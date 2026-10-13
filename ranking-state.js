/* The catalogue and preference model. Shared by the page and Node tests. */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory(require('./ranking-math'));
    else root.RankingState = factory(root.RankingMath);
})(typeof globalThis === 'object' ? globalThis : this, function (math) {
    'use strict';
    const CATEGORIES = Object.freeze([
        { key: 'char', name: 'Characters & acting', short: 'Characters', description: 'Believable people with distinct motives, agency and inner lives, expressed through convincing performances. Judge how many substantial roles sustain that standard across the assessed run, including weaker links; one great lead or a large cast is not enough.' },
        { key: 'world', name: 'World building', short: 'World', description: 'A credible social world with consistent rules, material constraints and institutions that exist beyond the plot. Behaviour and consequences must fit that world. Ordinary communities count as much as invented settings.' },
        { key: 'cine', name: 'Cinematography', short: 'Camera', description: 'How framing, light, composition and movement communicate meaning. Judge how the camera shows a world, separately from the scale of what it shows.' },
        { key: 'spect', name: 'Visual spectacle', short: 'Spectacle', description: 'The impact, variety and ambition of what we see: unfamiliar lives and systems as well as spectacular environments. Effects and spending are not prerequisites.' },
        { key: 'conc', name: 'Conceptual density', short: 'Ideas', description: 'Distinct, independent ideas dramatised through choices and consequences, and how those ideas interact. Serious tone or a list of themes is not enough.' },
        { key: 'drive', name: 'Narrative drive', short: 'Momentum', description: 'Purposeful progression driven by credible choices, causes and lasting consequences. Quiet scenes can build tension or understanding; repeated resets, contrivances and manufactured cliffhangers weaken the writing.' },
        { key: 'resol', name: 'Narrative path & resolution', short: 'Payoff', description: 'Promises developed and earned across the assessed run, with coherent setups, character choices and consequences. Judge the whole journey, not just its final twist. Ambiguity can be satisfying; an ongoing series is not automatically a failed ending.' }
    ]);
    const ERAS = Object.freeze(['last3mo', 'last6mo', 'thisYear', '2020s', '2010s', '2000s', 'pre2000']);
    const SORTS = Object.freeze(['rank', 'score-desc', 'score-asc', 'title', 'year-desc', 'year-asc']);
    const record = value => value && typeof value === 'object' && !Array.isArray(value);
    const clone = value => JSON.parse(JSON.stringify(value));
    const normalizeText = text => String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    function validateAssessment(show) {
        const a = show.assessment;
        if (a === undefined) return; // Older catalogues and account backups remain readable.
        const text = value => typeof value === 'string' && value.trim().length > 0;
        if (!record(a) || !Number.isInteger(a.version) || a.version < 1 || a.rubricVersion !== '2026-10' ||
            !['legacy','reviewed','withheld'].includes(a.status) || !record(a.scope) || !text(a.scope.label) ||
            !['named','unrecorded'].includes(a.scope.status) || !record(a.review) ||
            a.review.path !== 'docs/shows/' + show.slug + '.html' || !['archived','withheld'].includes(a.review.status) ||
            !text(a.review.note) || !Array.isArray(a.review.sources) || a.review.sources.some(url => {
                try { return new URL(url).protocol !== 'https:'; } catch { return true; }
            }) || !Array.isArray(a.issues) || a.issues.some(issue => !record(issue) || !text(issue.note)) ||
            !record(a.dimensions) || math.KEYS.some(key => {
                const dimension = a.dimensions[key], archive = dimension?.archive;
                return !record(dimension) || (dimension.reason !== null && !text(dimension.reason)) || !record(archive) ||
                    !Array.isArray(archive.ratings) || archive.ratings.some(n => !Number.isFinite(n) || n < 0 || n > 10) ||
                    (archive.excerpt !== null && !text(archive.excerpt));
            })) throw new Error('Invalid assessment evidence for ' + show.title);
        if (a.status === 'reviewed') {
            const sources = a.sources;
            const ids = new Set(Array.isArray(sources) ? sources.map(s => s?.id) : []);
            const references = refs => Array.isArray(refs) && refs.length > 0 && refs.every(id => ids.has(id));
            if (a.version < 2 || show.reviewStatus || !['research','viewing'].includes(a.basis) ||
                typeof a.provisional !== 'boolean' || (a.basis === 'research' && !a.provisional) ||
                !/^\d{4}-\d{2}-\d{2}$/.test(a.reviewedAt || '') || !text(a.summary) || !text(a.limitations) ||
                a.scope.status !== 'named' || a.scope.episodes !== show.episodes || !text(a.scope.episodeBasis) ||
                !['season','limited-series','complete-series'].includes(a.scope.coverage) ||
                !Array.isArray(a.scope.seasons) || !a.scope.seasons.length || a.scope.seasons.some(n => !Number.isInteger(n) || n < 1) ||
                !Array.isArray(sources) || !sources.length || ids.size !== sources.length || sources.some(s => {
                    if (!record(s) || !/^[a-z0-9-]+$/.test(s.id) || !text(s.title) || !text(s.coverage)) return true;
                    try { return new URL(s.url).protocol !== 'https:'; } catch { return true; }
                }) || !references(a.scope.sourceRefs) || math.KEYS.some(key => !text(a.dimensions[key].reason) ||
                    !references(a.dimensions[key].sourceRefs) ||
                    (a.dimensions[key].evidenceNote !== undefined && !text(a.dimensions[key].evidenceNote)))) {
                throw new Error('Invalid reviewed assessment for ' + show.title);
            }
        }
    }

    function defaults() {
        return { weights: { ...math.DEFAULT_WEIGHTS }, multiplierEnabled: false, currentGenres: ['all'],
            currentEras: [], sortBy: 'rank', filtersCollapsed: true, pinnedShows: [], scoreOverrides: {} };
    }

    function normalizePreferences(raw, genres = []) {
        if (!record(raw)) throw new Error('This is not a rankings backup.');
        const result = defaults();
        if (raw.weights !== undefined) {
            if (!math.validWeights(raw.weights)) throw new Error('Saved weights must total 100%.');
            result.weights = Object.fromEntries(math.KEYS.map(key => [key, raw.weights[key]]));
        }
        for (const key of ['multiplierEnabled', 'filtersCollapsed']) {
            if (raw[key] !== undefined && typeof raw[key] !== 'boolean') throw new Error('Invalid setting: ' + key);
            if (raw[key] !== undefined) result[key] = raw[key];
        }
        if (raw.sortBy !== undefined && !SORTS.includes(raw.sortBy)) throw new Error('Unknown sort order.');
        if (raw.sortBy) result.sortBy = raw.sortBy;
        for (const key of ['currentGenres', 'currentEras', 'pinnedShows']) {
            if (raw[key] !== undefined && (!Array.isArray(raw[key]) || raw[key].some(x => typeof x !== 'string'))) {
                throw new Error('Invalid setting: ' + key);
            }
        }
        const selectedGenres = (raw.currentGenres || []).filter(g => genres.includes(g));
        result.currentGenres = raw.currentGenres?.includes('all') || !selectedGenres.length ? ['all'] : [...new Set(selectedGenres)];
        result.currentEras = [...new Set((raw.currentEras || []).filter(e => ERAS.includes(e)))];
        result.pinnedShows = [...new Set(raw.pinnedShows || [])];
        const overrides = raw.scoreOverrides ?? raw.overrides ?? {};
        if (!record(overrides)) throw new Error('Saved ratings must be an object.');
        result.scoreOverrides = Object.fromEntries(Object.entries(overrides).map(([title, scores]) => {
            if (!record(scores)) throw new Error('Invalid ratings for ' + title);
            math.validateScores(scores, true);
            return [title, Object.fromEntries(math.KEYS.filter(k => scores[k] !== undefined).map(k => [k, scores[k]]))];
        }));
        return result;
    }

    // Keep the moved weight exact, then share the remainder proportionally.
    // Largest remainders make whole percentages sum to exactly 100, even at the extremes.
    function balanceWeights(weights, key, value) {
        if (!math.validWeights(weights) || !math.KEYS.includes(key) || !Number.isInteger(value) || value < 0 || value > 100) {
            throw new Error('Weights must be whole percentages from 0 to 100.');
        }
        const others = math.KEYS.filter(k => k !== key);
        const total = others.reduce((sum, k) => sum + weights[k], 0);
        const fallback = others.reduce((sum, k) => sum + math.DEFAULT_WEIGHTS[k], 0);
        const shares = others.map(k => {
            const exact = (100 - value) * (total ? weights[k] / total : math.DEFAULT_WEIGHTS[k] / fallback);
            return { key: k, value: Math.floor(exact), fraction: exact - Math.floor(exact) };
        });
        let remaining = 100 - value - shares.reduce((sum, s) => sum + s.value, 0);
        [...shares].sort((a, b) => b.fraction - a.fraction).forEach(s => { if (remaining-- > 0) s.value++; });
        return Object.fromEntries([[key, value], ...shares.map(s => [s.key, s.value])]);
    }

    function matchesEra(show, era, now = new Date()) {
        const year = now.getFullYear(), month = now.getMonth() + 1;
        const monthsAgo = (year - show.year) * 12 + month - show.month;
        if (era === 'last3mo' || era === 'last6mo') return monthsAgo >= 0 && monthsAgo < (era === 'last3mo' ? 3 : 6);
        if (era === 'thisYear') return show.year === year && monthsAgo >= 0;
        if (era === 'pre2000') return show.year < 2000;
        return show.year >= Number(era.slice(0, 4)) && show.year < Number(era.slice(0, 4)) + 10;
    }

    class Model {
        constructor(catalogue) {
            if (!Array.isArray(catalogue) || !catalogue.length) throw new Error('The catalogue is empty.');
            const titles = new Set(), slugs = new Set();
            for (const show of catalogue) {
                math.validateScores(show);
                math.episodeMultiplier(show.episodes);
                validateAssessment(show);
                if (!show.title || typeof show.title !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(show.slug) ||
                    titles.has(show.title) || slugs.has(show.slug) || !Array.isArray(show.genres) ||
                    show.genres.some(g => typeof g !== 'string') || !Number.isInteger(show.year) ||
                    !Number.isInteger(show.month) || show.month < 1 || show.month > 12) throw new Error('Invalid catalogue entry.');
                titles.add(show.title); slugs.add(show.slug);
            }
            this.aliases = catalogue.filter(s => s.duplicateOf);
            this.original = clone(catalogue.filter(s => !s.duplicateOf && s.verificationStatus !== 'unverified'));
            this.base = new Map(this.original.map(s => [s.title, s]));
            this.canonicalBySlug = new Map(this.original.map(s => [s.slug,s]));
            if (this.aliases.some(s => !this.canonicalBySlug.has(s.duplicateOf))) throw new Error('Duplicate refers to a missing canonical show.');
            this.genres = [...new Set(this.original.flatMap(s => s.genres))].sort();
            this.apply({});
        }
        apply(raw) {
            const next = normalizePreferences(raw, this.genres); // Validate everything before changing state.
            // Preserve old title-keyed backups, while rendering a single canonical entry.
            for (const alias of this.aliases) {
                const title = this.canonicalBySlug.get(alias.duplicateOf).title;
                if (Object.hasOwn(next.scoreOverrides, alias.title)) {
                    next.scoreOverrides[title] = { ...next.scoreOverrides[alias.title], ...next.scoreOverrides[title] };
                }
                next.pinnedShows = next.pinnedShows.map(t => t === alias.title ? title : t);
            }
            next.pinnedShows = [...new Set(next.pinnedShows)];
            this.prefs = next;
            this.recalculate();
        }
        recalculate() {
            this.shows = this.original.map(show => {
                const scores = Object.hasOwn(this.prefs.scoreOverrides, show.title) ? this.prefs.scoreOverrides[show.title] : {};
                const result = { ...show, ...scores };
                // A wrong-programme assessment is missing evidence, not evidence of poor quality.
                // Keep the record and personal inputs recoverable, without publishing a false rank.
                result.pending = show.assessment?.status === 'withheld' || !!show.reviewStatus;
                result.final = result.pending ? null : math.calculateFinal(result, this.prefs.weights, this.prefs.multiplierEnabled);
                result.rank = null;
                return result;
            });
            this.ranked = this.shows.filter(s => !s.pending);
            math.rankShows(this.ranked);
            const withoutLength = this.ranked.map(s => ({ title:s.title, slug:s.slug, final:math.calculateFinal(s, this.prefs.weights, false) }));
            math.rankShows(withoutLength);
            const noLengthBySlug = new Map(withoutLength.map(s => [s.slug,s]));
            const ties = new Map();
            for (const show of this.ranked) ties.set(show.final, (ties.get(show.final) || 0) + 1);
            for (const show of this.ranked) {
                show.withoutLengthRank = noLengthBySlug.get(show.slug).rank;
                show.withoutLengthScore = noLengthBySlug.get(show.slug).final;
                show.tieCount = ties.get(show.final);
            }
            this.pending = this.shows.filter(s => s.pending).sort((a,b) => a.title.localeCompare(b.title,'en'));
            this.shows = [...this.ranked, ...this.pending];
            this.bySlug = new Map(this.shows.map(s => [s.slug, s]));
            for (const alias of this.aliases) this.bySlug.set(alias.slug,this.bySlug.get(alias.duplicateOf));
        }
        setScore(title, key, value) {
            if (!this.base.has(title) || !math.KEYS.includes(key) || !Number.isFinite(value) || value < 0 || value > 10) {
                throw new Error('Ratings must be between 0 and 10.');
            }
            const show = this.shows.find(s => s.title === title);
            if (show.pending) throw new Error('This programme is awaiting a new assessment. Existing personal ratings are preserved in your backup.');
            const scores = Object.fromEntries(math.KEYS.map(k => [k, k === key ? value : show[k]]));
            this.prefs.scoreOverrides[title] = scores;
            if (math.KEYS.every(k => scores[k] === this.base.get(title)[k])) { this.resetShow(title); return; }
            this.recalculate();
        }
        resetShow(title) {
            delete this.prefs.scoreOverrides[title];
            for (const alias of this.aliases) if (this.canonicalBySlug.get(alias.duplicateOf).title === title) delete this.prefs.scoreOverrides[alias.title];
            this.recalculate();
        }
        setWeight(key, value) { this.prefs.weights = balanceWeights(this.prefs.weights, key, value); this.recalculate(); }
        get modifiedCount() { return Object.keys(this.prefs.scoreOverrides).filter(title => this.base.has(title)).length; }
        snapshot() {
            const result = clone(this.prefs);
            for (const show of this.shows) if (!show.pending && Object.hasOwn(result.scoreOverrides, show.title)) {
                result.scoreOverrides[show.title]._final = show.final; // Compatible with the previous public client.
            }
            return result;
        }
        results({ query = '', onlyPinned = false, now = new Date() } = {}) {
            const terms = normalizeText(query).trim().split(/\s+/).filter(Boolean);
            const p = this.prefs;
            const result = this.shows.filter(s => terms.every(t => normalizeText(s.title).includes(t)) &&
                (p.currentGenres.includes('all') || p.currentGenres.every(g => s.genres.includes(g))) &&
                (!p.currentEras.length || p.currentEras.some(e => matchesEra(s, e, now))) &&
                (!onlyPinned || p.pinnedShows.includes(s.title)));
            const alpha = (a, b) => a.title.localeCompare(b.title, 'en');
            const sorters = { title: alpha, 'score-asc': (a,b) => a.final - b.final || alpha(a,b),
                'year-desc': (a,b) => b.year - a.year || b.month - a.month || a.rank - b.rank,
                'year-asc': (a,b) => a.year - b.year || a.month - b.month || a.rank - b.rank };
            // Pending entries remain searchable and pinnable, but never become "lowest score" zeroes.
            return result.sort((a,b) => Number(a.pending) - Number(b.pending) ||
                (sorters[p.sortBy] || ((a,b) => a.rank - b.rank || alpha(a,b)))(a,b));
        }
    }
    return Object.freeze({ CATEGORIES, ERAS, SORTS, defaults, normalizePreferences, balanceWeights, matchesEra, Model });
});
