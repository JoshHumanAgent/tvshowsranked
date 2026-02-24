const fs = require('fs');

let c = fs.readFileSync('data/core/ranked.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const ranked = JSON.parse(c);

const newShows = [
  {
    title: 'Spiral',
    slug: 'spiral',
    year: 2005,
    tmdbId: 11726,
    episodes: 86,
    genres: ['crime', 'drama', 'thriller'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/t4i4wJCRUDkblYaqp3ln4vENQdC.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/eL4f9S6zLBs7LH7dNI2lQf1WwYB.jpg',
    // Engrenages. French legal drama. Raw, realistic. 8 seasons complete.
    char: 8,     // Complex, authentic
    world: 7.5,  // French justice system
    cine: 7.5,   // Raw, documentary feel
    spect: 4,    // No spectacle
    conc: 8,     // Justice, corruption, system
    drive: 8,    // Gripping cases
    resol: 8     // Complete after 8 seasons
  },
  {
    title: "Foyle's War",
    slug: 'foyles-war',
    year: 2002,
    tmdbId: 3163,
    episodes: 28,
    genres: ['crime', 'mystery', 'drama'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/avPXLCHNUGVtTu52X5VStZRoHDD.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/dVbZvQhXvPYCKeJNzKbV4uWEVQv.jpg',
    // WWII detective. Michael Kitchen. Quality British mystery. Complete.
    char: 8,     // Kitchen perfect as Foyle
    world: 8,    // WWII England, rich period
    cine: 7.5,   // Beautiful period work
    spect: 4,    // No spectacle
    conc: 7.5,   // War, morality, justice
    drive: 7.5,  // Procedural but quality
    resol: 8     // Complete, definitive
  },
  {
    title: 'CSI: Crime Scene Investigation',
    slug: 'csi-crime-scene-investigation',
    year: 2000,
    tmdbId: 1431,
    episodes: 335,
    genres: ['crime', 'drama', 'mystery'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/i5hmoRjHNWady4AtAGICTUXknKH.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/etvkQCuIjsPQFYZ6ex3NKrfYJJM.jpg',
    // Procedural pioneer. Las Vegas forensics. 15 seasons. Defined a genre.
    char: 7,     // Ensemble, procedural
    world: 7,    // Vegas forensics lab
    cine: 7,     // Style over substance
    spect: 6,    // Forensic spectacle
    conc: 6.5,   // Case-of-week, limited depth
    drive: 7.5,  // Addictive formula
    resol: 7     // Long-running, ended
  },
  {
    title: 'Law & Order: SVU',
    slug: 'law-and-order-svu',
    year: 1999,
    tmdbId: 2734,
    episodes: 589,
    genres: ['crime', 'drama', 'mystery'],
    status: 'Returning Series',
    poster: 'https://image.tmdb.org/t/p/w500/iofokHZoUB4Qhik4PflvJl8TT6a.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/1jCJD8A9zLxLZDuU8D5jKELeNUf.jpg',
    // Mariska Hargitay. 25+ seasons. Procedural institution. Still running.
    char: 7,     // Hargitay iconic, ensemble
    world: 6.5,  // SVU unit, NYC
    cine: 6.5,   // Standard procedural
    spect: 4,    // No spectacle
    conc: 7,     // Justice, trauma, society
    drive: 7.5,  // Formulaic but effective
    resol: 5     // Never-ending
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

console.log('=== BATCH 12 SCORED ===\n');
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