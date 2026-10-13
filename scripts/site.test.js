const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { Model, balanceWeights, matchesEra } = require('../ranking-state');
const math = require('../ranking-math');
const catalogue = JSON.parse(fs.readFileSync(path.join(__dirname,'../data/shows/index.json'),'utf8').replace(/^\uFEFF/,'')).shows;

test('quality alone is the default and reset, while a saved length opt-in survives a round trip', () => {
    const model=new Model(catalogue);
    assert.equal(model.prefs.multiplierEnabled,false);
    for (const show of model.ranked) {
        assert.equal(show.final,show.withoutLengthScore);
        assert.equal(show.rank,show.withoutLengthRank);
    }
    assert.equal(model.bySlug.get('boardwalk-empire').final,8.23);
    assert.equal(model.bySlug.get('buffy-the-vampire-slayer').final,7.03);
    assert.ok(model.bySlug.get('boardwalk-empire').rank < model.bySlug.get('buffy-the-vampire-slayer').rank);
    model.apply({multiplierEnabled:true,scoreOverrides:{'Breaking Bad':{char:9.25}},pinnedShows:['Breaking Bad']});
    const saved=model.snapshot(), copy=new Model(catalogue); copy.apply(saved);
    assert.equal(copy.prefs.multiplierEnabled,true);
    assert.deepEqual(copy.snapshot(),saved);
    copy.apply({});
    assert.equal(copy.prefs.multiplierEnabled,false);
    const olderBackup=new Model(catalogue); olderBackup.apply({scoreOverrides:saved.scoreOverrides});
    assert.equal(olderBackup.prefs.multiplierEnabled,false);
    assert.equal(olderBackup.bySlug.get('breaking-bad').char,9.25);
});

test('all catalogue records remain reachable, including low scores and ranks after 100', () => {
    const model = new Model(catalogue);
    assert.equal(model.results().length,439);
    model.prefs.sortBy = 'score-asc';
    assert.ok(model.results()[0].final < 6.5);
    const last = model.shows.at(-1);
    assert.equal(model.results({query:last.title}).some(s => s.slug === last.slug),true);
});
test('search tolerates accents, case, spaces and punctuation without treating text as markup', () => {
    const model = new Model(catalogue);
    assert.equal(model.results({query:'  BREAKING   bad '})[0].title,'Breaking Bad');
    assert.ok(model.results({query:'bon appetit'}).length > 0);
    assert.equal(model.results({query:'<img src=x onerror=alert(1)>'}).length,0);
});
test('all 50 catalogue genres can be selected and combined; filter does not relabel global ranks', () => {
    const model = new Model(catalogue);
    for (const genre of model.genres) {
        model.prefs.currentGenres = [genre];
        assert.ok(model.results().length,genre);
        assert.ok(model.results().every(s => s.genres.includes(genre)));
    }
    model.prefs.currentGenres = ['crime','drama'];
    assert.ok(model.results().every(s => s.genres.includes('crime') && s.genres.includes('drama')));
    assert.equal(model.results()[0].rank,2);
});
test('relative periods exclude future premieres and this year means the current calendar year', () => {
    const now = new Date(2026,9,13);
    assert.equal(matchesEra({year:2025,month:12},'thisYear',now),false);
    assert.equal(matchesEra({year:2026,month:11},'last3mo',now),false);
    assert.equal(matchesEra({year:2026,month:8},'last3mo',now),true);
    assert.equal(matchesEra({year:2026,month:7},'last3mo',now),false);
    assert.equal(matchesEra({year:2031,month:1},'2020s',now),false);
});
test('every weight position stays non-negative, integral and totals exactly 100', () => {
    for (const key of math.KEYS) for (let value=0;value<=100;value++) {
        const balanced = balanceWeights(math.DEFAULT_WEIGHTS,key,value);
        assert.equal(balanced[key],value);
        assert.equal(Object.values(balanced).reduce((a,b)=>a+b,0),100);
        assert.ok(Object.values(balanced).every(n=>Number.isInteger(n)&&n>=0));
        const reversed = balanceWeights(balanced,key,0);
        assert.equal(Object.values(reversed).reduce((a,b)=>a+b,0),100);
    }
});
test('moving one weight retains the proportions of the others, apart from whole-percent rounding', () => {
    const balanced = balanceWeights(math.DEFAULT_WEIGHTS,'char',40);
    assert.deepEqual(balanced,{char:40,world:12,cine:4,spect:4,conc:12,drive:12,resol:16});
});
test('rating, reset and reloaded account totals agree; catalogue baselines are immutable', () => {
    const before = JSON.stringify(catalogue), model = new Model(catalogue);
    const bb = () => model.bySlug.get('breaking-bad');
    assert.equal(bb().final,8.95);
    model.setScore('Breaking Bad','char',10);
    assert.equal(bb().final,9.20); assert.equal(bb().rank,2); assert.equal(model.modifiedCount,1);
    const copy = new Model(catalogue); copy.apply(model.snapshot());
    assert.equal(copy.bySlug.get('breaking-bad').final,9.20);
    model.resetShow('Breaking Bad'); assert.equal(bb().final,8.95); assert.equal(model.modifiedCount,0);
    assert.equal(JSON.stringify(catalogue),before);
});
test('legacy backups keep precise category inputs and ignore obsolete cached totals', () => {
    const model = new Model(catalogue);
    model.apply({weights:{char:20,world:15,cine:15,spect:10,conc:15,drive:15,resol:10},multiplierEnabled:false,
        overrides:{'Breaking Bad':{char:9.5,_final:12345}},pinnedShows:['Breaking Bad']});
    const show = model.bySlug.get('breaking-bad');
    assert.equal(show.char,9.5); assert.equal(show.final,8.9);
    assert.equal(model.results({onlyPinned:true})[0].title,'Breaking Bad');
});
test('invalid imports are atomic and cannot erase valid preferences', () => {
    const model = new Model(catalogue); model.setScore('Breaking Bad','char',10);
    const before = model.snapshot();
    for (const data of [null,[],{weights:{char:100}}, {scoreOverrides:[]}, {scoreOverrides:{'Breaking Bad':{char:'10'}}},
        {scoreOverrides:{'Breaking Bad':{char:11}}}, {currentGenres:['crime',{}]}, {sortBy:'<script>'}, {multiplierEnabled:'false'}]) {
        assert.throws(()=>model.apply(data)); assert.deepEqual(model.snapshot(),before);
    }
});
test('an empty and a malformed catalogue fail explicitly, without a stale substitute', () => {
    assert.throws(()=>new Model([]));
    assert.throws(()=>new Model([{...catalogue[0],slug:'../index'}]));
    assert.throws(()=>new Model([{...catalogue[0],episodes:0}]));
    assert.throws(()=>new Model([catalogue[0],catalogue[0]]));
});
test('a full export and restore preserves formula, all personal inputs, pins and filter preferences', () => {
    const model = new Model(catalogue);
    model.setScore('Breaking Bad','world',4.5); model.setWeight('resol',60);
    model.prefs.multiplierEnabled=false; model.prefs.pinnedShows=['Breaking Bad','The Wire'];
    model.prefs.currentGenres=['crime']; model.prefs.currentEras=['2000s']; model.prefs.sortBy='title';
    model.recalculate(); const exported=model.snapshot(), copy=new Model(catalogue); copy.apply(exported);
    assert.deepEqual(copy.snapshot(),exported);
    assert.deepEqual(copy.shows.map(s=>[s.title,s.final,s.rank]),model.shows.map(s=>[s.title,s.final,s.rank]));
});
test('duplicate records share a ranking and preserve legacy ratings, pins and deep links', () => {
    const model = new Model(catalogue);
    model.apply({scoreOverrides:{'Doctor Who (2005)':{char:9.5}},pinnedShows:['Doctor Who (2005)']});
    assert.equal(model.bySlug.get('doctor-who').char,9.5);
    assert.equal(model.bySlug.get('doctor-who-2005'),model.bySlug.get('doctor-who'));
    assert.equal(model.results({query:'doctor who'}).length,1);
    assert.equal(model.results({onlyPinned:true})[0].title,'Doctor Who');
    assert.equal(model.snapshot().scoreOverrides['Doctor Who (2005)'].char,9.5);
    model.resetShow('Doctor Who');
    const restored=new Model(catalogue);restored.apply(model.snapshot());
    assert.equal(restored.bySlug.get('doctor-who').char,model.base.get('Doctor Who').char);
});
test('unverified entries stay in the original catalogue but do not masquerade as verified rankings', () => {
    const model=new Model(catalogue);
    assert.ok(catalogue.some(s=>s.slug==='revolution-9-2024'));
    assert.equal(model.results({query:'Revolution 9'}).length,0);
});
