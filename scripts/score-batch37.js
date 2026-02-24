const fs = require('fs');

let c = fs.readFileSync('data/core/ranked.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const ranked = JSON.parse(c);

const newShows = [
  { title: 'The Glory', slug: 'the-glory', year: 2022, tmdbId: 205049, episodes: 16, genres: ['drama', 'thriller'], status: 'Ended', char: 8, world: 7, cine: 8, spect: 4, conc: 8, drive: 8.5, resol: 7.5 },
  { title: 'My Holo Love', slug: 'my-holo-love', year: 2020, tmdbId: 98468, episodes: 12, genres: ['drama', 'romance', 'sci-fi'], status: 'Ended', char: 7, world: 7, cine: 7, spect: 5, conc: 6.5, drive: 7, resol: 7 },
  { title: 'Tomorrow', slug: 'tomorrow', year: 2022, tmdbId: 156232, episodes: 16, genres: ['drama', 'fantasy'], status: 'Ended', char: 7.5, world: 7.5, cine: 7.5, spect: 5, conc: 7, drive: 7.5, resol: 7 },
  { title: 'Club de Cuervos', slug: 'club-de-cuervos', year: 2015, tmdbId: 62652, episodes: 45, genres: ['drama', 'comedy'], status: 'Ended', char: 7, world: 7, cine: 7, spect: 3, conc: 7, drive: 7.5, resol: 7 },
  { title: 'Rigo', slug: 'rigo', year: 2024, tmdbId: 276629, episodes: 99, genres: ['drama'], status: 'Returning Series', char: 6.5, world: 6, cine: 6.5, spect: 4, conc: 6, drive: 7, resol: 5 },
  { title: 'Ted Lasso', slug: 'ted-lasso', year: 2020, tmdbId: 92830, episodes: 34, genres: ['drama', 'comedy'], status: 'Ended', char: 8.5, world: 7.5, cine: 7.5, spect: 3, conc: 8, drive: 8, resol: 8 },
  { title: 'Maxton Hall', slug: 'maxton-hall', year: 2024, tmdbId: 273219, episodes: 12, genres: ['drama', 'romance'], status: 'Returning Series', char: 7, world: 6.5, cine: 7.5, spect: 4, conc: 6.5, drive: 7.5, resol: 6.5 },
  { title: 'Lessons in Chemistry', slug: 'lessons-in-chemistry', year: 2023, tmdbId: 234183, episodes: 8, genres: ['drama'], status: 'Ended', char: 8, world: 7.5, cine: 8, spect: 4, conc: 8, drive: 8, resol: 7.5 },
  { title: 'Panchayat', slug: 'panchayat', year: 2020, tmdbId: 104617, episodes: 32, genres: ['drama', 'comedy'], status: 'Returning Series', char: 8, world: 8, cine: 7.5, spect: 3, conc: 7.5, drive: 7.5, resol: 7.5 },
  { title: 'The Summer I Turned Pretty', slug: 'the-summer-i-turned-pretty', year: 2022, tmdbId: 205291, episodes: 26, genres: ['drama', 'romance'], status: 'Returning Series', char: 7, world: 6.5, cine: 7, spect: 3, conc: 6, drive: 7, resol: 6 },
  { title: 'Black Bird', slug: 'black-bird', year: 2022, tmdbId: 203102, episodes: 6, genres: ['drama', 'crime'], status: 'Ended', char: 8, world: 7.5, cine: 8, spect: 5, conc: 8, drive: 8.5, resol: 8 },
  { title: 'Mirzapur', slug: 'mirzapur', year: 2018, tmdbId: 85370, episodes: 29, genres: ['drama', 'crime', 'action'], status: 'Returning Series', char: 7.5, world: 8, cine: 7.5, spect: 5, conc: 7.5, drive: 8, resol: 6.5 },
  { title: 'Good Omens', slug: 'good-omens', year: 2019, tmdbId: 87432, episodes: 12, genres: ['drama', 'comedy', 'fantasy'], status: 'Ended', char: 8, world: 8, cine: 8, spect: 6, conc: 7.5, drive: 7.5, resol: 7.5 },
  { title: 'Paradise City', slug: 'paradise-city', year: 2021, tmdbId: 102891, episodes: 8, genres: ['drama'], status: 'Ended', char: 6.5, world: 6.5, cine: 6.5, spect: 4, conc: 6, drive: 6.5, resol: 5.5 },
  { title: 'Daisy Jones & the Six', slug: 'daisy-jones-the-six', year: 2023, tmdbId: 84955, episodes: 10, genres: ['drama'], status: 'Ended', char: 7.5, world: 7.5, cine: 8, spect: 4, conc: 7, drive: 7.5, resol: 7.5 },
  { title: 'Bosch: Legacy', slug: 'bosch-legacy', year: 2022, tmdbId: 136315, episodes: 30, genres: ['drama', 'crime'], status: 'Returning Series', char: 7.5, world: 7.5, cine: 7.5, spect: 4, conc: 7.5, drive: 8, resol: 7 },
  { title: 'Pachinko', slug: 'pachinko', year: 2022, tmdbId: 154431, episodes: 16, genres: ['drama'], status: 'Returning Series', char: 8.5, world: 9, cine: 9, spect: 6, conc: 8.5, drive: 8, resol: 7.5 },
  { title: 'Swagger', slug: 'swagger', year: 2021, tmdbId: 95057, episodes: 18, genres: ['drama'], status: 'Canceled', char: 7, world: 7, cine: 7.5, spect: 4, conc: 7, drive: 7.5, resol: 6 },
  { title: 'Masters of the Air', slug: 'masters-of-the-air', year: 2024, tmdbId: 125153, episodes: 9, genres: ['drama', 'war'], status: 'Ended', char: 8, world: 8.5, cine: 9, spect: 8, conc: 7.5, drive: 8, resol: 7.5 },
  { title: 'Monarch: Legacy of Monsters', slug: 'monarch-legacy-of-monsters', year: 2023, tmdbId: 204801, episodes: 20, genres: ['drama', 'sci-fi'], status: 'Returning Series', char: 7, world: 8, cine: 8, spect: 7, conc: 7, drive: 7.5, resol: 6.5 }
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
  else if (eps <= 50) mult = 1.00;
  else if (eps <= 100) mult = 1.02;
  else mult = 1.03;
  return Math.round(base * mult * 100) / 100;
}

console.log('=== BATCH 37: STREAMING DRAMAS ===\n');
newShows.forEach(s => {
  s.final = calcFinal(s);
  s.locked = false;
  s.poster = 'https://image.tmdb.org/t/p/w500/placeholder.jpg';
  s.backdrop = 'https://image.tmdb.org/t/p/w780/placeholder.jpg';
  console.log(s.title + ': ' + s.final);
});

newShows.forEach(ns => ranked.shows.push(ns));
ranked.shows.sort((a, b) => b.final - a.final || a.title.localeCompare(b.title));
ranked.shows.forEach((s, i) => s.rank = i + 1);
ranked.meta.total = ranked.shows.length;

fs.writeFileSync('data/core/ranked.json', '\ufeff' + JSON.stringify(ranked, null, 2));

console.log('\n=== ADDED ===');
newShows.forEach(ns => {
  const s = ranked.shows.find(x => x.slug === ns.slug);
  console.log(ns.title + ' -> #' + s.rank);
});
console.log('Total:', ranked.shows.length);