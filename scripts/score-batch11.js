const fs = require('fs');

let c = fs.readFileSync('data/core/ranked.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const ranked = JSON.parse(c);

const newShows = [
  {
    title: 'Endeavour',
    slug: 'endeavour',
    year: 2013,
    tmdbId: 44264,
    episodes: 35,
    genres: ['crime', 'mystery', 'drama'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/suX3F5e8XN9emrb52CQSwt2mRwx.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/52UMX6fg1PHgkgZicP8eBktR7Ay.jpg',
    // Inspector Morse prequel. Shaun Evans. Quality British detective. Complete.
    char: 8,     // Evans excellent as young Morse
    world: 7,    // 1960s Oxford, period piece
    cine: 7.5,   // Beautiful period work
    spect: 4,    // No spectacle
    conc: 7.5,   // Detective puzzles, period politics
    drive: 7.5,  // Procedural but quality
    resol: 8     // Complete arc, connects to Morse
  },
  {
    title: 'American Horror Story',
    slug: 'american-horror-story',
    year: 2011,
    tmdbId: 1413,
    episodes: 132,
    genres: ['horror', 'thriller', 'drama'],
    status: 'Returning Series',
    poster: 'https://image.tmdb.org/t/p/w500/x2c3AvZeTyNehRZXabTojAxfDuR.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/oCHG3Lz2Gx7VrM2rHCLvbWpuJze.jpg',
    // Anthology horror. Ryan Murphy. Peaks early, declines. Ongoing.
    char: 7,     // Repertory cast, varies by season
    world: 7.5,  // Each season different
    cine: 8,     // Stylish, visual
    spect: 7,    // Horror spectacle
    conc: 6.5,   // Horror themes, inconsistent
    drive: 7,    // Varies wildly by season
    resol: 6     // Anthology, but seasons vary
  },
  {
    title: 'The Bridge',
    slug: 'the-bridge',
    year: 2011,
    tmdbId: 45016,
    episodes: 38,
    genres: ['crime', 'mystery', 'drama'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/v8V9hLWArWhoIdmZ1ujmWrJZL6J.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/3HEqP7iN2nS5XhL1gXc7c6Ggq6M.jpg',
    // Bron/Broen. Danish/Swedish noir. Sofia Helin legendary as Saga Norén.
    char: 8.5,   // Saga Norén is iconic
    world: 8,    // Øresund bridge, cross-border
    cine: 8.5,   // Nordic noir aesthetic perfected
    spect: 4,    // No spectacle
    conc: 8,     // Society, identity, justice
    drive: 8,    // Gripping throughout
    resol: 8     // Complete in 4 seasons
  },
  {
    title: 'Doctor Who',
    slug: 'doctor-who',
    year: 2005,
    tmdbId: 57243,
    episodes: 153,
    genres: ['sci-fi', 'adventure', 'drama'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/w8enSKCf6Zm0topeQ2XPccDqsqp.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/5NzHDxzN6tSWBUzVYO6j6WB7T8q.jpg',
    // Sci-fi institution. Multiple eras, quality varies. 2005-2022 revival.
    // NOTE: More adventure than drama, but dramatic elements significant
    char: 7.5,   // Doctors and companions vary
    world: 9,    // Time/space infinite
    cine: 7,     // BBC budget, creative but inconsistent
    spect: 8,    // Time travel spectacle
    conc: 7,     // Timey-wimey, morality
    drive: 7.5,  // Episodic + arcs
    resol: 6     // Never truly ends, regenerates
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

console.log('=== BATCH 11 SCORED ===\n');
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