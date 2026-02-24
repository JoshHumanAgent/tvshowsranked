const fs = require('fs');

let c = fs.readFileSync('data/core/ranked.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const ranked = JSON.parse(c);

const existing = new Set(ranked.shows.map(s => s.slug));

// Score with HARSH standards: 5=avg, 6=good, 7=very good, 8=insanely good (RARE)
const newShows = [
  {
    title: 'My Holo Love',
    slug: 'my-holo-love',
    year: 2020, tmdbId: 98468, episodes: 12,
    genres: ['drama', 'romance', 'sci-fi'], status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    // K-drama sci-fi romance. Light, enjoyable. Not exceptional.
    char: 6.5, world: 6, cine: 6.5, spect: 5, conc: 6, drive: 6.5, resol: 6
  },
  {
    title: 'Tomorrow',
    slug: 'tomorrow',
    year: 2022, tmdbId: 156232, episodes: 16,
    genres: ['drama', 'fantasy'], status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    // K-drama fantasy. Grim reapers. Decent but not standout.
    char: 6.5, world: 6.5, cine: 6.5, spect: 5, conc: 6, drive: 6.5, resol: 6
  },
  {
    title: 'Club de Cuervos',
    slug: 'club-de-cuervos',
    year: 2015, tmdbId: 62652, episodes: 45,
    genres: ['drama', 'comedy'], status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    // Mexican dramedy. Soccer team inheritance. Fun, not deep.
    char: 6.5, world: 6, cine: 6, spect: 4, conc: 6, drive: 6.5, resol: 6
  },
  {
    title: 'Rigo',
    slug: 'rigo',
    year: 2024, tmdbId: 276629, episodes: 99,
    genres: ['drama'], status: 'Returning Series',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    // Spanish drama. Long format telenovela style. Average.
    char: 5.5, world: 5, cine: 5.5, spect: 4, conc: 5, drive: 6, resol: 5
  },
  {
    title: 'Ted Lasso',
    slug: 'ted-lasso',
    year: 2020, tmdbId: 92830, episodes: 34,
    genres: ['drama', 'comedy'], status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    // Apple TV+ hit. Optimistic, heartwarming. Very good but not elite.
    char: 7.5, world: 6.5, cine: 7, spect: 3, conc: 7, drive: 7, resol: 7
  },
  {
    title: 'Maxton Hall',
    slug: 'maxton-hall',
    year: 2024, tmdbId: 273219, episodes: 12,
    genres: ['drama', 'romance'], status: 'Returning Series',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    // German private school romance. New, unproven.
    char: 6, world: 6, cine: 6.5, spect: 4, conc: 5.5, drive: 6.5, resol: 5.5
  },
  {
    title: 'Lessons in Chemistry',
    slug: 'lessons-in-chemistry',
    year: 2023, tmdbId: 234183, episodes: 8,
    genres: ['drama'], status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    // Apple TV+ period drama. Brie Larson. Very good, limited series.
    char: 7, world: 6.5, cine: 7.5, spect: 4, conc: 7, drive: 7, resol: 7
  },
  {
    title: 'Panchayat',
    slug: 'panchayat',
    year: 2020, tmdbId: 104617, episodes: 32,
    genres: ['drama', 'comedy'], status: 'Returning Series',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    // Indian village dramedy. Authentic, charming. Very good for what it is.
    char: 7, world: 7, cine: 6.5, spect: 3, conc: 6.5, drive: 6.5, resol: 6.5
  }
];

// Filter to only add shows not already in pool
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
  else if (eps <= 50) mult = 1.00;
  else if (eps <= 100) mult = 1.02;
  else mult = 1.03;
  return Math.round(base * mult * 100) / 100;
}

console.log('=== BATCH 38 (HARSH SCORING) ===\n');
toAdd.forEach(s => {
  s.final = calcFinal(s);
  s.locked = false;
  console.log(s.title + ': ' + s.final + ' [' + s.char + '/' + s.world + '/' + s.cine + '/' + s.spect + '/' + s.conc + '/' + s.drive + '/' + s.resol + ']');
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
    console.log(ns.title + ' -> #' + s.rank);
  });
  console.log('Total:', ranked.shows.length);
} else {
  console.log('No new shows to add.');
}