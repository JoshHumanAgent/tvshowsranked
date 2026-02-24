const fs = require('fs');

let c = fs.readFileSync('data/core/ranked.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const ranked = JSON.parse(c);

// Valid dramas from discovery (Thai & K-dramas)
const newShows = [
  {
    title: 'The Loyal Pin',
    slug: 'the-loyal-pin',
    year: 2024,
    tmdbId: 263497,
    episodes: 16,
    genres: ['drama', 'romance'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // Thai GL romance. High fan rating. Score harsh.
    char: 7, world: 6.5, cine: 6.5, spect: 4, conc: 6, drive: 7, resol: 7.5
  },
  {
    title: 'Heated Rivalry',
    slug: 'heated-rivalry',
    year: 2025,
    tmdbId: 278172,
    episodes: 6,
    genres: ['drama'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // Short format drama. Limited scope.
    char: 6.5, world: 6, cine: 6, spect: 4, conc: 6, drive: 6.5, resol: 6.5
  },
  {
    title: 'Good Boy',
    slug: 'good-boy-2025',
    year: 2025,
    tmdbId: 273502,
    episodes: 16,
    genres: ['crime', 'comedy', 'drama'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // K-drama crime comedy. Genre blend.
    char: 7, world: 6.5, cine: 7, spect: 5, conc: 6.5, drive: 7, resol: 7
  },
  {
    title: 'Head Over Heels',
    slug: 'head-over-heels-2025',
    year: 2025,
    tmdbId: 278165,
    episodes: 12,
    genres: ['drama', 'fantasy', 'comedy'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // Fantasy romance K-drama.
    char: 6.5, world: 6.5, cine: 6.5, spect: 5, conc: 5.5, drive: 7, resol: 7
  },
  {
    title: 'Bon Appétit, Your Majesty',
    slug: 'bon-appetit-your-majesty',
    year: 2025,
    tmdbId: 280123,
    episodes: 12,
    genres: ['drama', 'fantasy'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // Historical fantasy K-drama.
    char: 6.5, world: 7, cine: 7, spect: 5, conc: 6, drive: 6.5, resol: 7
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

console.log('=== BATCH 25 SCORED ===\n');
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