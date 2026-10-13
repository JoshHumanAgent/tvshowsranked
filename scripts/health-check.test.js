const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { runHealthCheck } = require('./health-check');

function fixture(t, count = 2) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rank-health-test-'));
    t.after(() => {
        assert.equal(path.dirname(root), path.resolve(os.tmpdir()));
        assert.ok(path.basename(root).startsWith('rank-health-test-'));
        fs.rmSync(root, { recursive: true, force: true });
    });
    function write(file, data) {
        const target = path.join(root, file);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, typeof data === 'string' ? data : JSON.stringify(data));
    }
    const shows = Array.from({ length: count }, (_, index) => ({ rank: index + 1,
        slug: 'show-' + (index + 1), title: 'Show ' + (index + 1), genres: ['drama'],
        final: 8, char: 8, world: 8, cine: 8, spect: 8, conc: 8, drive: 8, resol: 8 }));
    write('index.html', '<script>fetch("data/shows/index.json")</script>');
    write('data/shows/index.json', { totalShows: count, shows });
    write('data/core/ranked.json', { meta: { total: count }, shows });
    write('data/core/queue.json', { meta: { total: 0 }, candidates: [] });
    write('data/core/00-foundation-list.json', { finalRankings: [], baseScores: {} });
    write('data/core/04-DIRECTIVE.md', 'Preserve foundation scores.');
    write('.git', 'gitdir: test-fixture');
    for (const show of shows) write('docs/shows/' + show.slug + '.html', '<h1>' + show.title + '</h1>');
    return { root, shows, write };
}

test('current layout works without legacy files or per-show JSON; checker is read-only', t => {
    const { root } = fixture(t);
    const file = path.join(root, 'data/shows/index.json');
    const before = fs.readFileSync(file);
    const result = runHealthCheck(root);
    assert.equal(result.status, 'HEALTHY');
    assert.equal(result.summary.failed, 0);
    assert.equal(result.stats.reviews, 2);
    assert.deepEqual(fs.readFileSync(file), before);
});

test('malformed live JSON produces a contextual failure, not a crash', t => {
    const { root, write } = fixture(t);
    write('data/shows/index.json', '{');
    const result = runHealthCheck(root);
    assert.equal(result.status, 'UNHEALTHY');
    assert.ok(result.issues.some(issue => issue.startsWith('Live catalogue:')));
});

test('duplicate names, unsafe slugs and invalid scores are rejected', t => {
    const { root, shows, write } = fixture(t);
    shows[1] = { ...shows[0], rank: 2, slug: '../outside', final: 'not a score' };
    write('data/shows/index.json', { totalShows: 2, shows });
    const result = runHealthCheck(root);
    assert.equal(result.status, 'UNHEALTHY');
    assert.match(result.issues.join(' '), /invalid slug/);
    assert.match(result.issues.join(' '), /duplicate title/);
    assert.match(result.issues.join(' '), /final must be a number/);
});

test('authoring and published score differences are reported without reranking', t => {
    const { root, shows, write } = fixture(t);
    write('data/core/ranked.json', { meta: { total: 2 }, shows: shows.map(show => ({ ...show, final: 7 })) });
    const result = runHealthCheck(root);
    assert.equal(result.status, 'UNHEALTHY');
    assert.match(result.issues.join(' '), /show-1: final/);
});

test('optional service metadata can differ from the generated live catalogue', t => {
    const { root, shows, write } = fixture(t);
    write('data/core/ranked.json', { meta: { total: 2 }, shows: shows.map(show => ({
        ...show, tmdbId: 123, streaming: { US: ['Test service'] }
    })) });
    write('data/shows/index.json', { totalShows: 2, shows: shows.map(show => ({
        ...show, streaming: { us: ['Test service'] }
    })) });
    assert.equal(runHealthCheck(root).status, 'HEALTHY');
});

test('Top 100 review loss fails; missing overflow review is a warning', t => {
    const { root, write } = fixture(t, 101);
    write('docs/shows/show-101.html', '');
    let result = runHealthCheck(root);
    assert.equal(result.status, 'HEALTHY');
    assert.match(result.warnings.join(' '), /Overflow reviews/);
    write('docs/shows/show-1.html', '');
    result = runHealthCheck(root);
    assert.equal(result.status, 'UNHEALTHY');
    assert.match(result.issues.join(' '), /Top 100 reviews: show-1/);
});

test('BOM files load and stale queue metadata reports the actual count', t => {
    const { root, write } = fixture(t);
    write('data/core/queue.json', '\uFEFF' + JSON.stringify({ meta: { total: 9 }, candidates: [] }));
    const result = runHealthCheck(root);
    assert.equal(result.status, 'HEALTHY');
    assert.equal(result.stats.inQueue, 0);
    assert.match(result.warnings.join(' '), /meta.total is 9; actual count is 0/);
});
