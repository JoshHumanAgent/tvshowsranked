const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { Model, CATEGORIES } = require('../ranking-state');
const math = require('../ranking-math');
const read = file => JSON.parse(fs.readFileSync(path.join(__dirname,'..',file),'utf8').replace(/^\uFEFF/,''));
const catalogue = read('data/shows/index.json').shows;
const historical = read('docs/ranking-ledger/show-ledger.json');
const revised = {
    'when-life-gives-you-tangerines': { scores:[9,8.5,8,7.5,8,8,9], episodes:16, final:8.50, historicalFinal:8.08 },
    pluribus: { scores:[8.5,8,9,7.5,8.5,8,7.5], episodes:9, final:8.13, historicalFinal:7.80 },
    'golden-boy-2022': { scores:[6.5,6.5,6.5,6,6,5,5.5], episodes:101, final:5.98, historicalFinal:6.33 },
    'esrefs-dream': { scores:[7,6.5,7,6.5,6,6.5,6.5], episodes:47, final:6.58, historicalFinal:6.71 },
    'the-art-of-sarah': { scores:[7.5,6.5,7,6,7,7,6.5], episodes:8, final:6.90, historicalFinal:6.62 }
};
const revisedSlugs = Object.keys(revised).sort();
// Keep the quarantine regression after the first five records have been rehabilitated.
const pendingFixture = () => catalogue.map(original => {
    const show = structuredClone(original);
    if (revised[show.slug]) { show.assessment.status='withheld'; show.reviewStatus='premise-mismatch'; }
    return show;
});

test('only the five deliberately revised input vectors differ from the preserved audit', () => {
    const before = new Map(historical.map(s=>[s.slug,s.scores]));
    for (const show of catalogue) {
        const update = revised[show.slug];
        for (const [i,key] of math.KEYS.entries()) assert.equal(show[key],update ? update.scores[i] : before.get(show.slug)[key],show.slug + '/' + key);
        if (update) {
            assert.equal(show.episodes,update.episodes);
            assert.equal(math.calculateFinal(show),update.final);
            assert.equal(show.final,update.historicalFinal);
            assert.deepEqual(show.assessment.supersedes.ratings,before.get(show.slug));
        }
    }
});

test('every preserved catalogue entry binds scope and all seven evidence records to one assessment', () => {
    for (const show of catalogue) {
        const a = show.assessment;
        assert.equal(a.version,revised[show.slug] ? 2 : 1,show.slug);
        assert.equal(a.rubricVersion,'2026-10');
        assert.ok(['legacy','withheld','reviewed'].includes(a.status));
        assert.ok(['named','unrecorded'].includes(a.scope.status));
        assert.equal(a.review.path,`docs/shows/${show.slug}.html`);
        assert.equal(fs.existsSync(path.join(__dirname,'..',a.review.path)),true);
        assert.deepEqual(Object.keys(a.dimensions),math.KEYS);
        for (const key of math.KEYS) {
            const {reason,archive} = a.dimensions[key];
            if (revised[show.slug]) assert.ok(typeof reason === 'string' && reason.length > 100,'Substantive new reason: '+show.slug+'/'+key);
            else assert.equal(reason,null,'Untouched migration must not invent a current justification: ' + show.slug);
            assert.ok(archive.ratings.every(n => Number.isFinite(n) && n >= 0 && n <= 10));
            assert.ok(archive.excerpt === null || typeof archive.excerpt === 'string');
        }
        for (const source of a.review.sources) assert.equal(new URL(source).protocol,'https:');
    }
});
test('wrong-programme assessments remain discoverable without a score or ordinal rank', () => {
    const model = new Model(pendingFixture());
    assert.equal(model.shows.length,439);
    assert.equal(model.ranked.length,434);
    assert.deepEqual(model.pending.map(s=>s.slug).sort(),revisedSlugs);
    assert.deepEqual(model.ranked.map(s=>s.rank),Array.from({length:434},(_,i)=>i+1));
    for (const show of model.pending) {
        assert.equal(show.final,null); assert.equal(show.rank,null);
        assert.equal(model.results({query:show.title})[0].slug,show.slug);
        assert.throws(()=>model.setScore(show.title,'char',8),/awaiting a new assessment/);
    }
    model.prefs.sortBy='score-asc';
    assert.ok(model.results()[0].final > 0);
    assert.ok(model.results().slice(-5).every(s=>s.pending));
});
test('the five research assessments have complete evidence and rejoin the calculated ranking', () => {
    const model = new Model(catalogue);
    assert.equal(model.ranked.length,439);
    assert.equal(model.pending.length,0);
    assert.deepEqual(model.ranked.map(s=>s.rank),Array.from({length:439},(_,i)=>i+1));
    assert.deepEqual(catalogue.filter(s=>s.assessment.status==='reviewed').map(s=>s.slug).sort(),revisedSlugs);
    for (const slug of revisedSlugs) {
        const show=model.bySlug.get(slug), a=show.assessment;
        assert.equal(a.basis,'research'); assert.equal(a.provisional,true);
        assert.equal(a.reviewedAt,'2026-10-13'); assert.equal(a.scope.episodes,show.episodes);
        assert.equal(a.review.status,'withheld'); assert.equal(show.reviewStatus,undefined);
        assert.ok(a.limitations.length>100);
        const ids=new Set(a.sources.map(s=>s.id));
        for (const key of math.KEYS) assert.ok(a.dimensions[key].sourceRefs.every(id=>ids.has(id)));
        assert.equal(show.final,revised[slug].final);
        assert.ok(Number.isInteger(show.rank));
        const archive=fs.readFileSync(path.join(__dirname,'..',a.review.path),'utf8');
        assert.match(archive,/superseded by a new research assessment/);
        assert.match(archive,/name="robots" content="noindex, follow"/);
    }
});
test('malformed or misbound assessment evidence cannot quietly enter the live catalogue', () => {
    for (const mutate of [a=>a.review.path='javascript:alert(1)',a=>a.review.sources=['javascript:alert(1)'],
        a=>a.dimensions.char.archive.ratings=[99],a=>delete a.dimensions.resol,a=>a.scope=null,a=>a.status='verified-by-magic']) {
        const show = structuredClone(catalogue[0]); mutate(show.assessment);
        assert.throws(()=>new Model([show]),/Invalid assessment evidence/);
    }
});
test('a reviewed label cannot hide missing reasons, dangling sources, scope drift or research uncertainty', () => {
    const original=catalogue.find(s=>s.slug==='pluribus');
    for (const mutate of [
        s=>s.assessment.dimensions.char.reason=null,
        s=>s.assessment.dimensions.resol.sourceRefs=['missing-source'],
        s=>s.assessment.scope.episodes=10,
        s=>s.assessment.sources[0].url='javascript:alert(1)',
        s=>s.assessment.sources.push(s.assessment.sources[0]),
        s=>s.assessment.scope.sourceRefs=[],
        s=>s.assessment.limitations='',
        s=>s.assessment.provisional=false,
        s=>s.reviewStatus='premise-mismatch'
    ]) {
        const show=structuredClone(original); mutate(show);
        assert.throws(()=>new Model([show]),/Invalid reviewed assessment/);
    }
});
test('a saved personal override cannot silently resurrect a disputed assessment, and survives backup round trips', () => {
    const fixture=pendingFixture(), model = new Model(fixture), before = { char:9.25, drive:8, _final:99 };
    model.apply({scoreOverrides:{Pluribus:before},pinnedShows:['Pluribus','Breaking Bad']});
    assert.equal(model.bySlug.get('pluribus').final,null);
    const backup = model.snapshot();
    assert.deepEqual(backup.scoreOverrides.Pluribus,{char:9.25,drive:8});
    const copy = new Model(fixture); copy.apply(backup);
    assert.deepEqual(copy.snapshot(),backup);
    assert.equal(copy.results({onlyPinned:true}).length,2);
    assert.equal(copy.bySlug.get('pluribus').rank,null);
});
test('saved personal inputs survive reassessment and reset restores the new baseline without rewriting reasons', () => {
    const model=new Model(catalogue), before=model.base.get('Pluribus').assessment.dimensions.char.reason;
    model.apply({scoreOverrides:{Pluribus:{char:9.25,drive:8}},pinnedShows:['Pluribus']});
    assert.equal(model.bySlug.get('pluribus').char,9.25);
    assert.equal(model.base.get('Pluribus').char,8.5);
    assert.equal(model.bySlug.get('pluribus').assessment.dimensions.char.reason,before);
    const copy=new Model(catalogue); copy.apply(model.snapshot());
    assert.equal(copy.bySlug.get('pluribus').char,9.25);
    copy.resetShow('Pluribus');
    assert.equal(copy.bySlug.get('pluribus').char,8.5);
    assert.equal(copy.bySlug.get('pluribus').final,8.13);
    assert.equal(copy.bySlug.get('pluribus').assessment.dimensions.char.reason,before);
    assert.deepEqual(copy.prefs.pinnedShows,['Pluribus']);
});
test('contributions explain the full weighted score without extra rounding or hidden adjustments', () => {
    for (const show of catalogue) {
        const b = math.breakdown(show);
        assert.ok(Math.abs(b.contributions.reduce((sum,c)=>sum+c.points,0)-b.weighted)<1e-10);
        for (const c of b.contributions) assert.equal(c.points,show[c.key]*math.DEFAULT_WEIGHTS[c.key]/100);
    }
});
test('length comparison recalculates the whole ranked population using current personal inputs', () => {
    const model = new Model(catalogue);
    model.apply({multiplierEnabled:true});
    const qualityOrder = model.shows.map(s=>({...s,final:math.calculateFinal(s,undefined,false)})).sort(math.compareScores);
    qualityOrder.forEach((s,i)=>assert.equal(model.bySlug.get(s.slug).withoutLengthRank,i+1));
    model.setScore('Breaking Bad','char',9.37); model.setWeight('resol',0);
    const adjusted = model.ranked.map(s=>({slug:s.slug,rank:s.withoutLengthRank,final:s.withoutLengthScore}));
    model.prefs.multiplierEnabled=false; model.recalculate();
    for (const expected of adjusted) {
        const actual = model.bySlug.get(expected.slug);
        assert.equal(actual.rank,expected.rank);
        assert.equal(actual.final,expected.final);
    }
});
test('equal displayed scores reveal their tie group, while alphabetical positions remain stable', () => {
    const model = new Model(catalogue);
    const group=model.ranked.filter(s=>s.final===8.05);
    assert.deepEqual(group.map(s=>s.title),['Dark','Halt and Catch Fire','Mad Men','The Leftovers']);
    assert.ok(group.every(s=>s.tieCount===4));
    assert.deepEqual(group.map(s=>s.rank),[15,16,17,18]);
});
test('museum count repair is sourced, and the existing seven scores and multiplier are preserved', () => {
    const museum = catalogue.find(s=>s.slug==='museum-of-innocence');
    assert.equal(museum.episodes,9);
    const fix = read('data/catalogue-corrections.json').corrections.find(c=>c.slug===museum.slug&&c.type==='episode-count');
    assert.equal(fix.after.episodes,9);
    assert.equal(new URL(fix.source).hostname,'about.netflix.com');
    assert.equal(math.calculateFinal(museum),math.calculateFinal({...museum,episodes:8}));
});
test('historical ratings and mismatching prose stay distinct; missing evidence never becomes invented support', () => {
    const bb = catalogue.find(s=>s.slug==='breaking-bad');
    assert.equal(bb.char,9);
    assert.deepEqual(bb.assessment.dimensions.char.archive.ratings,[10]);
    assert.equal(bb.assessment.dimensions.world.archive.excerpt,null);
    const godless = catalogue.find(s=>s.slug==='godless');
    assert.ok(math.KEYS.every(k=>godless.assessment.dimensions[k].archive.excerpt===null));
    assert.equal(catalogue.find(s=>s.slug==='lost').resol,1);
    assert.equal(catalogue.find(s=>s.slug==='game-of-thrones-s1-4').assessment.scope.label,'Seasons 1–4');
    assert.equal(CATEGORIES.find(c=>c.key==='drive').description.includes('Quiet scenes'),true);
});
