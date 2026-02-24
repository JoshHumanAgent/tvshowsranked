const fs = require('fs');

let c = fs.readFileSync('data/core/queue.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const q = JSON.parse(c);

// Valid drama slugs (not animation)
const validSlugs = [
  'the-loyal-pin',
  'bon-appetit-your-majesty',
  'heated-rivalry',
  'when-life-gives-you-tangerines',
  'good-boy',
  'head-over-heels',
  'can-this-love-be-translated',
  'friendly-rivalry',
  'lovely-runner',
  'high-school-return-of-a-gangster',
  'the-judge-from-hell'
];

const validCandidates = q.candidates.filter(c => validSlugs.includes(c.slug));

fs.writeFileSync('data/core/queue.json', '\ufeff' + JSON.stringify({
  meta: { total: validCandidates.length, generated: new Date().toISOString() },
  candidates: validCandidates
}, null, 2));

console.log('Queue updated: ' + validCandidates.length + ' valid drama candidates');
validCandidates.forEach((c, i) => console.log((i+1) + '. ' + c.title + ' (' + c.year + ')'));