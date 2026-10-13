const test = require('node:test');
const assert = require('node:assert/strict');
const { Coordinator, withTimeout } = require('../account-sync');
function deferred() { let resolve,reject; const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject}; }
function harness(t,options={}) {
    const reads=[],writes=[],statuses=[],applied=[],cached=[]; let current={sortBy:'rank'};
    const sync=new Coordinator({read:uid=>{const d=deferred();reads.push({uid,...d});return d.promise;},
        write:(uid,data)=>{const d=deferred();writes.push({uid,data,...d});return d.promise;},
        snapshot:()=>structuredClone(current),apply:data=>{if(data.invalid)throw new Error('invalid');current=data;applied.push(data);},
        status:s=>statuses.push(s),cache:(uid,data)=>cached.push({uid,data}),delay:10000,timeoutMs:1000,...options});
    t.after(()=>sync.disconnect());
    return {sync,reads,writes,statuses,applied,cached,edit:data=>{current=data;sync.changed();}};
}
async function ready(h) {const load=h.sync.load('account-a');h.reads[0].resolve({sortBy:'rank'});assert.equal(await load,true);}
test('initial defaults cannot be saved before a confirmed account load',async t=>{
    const h=harness(t); const load=h.sync.load('account-a'); assert.equal(await h.sync.save(),false);assert.equal(h.sync.changed(),false);
    h.reads[0].resolve({sortBy:'title'});await load; assert.equal(h.writes.length,0);assert.equal(h.sync.ready,true);
});
test('a rejected read leaves state intact and editing blocked',async t=>{
    const h=harness(t);const load=h.sync.load('account-a');h.reads[0].reject(new Error('offline'));assert.equal(await load,false);
    assert.equal(h.applied.length,0);assert.equal(h.sync.ready,false);assert.equal(h.statuses.at(-1),'load-error');assert.equal(await h.sync.save(),false);
});
test('invalid stored preferences never enable writes or silently restore defaults',async t=>{
    const h=harness(t);const load=h.sync.load('account-a');h.reads[0].resolve({invalid:true});assert.equal(await load,false);
    assert.equal(h.sync.ready,false);assert.equal(h.applied.length,0);assert.equal(h.writes.length,0);
});
test('a stale account read cannot apply to a different account',async t=>{
    const h=harness(t);const a=h.sync.load('account-a'),b=h.sync.load('account-b');h.reads[0].resolve({owner:'a'});assert.equal(await a,false);
    h.reads[1].resolve({owner:'b'});assert.equal(await b,true);assert.deepEqual(h.applied,[{owner:'b'}]);
});
test('saving waits for server acknowledgement and retains an account-specific recovery copy',async t=>{
    const h=harness(t);await ready(h);h.edit({sortBy:'title',scoreOverrides:{Example:{char:9,_final:8}}});const save=h.sync.save();
    assert.equal(h.sync.dirty,true);assert.equal(h.statuses.at(-1),'saving');assert.equal(h.writes[0].uid,'account-a');
    assert.equal(h.cached.at(-1).data.scoreOverrides.Example.char,9);h.writes[0].resolve();assert.equal(await save,true);
    assert.equal(h.statuses.at(-1),'saved');assert.equal(h.sync.dirty,false);
});
test('rejected writes do not claim success and can be retried',async t=>{
    const h=harness(t);await ready(h);h.edit({sortBy:'title'});let save=h.sync.save();h.writes[0].reject(new Error('denied'));
    assert.equal(await save,false);assert.equal(h.sync.dirty,true);assert.equal(h.statuses.at(-1),'save-error');
    save=h.sync.save();h.writes[1].resolve();assert.equal(await save,true);assert.equal(h.sync.dirty,false);
});
test('changes made during a save are sent in order, with only the newest acknowledgement marking Saved',async t=>{
    const h=harness(t);await ready(h);h.edit({sortBy:'title'});const save=h.sync.save();h.edit({sortBy:'year-desc'});
    assert.equal(h.writes.length,1);h.writes[0].resolve();await new Promise(setImmediate);
    assert.equal(h.writes.length,2);assert.equal(h.writes[1].data.sortBy,'year-desc');assert.ok(!h.statuses.includes('saved'));
    h.writes[1].resolve();assert.equal(await save,true);assert.equal(h.statuses.at(-1),'saved');
});
test('repeated Save clicks share the same pending write',async t=>{
    const h=harness(t);await ready(h);h.edit({sortBy:'title'});const first=h.sync.save(),second=h.sync.save();
    assert.equal(h.writes.length,1);h.writes[0].resolve();assert.equal(await first,true);assert.equal(await second,true);
});
test('old account acknowledgements cannot change new account state',async t=>{
    const h=harness(t);await ready(h);h.edit({owner:'a'});const save=h.sync.save(),load=h.sync.load('account-b');
    h.reads[1].resolve({owner:'b'});await load;h.writes[0].resolve();assert.equal(await save,false);assert.equal(h.statuses.at(-1),'ready');
});
test('disconnect cancels pending debounced work and blocks writes',async t=>{
    const h=harness(t);await ready(h);h.edit({sortBy:'title'});h.sync.disconnect();assert.equal(await h.sync.save(),false);assert.equal(h.writes.length,0);
});
test('timeouts fail explicitly and late acknowledgement cannot retroactively claim success',async t=>{
    const h=harness(t,{timeoutMs:15});await ready(h);h.edit({sortBy:'title'});const save=h.sync.save();
    assert.equal(await save,false);h.writes[0].resolve();await new Promise(setImmediate);
    assert.equal(h.statuses.at(-1),'save-error');assert.equal(h.sync.dirty,true);
});
test('bounded reads do not hang indefinitely',async()=>{await assert.rejects(withTimeout(new Promise(()=>{}),5),/confirm/);});
