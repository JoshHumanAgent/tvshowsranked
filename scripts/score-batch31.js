const fs = require('fs');

let c = fs.readFileSync('data/core/ranked.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const ranked = JSON.parse(c);

const newShows = [
  {
    title: 'KinnPorsche: The Series',
    slug: 'kinnporsche',
    year: 2022, tmdbId: 206302, episodes: 14,
    genres: ['drama', 'action', 'romance'], status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // Thai BL. Mafia romance. Very popular in niche.
    char: 7, world: 7, cine: 7, spect: 6, conc: 6.5, drive: 7.5, resol: 7
  },
  {
    title: 'Beyond Evil',
    slug: 'beyond-evil',
    year: 2021, tmdbId: 126009, episodes: 16,
    genres: ['drama', 'mystery', 'thriller'], status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // Korean thriller. Serial killer investigation.
    char: 8, world: 7.5, cine: 8, spect: 5, conc: 8, drive: 8.5, resol: 7.5
  },
  {
    title: 'Scam 1992: The Harshad Mehta Story',
    slug: 'scam-1992',
    year: 2020, tmdbId: 111110, episodes: 10,
    genres: ['drama', 'crime'], status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // Indian financial crime. Based on true story.
    char: 7.5, world: 7.5, cine: 7.5, spect: 4, conc: 8, drive: 8, resol: 8
  },
  {
    title: 'Big Mouth',
    slug: 'big-mouth-2022',
    year: 2022, tmdbId: 206303, episodes: 16,
    genres: ['drama', 'legal'], status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/placeholder.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // Korean legal drama. Public defender.
    char: 7.5, world: 7, cine: 7.5, spect: 4, conc: 7, drive: 8, resol: 7
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

console.log('=== BATCH 31 SCORED ===\n');
newShows.forEach(s => {
  s.final = calcFinal(s);
  s.locked = false;
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