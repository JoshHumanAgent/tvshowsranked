const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {Model,releaseGap} = require('../ranking-state');
const {auditCatalogueMaintenance,validateMaintenance,validateTransition} = require('./audit-catalogue-maintenance');
const read = p => JSON.parse(fs.readFileSync(path.join(__dirname,'..',p),'utf8').replace(/^\uFEFF/,''));
const catalogue = read('data/shows/index.json');
const core = read('data/core/ranked.json');
const ledger = read('data/maintenance/'+catalogue.catalogueCheckedThrough+'.json');
const previous = read('data/maintenance/'+ledger.previousCutoff+'.json');

test('dated intake preserves original assessments and binds every new rating and release to its ledger', () => {
    assert.deepEqual(auditCatalogueMaintenance().errors,[]);
    assert.equal(catalogue.shows.filter(s=>s.assessment.origin !== 'new').length,442);
    assert.equal(ledger.added.length,139);
    assert.equal(ledger.added.filter(s=>s.status==='reviewed').length,11);
    assert.equal(ledger.intakeThisRun.length,9);
    const model=new Model(catalogue.shows);
    assert.equal(model.ranked.length,450);
    assert.equal(model.pending.length,128);
});

test('19 October assessments replace only the recorded pending inputs and retain exact run scope', () => {
    const expected=[
        ['dying-for-sex',[8,7,7.5,7,7.5,7.5,8],7.63,'Limited series · 8 episodes'],
        ['the-chair-company',[7.5,7,8,7,7.5,6.5,6.5],7.08,'Season 1 only · 8 episodes']
    ];
    const model=new Model(catalogue.shows);
    assert.equal(ledger.changes.filter(c=>c.kind==='assessment').length,2);
    for(const [slug,vector,score,scope] of expected){
        const change=ledger.changes.find(c=>c.slug===slug),show=model.bySlug.get(slug);
        assert.equal(change.before.status,'pending');
        assert.equal(change.before.scoreVector,null);
        assert.deepEqual(change.after.scoreVector,vector);
        assert.equal(change.after.final,score);
        assert.equal(show.final,score);
        assert.equal(show.assessment.version,2);
        assert.equal(show.assessment.scope.label,scope);
        assert.equal(show.episodes,8);
        assert.equal(show.assessment.provisional,true);
        assert.equal(show.assessment.supersedes.status,'pending');
        assert.ok(Object.values(show.assessment.supersedes.ratings).every(v=>v===null));
    }
    model.setScore('Dying for Sex','char',9);
    const copy=new Model(catalogue.shows);copy.apply(model.snapshot());
    assert.equal(copy.bySlug.get('dying-for-sex').final,7.88);
    copy.resetShow('Dying for Sex');
    assert.equal(copy.bySlug.get('dying-for-sex').final,7.63);
});

test('maintenance revisions require an unchanged predecessor and explicit versioned before/after inputs', () => {
    const mutations=[
        [l=>l.previousManifestDigest='0'.repeat(64),/Historical maintenance manifest changed/],
        [l=>l.added.find(s=>s.slug==='task').scoreVector[0]=8.5,/intake changed without a recorded transition/],
        [l=>l.changes.find(c=>c.slug==='dying-for-sex').before.status='reviewed',/before\/after transition disagrees/],
        [l=>{const c=l.changes.find(c=>c.slug==='dying-for-sex');c.after.assessmentVersion=1;l.added.find(s=>s.slug===c.slug).assessmentVersion=1;},/revision did not advance version/],
        [l=>l.intakeThisRun.pop(),/intake does not match new identities/],
        [l=>{const c=l.changes.find(c=>c.kind==='pending-release-count');c.after.scope='Invented assessment';l.added.find(s=>s.slug===c.slug).scope=c.after.scope;},/release refresh altered pending judgment/]
    ];
    for(const [mutate,message]of mutations){const l=structuredClone(ledger);mutate(l);assert.match(validateTransition(l,previous).join('\n'),message);}
    const alteredPrevious=structuredClone(previous);alteredPrevious.coverage='Rewritten history';
    assert.match(validateTransition(ledger,alteredPrevious).join('\n'),/Historical maintenance manifest changed/);
    const alteredData=structuredClone(catalogue);alteredData.shows.find(s=>s.slug==='task').assessment.dimensions.char.reason='Silent reinterpretation';
    assert.match(validateMaintenance(alteredData,core,ledger,previous).errors.join('\n'),/Unchanged catalogue records drifted/);
});

test('new unassessed titles remain searchable, shortlistable and unranked through preference round trips', () => {
    const model = new Model(catalogue.shows);
    const show = model.pending.find(s=>s.assessment.origin==='new');
    assert.ok(show);
    assert.equal(model.results({query:show.title}).some(s=>s.slug===show.slug),true);
    assert.throws(()=>model.setScore(show.title,'char',9),/awaiting/);
    model.apply({scoreOverrides:{[show.title]:{char:10}},pinnedShows:[show.title],sortBy:'score-asc'});
    assert.equal(model.bySlug.get(show.slug).final,null);
    assert.equal(model.bySlug.get(show.slug).rank,null);
    assert.equal(model.results({onlyPinned:true})[0].slug,show.slug);
    assert.ok(!model.results()[0].pending);
    const copy = new Model(catalogue.shows); copy.apply(model.snapshot());
    assert.deepEqual(copy.snapshot(),model.snapshot());
    assert.equal(copy.bySlug.get(show.slug).final,null);
    assert.ok(copy.results().at(-1).pending);
});

test('new researched assessments retain personal inputs on reload and restore the editorial baseline', () => {
    const model=new Model(catalogue.shows), before=JSON.stringify(catalogue);
    model.setScore('Task','char',9); model.setWeight('resol',40);
    const score=model.bySlug.get('task').final,copy=new Model(catalogue.shows); copy.apply(model.snapshot());
    assert.equal(copy.bySlug.get('task').final,score);
    assert.equal(copy.bySlug.get('task').char,9);
    copy.resetShow('Task');
    assert.equal(copy.bySlug.get('task').char,8);
    assert.equal(JSON.stringify(catalogue),before);
});

test('Recently added includes pending intake without interpreting missing ratings as low scores', () => {
    const model=new Model(catalogue.shows);model.prefs.sortBy='added-desc';
    const added=model.results().slice(0,ledger.added.length);
    assert.ok(added.every(s=>s.assessment.origin==='new'));
    assert.ok(added.some(s=>s.pending));
    assert.ok(added.some(s=>!s.pending));
    assert.ok(added.filter(s=>s.pending).every(s=>s.rank===null&&s.final===null));
});

test('newer released seasons do not silently expand assessed scope or the duration input', () => {
    const show=structuredClone(catalogue.shows.find(s=>s.slug==='fallout'));
    assert.equal(show.episodes,8);assert.equal(show.release.episodes,16);
    assert.equal(releaseGap(show),'newer');
    assert.equal(releaseGap(catalogue.shows.find(s=>s.slug==='the-pitt')),'covered');
    assert.equal(releaseGap(catalogue.shows.find(s=>s.slug==='andor')),'unscoped');
    const lowdown=catalogue.shows.find(s=>s.slug==='the-lowdown');
    assert.equal(lowdown.episodes,8);assert.equal(lowdown.release.episodes,10);
    assert.equal(lowdown.assessment.scope.episodes,8);
    assert.equal(releaseGap(lowdown),'newer');
    const model=new Model([show]);model.prefs.multiplierEnabled=true;model.recalculate();
    assert.equal(model.ranked[0].final,7.43);
    assert.equal(model.ranked[0].episodes,8);
});

test('maintenance guard catches score drift, future releases, incomplete evidence and a second article by one critic', () => {
    const mutations=[
        [d=>d.shows[0].char=5,/Original records changed/],
        [d=>d.shows.find(s=>s.slug==='task').char=8.5,/score vector changed/],
        [d=>d.shows.find(s=>s.slug==='task').release.premiered='2026-12-01',/unreleased premiere/],
        [d=>d.shows.find(s=>s.slug==='task').release.seasons[0].lastReleased='2026-99-01',/invalid season/],
        [d=>d.shows.find(s=>s.slug==='task').assessment.dimensions.char.sourceRefs=['episodes'],/no critical evidence/],
        [d=>d.shows.find(s=>s.slug==='the-studio').assessment.sources.filter(s=>s.kind==='criticism').forEach(s=>s.author='One critic'),/two independent/],
        [d=>d.shows.find(s=>s.slug==='the-studio').assessment.sources.forEach(s=>{s.fullRun=false;s.coversEnding=false;}),/ending coverage/],
        [d=>d.shows.find(s=>s.assessment.status==='pending').char=0,/unsupported scores/]
    ];
    for(const [mutate,message]of mutations){const d=structuredClone(catalogue);mutate(d);assert.match(validateMaintenance(d,core,ledger,previous).errors.join('\n'),message);}
});
