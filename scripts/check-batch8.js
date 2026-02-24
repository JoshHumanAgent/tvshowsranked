const fs = require('fs');
const https = require('https');

const TMDB_API = 'ca9b21cb89de2d1debed1050f603d7ad';
const ids = [
  { title: 'Counterpart', id: 63646 },
  { title: 'The Sinner', id: 39852 },
  { title: 'Money Heist', id: 71446 },
  { title: 'American Gods', id: 46639 },
  { title: 'The Punisher', id: 67178 }
];

function fetch(id) {
  return new Promise((resolve, reject) => {
    https.get(`https://api.themoviedb.org/3/tv/${id}?api_key=${TMDB_API}`, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function main() {
  for (const s of ids) {
    const j = await fetch(s.id);
    console.log('=== ' + j.name + ' ===');
    console.log('ID:', j.id, '| Year:', (j.first_air_date || '').substring(0, 4));
    console.log('Eps:', j.number_of_episodes, '| Status:', j.status);
    console.log('Vote:', j.vote_average);
    console.log('Genres:', j.genres ? j.genres.map(g => g.name).join(', ') : 'none');
    console.log('Poster:', j.poster_path ? 'YES' : 'NO');
    console.log('');
  }
}

main();