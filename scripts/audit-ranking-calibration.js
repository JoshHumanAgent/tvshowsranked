/* Read-only JSON diagnostic: node scripts/audit-ranking-calibration.js
 * Uses public defaults, never account settings. Does not propose replacement scores.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');
const math = require('../ranking-math');
const { Model } = require('../ranking-state');
const root = path.resolve(__dirname, '..');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex');
const round = n => Math.round((n + 1e-10) * 1e6) / 1e6;
const keys = math.KEYS;
const catalogue = read('data/shows/index.json').shows;
const model = new Model(catalogue);
// Compare the optional bonus against quality alone, regardless of the UI default.
const defaultLengthAdjustment = model.prefs.multiplierEnabled;
model.apply({multiplierEnabled:true});
const shows = model.ranked;
const savedExports = fs.readdirSync(path.join(root, '_archived/josh-edits'))
    .filter(file => /^tvranked-scores-.*\.json$/.test(file)).sort()
    .map(file => ({ file: '_archived/josh-edits/' + file, ...read('_archived/josh-edits/' + file) }));
const originalWeights = { char:20, world:15, cine:10, spect:10, conc:15, drive:15, resol:15 };
const originalOrder = shows.map(s => ({ title:s.title, slug:s.slug, final:math.calculateFinal(s, originalWeights, true) }));
math.rankShows(originalOrder);
const originalBySlug = new Map(originalOrder.map(s => [s.slug, s]));
const evidence = read('docs/ranking-ledger/review-evidence.json');
const oldEvidenceBySlug = new Map(evidence.filter(r => r.path === 'docs/shows/' + r.slug + '.html').map(r => [r.slug, r]));

const rows = shows.map(s => {
    const b = math.breakdown(s);
    const history = savedExports.filter(e => e.overrides?.[s.title]).map(e => ({
        file:e.file,
        ratings:e.overrides[s.title],
        differences:keys.filter(k => s[k] !== e.overrides[s.title][k])
    }));
    const latest = history.at(-1);
    const dimensions = s.assessment.dimensions;
    const mismatches = keys.filter(k => dimensions[k].archive.ratings.length && !dimensions[k].archive.ratings.includes(s[k]));
    return {
        slug:s.slug, title:s.title, rank:s.rank, final:s.final,
        quality:round(b.weighted), multiplier:b.multiplier,
        qualityOnlyRank:s.withoutLengthRank, qualityOnlyScore:s.withoutLengthScore,
        placesGainedFromLength:s.withoutLengthRank - s.rank, tiedAtFinalScore:s.tieCount,
        episodes:s.episodes, ratings:Object.fromEntries(keys.map(k => [k, s[k]])),
        originalWeightsWithLength:{rank:originalBySlug.get(s.slug).rank, final:originalBySlug.get(s.slug).final},
        assessmentStatus:s.assessment.status, scope:s.assessment.scope,
        currentReasonCount:keys.filter(k => dimensions[k].reason).length,
        archivedReasonCount:keys.filter(k => dimensions[k].archive.excerpt).length,
        archivedRatingMismatches:mismatches,
        reviewStatus:s.assessment.review.status,
        historicalPrintedWeightTotals:oldEvidenceBySlug.get(s.slug)?.printedWeightTotals || [],
        issues:s.assessment.issues,
        recoveredEdits:{
            latestMatch:!latest ? 'no-override-found-in-four-exports' : latest.differences.length ? 'partial' : 'exact',
            history,
            baseSnapshotFiles:savedExports.filter(e => e.baseScores?.[s.title]).map(e => e.file)
        }
    };
});

const reversals = [];
const dominanceReversals = [];
for (let i = 0; i < rows.length; i++) {
    for (let j = i + 1; j < rows.length; j++) {
        const a = rows[i], b = rows[j];
        if (a.final <= b.final) continue; // Equal displayed scores are not claimed preferences.
        if (a.quality < b.quality) reversals.push([a.slug, b.slug]);
        if (keys.every(k => b.ratings[k] >= a.ratings[k]) && keys.some(k => b.ratings[k] > a.ratings[k])) {
            dominanceReversals.push([a.slug, b.slug]);
        }
    }
}
const top50 = new Set(rows.slice(0, 50).map(s => s.slug));
const qualityScores = rows.map(s => s.quality);
const histogram = Object.fromEntries(keys.map(k => [k, {
    mean:round(shows.reduce((n,s) => n + s[k], 0) / shows.length),
    counts:Object.fromEntries([...new Set(shows.map(s => s[k]))].sort((a,b) => a-b).map(v => [v, shows.filter(s => s[k] === v).length]))
}]));
const inputFiles = ['data/shows/index.json', 'ranking-math.js', 'ranking-state.js',
    'docs/ranking-ledger/review-evidence.json', 'docs/ranking-ledger/review-corpus.json', ...savedExports.map(e => e.file)];
const report = {
    schemaVersion:2,
    generatedAt:new Date().toISOString(),
    baselineCommit:execFileSync('git', ['rev-parse','HEAD'], {cwd:root, encoding:'utf8'}).trim(),
    inputs:Object.fromEntries(inputFiles.map(file => [file, hash(file)])),
    settings:{weights:math.DEFAULT_WEIGHTS, defaultLengthAdjustment, lengthAdjustment:true, personalOverrides:false, originalWeights},
    methodology:{
        coverage:'Every active ranking recalculated with the optional length preference enabled and public default weights; current evidence metadata and four recovered saved exports compared. The defaultLengthAdjustment field records whether the optional scenario is the default. Dated companion reviews are historical snapshots, not regenerated conclusions.',
        qualityOnly:'Same seven ratings and current weights, all ranked entries recalculated with length disabled. Diagnostic only, not corrected scores or approved replacement ranks.',
        historicalComparison:'Archive mismatches are evidence gaps, not proof the current rating is wrong. Research-reviewed records intentionally supersede old material.',
        recoveredEdits:'Matching an exported override establishes saved provenance, not who made it or whether it was correct. Absence from these four files does not establish AI authorship.',
        ties:'Ranks follow the application: rounded score descending, then English alphabetical title. Tied ordinal positions do not indicate a quality difference.',
        dominance:'A strict final-score advantage despite the lower entry having equal-or-higher ratings in every dimension and a higher rating in at least one. This diagnoses the separate duration preference, not an arithmetic failure.'
    },
    summary:{
        catalogueRecords:catalogue.length, ranked:rows.length, excluded:catalogue.length-rows.length,
        legacy:rows.filter(s => s.assessmentStatus === 'legacy').length,
        researchReviewed:shows.filter(s => s.assessment.status === 'reviewed' && s.assessment.basis === 'research').length,
        unrecordedScopes:rows.filter(s => s.scope.status === 'unrecorded').length,
        noCurrentDimensionReasons:rows.filter(s => s.currentReasonCount === 0).length,
        anyArchivedRatingMismatch:rows.filter(s => s.archivedRatingMismatches.length).length,
        legacyArchivedRatingMismatch:rows.filter(s => s.assessmentStatus === 'legacy' && s.archivedRatingMismatches.length).length,
        exactLatestRecoveredOverride:rows.filter(s => s.recoveredEdits.latestMatch === 'exact').length,
        partialLatestRecoveredOverride:rows.filter(s => s.recoveredEdits.latestMatch === 'partial').length,
        noRecoveredOverride:rows.filter(s => s.recoveredEdits.latestMatch.startsWith('no-')).length,
        qualityBetween7And8Inclusive:qualityScores.filter(s => s >= 7 && s <= 8).length,
        meanAbsoluteRankMovementWithLength:round(rows.reduce((n,s) => n + Math.abs(s.placesGainedFromLength), 0) / rows.length),
        movedAtLeast100Places:rows.filter(s => Math.abs(s.placesGainedFromLength) >= 100).length,
        top50OverlapWithQualityOnly:rows.filter(s => s.qualityOnlyRank <= 50 && top50.has(s.slug)).length,
        showsTiedWithAnotherAtFinalScore:rows.filter(s => s.tiedAtFinalScore > 1).length,
        qualityOrderReversalPairs:reversals.length,
        dimensionDominanceReversalPairs:dominanceReversals.length,
        maximumRelativeLengthAdvantagePercent:round((math.episodeMultiplier(Number.MAX_SAFE_INTEGER)/math.episodeMultiplier(1)-1)*100)
    },
    lengthBoundaries:[10,20,30,40,50,60,75,100].map(n => ({episodes:n, multiplier:math.episodeMultiplier(n), nextEpisodes:n+1, nextMultiplier:math.episodeMultiplier(n+1)})),
    histogram,
    largestLengthLifts:[...rows].sort((a,b) => b.placesGainedFromLength-a.placesGainedFromLength).slice(0,20).map(s => ({title:s.title, rank:s.rank, qualityOnlyRank:s.qualityOnlyRank})),
    first20DimensionDominanceReversals:dominanceReversals.slice(0,20),
    rows
};
process.stdout.write(JSON.stringify(report, null, 2) + '\n');
