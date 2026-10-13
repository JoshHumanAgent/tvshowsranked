const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {Model,releaseGap} = require('../ranking-state');
const {auditCatalogueMaintenance,validateMaintenance} = require('./audit-catalogue-maintenance');
const read = p => JSON.parse(fs.readFileSync(path.join(__dirname,'..',p),'utf8').replace(/^\uFEFF/,''));
const catalogue = read('data/shows/index.json');
const core = read('data/core/ranked.json');
const ledger = read('data/maintenance/'+catalogue.catalogueCheckedThrough+'.json');

test('dated intake preserves original assessments and binds every new rating and release to its ledger', () => {
    assert.deepEqual(auditCatalogueMaintenance().errors,[]);
    assert.equal(catalogue.shows.filter(s=>s.assessment.origin !== 'new').length,442);
    assert.equal(ledger.added.length,130);
    assert.equal(ledger.added.filter(s=>s.status==='reviewed').length,9);
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
    for(const [mutate,message]of mutations){const d=structuredClone(catalogue);mutate(d);assert.match(validateMaintenance(d,core,ledger).errors.join('\n'),message);}
});
