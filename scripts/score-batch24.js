const fs = require('fs');

let c = fs.readFileSync('data/core/ranked.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const ranked = JSON.parse(c);

const newShow = {
  title: 'Can This Love Be Translated?',
  slug: 'can-this-love-be-translated',
  year: 2026,
  tmdbId: 229891,
  episodes: 12,
  genres: ['drama', 'romance', 'comedy'],
  status: 'In Production',
  poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
  backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
  // Upcoming 2026 K-drama. Not yet aired. Score conservatively.
  char: 6.5,   // Unknown cast quality
  world: 6,    // Standard romance setting
  cine: 6.5,   // Expected K-drama production
  spect: 4,    // No spectacle
  conc: 5.5,   // Romance premise
  drive: 6,    // Unknown pacing
  resol: 5     // Not yet aired
};

function calcFinal(show) {
  const base = (show.char * 0.20) + (show.world * 0.15) + (show.cine * 0.15) +
               (show.spect * 0.10) + (show.conc * 0.15) + (show.drive * 0.15) +
               (show.resol * 0.10);
  const eps = show.episodes || 40;
  let mult = 1.0;
  if (eps <= 10) mult = 0.96;
  else if (eps <= 20) mult = 0.95;
  else if (eps <= 30) mult = 0.97;
  else if (eps <= 40) mult = 1.00;
  else mult = 1.02;
  return Math.round(base * mult * 100) / 100;
}

newShow.final = calcFinal(newShow);
newShow.locked = false;

console.log('=== BATCH 24 SCORED ===');
console.log(newShow.title + ': ' + newShow.final + ' (' + newShow.status + ')');

const exists = ranked.shows.find(s => s.slug === newShow.slug);
if (!exists) {
  ranked.shows.push(newShow);
  ranked.shows.sort((a, b) => {
    if (b.final !== a.final) return b.final - a.final;
    return a.title.localeCompare(b.title);
  });
  ranked.shows.forEach((s, i) => s.rank = i + 1);
  ranked.meta.total = ranked.shows.length;
  ranked.meta.generated = new Date().toISOString();

  fs.writeFileSync('data/core/ranked.json', '\ufeff' + JSON.stringify(ranked, null, 2));

  const s = ranked.shows.find(x => x.slug === newShow.slug);
  console.log('\n' + s.title + ' -> Rank #' + s.rank);
  console.log('Total: ' + ranked.shows.length);
} else {
  console.log('Already exists!');
}

// Clear queue - remaining shows not found on TMDB
fs.writeFileSync('data/core/queue.json', '\ufeff' + JSON.stringify({
  meta: { total: 0, generated: new Date().toISOString() },
  candidates: []
}, null, 2));
console.log('\nQueue CLEARED (remaining shows not in TMDB)');