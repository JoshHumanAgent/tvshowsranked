const fs = require('fs');

let c = fs.readFileSync('data/core/ranked.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const ranked = JSON.parse(c);

const newShows = [
  {
    title: "Tom Clancy's Jack Ryan",
    slug: 'jack-ryan',
    year: 2018,
    tmdbId: 73375,
    episodes: 30,
    genres: ['action', 'thriller', 'drama'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/pvDWX1bftOso4opTSfp4h78abYW.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // John Krasinski. CIA analyst action. 4 seasons complete.
    char: 7.5,   // Krasinski solid
    world: 7.5,  // Global spy thriller
    cine: 8,     // Big budget action
    spect: 7,    // Action spectacle
    conc: 7,     // Geopolitics, terrorism
    drive: 8,    // Propulsive action
    resol: 7.5   // Complete after 4 seasons
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

console.log('=== BATCH 18 SCORED ===\n');
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