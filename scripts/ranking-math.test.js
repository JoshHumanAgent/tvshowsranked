const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const math = require('../ranking-math');
const catalogue = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/shows/index.json'), 'utf8').replace(/^\uFEFF/, '')).shows;
const accountWeights = { char: 20, world: 15, cine: 15, spect: 10, conc: 15, drive: 15, resol: 10 };

// Independent integer oracle: category hundredths, whole percent weights and multiplier percentages.
function reference(show, weights, bonus) {
    const limits = [[10, 96], [20, 95], [30, 97], [40, 100], [50, 102], [60, 103], [75, 104], [100, 105], [Infinity, 106]];
    const percent = bonus ? limits.find(([limit]) => show.episodes <= limit)[1] : 100;
    const numerator = math.KEYS.reduce((sum, key) => sum + BigInt(Math.round(show[key] * 100)) * BigInt(weights[key]), 0n) * BigInt(percent);
    return Number((numerator + 5000n) / 10000n) / 100;
}

test('all 442 shows agree with an independent exact-decimal oracle, with both weight sets and bonus states', () => {
    for (const weights of [math.DEFAULT_WEIGHTS, accountWeights]) {
        for (const bonus of [true, false]) for (const show of catalogue) {
            assert.equal(math.calculateFinal(show, weights, bonus), reference(show, weights, bonus), show.title);
        }
    }
});

test('episode boundaries apply exactly one adjustment', () => {
    const expected = [[1,.96],[10,.96],[11,.95],[20,.95],[21,.97],[30,.97],[31,1],[40,1],[41,1.02],[50,1.02],[51,1.03],[60,1.03],[61,1.04],[75,1.04],[76,1.05],[100,1.05],[101,1.06]];
    for (const [episodes, multiplier] of expected) assert.equal(math.episodeMultiplier(episodes), multiplier);
    const perfect = Object.fromEntries(math.KEYS.map(key => [key, 10]));
    assert.equal(math.calculateFinal({ ...perfect, episodes: 101 }, math.DEFAULT_WEIGHTS, true), 10.6);
});

test('half-cent rounding and calculated totals do not depend on cached finals', () => {
    const boardwalk = catalogue.find(show => show.title === 'Boardwalk Empire');
    assert.equal(math.calculateFinal(boardwalk, math.DEFAULT_WEIGHTS, false), 8.23);
    const bb = catalogue.find(show => show.title === 'Breaking Bad');
    assert.equal(math.calculateFinal({ ...bb, final: 999, _final: -99 }, math.DEFAULT_WEIGHTS, true), 9.31);
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

