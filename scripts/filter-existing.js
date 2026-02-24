const fs = require('fs');

let c = fs.readFileSync('data/core/queue.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const q = JSON.parse(c);

let c2 = fs.readFileSync('data/core/ranked.json', 'utf8');
if (c2.charCodeAt(0) === 0xFEFF) c2 = c2.substring(1);
const ranked = JSON.parse(c2);
const existingSlugs = new Set(ranked.shows.map(s => s.slug));

// Filter out existing shows
const newCandidates = q.candidates.filter(c => !existingSlugs.has(c.slug));

console.log('=== NEW (NOT IN POOL) ===');
newCandidates.forEach((c, i) => console.log((i+1) + '. ' + c.title + ' (' + c.year + ')'));
console.log('\nTotal: ' + newCandidates.length);

fs.writeFileSync('data/core/queue.json', '\ufeff' + JSON.stringify({
  meta: { total: newCandidates.length, generated: new Date().toISOString() },
  candidates: newCandidates
}, null, 2));