const fs = require('fs');

let c = fs.readFileSync('data/core/ranked.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const ranked = JSON.parse(c);

const existingSlugs = new Set(ranked.shows.map(s => s.slug));

// New candidates from discovery (not yet scored)
const newShows = [
  {
    title: 'Friendly Rivalry',
    slug: 'friendly-rivalry',
    year: 2025,
    tmdbId: 275940,
    episodes: 16,
    genres: ['drama', 'mystery'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    // K-drama mystery. High school setting.
    char: 7, world: 6.5, cine: 7, spect: 4, conc: 7, drive: 7.5, resol: 7
  },
  {
    title: 'No One Will Miss Us',
    slug: 'no-one-will-miss-us',
    year: 2024,
    tmdbId: 252893,
    episodes: 8,
    genres: ['drama', 'comedy'],
    status: 'Returning Series',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    // Mexican teen drama. Coming of age.
    char: 6.5, world: 6, cine: 6.5, spect: 3, conc: 6, drive: 7, resol: 5.5
  },
  {
    title: 'The Trauma Code: Heroes on Call',
    slug: 'the-trauma-code-heroes-on-call',
    year: 2025,
    tmdbId: 279722,
    episodes: 8,
    genres: ['drama', 'medical'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    // K-drama medical. Trauma surgeons.
    char: 7, world: 6.5, cine: 7, spect: 5, conc: 7, drive: 7.5, resol: 7
  },
  {
    title: 'The Pendragon Cycle: Rise of the Merlin',
    slug: 'the-pendragon-cycle',
    year: 2026,
    tmdbId: 296418,
    episodes: 7,
    genres: ['drama', 'fantasy'],
    status: 'Returning Series',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    // Arthurian fantasy. Early 2026. Not complete.
    char: 6.5, world: 7, cine: 7, spect: 6, conc: 6, drive: 6, resol: 5
  },
  {
    title: 'Dinastía Casillas',
    slug: 'dinastia-casillas',
    year: 2025,
    tmdbId: 292234,
    episodes: 92,
    genres: ['drama', 'sports'],
    status: 'Returning Series',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    // Spanish sports drama. Telenovela format.
    char: 6, world: 5.5, cine: 5.5, spect: 4, conc: 5.5, drive: 6, resol: 5
  },
  {
    title: 'Memory of a Killer',
    slug: 'memory-of-a-killer',
    year: 2026,
    tmdbId: 295672,
    episodes: 10,
    genres: ['drama', 'thriller'],
    status: 'Returning Series',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    // Thriller drama. Recently started.
    char: 6.5, world: 6, cine: 6.5, spect: 5, conc: 6.5, drive: 7, resol: 5
  }
];

// Filter out existing
const toAdd = newShows.filter(s => !existingSlugs.has(s.slug));

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

console.log('=== BATCH 26 SCORED ===\n');
toAdd.forEach(s => {
  s.final = calcFinal(s);
  s.locked = false;
  console.log(s.title + ': ' + s.final + ' (' + s.status + ', ' + s.episodes + ' eps)');
});

if (toAdd.length > 0) {
  toAdd.forEach(ns => ranked.shows.push(ns));
  ranked.shows.sort((a, b) => b.final - a.final || a.title.localeCompare(b.title));
  ranked.shows.forEach((s, i) => s.rank = i + 1);
  ranked.meta.total = ranked.shows.length;
  ranked.meta.generated = new Date().toISOString();
  fs.writeFileSync('data/core/ranked.json', '\ufeff' + JSON.stringify(ranked, null, 2));
  
  console.log('\n=== ADDED ===');
  toAdd.forEach(ns => {
    const s = ranked.shows.find(x => x.slug === ns.slug);
    if (s) console.log(s.title + ' -> #' + s.rank);
  });
  console.log('Total: ' + ranked.shows.length);
} else {
  console.log('No new shows to add.');
}