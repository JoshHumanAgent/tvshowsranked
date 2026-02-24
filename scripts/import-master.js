const fs = require('fs');
const path = require('path');

console.log('=== IMPORTING MASTER RANKINGS ===\n');

// Read the import file
const importPath = 'C:/Users/randl/Desktop/OpenClaw-Workspace/10-Projects/tvshowsranked/data/imports/ranked-master-2026-02-24T09-14-13.json';
const outputPath = 'C:/Users/randl/Desktop/OpenClaw-Workspace/10-Projects/tvshowsranked/data/core/ranked.json';

let data = fs.readFileSync(importPath, 'utf8');
if (data.charCodeAt(0) === 0xFEFF) data = data.substring(1);
const importData = JSON.parse(data);

console.log('Import meta:', importData.meta);
console.log('Shows in import:', importData.shows.length);

// Clean up slugs (trim whitespace)
let fixedSlugs = 0;
importData.shows.forEach(s => {
    if (s.slug && (s.slug.startsWith(' ') || s.slug.endsWith(' '))) {
        console.log('Fixing slug: "' + s.slug + '" -> "' + s.slug.trim() + '"');
        s.slug = s.slug.trim();
        fixedSlugs++;
    }
});

// Check for duplicates
const slugSet = new Set();
const duplicates = [];
importData.shows.forEach(s => {
    if (slugSet.has(s.slug)) {
        duplicates.push(s.slug);
    }
    slugSet.add(s.slug);
});

if (duplicates.length > 0) {
    console.log('\n❌ DUPLICATES FOUND:', duplicates);
    process.exit(1);
}

// Sort by rank
importData.shows.sort((a, b) => a.rank - b.rank);

// Re-number ranks to ensure sequential
importData.shows.forEach((s, i) => {
    s.rank = i + 1;
});

// Update meta
importData.meta.imported = new Date().toISOString();
importData.meta.source = 'Master Import from Josh';

// Save to ranked.json
fs.writeFileSync(outputPath, JSON.stringify(importData, null, 2));

console.log('\n✅ IMPORT COMPLETE');
console.log('Shows imported:', importData.shows.length);
console.log('Slugs fixed:', fixedSlugs);
console.log('Duplicates found:', duplicates.length);

// Verify
const verify = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
console.log('Verification - shows in ranked.json:', verify.shows.length);