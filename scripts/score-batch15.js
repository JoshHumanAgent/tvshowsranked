const fs = require('fs');

let c = fs.readFileSync('data/core/ranked.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const ranked = JSON.parse(c);

const newShows = [
  {
    title: 'Law & Order: Organized Crime',
    slug: 'law-order-organized-crime',
    year: 2021,
    tmdbId: 106158,
    episodes: 75,
    genres: ['crime', 'drama'],
    status: 'Returning Series',
    poster: 'https://image.tmdb.org/t/p/w500/wOffjfafVLyav9CMDgBfIv49J9Y.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // Christopher Meloni as Stabler. SVU spinoff. Procedural with arc.
    char: 6.5,   // Meloni strong, rest procedural
    world: 6,    // Organized crime unit
    cine: 6.5,   // Standard procedural
    spect: 4,    // No spectacle
    conc: 6.5,   // Crime, corruption
    drive: 7,    // Stabler intensity
    resol: 5     // Ongoing
  },
  {
    title: 'Lupin',
    slug: 'lupin',
    year: 2021,
    tmdbId: 96677,
    episodes: 17,
    genres: ['crime', 'thriller', 'drama'],
    status: 'Returning Series',
    poster: 'https://image.tmdb.org/t/p/w500/h6Z2oogE4mJk2uffdtIlLhb0EHx.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // Omar Sy. Gentleman thief. French phenomenon. Heist thriller.
    char: 8,     // Omar Sy magnetic
    world: 7.5,  // Paris, heist world
    cine: 8,     // Stylish, cinematic
    spect: 6,    // Heist spectacle
    conc: 7.5,   // Class, identity, justice
    drive: 8.5,  // Propulsive
    resol: 5.5   // Part way through story
  },
  {
    title: 'Sweet Tooth',
    slug: 'sweet-tooth',
    year: 2021,
    tmdbId: 103768,
    episodes: 24,
    genres: ['drama', 'fantasy', 'adventure'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/rgMfhcrVZjuy5b7Pn0KzCRCEnMX.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // Post-apocalyptic. Hybrid children. Surprisingly warm.
    char: 8,     // Gus and Jepperd
    world: 8,    // Unique post-apocalyptic
    cine: 8,     // Beautiful, cinematic
    spect: 6.5,  // Post-apocalyptic
    conc: 7.5,   // Nature vs humanity
    drive: 7.5,  // Journey narrative
    resol: 7     // Complete after 2 seasons
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

console.log('=== BATCH 15 SCORED ===\n');
newShows.forEach(s => {
  s.final = calcFinal(s);
  s.locked = false;
  console.log(s.title + ': ' + s.final + ' (' + s.status + ', ' + s.episodes + ' eps)');
  console.log('  char:' + s.char + ' world:' + s.world + ' cine:' + s.cine + ' spect:' + s.spect + ' conc:' + s.conc + ' drive:' + s.drive + ' resol:' + s.resol);
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