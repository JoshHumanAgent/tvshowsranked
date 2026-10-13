/** Read-only checks for the site and its current authoring files. */
const fs = require('node:fs');
const path = require('node:path');

const SCORE_KEYS = ['char', 'world', 'cine', 'spect', 'conc', 'drive', 'resol'];
const SITE_FIELDS = ['rank', 'slug', 'title', 'year', 'month', 'episodes', 'genres',
    'final', ...SCORE_KEYS, 'poster', 'backdrop'];

function readJson(filename) {
    return JSON.parse(fs.readFileSync(filename, 'utf8').replace(/^\uFEFF/, ''));
}

function canonical(value) {
    if (Array.isArray(value)) return value.map(canonical);
    if (value && typeof value === 'object') {
        return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
    }
    return value;
}

function summarize(items) {
    return items.slice(0, 8).join(', ') + (items.length > 8 ? ' (+' + (items.length - 8) + ' more)' : '');
}

function validateShows(data) {
    if (!Array.isArray(data.shows) || data.shows.length === 0) {
        throw new Error('Expected a non-empty shows array');
    }
    const issues = [];
    const slugs = new Set();
    const titles = new Set();
    for (const [index, show] of data.shows.entries()) {
        if (!show || typeof show !== 'object') {
            issues.push('Record ' + (index + 1) + ' is not an object');
            continue;
        }
        const label = show.slug || 'Record ' + (index + 1);
        if (typeof show.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(show.slug)) {
            issues.push(label + ': invalid slug');
        }
        if (slugs.has(show.slug)) issues.push(label + ': duplicate slug');
        slugs.add(show.slug);
        if (typeof show.title !== 'string' || !show.title.trim()) issues.push(label + ': missing title');
        if (titles.has(show.title)) issues.push(label + ': duplicate title');
        titles.add(show.title);
        const fresh = show.assessment?.origin === 'new';
        if (fresh ? show.rank !== null : show.rank !== index + 1) issues.push(label + ': invalid stored historical rank');
        if (!Array.isArray(show.genres) || !show.genres.length ||
            show.genres.some(genre => typeof genre !== 'string' || !genre.trim())) {
            issues.push(label + ': invalid genres');
        }
        for (const key of ['final', ...SCORE_KEYS]) {
            if (fresh && (key === 'final' || show.assessment.status === 'pending')) {
                if (show[key] !== null) issues.push(label + ': ' + key + ' must remain null until calculated or assessed');
                continue;
            }
            if (typeof show[key] !== 'number' || !Number.isFinite(show[key]) || show[key] < 0 || show[key] > 10) {
                issues.push(label + ': ' + key + ' must be a number from 0 to 10');
            }
        }
    }
    if (issues.length) throw new Error(summarize(issues));
    return data;
}

function runHealthCheck(root = path.resolve(__dirname, '..')) {
    const results = { timestamp: new Date().toISOString(), status: 'HEALTHY',
        checks: [], issues: [], warnings: [], stats: {} };
    const filename = relative => path.join(root, relative);
    function check(name, action) {
        try {
            results.checks.push({ name, status: 'PASS', details: action() });
        } catch (error) {
            results.checks.push({ name, status: 'FAIL', error: error.message });
            results.issues.push(name + ': ' + error.message);
            results.status = 'UNHEALTHY';
        }
    }
    function warn(name, message) {
        results.warnings.push(name + ': ' + message);
        results.checks.push({ name, status: 'WARN', details: message });
    }

    let live, master;
    check('Website entry point', () => {
        const html = fs.readFileSync(filename('index.html'), 'utf8');
        const app = /src="app\.js(?:\?[^"\s]*)?"/.test(html) ? fs.readFileSync(filename('app.js'), 'utf8') : html;
        if (!app.includes('data/shows/index.json')) throw new Error('Page does not reference the live catalogue');
        for (const match of html.matchAll(/(?:src|href)="([^"?#]+\.(?:js|css))(?:\?[^"\s]*)?"/g)) {
            if (!match[1].startsWith('https:') && !fs.existsSync(filename(match[1]))) throw new Error('Missing page dependency: ' + match[1]);
        }
        return 'The page and its local dependencies read the live catalogue';
    });
    check('Live catalogue', () => {
        live = validateShows(readJson(filename('data/shows/index.json')));
        results.stats.top100 = Math.min(100, live.shows.length);
        results.stats.overflow = Math.max(0, live.shows.length - 100);
        results.stats.catalogueRecords = live.shows.length;
        if (live.totalShows !== live.shows.length) warn('Catalogue count',
            'totalShows is ' + live.totalShows + '; actual count is ' + live.shows.length);
        return live.shows.length + ' valid, uniquely named records in their preserved historical order';
    });
    check('Authoring catalogue', () => {
        master = validateShows(readJson(filename('data/core/ranked.json')));
        if (master.meta?.total !== master.shows.length) warn('Authoring count',
            'meta.total is ' + master.meta?.total + '; actual count is ' + master.shows.length);
        return master.shows.length + ' shows in data/core/ranked.json';
    });
    if (live && master) check('Ranking data matches authoring data', () => {
        const bySlug = new Map(master.shows.map(show => [show.slug, show]));
        const differences = [];
        for (const show of live.shows) {
            const source = bySlug.get(show.slug);
            if (!source) { differences.push(show.slug + ': missing from authoring catalogue'); continue; }
            for (const field of SITE_FIELDS) {
                if (JSON.stringify(canonical(show[field])) !== JSON.stringify(canonical(source[field]))) {
                    differences.push(show.slug + ': ' + field);
                }
            }
            bySlug.delete(show.slug);
        }
        for (const slug of bySlug.keys()) differences.push(slug + ': missing from live catalogue');
        if (differences.length) throw new Error(summarize(differences));
        return 'Ranking and artwork fields match; optional service metadata may differ; curated scores are not recalculated';
    });
    check('Ranking queue', () => {
        const queue = readJson(filename('data/core/queue.json'));
        if (!Array.isArray(queue.candidates)) throw new Error('Expected a candidates array');
        results.stats.inQueue = queue.candidates.length;
        if (queue.meta?.total !== queue.candidates.length) warn('Queue count',
            'meta.total is ' + queue.meta?.total + '; actual count is ' + queue.candidates.length);
        return queue.candidates.length + ' candidate records, including completed and rejected entries';
    });
    check('Foundation and directive', () => {
        const foundation = readJson(filename('data/core/00-foundation-list.json'));
        if (!Array.isArray(foundation.finalRankings) || !foundation.baseScores) {
            throw new Error('Foundation must contain finalRankings and baseScores');
        }
        if (!fs.readFileSync(filename('data/core/04-DIRECTIVE.md'), 'utf8').trim()) {
            throw new Error('The authoring directive is empty');
        }
        return 'Protected foundation and current authoring directive are readable';
    });
    if (live) check('Review coverage', () => {
        const missingTop = [], missingOther = [];
        const archived = live.shows.filter(show => show.assessment?.review.status !== 'none');
        for (const show of archived) {
            const review = filename('docs/shows/' + show.slug + '.html');
            if (!fs.existsSync(review) || !fs.statSync(review).isFile() || !fs.readFileSync(review, 'utf8').trim()) {
                (show.rank <= 100 ? missingTop : missingOther).push(show.slug);
            }
        }
        results.stats.reviews = archived.length - missingTop.length - missingOther.length;
        if (missingTop.length) throw new Error('Missing or empty Top 100 reviews: ' + summarize(missingTop));
        if (missingOther.length) warn('Overflow reviews', missingOther.length + ' missing: ' + summarize(missingOther));
        return results.stats.reviews + '/' + archived.length + ' historical reviews in docs/shows; new assessments do not invent archived reviews';
    });
    check('Git checkout', () => {
        if (!fs.existsSync(filename('.git'))) throw new Error('No .git directory or worktree file');
        return 'Git checkout present';
    });
    results.summary = { totalChecks: results.checks.length,
        passed: results.checks.filter(check => check.status === 'PASS').length,
        warnings: results.warnings.length,
        failed: results.checks.filter(check => check.status === 'FAIL').length };
    return results;
}

if (require.main === module) {
    const results = runHealthCheck();
    console.log(JSON.stringify(results, null, 2));
    process.exitCode = results.status === 'HEALTHY' ? 0 : 1;
}

module.exports = { runHealthCheck };
