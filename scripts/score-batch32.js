const fs = require('fs');

let c = fs.readFileSync('data/core/ranked.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const ranked = JSON.parse(c);

const newShows = [
  {
    title: 'Anne with an E',
    slug: 'anne-with-an-e',
    year: 2017, tmdbId: 67284, episodes: 27,
    genres: ['drama'], status: 'Canceled',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // Canadian period drama. Anne of Green Gables. Critical acclaim.
    char: 8.5, world: 8, cine: 8, spect: 4, conc: 7.5, drive: 8, resol: 6.5
  },
  {
    title: 'Merlí',
    slug: 'merli',
    year: 2015, tmdbId: 67100, episodes: 40,
    genres: ['drama', 'comedy'], status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // Catalan philosophy teacher. Spanish hit.
    char: 8, world: 7.5, cine: 7.5, spect: 3, conc: 8, drive: 7.5, resol: 7.5
  },
  {
    title: 'Sex Education',
    slug: 'sex-education',
    year: 2019, tmdbId: 83123, episodes: 32,
    genres: ['drama', 'comedy'], status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // British coming-of-age. Sex therapist mother.
    char: 7.5, world: 7, cine: 7.5, spect: 3, conc: 7, drive: 7.5, resol: 7.5
  },
  {
    title: 'All Creatures Great & Small',
    slug: 'all-creatures-great-and-small',
    year: 2020, tmdbId: 110592, episodes: 42,
    genres: ['drama'], status: 'Returning Series',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // British period drama. Veterinarians. Wholesome.
    char: 7.5, world: 7.5, cine: 8, spect: 4, conc: 7, drive: 7, resol: 7
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

console.log('=== BATCH 32 ===\n');
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