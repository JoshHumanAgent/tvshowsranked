const fs = require('fs');
const path = require('path');

const newShows = [
  {
    slug: 'bon-appetit-your-majesty',
    title: 'Bon Appétit, Your Majesty',
    year: 2025,
    month: 8,
    genres: ['drama', 'fantasy', 'romance'],
    final: 6.8,
    tmdbId: 280945,
    char: 7,
    world: 7,
    cine: 6.5,
    spect: 5,
    conc: 6.5,
    drive: 7.5,
    resol: 7,
    episodes: 12,
    locked: false,
    poster: 'https://image.tmdb.org/t/p/w500/ttbmzTZHTzqDK4JniKonMrsQath.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/ttbmzTZHTzqDK4JniKonMrsQath.jpg',
    streaming: { us: ['Viki'], uk: ['Viki'] },
    notes: 'K-drama historical romance with fantasy - solid but niche'
  },
  {
    slug: 'paradise-2025',
    title: 'Paradise',
    year: 2025,
    month: 1,
    genres: ['drama', 'crime', 'thriller'],
    final: 6.8,
    tmdbId: 245927,
    char: 7,
    world: 6.5,
    cine: 6.5,
    spect: 5,
    conc: 7,
    drive: 7,
    resol: 6,
    episodes: 8,
    locked: false,
    poster: 'https://image.tmdb.org/t/p/w500/5QsLvWh8J1mXl1W05wNJknMmhzR.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/5QsLvWh8J1mXl1W05wNJknMmhzR.jpg',
    streaming: { us: ['Hulu'], uk: ['Disney+'] },
    notes: 'Ongoing - provisional score capped per rules'
  },
  {
    slug: 'in-the-mud',
    title: 'In the Mud',
    year: 2025,
    month: 8,
    genres: ['drama', 'crime'],
    final: 6.2,
    tmdbId: 258462,
    char: 6.5,
    world: 6,
    cine: 6,
    spect: 4,
    conc: 6.5,
    drive: 6.5,
    resol: 6,
    episodes: 8,
    locked: false,
    poster: 'https://image.tmdb.org/t/p/w500/bxPELhUZNgbFUN31EZTBC99wOHD.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/bxPELhUZNgbFUN31EZTBC99wOHD.jpg',
    streaming: { us: ['Netflix'], uk: ['Netflix'] },
    notes: 'Spanish crime drama - solid but not standout'
  },
  {
    slug: 'dinastia-casillas',
    title: 'Dinastía Casillas',
    year: 2025,
    month: 10,
    genres: ['drama'],
    final: 6.0,
    tmdbId: 302463,
    char: 6,
    world: 5.5,
    cine: 6,
    spect: 4,
    conc: 6,
    drive: 6.5,
    resol: 6,
    episodes: 10,
    locked: false,
    poster: 'https://image.tmdb.org/t/p/w500/b4D9I3nz4Iya8Pd566PpOvz9q6O.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/b4D9I3nz4Iya8Pd566PpOvz9q6O.jpg',
    streaming: { us: ['Netflix'], uk: ['Netflix'] },
    notes: 'Spanish telenovela-style drama - narrow appeal'
  }
];

const rankedPath = path.join(__dirname, '../data/core/ranked.json');
let raw = fs.readFileSync(rankedPath, 'utf8');
if (raw.charCodeAt(0) === 0xFEFF) raw = raw.substring(1);
const data = JSON.parse(raw);

let added = 0;
newShows.forEach(show => {
  const exists = data.shows.find(s => s.tmdbId === show.tmdbId || s.slug === show.slug);
  if (!exists) {
    data.shows.push(show);
    console.log('✓ Queued:', show.title, '| Score:', show.final);
    added++;
  } else {
    console.log('✗ Skip:', show.title, '- already exists');
  }
});

if (added > 0) {
  data.shows.sort((a, b) => b.final - a.final);
  data.shows.forEach((s, i) => s.rank = i + 1);
  data.meta.total = data.shows.length;
  data.meta.generated = new Date().toISOString();
  fs.writeFileSync(rankedPath, JSON.stringify(data, null, 2));
  console.log('\n✓ Added', added, 'shows. Total:', data.meta.total);
} else {
  console.log('\n✗ No new shows added.');
}