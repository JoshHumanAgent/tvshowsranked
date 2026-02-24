const fs = require('fs');

let c = fs.readFileSync('data/core/ranked.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const ranked = JSON.parse(c);

const newShows = [
  {
    title: 'The Rookie',
    slug: 'the-rookie',
    year: 2018, tmdbId: 80339, episodes: 144,
    genres: ['drama', 'crime'], status: 'Returning Series',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // Nathan Fillion. Police procedural. Light-hearted.
    char: 7.5, world: 6.5, cine: 7, spect: 4, conc: 6.5, drive: 7.5, resol: 6
  },
  {
    title: 'Girl from Nowhere',
    slug: 'girl-from-nowhere',
    year: 2018, tmdbId: 90037, episodes: 13,
    genres: ['drama', 'thriller'], status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // Thai anthology. Dark. School settings.
    char: 7.5, world: 7, cine: 7.5, spect: 5, conc: 7, drive: 8, resol: 7
  },
  {
    title: 'The Untamed',
    slug: 'the-untamed',
    year: 2019, tmdbId: 90480, episodes: 50,
    genres: ['drama', 'fantasy', 'action'], status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // Chinese xianxia. Adapted from BL novel. Huge fanbase.
    char: 8, world: 8.5, cine: 8, spect: 7, conc: 7.5, drive: 8, resol: 7.5
  },
  {
    title: 'Riverdale',
    slug: 'riverdale',
    year: 2017, tmdbId: 69121, episodes: 137,
    genres: ['drama', 'mystery', 'romance'], status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // Archie comics adaptation. Campy teen mystery. Declined in later seasons.
    char: 6.5, world: 6.5, cine: 7, spect: 4, conc: 5.5, drive: 7, resol: 5
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
  else if (eps <= 50) mult = 1.02;
  else mult = 1.03;
  return Math.round(base * mult * 100) / 100;
}

console.log('=== BATCH 33 ===\n');
newShows.forEach(s => {
  s.final = calcFinal(s);
  s.locked = false;
  console.log(s.title + ': ' + s.final);
});

newShows.forEach(ns => ranked.shows.push(ns));
ranked.shows.sort((a, b) => b.final - a.final || a.title.localeCompare(b.title));
ranked.shows.forEach((s, i) => s.rank = i + 1);
ranked.meta.total = ranked.shows.length;

fs.writeFileSync('data/core/ranked.json', '\ufeff' + JSON.stringify(ranked, null, 2));

newShows.forEach(ns => {
  const s = ranked.shows.find(x => x.slug === ns.slug);
  console.log('-> #' + s.rank);
});
console.log('Total:', ranked.shows.length);