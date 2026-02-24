const fs = require('fs');

let c = fs.readFileSync('data/core/ranked.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const ranked = JSON.parse(c);

const newShows = [
  {
    title: 'El Marginal',
    slug: 'el-marginal',
    year: 2016,
    tmdbId: 67166,
    episodes: 43,
    genres: ['crime', 'drama'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/p1GFsUK5nCVHYNtjRxoGyfGdD9C.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // Argentine crime drama. Prison setting. Critical acclaim.
    char: 8,     // Complex characters
    world: 7.5,  // Argentine prison
    cine: 7.5,   // Gritty realism
    spect: 4,    // No spectacle
    conc: 7.5,   // Prison politics, survival
    drive: 8,    // Tense
    resol: 7.5   // Complete
  },
  {
    title: "Marvel's Agent Carter",
    slug: 'agent-carter',
    year: 2015,
    tmdbId: 61550,
    episodes: 18,
    genres: ['action', 'drama', 'superhero'],
    status: 'Canceled',
    poster: 'https://image.tmdb.org/t/p/w500/fe79VYyLp5ZBstpJ4oukpuUT3B.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // Hayley Atwell. Peggy Carter. 1940s spy thriller.
    char: 7.5,   // Atwell excellent
    world: 8,    // 1940s MCU
    cine: 8,     // Period piece
    spect: 6,    // Spy action
    conc: 7,     // Gender, power, espionage
    drive: 7.5,  // Fun and propulsive
    resol: 5     // Canceled, undone
  },
  {
    title: 'The Blacklist',
    slug: 'the-blacklist',
    year: 2013,
    tmdbId: 46952,
    episodes: 218,
    genres: ['crime', 'thriller', 'drama'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/4HTfd1PhgFUenJxVuBDNdLmdr0c.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // James Spader. Red Reddington. Long-running criminal informant series.
    char: 8,     // Spader carries
    world: 7,    // Criminal underworld
    cine: 6.5,   // Network TV
    spect: 4,    // No spectacle
    conc: 7,     // Crime, conspiracy
    drive: 7.5,  // Serialized procedural
    resol: 6.5   // Ran long, resolved
  },
  {
    title: 'From Dusk Till Dawn: The Series',
    slug: 'from-dusk-till-dawn-the-series',
    year: 2014,
    tmdbId: 60626,
    episodes: 30,
    genres: ['horror', 'crime', 'drama'],
    status: 'Canceled',
    poster: 'https://image.tmdb.org/t/p/w500/pAfTOb7lHvRlTa86jw99nM8iU3K.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // Rodriguez adaptation. Expanded film mythology.
    char: 6,     // Film cast recast
    world: 6.5,  // Film expanded
    cine: 6.5,   // TV budget
    spect: 6,    // Horror action
    conc: 5.5,   // Vampire mythology
    drive: 6.5,  // Stretched premise
    resol: 5     // Canceled
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

console.log('=== BATCH 21 SCORED ===\n');
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