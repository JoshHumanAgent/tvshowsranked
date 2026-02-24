const fs = require('fs');

let c = fs.readFileSync('data/core/ranked.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const ranked = JSON.parse(c);

const existing = new Set(ranked.shows.map(s => s.slug));

const newShows = [
  {
    title: 'Mirzapur',
    slug: 'mirzapur',
    year: 2018, tmdbId: 85370, episodes: 29,
    genres: ['drama', 'crime', 'action'], status: 'Returning Series',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    // Indian crime drama. Violent, gritty. Good but not elite.
    char: 6.5, world: 7, cine: 6.5, spect: 5, conc: 6.5, drive: 7, resol: 5.5
  },
  {
    title: 'Paradise City',
    slug: 'paradise-city',
    year: 2021, tmdbId: 102891, episodes: 8,
    genres: ['drama'], status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    // Music industry drama. Average.
    char: 5.5, world: 5.5, cine: 6, spect: 4, conc: 5, drive: 5.5, resol: 5
  },
  {
    title: 'Daisy Jones & the Six',
    slug: 'daisy-jones-the-six',
    year: 2023, tmdbId: 84955, episodes: 10,
    genres: ['drama'], status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    // 70s rock drama. Good execution, limited appeal.
    char: 6.5, world: 6.5, cine: 7, spect: 4, conc: 6, drive: 6.5, resol: 6.5
  },
  {
    title: 'Bosch: Legacy',
    slug: 'bosch-legacy',
    year: 2022, tmdbId: 136315, episodes: 30,
    genres: ['drama', 'crime'], status: 'Returning Series',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    // Procedural spinoff. Solid but not exceptional.
    char: 6.5, world: 6.5, cine: 6.5, spect: 4, conc: 6.5, drive: 7, resol: 6
  },
  {
    title: 'Pluribus',
    slug: 'pluribus',
    year: 2025, tmdbId: 278221, episodes: 9,
    genres: ['drama'], status: 'Returning Series',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    // New show, limited info. Conservative scoring.
    char: 5.5, world: 5.5, cine: 5.5, spect: 4, conc: 5, drive: 5.5, resol: 4.5
  }
];

const toAdd = newShows.filter(s => !existing.has(s.slug));

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

console.log('=== BATCH 39 (HARSH) ===\n');
toAdd.forEach(s => {
  s.final = calcFinal(s);
  s.locked = false;
  console.log(s.title + ': ' + s.final);
});

if (toAdd.length > 0) {
  toAdd.forEach(ns => ranked.shows.push(ns));
  ranked.shows.sort((a, b) => b.final - a.final || a.title.localeCompare(b.title));
  ranked.shows.forEach((s, i) => s.rank = i + 1);
  ranked.meta.total = ranked.shows.length;
  fs.writeFileSync('data/core/ranked.json', '\ufeff' + JSON.stringify(ranked, null, 2));
  
  console.log('\n=== ADDED ===');
  toAdd.forEach(ns => {
    const s = ranked.shows.find(x => x.slug === ns.slug);
    console.log(ns.title + ' -> #' + s.rank);
  });
  console.log('Total:', ranked.shows.length);
}