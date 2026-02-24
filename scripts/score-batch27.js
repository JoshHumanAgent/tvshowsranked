const fs = require('fs');

let c = fs.readFileSync('data/core/ranked.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const ranked = JSON.parse(c);

const existingSlugs = new Set(ranked.shows.map(s => s.slug));

// Filter out Shōgun (already in pool as 'shogun-2024')
const skipSlugs = ['sh-gun', 'shogun-2024', 'shogun'];

const newShows = [
  {
    title: 'The Good Bad Mother',
    slug: 'the-good-bad-mother',
    year: 2023,
    tmdbId: 211410,
    episodes: 14,
    genres: ['drama', 'comedy'],
    status: 'Ended',
    // K-drama. Mother-son relationship. Critical acclaim.
    char: 8, world: 7, cine: 7.5, spect: 4, conc: 7.5, drive: 8, resol: 7.5
  },
  {
    title: 'The Long Season',
    slug: 'the-long-season',
    year: 2023,
    tmdbId: 217449,
    episodes: 12,
    genres: ['drama', 'mystery', 'crime'],
    status: 'Ended',
    // Chinese drama. Murder mystery spanning decades.
    char: 7.5, world: 7, cine: 7.5, spect: 4, conc: 7.5, drive: 7.5, resol: 7.5
  },
  {
    title: 'Twinkling Watermelon',
    slug: 'twinkling-watermelon',
    year: 2023,
    tmdbId: 230133,
    episodes: 16,
    genres: ['drama', 'fantasy'],
    status: 'Ended',
    // K-drama. Time travel, music, deaf representation.
    char: 7.5, world: 7, cine: 7.5, spect: 5, conc: 7, drive: 7.5, resol: 7
  },
  {
    title: "The Boy's Word: Blood on the Asphalt",
    slug: 'the-boy-s-word-blood-on-the-asphalt',
    year: 2023,
    tmdbId: 219266,
    episodes: 8,
    genres: ['drama', 'crime'],
    status: 'Ended',
    // Russian crime drama. 80s youth gangs. Dark.
    char: 7.5, world: 7.5, cine: 7.5, spect: 5, conc: 7.5, drive: 8, resol: 7
  },
  {
    title: 'Marry My Husband',
    slug: 'marry-my-husband',
    year: 2024,
    tmdbId: 246543,
    episodes: 16,
    genres: ['drama', 'fantasy', 'comedy'],
    status: 'Ended',
    // K-drama. Time travel revenge. Popular.
    char: 7, world: 6.5, cine: 7, spect: 5, conc: 6.5, drive: 7.5, resol: 7
  },
  {
    title: 'Hidden Love',
    slug: 'hidden-love',
    year: 2023,
    tmdbId: 231891,
    episodes: 25,
    genres: ['drama', 'romance'],
    status: 'Ended',
    // C-drama romance. Very popular but genre-focused.
    char: 7, world: 6, cine: 7, spect: 3, conc: 5.5, drive: 7, resol: 7
  },
  {
    title: 'My Demon',
    slug: 'my-demon',
    year: 2023,
    tmdbId: 229746,
    episodes: 16,
    genres: ['drama', 'comedy', 'romance'],
    status: 'Ended',
    // K-drama. Demon-human romance.
    char: 6.5, world: 6.5, cine: 7, spect: 5, conc: 6, drive: 7, resol: 7
  },
  {
    title: 'No Gain No Love',
    slug: 'no-gain-no-love',
    year: 2024,
    tmdbId: 271966,
    episodes: 12,
    genres: ['drama', 'comedy', 'romance'],
    status: 'Ended',
    // K-drama rom-com.
    char: 6.5, world: 6, cine: 6.5, spect: 3, conc: 5.5, drive: 7, resol: 7
  },
  {
    title: 'Light Shop',
    slug: 'light-shop',
    year: 2024,
    tmdbId: 277821,
    episodes: 8,
    genres: ['drama', 'mystery'],
    status: 'Ended',
    // Korean mystery. Supernatural elements.
    char: 7, world: 7, cine: 7, spect: 5, conc: 7, drive: 7, resol: 6.5
  }
];

// Filter out existing and skip
const toAdd = newShows.filter(s => !existingSlugs.has(s.slug) && !skipSlugs.includes(s.slug));

function calcFinal(show) {
  const base = (show.char * 0.20) + (show.world * 0.15) + (show.cine * 0.15) +
               (show.spect * 0.10) + (show.conc * 0.15) + (show.drive * 0.15) +
               (show.resol * 0.10);
  const eps = show.episodes || 40;
  let mult = 1.0;
  if (eps <= 10) mult = 0.96;
  else if (eps <= 20) mult = 0.95;
  else if (eps <= 30) mult = 0.97;
  else mult = 1.00;
  return Math.round(base * mult * 100) / 100;
}

console.log('=== BATCH 27 SCORED ===\n');
toAdd.forEach(s => {
  s.final = calcFinal(s);
  s.locked = false;
  s.poster = 'https://image.tmdb.org/t/p/w500/placeholder.jpg';
  s.backdrop = 'https://image.tmdb.org/t/p/w780/placeholder.jpg';
  console.log(s.title + ': ' + s.final + ' (' + s.episodes + ' eps)');
});

if (toAdd.length > 0) {
  toAdd.forEach(ns => ranked.shows.push(ns));
  ranked.shows.sort((a, b) => b.final - a.final || a.title.localeCompare(b.title));
  ranked.shows.forEach((s, i) => s.rank = i + 1);
  ranked.meta.total = ranked.shows.length;
  ranked.meta.generated = new Date().toISOString();
  fs.writeFileSync('data/core/ranked.json', '\ufeff' + JSON.stringify(ranked, null, 2));
  
  console.log('\n=== ADDED ===');
  toAdd.forEach(ns => {
    const s = ranked.shows.find(x => x.slug === ns.slug);
    if (s) console.log(s.title + ' -> #' + s.rank);
  });
  console.log('Total: ' + ranked.shows.length);
}