const fs = require('fs');

let c = fs.readFileSync('data/core/ranked.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const ranked = JSON.parse(c);

const newShows = [
  {
    title: 'Chicago Justice',
    slug: 'chicago-justice',
    year: 2017,
    tmdbId: 67993,
    episodes: 13,
    genres: ['crime', 'drama', 'legal'],
    status: 'Canceled',
    poster: 'https://image.tmdb.org/t/p/w500/hZ76A8l1JoONy2NoL0BF4AU2g3c.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // Chicago PD spinoff. Prosecutors. One season. Canceled.
    char: 6,     // Procedural ensemble
    world: 5.5,  // Chicago universe
    cine: 6,     // Network TV
    spect: 3,    // No spectacle
    conc: 6,     // Legal drama
    drive: 6.5,  // Standard procedural
    resol: 4     // Canceled prematurely
  },
  {
    title: "Marvel's Iron Fist",
    slug: 'iron-fist',
    year: 2017,
    tmdbId: 62127,
    episodes: 23,
    genres: ['action', 'drama', 'superhero'],
    status: 'Canceled',
    poster: 'https://image.tmdb.org/t/p/w500/4l6KD9HhtD6nCDEfg10Lp6C6zah.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // Netflix Marvel. Danny Rand. Mixed reception. S2 improved.
    char: 6,     // Finn Jones miscast
    world: 7,    // Marvel Netflix universe
    cine: 6.5,   // Inconsistent
    spect: 6.5,  // Martial arts action
    conc: 6,     // Corporate + mysticism
    drive: 6,    // Pacing issues
    resol: 5     // Canceled, unresolved
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

console.log('=== BATCH 19 SCORED ===\n');
newShows.forEach(s => {
  s.final = calcFinal(s);
  s.locked = false;
  console.log(s.title + ': ' + s.final + ' (' + s.status + ', ' + s.episodes + ' eps)');
});

newShows.forEach(ns => {
  const exists = ranked.shows.find(s => s.slug === ns.slug);
  if (!exists) ranked.shows.push(ns);
});

ranked.shows.sort((a, b) => {
  if (b.final !== a.final) return b.final - a.final;
  return a.title.localeCompare(b.title);
});
ranked.shows.forEach((s, i) => s.rank = i + 1);
ranked.meta.total = ranked.shows.length;
ranked.meta.generated = new Date().toISOString();

fs.writeFileSync('data/core/ranked.json', '\ufeff' + JSON.stringify(ranked, null, 2));

console.log('\n=== ADDED ===');
newShows.forEach(ns => {
  const s = ranked.shows.find(x => x.slug === ns.slug);
  if (s) console.log(s.title + ' -> Rank #' + s.rank);
});
console.log('Total: ' + ranked.shows.length);