const fs = require('fs');

let c = fs.readFileSync('data/core/ranked.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const ranked = JSON.parse(c);

// Only scoring Castle Rock - others need more research
const newShows = [
  {
    title: 'Castle Rock',
    slug: 'castle-rock',
    year: 2018,
    tmdbId: 71116,
    episodes: 20,
    genres: ['horror', 'thriller', 'drama'],
    status: 'Canceled',
    poster: 'https://image.tmdb.org/t/p/w500/7AFPH4VmDKAtMpVq7JLVAJjsGxj.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/gNIdzV3qWogP4DwVvCf8O9fQSYi.jpg',
    // Stephen King universe. Hulu. Canceled after 2 seasons.
    char: 7,     // Great ensemble
    world: 8.5,  // King universe, interconnected
    cine: 8,     // Atmospheric horror
    spect: 6,    // Horror elements
    conc: 7,     // King mythology
    drive: 7.5,  // Mystery-driven
    resol: 5     // Canceled, incomplete
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

console.log('=== BATCH 17 SCORED ===\n');
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