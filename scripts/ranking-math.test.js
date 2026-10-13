const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const math = require('../ranking-math');
const catalogue = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/shows/index.json'), 'utf8').replace(/^\uFEFF/, '')).shows;
const accountWeights = { char: 20, world: 15, cine: 15, spect: 10, conc: 15, drive: 15, resol: 10 };

// Independent rational oracle: category hundredths and whole percent weights.
// The optional bonus advances 1/18000 per episode after ten, for at most 90 steps.
function reference(show, weights, bonus) {
    const steps = bonus ? BigInt(Math.min(90, Math.max(0, show.episodes - 10))) : 0n;
    const numerator = math.KEYS.reduce((sum, key) => sum + BigInt(Math.round(show[key] * 100)) * BigInt(weights[key]), 0n) * (18000n + steps);
    return Number((numerator + 900000n) / 1800000n) / 100;
}

test('all 442 shows agree with an independent exact-decimal oracle, with both weight sets and bonus states', () => {
    for (const weights of [math.DEFAULT_WEIGHTS, accountWeights]) {
        for (const bonus of [true, false]) for (const show of catalogue) {
            assert.equal(math.calculateFinal(show, weights, bonus), reference(show, weights, bonus), show.title);
        }
    }
});

test('optional duration preference is monotonic, penalty-free and capped at half a percent', () => {
    const expected = [[1,1],[10,1],[55,1.0025],[100,1.005],[101,1.005],[10000,1.005]];
    for (const [episodes,multiplier] of expected) assert.equal(math.episodeMultiplier(episodes),multiplier);
    for (let episodes=2; episodes<=1000; episodes++) {
        const previous=math.episodeMultiplier(episodes-1), current=math.episodeMultiplier(episodes);
        assert.ok(current>=previous && current>=1 && current<=1.005);
        assert.ok(current-previous<=1/18000+1e-12, 'No boundary cliff');
    }
    const perfect = Object.fromEntries(math.KEYS.map(key => [key, 10]));
    assert.equal(math.calculateFinal({ ...perfect, episodes:101 }),10);
    assert.equal(math.calculateFinal({ ...perfect, episodes:101 }, math.DEFAULT_WEIGHTS, true),10.05);
    const eight=Object.fromEntries(math.KEYS.map(key=>[key,8]));
    assert.equal(math.calculateFinal({ ...eight, episodes:10000 }, math.DEFAULT_WEIGHTS, true),8.04);
    for (const show of catalogue) {
        const difference=math.calculateFinal(show,undefined,true)-math.calculateFinal(show,undefined,false);
        assert.ok(difference>=-1e-10 && difference<=0.05+1e-10,show.title);
    }
});

test('half-cent rounding and calculated totals do not depend on cached finals', () => {
    const boardwalk = catalogue.find(show => show.title === 'Boardwalk Empire');
    assert.equal(math.calculateFinal(boardwalk, math.DEFAULT_WEIGHTS, false), 8.23);
    const bb = catalogue.find(show => show.title === 'Breaking Bad');
    assert.equal(math.calculateFinal({ ...bb, final: 999, _final: -99 }, math.DEFAULT_WEIGHTS, true), 8.98);
});

test('invalid weights, category values and episode counts cannot produce rankings', () => {
    for (const char of [0, 30, -5, NaN, Infinity, '25']) {
        assert.throws(() => math.calculateFinal(catalogue[0], { ...math.DEFAULT_WEIGHTS, char }), /weights/);
    }
    for (const char of [-1, 11, NaN, Infinity, null, '9']) {
        assert.throws(() => math.calculateFinal({ ...catalogue[0], char }), /char/);
    }
    for (const episodes of [0, -1, null, NaN, 1.5]) assert.throws(() => math.episodeMultiplier(episodes), /Episode/);
});

test('equal rounded scores have stable alphabetical positions regardless of editing history', () => {
    const first = [{ title: 'Zulu', final: 8 }, { title: 'Alpha', final: 8 }, { title: 'Leader', final: 9 }];
    const second = [...first].reverse();
    math.rankShows(first); math.rankShows(second);
    assert.deepEqual(first.map(s => [s.title, s.rank]), second.map(s => [s.title, s.rank]));
    assert.deepEqual(first.map(s => s.title), ['Leader', 'Alpha', 'Zulu']);
});

