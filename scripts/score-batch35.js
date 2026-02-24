const fs = require('fs');

let c = fs.readFileSync('data/core/ranked.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const ranked = JSON.parse(c);

const newShows = [
  {
    title: 'Scarlet Heart: Ryeo',
    slug: 'scarlet-heart-ryeo',
    year: 2016, tmdbId: 66622, episodes: 20,
    genres: ['drama', 'romance', 'fantasy'], status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // Korean time-slip historical. IU. Tragic romance.
    char: 8, world: 8, cine: 8.5, spect: 6, conc: 7.5, drive: 8, resol: 6
  },
  {
    title: 'Extraordinary Attorney Woo',
    slug: 'extraordinary-attorney-woo',
    year: 2022, tmdbId: 204381, episodes: 16,
    genres: ['drama', 'comedy'], status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // Korean legal. Autistic attorney. Heartwarming.
    char: 8, world: 7, cine: 8, spect: 3, conc: 7, drive: 7.5, resol: 7.5
  },
  {
    title: 'Meteor Garden',
    slug: 'meteor-garden',
    year: 2018, tmdbId: 79768, episodes: 49,
    genres: ['drama', 'romance', 'comedy'], status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // Chinese remake. School romance. Pop idol cast.
    char: 7, world: 6.5, cine: 7, spect: 3, conc: 6, drive: 7, resol: 7
  },
  {
    title: 'Teen Wolf',
    slug: 'teen-wolf',
    year: 2011, tmdbId: 38417, episodes: 100,
    genres: ['drama', 'fantasy', 'romance'], status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // MTV supernatural. Werewolf teen. Cult following.
    char: 7.5, world: 7, cine: 7, spect: 5, conc: 7, drive: 7.5, resol: 6.5
  },
  {
    title: 'Suits',
    slug: 'suits',
    year: 2011, tmdbId: 37680, episodes: 134,
    genres: ['drama', 'comedy'], status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // Legal drama. Mike Harvey dynamic. Sharp dialogue.
    char: 8, world: 7, cine: 7.5, spect: 3, conc: 7.5, drive: 8, resol: 7
  },
  {
    title: 'The Act',
    slug: 'the-act',
    year: 2019, tmdbId: 86125, episodes: 8,
    genres: ['drama', 'crime'], status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // True crime anthology. Gypsy Rose Blanchard.
    char: 8, world: 7, cine: 7.5, spect: 4, conc: 8, drive: 8, resol: 8
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
  else mult = 1.03;
  return Math.round(base * mult * 100) / 100;
}

console.log('=== BATCH 35 ===\n');
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

console.log('\n=== ADDED ===');
newShows.forEach(ns => {
  const s = ranked.shows.find(x => x.slug === ns.slug);
  console.log(ns.title + ' -> #' + s.rank);
});
console.log('Total:', ranked.shows.length);