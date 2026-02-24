const fs = require('fs');
const path = require('path');

function readJSON(p) {
    let c = fs.readFileSync(p, 'utf8');
    if(c.charCodeAt(0)===0xFEFF) c=c.substring(1);
    return JSON.parse(c);
}

const rankedPath = path.join(__dirname, '../data/core/ranked.json');
const data = readJSON(rankedPath);

console.log('=== DUPLICATE CHECK ===\n');

// Check for duplicate slugs
const slugCounts = {};
const titleCounts = {};
const slugToTitle = {};

data.shows.forEach(s => {
    const slug = s.slug ? s.slug.trim() : 'NO_SLUG';
    slugCounts[slug] = (slugCounts[slug] || 0) + 1;
    slugToTitle[slug] = s.title;
    
    const normTitle = s.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    titleCounts[normTitle] = (titleCounts[normTitle] || 0) + 1;
});

let hasDuplicates = false;

// Check for duplicate slugs
const dupSlugs = Object.entries(slugCounts).filter(([k,v]) => v > 1);
if (dupSlugs.length > 0) {
    hasDuplicates = true;
    console.log('❌ DUPLICATE SLUGS:');
    dupSlugs.forEach(([slug, count]) => {
        console.log('  ' + slug + ': ' + count + ' times');
    });
} else {
    console.log('✓ No duplicate slugs');
}

// Check for duplicate normalized titles
const dupTitles = Object.entries(titleCounts).filter(([k,v]) => v > 1);
if (dupTitles.length > 0) {
    hasDuplicates = true;
    console.log('\n❌ DUPLICATE TITLES (normalized):');
    dupTitles.forEach(([title, count]) => {
        console.log('  ' + title + ': ' + count + ' times');
    });
} else {
    console.log('✓ No duplicate titles');
}

// Check for slugs with leading/trailing spaces
const spaceSlugs = data.shows.filter(s => s.slug && (s.slug.startsWith(' ') || s.slug.endsWith(' ')));
if (spaceSlugs.length > 0) {
    hasDuplicates = true;
    console.log('\n❌ SLUGS WITH SPACES:');
    spaceSlugs.forEach(s => {
        console.log('  "' + s.slug + '" - ' + s.title);
    });
} else {
    console.log('✓ No slugs with spaces');
}

// Summary
console.log('\n=== SUMMARY ===');
console.log('Total shows: ' + data.shows.length);
console.log('Unique slugs: ' + Object.keys(slugCounts).length);
console.log('Unique titles: ' + Object.keys(titleCounts).length);

if (hasDuplicates) {
    console.log('\n❌ ISSUES FOUND - FIX BEFORE PROCEEDING');
    process.exit(1);
} else {
    console.log('\n✓ ALL CHECKS PASSED');
    process.exit(0);
}