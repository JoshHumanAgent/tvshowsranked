const https = require('https');

const ids = [
  { name: 'Elite', id: 80758 },           // Spanish Netflix
  { name: 'Jack Ryan', id: 73375 },
  { name: 'Titans', id: 77169 },          // DC Universe
  { name: 'Magnum PI', id: 79401 }        // 2018 reboot
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
          console.log('Genres:', j.genres ? j.genres.map(g => g.name).join(', ') : 'none');
          console.log('Poster:', j.poster_path ? 'YES' : 'NO');
          console.log('');
        } catch(e) { console.log('ERROR:', s.name); }
      });
    });
  }, i * 400);
});