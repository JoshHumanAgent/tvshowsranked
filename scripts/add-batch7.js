const fs = require('fs');

// Read current ranked
let c = fs.readFileSync('data/core/ranked.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const ranked = JSON.parse(c);

// Shows to add
const newShows = [
  {
    title: 'The Witcher',
    slug: 'the-witcher',
    year: 2019,
    tmdbId: 71912,
    episodes: 32,
    genres: ['fantasy', 'drama', 'action'],
    status: 'Returning Series',
    poster: 'https://image.tmdb.org/t/p/w500/AoGsDM02UVt0npBA8OvpDcZbaMi.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/foGkPxpw9h8zln81j63mix5B7m8.jpg',
    char: 7.5, world: 8, cine: 7.5, spect: 7.5, conc: 6.5, drive: 7, resol: 5.5, final: 7.15, locked: false
  },
  {
    title: 'Crash Landing on You',
    slug: 'crash-landing-on-you',
    year: 2019,
    tmdbId: 94796,
    episodes: 16,
    genres: ['drama', 'romance'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/fgBNLPr6mC8pxuR79ENAJY4nBmj.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/o3Htmlg6BfNs8Ew7yjsRzVnYSEs.jpg',
    char: 8.5, world: 8.5, cine: 7.5, spect: 5, conc: 7.5, drive: 8, resol: 8.5, final: 7.39, locked: false
  },
  {
    title: 'Mr Inbetween',
    slug: 'mr-inbetween',
    year: 2018,
    tmdbId: 81358,
    episodes: 26,
    genres: ['crime', 'drama'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/1FkONly4j7hxi6Pz5CmuhRN1Ops.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/2INMEKxee4z0mVYpHCS4AdPxgOb.jpg',
    char: 8.5, world: 6.5, cine: 7.5, spect: 4, conc: 7, drive: 8, resol: 8, final: 7.03, locked: false
  },
  {
    title: 'The Good Fight',
    slug: 'the-good-fight',
    year: 2017,
    tmdbId: 69158,
    episodes: 60,
    genres: ['drama', 'legal'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/8qoOHOfbUbrCcHZnDVxGcwOWinV.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/nz6vpYyN1pEwBYeoAVIu2316d0z.jpg',
    char: 8, world: 6.5, cine: 7, spect: 4, conc: 7.5, drive: 7, resol: 7.5, final: 7.16, locked: false
  }
];

// Check for duplicates
const existingSlugs = new Set(ranked.shows.map(s => s.slug));
newShows.forEach(ns => {
  if (existingSlugs.has(ns.slug)) {
    console.log('SKIP (exists): ' + ns.slug);
  } else {
    ranked.shows.push(ns);
    console.log('ADD: ' + ns.title + ' (final: ' + ns.final + ')');
  }
});

// Re-sort
ranked.shows.sort((a, b) => {
  if (b.final !== a.final) return b.final - a.final;
  return a.title.localeCompare(b.title);
});

// Re-rank
ranked.shows.forEach((s, i) => s.rank = i + 1);
ranked.meta.total = ranked.shows.length;
ranked.meta.generated = new Date().toISOString();

// Save
fs.writeFileSync('data/core/ranked.json', '\ufeff' + JSON.stringify(ranked, null, 2));

// Report
console.log('\n=== ADDED ===');
newShows.forEach(ns => {
  const s = ranked.shows.find(x => x.slug === ns.slug);
  if (s) console.log(s.title + ' -> Rank #' + s.rank);
});
console.log('Total: ' + ranked.shows.length);