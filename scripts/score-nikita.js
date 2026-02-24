const fs = require('fs');

let c = fs.readFileSync('data/core/ranked.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const ranked = JSON.parse(c);

const newShow = {
  title: 'Nikita',
  slug: 'nikita-2010',
  year: 2010,
  tmdbId: 32868,
  episodes: 73,
  genres: ['action', 'thriller', 'drama'],
  status: 'Ended',
  poster: 'https://image.tmdb.org/t/p/w500/rYsZGB1m6jLQpqYrsAnBmfdrSC.jpg',
  backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
  // Maggie Q. CW action. Division spy thriller. 4 seasons.
  char: 7,     // Maggie Q strong
  world: 7,    // Spy/conspiracy world
  cine: 6.5,   // CW budget but stylish
  spect: 6,    // Action spectacle
  conc: 6.5,   // Division, secrets
  drive: 7.5,  // Propulsive action
  resol: 7     // Complete after 4 seasons
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

console.log('=== FINAL SHOW SCORED ===');
console.log(newShow.title + ': ' + newShow.final + ' (' + newShow.status + ', ' + newShow.episodes + ' eps)');

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