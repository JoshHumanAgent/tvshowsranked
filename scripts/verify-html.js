const fs = require('fs');
const path = require('path');

function readJSON(p) {
    let c = fs.readFileSync(p, 'utf8');
    if(c.charCodeAt(0)===0xFEFF) c=c.substring(1);
    return JSON.parse(c);
}

const rankedPath = path.join(__dirname, '../data/core/ranked.json');
const htmlDir = path.join(__dirname, '../docs/shows');

const data = readJSON(rankedPath);
const htmlFiles = fs.readdirSync(htmlDir).filter(f => f.endsWith('.html'));

console.log('=== HTML VERIFICATION ===\n');

// Check for duplicate HTML files
const htmlCounts = {};
htmlFiles.forEach(f => {
    htmlCounts[f] = (htmlCounts[f] || 0) + 1;
});
const dupHtml = Object.entries(htmlCounts).filter(([k,v]) => v > 1);
if (dupHtml.length > 0) {
    console.log('❌ DUPLICATE HTML FILES:');
    dupHtml.forEach(([f, count]) => console.log('  ' + f + ': ' + count));
} else {
    console.log('✓ No duplicate HTML files');
}

// Check HTML slugs vs ranked.json
const rankedSlugs = new Set(data.shows.map(s => s.slug));
const htmlSlugs = new Set(htmlFiles.map(f => f.replace('.html', '')));

const htmlNotInRanked = [...htmlSlugs].filter(s => !rankedSlugs.has(s));
const rankedNotInHtml = [...rankedSlugs].filter(s => !htmlSlugs.has(s));

if (htmlNotInRanked.length > 0) {
    console.log('\n⚠️ HTML files not in ranked.json (' + htmlNotInRanked.length + '):');
    htmlNotInRanked.slice(0, 10).forEach(s => console.log('  ' + s));
    if (htmlNotInRanked.length > 10) console.log('  ... and ' + (htmlNotInRanked.length - 10) + ' more');
} else {
    console.log('✓ All HTML files have matching ranked entries');
}

if (rankedNotInHtml.length > 0) {
    console.log('\n⚠️ Ranked shows missing HTML (' + rankedNotInHtml.length + '):');
    rankedNotInHtml.slice(0, 10).forEach(s => console.log('  ' + s));
    if (rankedNotInHtml.length > 10) console.log('  ... and ' + (rankedNotInHtml.length - 10) + ' more');
} else {
    console.log('✓ All ranked shows have HTML files');
}

// Summary
console.log('\n=== SUMMARY ===');
console.log('Total shows in ranked.json: ' + data.shows.length);
console.log('Total HTML files: ' + htmlFiles.length);
console.log('HTML coverage: ' + Math.round((htmlFiles.length / data.shows.length) * 100) + '%');