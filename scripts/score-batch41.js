const fs = require('fs');

let c = fs.readFileSync('data/core/ranked.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const ranked = JSON.parse(c);

const existing = new Set(ranked.shows.map(s => s.slug));

// 2024-2025 dramas not yet in pool
const newShows = [
  {
    title: 'Museum of Innocence',
    slug: 'museum-of-innocence',
    year: 2026, tmdbId: 280123, episodes: 8,
    genres: ['drama'], status: 'Returning Series',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    // New 2026 drama. Limited info. Conservative.
    char: 5.5, world: 5.5, cine: 6, spect: 4, conc: 5, drive: 5.5, resol: 4.5
  },
  {
    title: 'The Art of Sarah',
    slug: 'the-art-of-sarah',
    year: 2025, tmdbId: 307327, episodes: 8,
    genres: ['drama'], status: 'Returning Series',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    // New drama. Unproven.
    char: 5.5, world: 5.5, cine: 5.5, spect: 4, conc: 5, drive: 5.5, resol: 4.5
  },
  {
    title: 'Speed and Love',
    slug: 'speed-and-love',
    year: 2025, tmdbId: 289456, episodes: 12,
    genres: ['drama', 'romance'], status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    // Romance drama. New.
    char: 5.5, world: 5, cine: 5.5, spect: 4, conc: 5, drive: 6, resol: 5
  },
  {
    title: 'Esrefs Dream',
    slug: 'esrefs-dream',
    year: 2025, tmdbId: 289789, episodes: 10,
    genres: ['drama'], status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    // New drama. Conservative.
    char: 5.5, world: 5.5, cine: 5.5, spect: 4, conc: 5, drive: 5.5, resol: 5
  }
];

const toAdd = newShows.filter(s => !existing.has(s.slug));

function calcFinal(show) {
  const base = (show.char * 0.20) + (show.world * 0.15) + (show.cine * 0.15) +
               (show.spect * 0.10) + (show.conc * 0.15) + (show.drive * 0.15) +
               (show.resol * 0.10);
  const eps = show.episodes || 40;
  let mult = eps <= 10 ? 0.96 : eps <= 20 ? 0.95 : 1.00;
  return Math.round(base * mult * 100) / 100;
}

console.log('=== BATCH 41: 2025-2026 NEW RELEASES (HARSH) ===\n');
toAdd.forEach(s => {
  s.final = calcFinal(s);
  s.locked = false;
  console.log(s.title + ': ' + s.final + ' (' + s.year + ', ' + s.episodes + ' eps)');
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