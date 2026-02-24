const fs = require('fs');

let c = fs.readFileSync('data/core/ranked.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const ranked = JSON.parse(c);

const newShows = [
  {
    title: "Marvel's Luke Cage",
    slug: 'luke-cage',
    year: 2016,
    tmdbId: 62126,
    episodes: 26,
    genres: ['action', 'drama', 'superhero'],
    status: 'Canceled',
    poster: 'https://image.tmdb.org/t/p/w500/yzM1hMB3PUJqbISX0f421b3xOjB.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // Netflix Marvel. Harlem. Mike Colter. S1 strong, S2 weaker.
    char: 7,     // Colter great, supporting mixed
    world: 7.5,  // Harlem, Marvel Netflix
    cine: 7.5,   // Stylish, soulful
    spect: 6,    // Superhero action
    conc: 6.5,   // Race, power, community
    drive: 6.5,  // Uneven pacing
    resol: 5     // Canceled, incomplete
  },
  {
    title: 'Fear the Walking Dead',
    slug: 'fear-the-walking-dead',
    year: 2015,
    tmdbId: 62286,
    episodes: 113,
    genres: ['horror', 'drama', 'thriller'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/l7N9aS6VyYvjelKoCB2eZge0Qky.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // TWD spinoff. 8 seasons. Found its own voice eventually.
    char: 6.5,   // Evolved over seasons
    world: 7,    // Zombie apocalypse
    cine: 6.5,   // TV quality
    spect: 5,    // Zombie horror
    conc: 6,     // Survival, family
    drive: 6.5,  // Variable by season
    resol: 6.5   // Complete after 8 seasons
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

console.log('=== BATCH 20 SCORED ===\n');
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