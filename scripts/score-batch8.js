const fs = require('fs');

let c = fs.readFileSync('data/core/ranked.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const ranked = JSON.parse(c);

const newShows = [
  {
    title: 'Counterpart',
    slug: 'counterpart',
    year: 2017,
    tmdbId: 63646,
    episodes: 20,
    genres: ['sci-fi', 'drama', 'thriller'],
    status: 'Canceled',
    poster: 'https://image.tmdb.org/t/p/w500/fVTpkoTkl7LJSoVCnuoHRPJvS4o.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/z2Q4lX7E76BuZMOOZrq4trz91j8.jpg',
    // JK Simmons dual role, parallel worlds spy thriller. Smart but CANCELED.
    char: 8,     // Simmons carries, strong supporting
    world: 8.5,  // Parallel worlds concept, well-built
    cine: 7,     // Standard TV look
    spect: 5,    // No spectacle
    conc: 8,     // Parallel worlds, identity, loyalty - dense
    drive: 7.5,  // Moves well
    resol: 4.5   // CANCELED penalty
  },
  {
    title: 'The Sinner',
    slug: 'the-sinner',
    year: 2017,
    tmdbId: 39852,
    episodes: 32,
    genres: ['crime', 'drama', 'mystery'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/rmibFGdqOe0kKKhPls0jVOdZCWw.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/lVWku9LX2qdJTtAbRzaCDhhWeTK.jpg',
    // Anthology mystery. Bill Pullman excellent. Each season complete.
    char: 7.5,   // Pullman great, varies by season
    world: 6,    // Generic American towns
    cine: 7,     // Atmospheric
    spect: 4,    // No spectacle
    conc: 7.5,   // Psychology, trauma, why-dunit
    drive: 8,    // Mystery propels
    resol: 7.5   // Each season resolves
  },
  {
    title: 'Money Heist',
    slug: 'money-heist',
    year: 2017,
    tmdbId: 71446,
    episodes: 41,
    genres: ['crime', 'thriller'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/gFZriCkpJYsApPZEF3jhxL4yLzG.jpg',
    // La Casa de Papel. Global phenomenon. Intense heist thriller.
    char: 7.5,   // Professor excellent, ensemble strong
    world: 7,    // Heist location, Madrid
    cine: 7.5,   // Dynamic, tense
    spect: 6,    // Heist spectacle
    conc: 7,     // Heist mechanics, resistance themes
    drive: 9,    // Relentlessly gripping
    resol: 8     // Complete, controversial ending
  },
  {
    title: 'American Gods',
    slug: 'american-gods',
    year: 2017,
    tmdbId: 46639,
    episodes: 26,
    genres: ['fantasy', 'drama'],
    status: 'Canceled',
    poster: 'https://image.tmdb.org/t/p/w500/3KCAZaKHmoMIN9dHutqaMtubQqD.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/uY3MJohUpY7UMMTK90BIhX5txEs.jpg',
    // Gaiman adaptation. S1 stunning, declined after. CANCELED.
    char: 7.5,   // McShane excellent, Shadow miscast
    world: 9,    // Gods among us, rich mythology
    cine: 9,     // Visually stunning
    spect: 7,    // God manifestations
    conc: 8.5,   // Faith, belief, American mythology
    drive: 6.5,  // Pacing issues after S1
    resol: 4     // CANCELED mid-story
  },
  {
    title: 'The Punisher',
    slug: 'the-punisher',
    year: 2017,
    tmdbId: 67178,
    episodes: 26,
    genres: ['action', 'crime', 'drama'],
    status: 'Canceled',
    poster: 'https://image.tmdb.org/t/p/w500/tM6xqRKXoloH9UchaJEyyRE9O1w.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/jBGjbSDRxOEudW9rmQbWDzJUKq9.jpg',
    // Bernthal perfect casting. Gritty, violent. CANCELED.
    char: 8,     // Bernthal phenomenal
    world: 6.5,  // Military/conspiracy underworld
    cine: 7.5,   // Gritty, violent
    spect: 5.5,  // Action violence
    conc: 7,     // PTSD, vengeance, moral ambiguity
    drive: 7.5,  // Propulsive
    resol: 5     // CANCELED, wrapped hastily
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

console.log('=== BATCH 8 SCORED ===\n');
newShows.forEach(s => {
  s.final = calcFinal(s);
  s.locked = false;
  console.log(s.title + ': ' + s.final + ' (' + s.status + ')');
  console.log('  char:' + s.char + ' world:' + s.world + ' cine:' + s.cine + ' spect:' + s.spect + ' conc:' + s.conc + ' drive:' + s.drive + ' resol:' + s.resol);
});

// Add to ranked
newShows.forEach(ns => {
  const exists = ranked.shows.find(s => s.slug === ns.slug);
  if (!exists) ranked.shows.push(ns);
});

// Re-sort
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