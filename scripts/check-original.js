const { execSync } = require('child_process');

const data = execSync('git show 65fe485:data/shows/index.json', { encoding: 'utf8', maxBuffer: 50*1024*1024 });
// Fix BOM if present
let clean = data;
if (clean.charCodeAt(0) === 0xFEFF) clean = clean.substring(1);
const json = JSON.parse(clean);

console.log('=== ORIGINAL TOP 30 (before my session) ===');
console.log('');
json.shows.slice(0, 30).forEach(s => {
    console.log('#' + String(s.rank || '?').padStart(2), s.final, s.title.substring(0,40).padEnd(40), '(' + s.year + ')');
});
console.log('');
console.log('Total original shows:', json.shows.length);
