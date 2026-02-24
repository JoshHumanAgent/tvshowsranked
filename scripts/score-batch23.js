const fs = require('fs');

let c = fs.readFileSync('data/core/ranked.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const ranked = JSON.parse(c);

// These are K-dramas with high fan ratings - MUST SCORE HARSHLY
// Compare to foundation: Breaking Bad (9.15), The Wire (8.83), etc.
// K-dramas rarely match foundation quality - caps apply

const newShows = [
  {
    title: 'When Life Gives You Tangerines',
    slug: 'when-life-gives-you-tangerines',
    year: 2025,
    tmdbId: 219246,
    episodes: 16,
    genres: ['drama', 'romance'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/1VC3sEFxYXYDqQUCAnvWfUsYg1s.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // Jeju romance saga. Sentimental, well-made. But NOT top-tier drama.
    // Compare to foundation: This is romance, not prestige drama.
    char: 7,     // Emotional characters
    world: 6.5,  // Jeju setting
    cine: 7,     // K-drama production
    spect: 4,    // No spectacle
    conc: 6,     // Romance, life
    drive: 7,    // Emotional pull
    resol: 7.5   // Complete
  },
  {
    title: 'Lovely Runner',
    slug: 'lovely-runner',
    year: 2024,
    tmdbId: 230923,
    episodes: 16,
    genres: ['drama', 'romance', 'fantasy'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/xJQyrif5M4UMoVBrBlwUabtaRxB.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // Time travel romance. Fan favorite. But genre-heavy, not prestige.
    char: 7,     // Charismatic leads
    world: 6.5,  // Time travel element
    cine: 6.5,   // Standard K-drama
    spect: 5,    // Fantasy element
    conc: 5.5,   // Romance mechanics
    drive: 7.5,  // Propulsive romance
    resol: 7     // Complete
  },
  {
    title: 'High School Return of a Gangster',
    slug: 'high-school-return-of-a-gangster',
    year: 2024,
    tmdbId: 224030,
    episodes: 8,
    genres: ['drama', 'fantasy', 'comedy'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/bK5kGsWq9vGALbDgPmNiLFNFVI1.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // Body possession comedy. Short format. Niche.
    char: 6.5,   // Fun premise
    world: 5.5,  // Body swap logic
    cine: 6,     // Web drama quality
    spect: 4,    // No spectacle
    conc: 5,     // High school comedy
    drive: 7,    // Fun pacing
    resol: 6.5   // Short but complete
  },
  {
    title: 'The Judge from Hell',
    slug: 'the-judge-from-hell',
    year: 2024,
    tmdbId: 235577,
    episodes: 14,
    genres: ['drama', 'fantasy', 'crime', 'mystery'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/9vhLHbUiiP9HiXfJw5OUC7KoaJG.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // Supernatural crime drama. Darker, genre-blend. Higher potential.
    char: 7,     // Demon judge premise
    world: 7,    // Supernatural overlay
    cine: 7,     // Dark K-drama style
    spect: 5,    // Fantasy elements
    conc: 7,     // Justice, morality
    drive: 7.5,  // Crime thriller pace
    resol: 7     // Complete
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

console.log('=== BATCH 23 SCORED (K-DRAMAS) ===\n');
console.log('Scoring HARSH per 00-HOW-TO-RANK.md');
console.log('Compare to: Breaking Bad (9.15), The Wire (8.83)\n');

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