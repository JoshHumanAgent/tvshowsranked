const fs = require('fs');

let c = fs.readFileSync('data/core/ranked.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const ranked = JSON.parse(c);

const newShows = [
  {
    title: 'Supernatural',
    slug: 'supernatural',
    year: 2005, tmdbId: 1622, episodes: 327,
    genres: ['drama', 'fantasy', 'horror'], status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // Long-running CW horror. Cult following. Declined in later seasons.
    char: 8, world: 7.5, cine: 7, spect: 6, conc: 6.5, drive: 7.5, resol: 6
  },
  {
    title: 'The Mentalist',
    slug: 'the-mentalist',
    year: 2008, tmdbId: 1407, episodes: 151,
    genres: ['drama', 'crime', 'mystery'], status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // Patrick Jane psychic consultant. Procedural with through-line.
    char: 8, world: 7, cine: 7.5, spect: 4, conc: 7.5, drive: 8, resol: 7.5
  },
  {
    title: 'Criminal Minds',
    slug: 'criminal-minds',
    year: 2005, tmdbId: 1415, episodes: 344,
    genres: ['drama', 'crime', 'mystery'], status: 'Returning Series',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // FBI behavioral analysis. Long-running procedural.
    char: 7.5, world: 7, cine: 7, spect: 4, conc: 7, drive: 7.5, resol: 6.5
  },
  {
    title: 'Bones',
    slug: 'bones',
    year: 2005, tmdbId: 1416, episodes: 246,
    genres: ['drama', 'crime', 'comedy'], status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // Forensic anthropology. Procedural with romance.
    char: 7.5, world: 7, cine: 7, spect: 3, conc: 6.5, drive: 7.5, resol: 7
  },
  {
    title: 'Midsomer Murders',
    slug: 'midsomer-murders',
    year: 1997, tmdbId: 2476, episodes: 140,
    genres: ['drama', 'crime', 'mystery'], status: 'Returning Series',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // British cozy mystery. Very long running.
    char: 7, world: 7.5, cine: 7.5, spect: 3, conc: 7, drive: 7, resol: 7
  },
  {
    title: 'The Art of Sarah',
    slug: 'the-art-of-sarah',
    year: 2025, tmdbId: 307327, episodes: 8,
    genres: ['drama'], status: 'Returning Series',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // New 2025 drama. Limited info.
    char: 6.5, world: 6, cine: 6.5, spect: 4, conc: 6, drive: 6.5, resol: 5
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
  else if (eps <= 50) mult = 1.00;
  else if (eps <= 100) mult = 1.02;
  else if (eps <= 200) mult = 1.03;
  else mult = 1.04;
  return Math.round(base * mult * 100) / 100;
}

console.log('=== BATCH 34: CLASSIC PROCEDURALS ===\n');
newShows.forEach(s => {
  s.final = calcFinal(s);
  s.locked = false;
  console.log(s.title + ': ' + s.final + ' (' + s.episodes + ' eps)');
});

newShows.forEach(ns => ranked.shows.push(ns));
ranked.shows.sort((a, b) => b.final - a.final || a.title.localeCompare(b.title));
ranked.shows.forEach((s, i) => s.rank = i + 1);
ranked.meta.total = ranked.shows.length;

fs.writeFileSync('data/core/ranked.json', '\ufeff' + JSON.stringify(ranked, null, 2));

console.log('\n=== ADDED ===');
newShows.forEach(ns => {
  const s = ranked.shows.find(x => x.slug === ns.slug);
  console.log(ns.title + ' -> #' + s.rank);
});
console.log('Total:', ranked.shows.length);