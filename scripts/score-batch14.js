const fs = require('fs');

let c = fs.readFileSync('data/core/ranked.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const ranked = JSON.parse(c);

// Check duplicates
const toAdd = ['northern-exposure', 'loki'];
console.log('=== DUPLICATE CHECK ===');
toAdd.forEach(s => {
  const found = ranked.shows.find(x => x.slug === s);
  console.log((found ? 'FOUND' : 'NEW') + ': ' + s + (found ? ' (#' + found.rank + ')' : ''));
});

const newShows = [
  {
    title: 'Northern Exposure',
    slug: 'northern-exposure',
    year: 1990,
    tmdbId: 4396,
    episodes: 110,
    genres: ['drama', 'comedy'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/BUSw61C2kNoMuKFQTamIgqMC5.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/98lCfMnw8k0fHRzL7QnL9z8YcF3.jpg',
    // Quirky Alaskan town comedy-drama. 1990s cult classic.
    char: 7.5,   // Ensemble, quirky characters  
    world: 8,    // Cicely Alaska, unique
    cine: 7.5,   // 90s look, warm
    spect: 4,    // No spectacle
    conc: 7,     // Community, philosophy, life
    drive: 7,    // Meandering
    resol: 7.5   // Complete
  },
  {
    title: 'Loki',
    slug: 'loki',
    year: 2021,
    tmdbId: 84958,
    episodes: 12,
    genres: ['sci-fi', 'action', 'drama'],
    status: 'Returning Series',
    poster: 'https://image.tmdb.org/t/p/w500/rzBRw0G5pFJM6DVGY2WdkYOik2Q.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/N1hWzVPpZ8lIQvQskgdQogxdsc.jpg',
    // Marvel series with Hiddleston. Time variant/multiverse. High production value.
    char: 8,     // Hiddleston carries
    world: 8.5,  // Time Variance Authority, multiverse
    cine: 8.5,   // Cinematic, stylish
    spect: 7,    // Time/space spectacle
    conc: 7.5,   // Time, identity, determinism
    drive: 8,    // Propulsive
    resol: 5     // Ongoing
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

console.log('\n=== BATCH SCORED ===\n');
newShows.forEach(s => {
  s.final = calcFinal(s);
  s.locked = false;
  console.log(s.title + ': ' + s.final);
});

// Filter out existing
const filtered = newShows.filter(ns => !ranked.shows.find(s => s.slug === ns.slug));
console.log('\nAdding', filtered.length, 'new shows');

filtered.forEach(ns => ranked.shows.push(ns));

ranked.shows.sort((a, b) => {
  if (b.final !== a.final) return b.final - a.final;
  return a.title.localeCompare(b.title);
});
ranked.shows.forEach((s, i) => s.rank = i + 1);
ranked.meta.total = ranked.shows.length;
ranked.meta.generated = new Date().toISOString();

fs.writeFileSync('data/core/ranked.json', '\ufeff' + JSON.stringify(ranked, null, 2));

console.log('\n=== ADDED ===');
filtered.forEach(ns => {
  const s = ranked.shows.find(x => x.slug === ns.slug);
  if (s) console.log(s.title + ' -> Rank #' + s.rank);
});
console.log('Total:', ranked.shows.length);