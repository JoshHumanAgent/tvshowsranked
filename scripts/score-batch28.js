const fs = require('fs');

let c = fs.readFileSync('data/core/ranked.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const ranked = JSON.parse(c);

const newShows = [
  {
    title: 'Shanty Town',
    slug: 'shanty-town',
    year: 2023,
    tmdbId: 217895,
    episodes: 6,
    genres: ['drama', 'crime'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    // Nigerian crime drama. Lagos underworld.
    char: 7, world: 7.5, cine: 7, spect: 5, conc: 7, drive: 7.5, resol: 6.5
  },
  {
    title: 'Like Water for Chocolate',
    slug: 'like-water-for-chocolate',
    year: 2024,
    tmdbId: 249871,
    episodes: 12,
    genres: ['drama', 'romance'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    // Mexican period romance. Adaptation of classic novel.
    char: 7, world: 7, cine: 7.5, spect: 4, conc: 6.5, drive: 7, resol: 7
  },
  {
    title: 'Lioness',
    slug: 'lioness',
    year: 2023,
    tmdbId: 211409,
    episodes: 16,
    genres: ['drama', 'thriller', 'action'],
    status: 'Returning Series',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    // Taylor Sheridan. CIA thriller. Zoe Saldana.
    char: 7.5, world: 7.5, cine: 7.5, spect: 6, conc: 7, drive: 7.5, resol: 5.5
  },
  {
    title: 'Cross',
    slug: 'cross-2024',
    year: 2024,
    tmdbId: 258721,
    episodes: 16,
    genres: ['drama', 'crime', 'thriller'],
    status: 'Returning Series',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    // Korean crime thriller. Police procedural.
    char: 7, world: 6.5, cine: 7, spect: 5, conc: 7, drive: 7.5, resol: 5.5
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
  else mult = 1.00;
  return Math.round(base * mult * 100) / 100;
}

console.log('=== BATCH 28 SCORED ===\n');
newShows.forEach(s => {
  s.final = calcFinal(s);
  s.locked = false;
  console.log(s.title + ': ' + s.final + ' (' + s.episodes + ' eps)');
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