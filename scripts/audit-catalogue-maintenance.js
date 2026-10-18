/* Read-only release and editorial invariants. A passing audit is not a quality judgment. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const math = require('../ranking-math');
const state = require('../ranking-state');
const canonical = value => Array.isArray(value) ? value.map(canonical) : value && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).sort().map(k => [k, canonical(value[k])])) : value;
const same = (a,b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));
const manifestDigest = ledger => crypto.createHash('sha256').update(JSON.stringify(canonical(ledger))).digest('hex');
function unchangedDigest(shows, excludedSlugs) {
    const excluded = new Set(excludedSlugs);
    const records = shows.filter(s=>!excluded.has(s.slug)).map(({release,...s})=>s).sort((a,b)=>a.slug.localeCompare(b.slug,'en'));
    return manifestDigest(records);
}
function validateTransition(ledger, previous) {
    if (ledger.version === 1) return [];
    const errors = [], check = (condition,message) => { if (!condition) errors.push(message); };
    if (ledger.version !== 2 || !previous || !Array.isArray(ledger.changes) || !Array.isArray(ledger.intakeThisRun)) {
        return ['Missing maintenance predecessor or change record'];
    }
    check(previous.cutoff === ledger.previousCutoff && ledger.previousCutoff < ledger.cutoff, 'Invalid maintenance predecessor');
    check(manifestDigest(previous) === ledger.previousManifestDigest, 'Historical maintenance manifest changed');
    const before = new Map(previous.added.map(s=>[s.slug,s]));
    const after = new Map(ledger.added.map(s=>[s.slug,s]));
    const changes = new Map(ledger.changes.map(c=>[c.slug,c]));
    check(changes.size === ledger.changes.length, 'Duplicate maintenance change');
    for (const [slug, entry] of before) {
        const change = changes.get(slug);
        if (!change) { check(same(entry,after.get(slug)), slug+': intake changed without a recorded transition'); continue; }
        check(same(change.before,entry) && same(change.after,after.get(slug)),slug+': before/after transition disagrees');
        check(typeof change.reason === 'string' && change.reason.trim().length > 0,slug+': missing change reason');
        if (change.kind === 'assessment') {
            check(change.after.status === 'reviewed' && change.after.assessmentVersion === (entry.assessmentVersion || 1)+1,slug+': assessment revision did not advance version');
        } else if (change.kind === 'pending-release-count') {
            check(entry.status === 'pending' && change.after.status === 'pending' &&
                same({...entry,episodes:change.after.episodes},change.after),slug+': release refresh altered pending judgment');
        } else check(false,slug+': unknown maintenance change kind');
    }
    check([...changes.keys()].every(slug=>before.has(slug)), 'Transition names an unknown previous entry');
    const newlyAdded = [...after.keys()].filter(slug=>!before.has(slug)).sort();
    check(same(newlyAdded,[...ledger.intakeThisRun].sort()), 'This-run intake does not match new identities');
    check(same(previous.policy,ledger.policy) && previous.preservedDigest === ledger.preservedDigest, 'Maintenance changed the protected editorial baseline');
    return errors;
}
function preservedDigest(shows) {
    const original = shows.filter(s => s.assessment?.origin !== 'new').map(({release, ...s}) => s).sort((a,b) => a.slug.localeCompare(b.slug,'en'));
    return crypto.createHash('sha256').update(JSON.stringify(canonical(original))).digest('hex');
}
function validateMaintenance(data, core, ledger, previous) {
    const errors = validateTransition(ledger,previous);
    const check = (condition, label) => { if (!condition) errors.push(label); };
    const text = s => typeof s === 'string' && s.trim().length > 0;
    const date = s => /^\d{4}-\d{2}-\d{2}$/.test(s || '') && Number.isFinite(Date.parse(s)) && new Date(s).toISOString().slice(0,10) === s;
    const https = url => { try { return new URL(url).protocol === 'https:'; } catch { return false; } };
    check(date(ledger.cutoff) && ledger.cutoff === data.catalogueCheckedThrough, 'Discovery cutoff disagrees with manifest');
    check(same(math.DEFAULT_WEIGHTS,{char:25,world:15,cine:5,spect:5,conc:15,drive:15,resol:20}), 'Editorial weights drifted');
    check(state.defaults().multiplierEnabled === false && math.episodeMultiplier(10000) === 1.005, 'Duration policy drifted');
    check(same(ledger.policy.weights,math.DEFAULT_WEIGHTS) && ledger.policy.lengthDefault === false && ledger.policy.maxLengthMultiplier === 1.005, 'Manifest policy drifted');
    if (ledger.version === 2 && Array.isArray(ledger.changes) && Array.isArray(ledger.intakeThisRun)) {
        check(unchangedDigest(data.shows,[...ledger.intakeThisRun,...ledger.changes.map(c=>c.slug)]) === ledger.unchangedSincePreviousDigest,
            'Unchanged catalogue records drifted since the previous maintenance release');
    }
    const original = data.shows.filter(s => s.assessment?.origin !== 'new');
    const added = data.shows.filter(s => s.assessment?.origin === 'new');
    check(original.length === ledger.preservedCount && original.length === 442, 'Original catalogue record count changed');
    check(preservedDigest(original) === ledger.preservedDigest, 'Original records changed outside this release-metadata update');
    check(added.length === ledger.added.length && new Set(ledger.added.map(s=>s.slug)).size === added.length, 'Intake manifest is incomplete or duplicated');
    check(data.totalShows === data.shows.length && core.meta.total === data.shows.length, 'Catalogue totals disagree');
    const manifest = new Map(ledger.added.map(s => [s.slug,s]));
    const coreBySlug = new Map(core.shows.map(s => [s.slug,s]));
    const ids = new Set();
    for (const show of data.shows.filter(s=>s.release)) {
        const r = show.release, label = show.slug + ': ';
        check(Number.isInteger(r.tvmazeId) && !ids.has(r.tvmazeId),label+'duplicate or missing programme identity'); ids.add(r.tvmazeId);
        check(date(r.checkedThrough) && r.checkedThrough <= ledger.cutoff && Number.isFinite(Date.parse(r.checkedAt)),label+'invalid release check date');
        check(date(r.premiered) && r.premiered <= r.checkedThrough && date(r.lastReleased) && r.lastReleased <= r.checkedThrough,label+'unreleased premiere or episode');
        check(https(r.source) && https(r.episodeSource) && text(r.episodeBasis),label+'missing release provenance');
        check(Number.isInteger(r.episodes) && r.episodes > 0 && Array.isArray(r.seasons) && r.seasons.length > 0,label+'invalid release count');
        if (Array.isArray(r.seasons)) {
            check(new Set(r.seasons.map(s=>s.season)).size === r.seasons.length,label+'duplicate season');
            check(r.seasons.reduce((n,s)=>n+s.episodes,0) === r.episodes,label+'season totals disagree');
            for (const s of r.seasons) check(Number.isInteger(s.season) && s.season > 0 && Number.isInteger(s.episodes) && s.episodes > 0 &&
                date(s.firstReleased) && date(s.lastReleased) && s.firstReleased <= s.lastReleased && s.lastReleased <= r.checkedThrough,label+'invalid season coverage');
        }
        check(same(r,coreBySlug.get(show.slug)?.release),label+'live/core release metadata disagree');
    }
    for (const show of added) {
        const a = show.assessment, entry = manifest.get(show.slug), label = show.slug + ': ';
        check(!!entry && entry.status === a.status && entry.episodes === show.episodes && entry.scope === a.scope.label,label+'manifest scope/status mismatch');
        check(!!show.release && entry?.tvmazeId === show.release.tvmazeId && entry?.premiered === show.release.premiered,label+'identity not bound to manifest');
        check(show.addedAt <= ledger.cutoff && date(show.addedAt),label+'invalid intake date');
        check(show.rank === null && show.final === null && a.review.status === 'none' && a.review.path === null,label+'invented rank, final or archive');
        check(['pending','reviewed'].includes(a.status),label+'unsupported intake state');
        check(same(math.KEYS.map(k=>show[k]),math.KEYS.map(k=>coreBySlug.get(show.slug)?.[k])),label+'live/core scores disagree');
        if (a.status === 'pending') {
            check(math.KEYS.every(k=>show[k] === null && a.dimensions[k].reason === null) && entry?.scoreVector === null && text(a.nextAction),label+'pending entry acquired unsupported scores');
        } else {
            check(same(math.KEYS.map(k=>show[k]),entry?.scoreVector) && math.calculateFinal(show) === entry?.final,label+'deliberate score vector changed');
            check(a.version === entry?.assessmentVersion && date(a.reviewedAt) && a.reviewedAt <= ledger.cutoff,label+'version/date drift');
            check(a.basis === 'research' && a.provisional === true && text(a.calibration),label+'missing research limits or calibration');
            const critics = (a.sources || []).filter(s=>s.kind === 'criticism');
            check(new Set(critics.map(s=>s.author).filter(text)).size >= 2,label+'fewer than two independent critical authors');
            check(a.sources.some(s=>s.fullRun === true || s.coversEnding === true),label+'ending coverage is absent');
            const count = (show.release?.seasons || []).filter(s=>a.scope.seasons.includes(s.season)).reduce((n,s)=>n+s.episodes,0);
            check(a.scope.episodes === show.episodes && show.episodes <= count,label+'assessment extends beyond released scope');
            for (const k of math.KEYS) check(a.dimensions[k].sourceRefs.some(id=>critics.some(s=>s.id===id)),label+k+' has no critical evidence');
        }
    }
    for (const entry of ledger.releaseChecks) {
        const show = original.find(s=>s.slug === entry.slug);
        check(show?.episodes === entry.storedEpisodes && show?.release?.episodes === entry.releasedEpisodes,entry.slug+': release-check ledger drift');
    }
    try { new state.Model(data.shows); } catch (e) { errors.push(e.message); }
    return {status:errors.length ? 'FAIL' : 'PASS',cutoff:ledger.cutoff,added:added.length,
        newAssessments:added.filter(s=>s.assessment.status==='reviewed').length,pending:added.filter(s=>s.assessment.status==='pending').length,
        existingReleaseChecks:ledger.releaseChecks.length,originalRecords:original.length,errors};
}
function auditCatalogueMaintenance(root = path.resolve(__dirname,'..')) {
    const read = p => JSON.parse(fs.readFileSync(path.join(root,p),'utf8').replace(/^\uFEFF/,''));
    const data = read('data/shows/index.json');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.catalogueCheckedThrough || '')) throw new Error('Missing catalogue discovery cutoff');
    const ledger = read('data/maintenance/'+data.catalogueCheckedThrough+'.json');
    if (ledger.version === 2 && !/^\d{4}-\d{2}-\d{2}$/.test(ledger.previousCutoff || '')) throw new Error('Invalid maintenance predecessor date');
    const previous = ledger.version === 2 ? read('data/maintenance/'+ledger.previousCutoff+'.json') : undefined;
    return validateMaintenance(data,read('data/core/ranked.json'),ledger,previous);
}
if (require.main === module) { const result = auditCatalogueMaintenance(); console.log(JSON.stringify(result,null,2)); process.exitCode = result.errors.length ? 1 : 0; }
module.exports = { auditCatalogueMaintenance, validateMaintenance, validateTransition, manifestDigest, unchangedDigest, preservedDigest };
