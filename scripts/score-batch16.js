const fs = require('fs');

let c = fs.readFileSync('data/core/ranked.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const ranked = JSON.parse(c);

const newShows = [
  {
    title: 'Brand New Cherry Flavor',
    slug: 'brand-new-cherry-flavor',
    year: 2021,
    tmdbId: 129418,
    episodes: 8,
    genres: ['horror', 'thriller', 'drama'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/k2I1sBp9LafKJFXNCGVXfxVUPLH.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // Netflix horror. Rosa Salazar. LA noir, surreal.
    char: 7,     // Salazar compelling
    world: 7.5,  // Nightmarish LA
    cine: 8,     // Stylish, surreal
    spect: 6,    // Body horror
    conc: 6.5,   // Identity, ambition
    drive: 7.5,  // Propulsive mystery
    resol: 7     // Complete miniseries
  },
  {
    title: 'Alice in Borderland',
    slug: 'alice-in-borderland',
    year: 2020,
    tmdbId: 110316,
    episodes: 22,
    genres: ['thriller', 'sci-fi', 'drama'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/1up6R9j7pIPPRUw4Y0ZGDWynQRV.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // Japanese survival thriller. Games in deserted Tokyo. Intense.
    char: 7.5,   // Arisu and ensemble
    world: 8,    // Empty Tokyo, game mechanics
    cine: 8,     // Stunning visuals
    spect: 7.5,  // Game spectacle
    conc: 7.5,   // Survival, morality
    drive: 9,    // Extremely propulsive
    resol: 7.5   // Complete (2 seasons)
  },
  {
    title: 'The Undoing',
    slug: 'the-undoing',
    year: 2020,
    tmdbId: 83851,
    episodes: 6,
    genres: ['thriller', 'drama', 'mystery'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/8B9tD5JMLr7o8vn7T6nQW7C6V7F.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // HBO miniseries. Kidman/Grant. Murder mystery. David E. Kelley.
    char: 8,     // Kidman, Grant, Donald Sutherland
    world: 7,    // Wealthy NYC
    cine: 8,     // Glossy HBO production
    spect: 4,    // No spectacle
    conc: 7,     // Truth, privilege
    drive: 8,    // Mystery-driven
    resol: 8     // Complete miniseries
  },
  {
    title: 'The Flight Attendant',
    slug: 'the-flight-attendant',
    year: 2020,
    tmdbId: 93287,
    episodes: 16,
    genres: ['thriller', 'drama', 'mystery'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/ddyB2ZjVWUDecRv6VS5VbIjUJiE.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // Kaley Cuoco. Drunk blackout murder mystery. Darkly comic.
    char: 7.5,   // Cuoco carries
    world: 6.5,  // Airline/espionage
    cine: 7,     // Stylish but TV
    spect: 4,    // No spectacle
    conc: 6.5,   // Addiction, truth
    drive: 7.5,  // Mystery-forward
    resol: 6.5   // Ended after 2 seasons
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

console.log('=== BATCH 16 SCORED ===\n');
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