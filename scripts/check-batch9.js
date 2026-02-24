const https = require('https');
const ids = [
  { name: 'Berlin Station', id: 66282 },
  { name: 'The Night Manager', id: 61859 },
  { name: 'Daredevil', id: 61857 },  // Marvel Daredevil correct ID
  { name: 'Jessica Jones', id: 38472 },
  { name: 'Sense8', id: 61664 }
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
          console.log('Poster:', j.poster_path ? 'YES' : 'NO');
          console.log('');
        } catch(e) { console.log('ERROR:', s.name, e.message); }
      });
    });
  }, i * 400);
});