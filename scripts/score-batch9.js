const fs = require('fs');

let c = fs.readFileSync('data/core/ranked.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const ranked = JSON.parse(c);

const newShows = [
  {
    title: 'Berlin Station',
    slug: 'berlin-station',
    year: 2016,
    tmdbId: 66282,
    episodes: 29,
    genres: ['thriller', 'drama'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/5MhMKbjff4tm9G46dJN7TnQj9WQ.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/nEAnoMHXb1qeePbaxE1Kmv7gvh2.jpg',
    // Spy thriller. Richard Armitage. Competent but forgettable.
    char: 7,     // Ensemble cast, no standout
    world: 7,    // CIA station, espionage
    cine: 7,     // Standard TV
    spect: 4,    // No spectacle
    conc: 7,     // Intelligence, loyalty, politics
    drive: 7,    // Moves along
    resol: 7     // Complete
  },
  {
    title: 'The Night Manager',
    slug: 'the-night-manager',
    year: 2016,
    tmdbId: 61859,
    episodes: 12,
    genres: ['drama', 'thriller'],
    status: 'Returning Series',
    poster: 'https://image.tmdb.org/t/p/w500/6X9fkXvUeNOhE4V57n7nLvJBrLp.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/2vAOdruqvx9GojXxKi3xVsZZvKU.jpg',
    // Le Carre adaptation. Hiddleston/Laurie. Limited series + S2 coming.
    // S1 is complete enough to score.
    char: 8.5,   // Hiddleston, Laurie, Coleman excellent
    world: 7.5,  // Arms dealing, spy underworld
    cine: 8.5,   // Cinematic, visually stunning
    spect: 5,    // No spectacle needed
    conc: 8,     // Arms trade, corruption, morality
    drive: 8.5,  // Tense, gripping
    resol: 7.5   // S1 resolves, S2 incoming
  },
  {
    title: 'Daredevil',
    slug: 'daredevil',
    year: 2015,
    tmdbId: 61889,
    episodes: 39,
    genres: ['action', 'drama', 'superhero'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/u6tICVagGwukuFPr0qBUwOqCKSn.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/qsnXwGS7KBbX4JLqHvICngtR8qg.jpg',
    // Best Marvel Netflix show. Cox/Kingpin. S3 perfect ending.
    char: 8.5,   // Cox brilliant, D'Onofrio terrifying
    world: 7.5,  // Hell's Kitchen, grounded
    cine: 8.5,   // Hallway fights, dark, cinematic
    spect: 6.5,  // Action spectacular in its own way
    conc: 7.5,   // Law, justice, vigilantism
    drive: 8,    // Compelling throughout
    resol: 8     // S3 perfect ending
  },
  {
    title: 'Jessica Jones',
    slug: 'jessica-jones',
    year: 2015,
    tmdbId: 38472,
    episodes: 39,
    genres: ['action', 'drama', 'superhero'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/pF7g6VyLnO4axqQl1QH3I4QH0vG.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/g9ju2o4LioYYOyihBvf9lVX8XL.jpg',
    // S1 masterful (Tennant). S2-3 declined. Ritter excellent.
    char: 8,     // Ritter perfect, Tennant unforgettable in S1
    world: 7,    // Noir NYC, Alias Investigations
    cine: 7.5,   // Noir aesthetic
    spect: 5,    // Limited spectacle
    conc: 8,     // Trauma, consent, power - deep for superhero
    drive: 7.5,  // S1 gripping, later seasons drag
    resol: 6.5   // Ended, not as strong as Daredevil
  },
  {
    title: 'Sense8',
    slug: 'sense8',
    year: 2015,
    tmdbId: 61664,
    episodes: 24,
    genres: ['sci-fi', 'drama'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/ufG3SG3dElDPriL1bFWvGSVeXqr.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/TePSNzSC8NoOkB7D7eIP3nIL1V.jpg',
    // Wachowskis. 8 minds connected. CANCELED but got movie finale.
    char: 8.5,   // 8 leads, all developed beautifully
    world: 9,    // Global, interconnected consciousness
    cine: 8.5,   // Stunning locations, fluid camera
    spect: 6,    // Sensate abilities
    conc: 9,     // Empathy, connection, identity - profound
    drive: 7.5,  // Slow burn but rewarding
    resol: 7     // Movie finale, rushed but complete
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

console.log('=== BATCH 9 SCORED ===\n');
newShows.forEach(s => {
  s.final = calcFinal(s);
  s.locked = false;
  console.log(s.title + ': ' + s.final + ' (' + s.status + ')');
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