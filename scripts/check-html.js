const fs = require('fs');
const path = require('path');

const raw = fs.readFileSync(path.join(__dirname, '../data/core/ranked.json'), 'utf8').replace(/^\uFEFF/, '');
const data = JSON.parse(raw);
const top20 = data.shows.slice(0, 20);

let existing = [];
try {
  existing = fs.readdirSync(path.join(__dirname, '../docs/shows'))
    .filter(f => f.endsWith('.html'))
    .map(f => f.replace('.html', ''));
} catch (e) {
  console.log('No docs/shows directory');
}

const missing = top20.filter(s => !existing.includes(s.slug));
console.log('Top 20 missing HTML:', missing.length);
missing.forEach(s => console.log('#' + s.rank, s.title, '-', s.slug));