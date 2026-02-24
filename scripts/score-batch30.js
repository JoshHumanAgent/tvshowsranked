const fs = require('fs');

let c = fs.readFileSync('data/core/ranked.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const ranked = JSON.parse(c);

const newShows = [
  {
    title: 'The Chosen',
    slug: 'the-chosen',
    year: 2019, tmdbId: 105909, episodes: 40,
    genres: ['drama', 'history'], status: 'Returning Series',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // Jesus Christ series. Crowdfunded. Very popular Christian drama.
    char: 8, world: 7.5, cine: 8, spect: 5, conc: 8, drive: 7.5, resol: 6
  },
  {
    title: 'Bridgerton',
    slug: 'bridgerton',
    year: 2020, tmdbId: 80752, episodes: 32,
    genres: ['drama', 'romance'], status: 'Returning Series',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // Shonda Rhimes. Period romance. Netflix hit.
    char: 7.5, world: 8, cine: 8.5, spect: 6, conc: 6, drive: 7.5, resol: 6
  }
];

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

console.log('=== BATCH 30 SCORED ===\n');
newShows.forEach(s => {
  s.final = calcFinal(s);
  s.locked = false;
  console.log(s.title + ': ' + s.final + ' (' + s.year + ', ' + s.episodes + ' eps)');
});

newShows.forEach(ns => {
  if (!ranked.shows.find(s => s.slug === ns.slug)) ranked.shows.push(ns);
});

ranked.shows.sort((a, b) => b.final - a.final || a.title.localeCompare(b.title));
ranked.shows.forEach((s, i) => s.rank = i + 1);
ranked.meta.total = ranked.shows.length;
ranked.meta.generated = new Date().toISOString();

fs.writeFileSync('data/core/ranked.json', '\ufeff' + JSON.stringify(ranked, null, 2));

console.log('\n=== ADDED ===');
newShows.forEach(ns => {
  const s = ranked.shows.find(x => x.slug === ns.slug);
  if (s) console.log(s.title + ' -> #' + s.rank);
});
console.log('Total: ' + ranked.shows.length);