const fs = require('fs');
const path = require('path');

// ANSI colors for output
const R = '\x1b[31m';  // Red
const G = '\x1b[32m';  // Green  
const Y = '\x1b[33m';  // Yellow
const C = '\x1b[36m';  // Cyan
const X = '\x1b[0m';   // Reset

function readJSON(p) {
    let c = fs.readFileSync(p, 'utf8');
    if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
    return JSON.parse(c);
}

function writeJSON(p, d) {
    fs.writeFileSync(p, '\ufeff' + JSON.stringify(d, null, 2));
}

console.log(C + '╔══════════════════════════════════════════════════════════════╗' + X);
console.log(C + '║     DYNAMIC RANK ENGINE - VALIDATION & DEBUG SYSTEM          ║' + X);
console.log(C + '╚══════════════════════════════════════════════════════════════╝' + X);
console.log();

let errors = 0;
let warnings = 0;

// Load current files
let top100, overflow;
try {
    top100 = readJSON('data/core/01-current-index.json');
    console.log(G + '✓' + X + ' Top 100 loaded: ' + top100.shows.length + ' shows');
} catch(e) {
    console.log(R + '✗ ERROR:' + X + ' Cannot load Top 100: ' + e.message);
    process.exit(1);
}

try {
    overflow = readJSON('data/core/02-overflow-pool.json');
    console.log(G + '✓' + X + ' Overflow loaded: ' + overflow.shows.length + ' shows');
} catch(e) {
    console.log(R + '✗ ERROR:' + X + ' Cannot load overflow: ' + e.message);
    process.exit(1);
}

console.log();
console.log(C + '── CHECK 1: True Detective S1 Integrity ─────────────────────' + X);
const td = top100.shows.find(s => s.slug === 'true-detective-s1');
if (!td) {
    console.log(R + '✗ CRITICAL:' + X + ' True Detective S1 NOT FOUND in Top 100!');
    errors++;
} else {
    console.log(G + '✓' + X + ' True Detective S1 found at rank #' + td.rank);
    
    const required = ['poster', 'backdrop', 'tmdbId', 'final', 'char', 'world', 'cine', 'spect', 'conc', 'drive', 'resol'];
    const missing = required.filter(f => !td[f]);
    if (missing.length > 0) {
        console.log(R + '✗ ERROR:' + X + ' True Detective S1 missing fields: ' + missing.join(', '));
        errors++;
    } else {
        console.log(G + '✓' + X + ' All required fields present');
    }
    
    if (td.final !== 8.0) {
        console.log(Y + '! WARNING:' + X + ' True Detective S1 score changed: ' + td.final + ' (expected 8.0)');
        warnings++;
    }
}

console.log();
console.log(C + '── CHECK 2: Severance Position ──────────────────────────────' + X);
const sev = top100.shows.find(s => s.slug === 'severance');
if (!sev) {
    console.log(Y + '! WARNING:' + X + ' Severance not in Top 100 (may be intentional)');
    warnings++;
} else {
    console.log(G + '✓' + X + ' Severance at rank #' + sev.rank + ', score: ' + sev.final);
    if (sev.final > 8.0) {
        console.log(Y + '! WARNING:' + X + ' Severance score may be updated (' + sev.final + ' > 8.0)');
        warnings++;
    }
}

console.log();
console.log(C + '── CHECK 3: Duplicate Slugs ─────────────────────────────────' + X);
const allShows = [...top100.shows, ...overflow.shows];
const slugCounts = {};
allShows.forEach(s => {
    slugCounts[s.slug] = (slugCounts[s.slug] || 0) + 1;
});
const duplicates = Object.entries(slugCounts).filter(([k, v]) => v > 1);
if (duplicates.length > 0) {
    console.log(R + '✗ CRITICAL:' + X + ' Duplicate slugs found:');
    duplicates.forEach(([slug, count]) => console.log('  - ' + slug + ' appears ' + count + ' times'));
    errors++;
} else {
    console.log(G + '✓' + X + ' No duplicate slugs found');
}

console.log();
console.log(C + '── CHECK 4: Top 100 Rankings ────────────────────────────────' + X);
const sorted = [...top100.shows].sort((a, b) => b.final - a.final);
let rankErrors = 0;
sorted.forEach((s, i) => {
    const expectedRank = i + 1;
    if (s.rank !== expectedRank) {
        console.log(Y + '! WARNING:' + X + ' ' + s.slug + ': rank ' + s.rank + ' should be ' + expectedRank);
        rankErrors++;
    }
});
if (rankErrors === 0) {
    console.log(G + '✓' + X + ' All ranks correct (sorted by score)');
} else {
    console.log(Y + '! ' + rankErrors + ' shows have incorrect rank numbers' + X);
    warnings++;
}

console.log();
console.log(C + '── CHECK 5: Poster/Backdrop URLs ────────────────────────────' + X);
let urlErrors = 0;
top100.shows.forEach(s => {
    if (!s.poster || !s.poster.includes('tmdb.org')) {
        console.log(Y + '! WARNING:' + X + ' ' + s.slug + ' missing/invalid poster');
        urlErrors++;
    }
});
if (urlErrors === 0) {
    console.log(G + '✓' + X + ' All posters valid');
} else {
    warnings++;
}

console.log();
console.log(C + '── CHECK 6: Existing Top 100 Preservation ───────────────────' + X);
console.log(C + '    (Compare with git to detect unintended changes)' + X);
const { execSync } = require('child_process');
try {
    const gitShow = execSync('git show HEAD:data/core/01-current-index.json', { encoding: 'utf8', cwd: '.' });
    let gitContent = gitShow;
    if (gitContent.charCodeAt(0) === 0xFEFF) gitContent = gitContent.substring(1);
    const gitData = JSON.parse(gitContent);
    const gitSlugs = new Set(gitData.shows.map(s => s.slug));
    const currentSlugs = new Set(top100.shows.map(s => s.slug));
    
    const removed = [...gitSlugs].filter(s => !currentSlugs.has(s));
    const added = [...currentSlugs].filter(s => !gitSlugs.has(s));
    
    if (removed.length > 0) {
        console.log(Y + '! WARNING:' + X + ' Shows removed from Top 100:');
        removed.forEach(s => console.log('  - ' + s));
        warnings++;
    }
    if (added.length > 0) {
        console.log(G + '✓' + X + ' New shows added to Top 100:');
        added.forEach(s => {
            const show = top100.shows.find(x => x.slug === s);
            console.log('  - ' + s + ' (score: ' + (show?.final || 'N/A') + ')');
        });
    }
    if (removed.length === 0 && added.length === 0) {
        console.log(G + '✓' + X + ' No changes to Top 100 composition');
    }
} catch(e) {
    console.log(Y + '! WARNING:' + X + ' Cannot compare with git: ' + e.message);
}

console.log();
console.log(C + '═══════════════════════════════════════════════════════════════' + X);
if (errors === 0 && warnings === 0) {
    console.log(G + '✓ ALL CHECKS PASSED' + X);
    console.log(G + '  Safe to deploy' + X);
    process.exit(0);
} else {
    console.log(errors > 0 ? R + '✗ ' + errors + ' ERRORS' + X : '' + (warnings > 0 ? Y + '⚠ ' + warnings + ' WARNINGS' + X : ''));
    if (errors > 0) {
        console.log(R + '  DO NOT DEPLOY - Fix errors first' + X);
        process.exit(1);
    } else {
        console.log(Y + '  Review warnings before deploying' + X);
        process.exit(0);
    }
}
