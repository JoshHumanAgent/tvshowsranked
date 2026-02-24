const fs = require('fs');

let c = fs.readFileSync('data/core/ranked.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const ranked = JSON.parse(c);

const newShows = [
  {
    title: 'Weak Hero',
    slug: 'weak-hero',
    year: 2022, tmdbId: 210677, episodes: 16,
    genres: ['drama', 'action'], status: 'Ended',
    // Korean school violence drama. Intense, well-crafted.
    char: 8, world: 7, cine: 8, spect: 6, conc: 7.5, drive: 8.5, resol: 7
  },
  {
    title: 'Navillera',
    slug: 'navillera',
    year: 2021, tmdbId: 126312, episodes: 12,
    genres: ['drama'], status: 'Ended',
    // Ballet dreams. Heartwarming K-drama.
    char: 7.5, world: 6.5, cine: 7.5, spect: 4, conc: 7, drive: 7.5, resol: 7.5
  },
  {
    title: 'Alchemy of Souls',
    slug: 'alchemy-of-souls',
    year: 2022, tmdbId: 205596, episodes: 30,
    genres: ['drama', 'fantasy', 'romance'], status: 'Ended',
    // Korean fantasy. Magic souls. Very popular.
    char: 7.5, world: 8, cine: 8, spect: 7, conc: 7, drive: 7.5, resol: 7.5
  },
  {
    title: 'Mr. Queen',
    slug: 'mr-queen',
    year: 2020, tmdbId: 115036, episodes: 20,
    genres: ['drama', 'comedy', 'fantasy'], status: 'Ended',
    // Time slip K-drama. Modern chef in Joseon.
    char: 7.5, world: 7.5, cine: 7.5, spect: 5, conc: 7, drive: 8, resol: 7
  },
  {
    title: "It's Okay to Not Be Okay",
    slug: 'its-okay-to-not-be-okay',
    year: 2020, tmdbId: 110492, episodes: 16,
    genres: ['drama', 'romance', 'comedy'], status: 'Ended',
    // Mental health K-drama. Visual storytelling.
    char: 8, world: 7, cine: 8.5, spect: 5, conc: 7.5, drive: 8, resol: 7.5
  },
  {
    title: 'Vincenzo',
    slug: 'vincenzo',
    year: 2021, tmdbId: 117376, episodes: 20,
    genres: ['drama', 'comedy', 'crime'], status: 'Ended',
    // Korean mafia lawyer. Dark comedy.
    char: 7.5, world: 7, cine: 7.5, spect: 6, conc: 7, drive: 8, resol: 7.5
  },
  {
    title: 'Snowdrop',
    slug: 'snowdrop',
    year: 2021, tmdbId: 128097, episodes: 16,
    genres: ['drama', 'romance'], status: 'Ended',
    // Korean historical romance. Tragic.
    char: 7.5, world: 7.5, cine: 8, spect: 4, conc: 7, drive: 8, resol: 6.5
  },
  {
    title: 'Hotel Del Luna',
    slug: 'hotel-del-luna',
    year: 2019, tmdbId: 90762, episodes: 16,
    genres: ['drama', 'fantasy', 'romance'], status: 'Ended',
    // Korean fantasy hotel for ghosts. IU.
    char: 7.5, world: 8, cine: 8, spect: 6, conc: 7, drive: 7.5, resol: 7.5
  },
  {
    title: 'Dickinson',
    slug: 'dickinson',
    year: 2019, tmdbId: 87835, episodes: 30,
    genres: ['drama', 'comedy'], status: 'Ended',
    // Apple TV+. Hailee Steinfeld as Emily Dickinson.
    char: 7.5, world: 7, cine: 7.5, spect: 4, conc: 7, drive: 7, resol: 8
  },
  {
    title: 'Golden Boy',
    slug: 'golden-boy-2022',
    year: 2022, tmdbId: 207732, episodes: 103,
    genres: ['drama'], status: 'Returning Series',
    // Turkish drama. Long format.
    char: 6.5, world: 6, cine: 6.5, spect: 4, conc: 6, drive: 6.5, resol: 5
  },
  {
    title: 'Tulsa King',
    slug: 'tulsa-king',
    year: 2022, tmdbId: 118206, episodes: 29,
    genres: ['drama', 'crime'], status: 'Returning Series',
    // Taylor Sheridan. Stallone. Mafia in Oklahoma.
    char: 7.5, world: 7.5, cine: 7.5, spect: 5, conc: 7, drive: 7.5, resol: 6
  },
  {
    title: 'Superman & Lois',
    slug: 'superman-lois',
    year: 2021, tmdbId: 110593, episodes: 53,
    genres: ['drama', 'action', 'sci-fi'], status: 'Canceled',
    // CW superhero. Better than expected.
    char: 7, world: 7, cine: 7, spect: 6, conc: 6.5, drive: 7, resol: 5.5
  },
  {
    title: 'Kurulus: Osman',
    slug: 'kurulus-osman',
    year: 2019, tmdbId: 95396, episodes: 194,
    genres: ['drama', 'history', 'action'], status: 'Returning Series',
    // Turkish historical. Very long running.
    char: 7, world: 7.5, cine: 7, spect: 6, conc: 7, drive: 7, resol: 5
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

console.log('=== BATCH 29 SCORED (2019-2022) ===\n');
newShows.forEach(s => {
  s.final = calcFinal(s);
  s.locked = false;
  s.poster = 'https://image.tmdb.org/t/p/w500/placeholder.jpg';
  s.backdrop = 'https://image.tmdb.org/t/p/w780/placeholder.jpg';
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