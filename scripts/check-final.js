const https = require('https');

const ids = [
  { name: 'Prime Suspect (US)', id: 39684 },
  { name: 'Blue Bloods', id: 32692 },
  { name: 'NCIS: Los Angeles', id: 17610 },
  { name: 'CSI: NY', id: 2458 },
  { name: 'CSI: Miami', id: 1620 }
];

ids.forEach((s, i) => {
  setTimeout(() => {
    https.get(`https://api.themoviedb.org/3/tv/${s.id}?api_key=ca9b21cb89de2d1debed1050f603d7ad`, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const j = JSON.parse(data);
          console.log('=== ' + j.name + ' ===');
          console.log('ID:', j.id, '| Year:', (j.first_air_date || '').substring(0, 4));
          console.log('Eps:', j.number_of_episodes, '| Status:', j.status);
          console.log('Vote:', j.vote_average);
          console.log('Poster:', j.poster_path || 'NO');
          console.log('');
        } catch(e) { console.log('ERROR:', s.name); }
      });
    });
  }, i * 400);
});