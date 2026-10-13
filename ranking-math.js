/* Shared by the browser and the read-only ranking audit. */
(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    else root.RankingMath = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
    'use strict';
    const KEYS = Object.freeze(['char', 'world', 'cine', 'spect', 'conc', 'drive', 'resol']);
    const DEFAULT_WEIGHTS = Object.freeze({ char: 25, world: 15, cine: 5, spect: 5, conc: 15, drive: 15, resol: 20 });

    function validWeights(weights) {
        return !!weights && KEYS.every(key => Number.isFinite(weights[key]) && weights[key] >= 0 && weights[key] <= 100) &&
            Math.abs(KEYS.reduce((sum, key) => sum + weights[key], 0) - 100) < 1e-8;
    }

    function validateScores(scores, partial = false) {
        if (!scores || typeof scores !== 'object') throw new Error('Category scores are missing.');
        for (const key of KEYS) {
            if (partial && scores[key] === undefined) continue;
            if (!Number.isFinite(scores[key]) || scores[key] < 0 || scores[key] > 10) {
                throw new Error(key + ' must be a number from 0 to 10.');
            }
        }
    }

    function episodeMultiplier(episodes) {
        if (!Number.isInteger(episodes) || episodes < 1) throw new Error('Episode count must be a positive whole number.');
        if (episodes <= 10) return 0.96;
        if (episodes <= 20) return 0.95;
        if (episodes <= 30) return 0.97;
        if (episodes <= 40) return 1;
        if (episodes <= 50) return 1.02;
        if (episodes <= 60) return 1.03;
        if (episodes <= 75) return 1.04;
        if (episodes <= 100) return 1.05;
        return 1.06;
    }

    function breakdown(show, weights = DEFAULT_WEIGHTS, bonusEnabled = true) {
        if (!validWeights(weights)) throw new Error('Category weights must total 100%.');
        validateScores(show);
        const weighted = KEYS.reduce((sum, key) => sum + show[key] * weights[key], 0) / 100;
        const multiplier = bonusEnabled ? episodeMultiplier(show.episodes) : 1;
        // Round only the final result. The small tolerance removes binary errors at decimal half-cent boundaries.
        const final = Math.round((weighted * multiplier + 1e-10) * 100) / 100;
        const contributions = KEYS.map(key => ({ key, rating: show[key], weight: weights[key], points: show[key] * weights[key] / 100 }));
        return { weighted, multiplier, final, contributions };
    }

    function calculateFinal(show, weights, bonusEnabled) {
        return breakdown(show, weights, bonusEnabled).final;
    }

    function compareScores(a, b) {
        return b.final - a.final || a.title.localeCompare(b.title, 'en');
    }

    function rankShows(shows) {
        shows.sort(compareScores);
        shows.forEach((show, index) => { show.rank = index + 1; });
    }

    return Object.freeze({ KEYS, DEFAULT_WEIGHTS, validWeights, validateScores,
        episodeMultiplier, breakdown, calculateFinal, compareScores, rankShows });
});
