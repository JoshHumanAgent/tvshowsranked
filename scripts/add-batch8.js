const fs = require('fs');
const https = require('https');

const TMDB_API = 'ca9b21cb89de2d1debed1050f603d7ad';
const shows = [
  { title: 'Counterpart', id: 69170 },
  { title: 'The Sinner', id: 73320 },
  { title: 'Money Heist', id: 71446 },
  { title: 'American Gods', id: 65456 },
  { title: 'The Punisher', id: 63086 }
];

function fetchTMDB(id) {
  return new Promise((resolve, reject) => {
    https.get(`https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_API}`, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function main() {
  const results = [];
  for (const show of shows) {
    const j = await fetchTMDB(show.id);
    results.push({
      title: j.name,
      slug: j.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      year: (j.first_air_date || '').substring(0, 4),
      tmdbId: j.id,
      episodes: j.number_of_episodes,
      genres: j.genres ? j.genres.map(g => g.name.toLowerCase().replace(' & ', '-')) : [],
      status: j.status,
      poster: j.poster_path ? `https://image.tmdb.org/t/p/w500${j.poster_path}` : null,
      backdrop: j.backdrop_path ? `https://image.tmdb.org/t/p/w780${j.backdrop_path}` : null,
      vote: j.vote_average
    });
    console.log(`${j.name} (${j.first_air_date?.substring(0,4)}) - ${j.number_of_episodes} eps - ${j.status}`);
  }
  
  console.log('\n=== JSON ===');
  console.log(JSON.stringify(results, null, 2));
}

main();