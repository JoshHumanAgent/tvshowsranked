const fs = require('fs');

let c = fs.readFileSync('data/core/ranked.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const ranked = JSON.parse(c);

const newShows = [
  {
    title: 'The Honourable Woman',
    slug: 'the-honourable-woman',
    year: 2014,
    tmdbId: 61123,
    episodes: 8,
    genres: ['thriller', 'drama'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/9EiRdOWqzkO7bHHQxxPnIIJ7s8G.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/aF9LrVAjGF5wyqVbWhLPLMqsgq.jpg',
    // Maggie Gyllenhaal, Hugo Blick. Limited series. Israel-Palestine intrigue.
    char: 8,     // Gyllenhaal excellent
    world: 7.5,  // Geopolitical complexity
    cine: 7.5,   // Atmospheric
    spect: 4,    // No spectacle
    conc: 8.5,   // Layers of political/personal
    drive: 7,    // Slow burn
    resol: 7.5   // Complete
  },
  {
    title: 'Top Boy',
    slug: 'top-boy',
    year: 2011,
    tmdbId: 41889,
    episodes: 32,  // Including Netflix revival
    genres: ['crime', 'drama'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/iBqgEMnbleoeLqdadlvBGDxVvKb.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/kagPjHfDQNOfthADcSfBhQKsXb2.jpg',
    // British crime masterpiece. Kane/Mod. Revived by Netflix. Complete.
    char: 8.5,   // Dushane/Sully iconic
    world: 8.5,  // Summerhouse brutal, real
    cine: 8,     // Gritty vérité
    spect: 5,    // No spectacle
    conc: 8,     // Survival, loyalty, system
    drive: 8.5,  // Relentless
    resol: 8     // Definitive ending
  },
  {
    title: 'Bates Motel',
    slug: 'bates-motel',
    year: 2013,
    tmdbId: 46786,
    episodes: 50,
    genres: ['thriller', 'drama', 'horror'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/xXKcfZE7ulYxgjjYv51s0zDG69s.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/s3pypVJf05ELPCUA6jSW381nLwm.jpg',
    // Psycho prequel. Highmore/Farmiga. 5 seasons complete arc.
    char: 8.5,   // Highmore/Farmiga tremendous
    world: 7.5,  // White Pine Bay
    cine: 7.5,   // Moody, atmospheric
    spect: 5,    // No spectacle
    conc: 8,     // Mother-son, madness, identity
    drive: 8,    // Builds tension masterfully
    resol: 8.5   // Perfect ending to prequel
  },
  {
    title: 'The Fall',
    slug: 'the-fall',
    year: 2013,
    tmdbId: 49010,
    episodes: 17,
    genres: ['crime', 'thriller'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/fm7nN3nUADA7JGgnFNlOWpXn1tf.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/vunaJ5k1cG8T4ROUGDZ05IhNXkP.jpg',
    // Anderson/Dornan. Cat-mouse serial killer hunt. Complete.
    char: 8,     // Anderson commanding, Dornan chilling
    world: 7,    // Belfast, grey
    cine: 7.5,   // Cold, clinical
    spect: 4,    // No spectacle
    conc: 7.5,   // Obsession, gender, power
    drive: 8,    // Slow but gripping
    resol: 7     // Controversial ending
  },
  {
    title: 'Shetland',
    slug: 'shetland',
    year: 2013,
    tmdbId: 46923,
    episodes: 56,
    genres: ['crime', 'mystery', 'drama'],
    status: 'Returning Series',
    poster: 'https://image.tmdb.org/t/p/w500/rKnxmir8m5I3RdSTdZr3jaQaCZi.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/AdlDrgoNCDu3naYjZMwmiklBHnV.jpg',
    // Scottish detective. Henshall. Long-running procedural.
    char: 7.5,   // Henshall solid, ensemble good
    world: 8,    // Shetland stunning, atmospheric
    cine: 7.5,   // Beautiful location work
    spect: 4,    // No spectacle
    conc: 7,     // Island life, isolation
    drive: 7.5,  // Procedural pacing
    resol: 7     // Case-by-case resolution
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

console.log('=== BATCH 10 SCORED ===\n');
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