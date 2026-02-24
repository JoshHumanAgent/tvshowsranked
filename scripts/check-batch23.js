const https = require('https');

const ids = [
  { name: 'When Life Gives You Tangerines', id: 219246 },
  { name: 'Lovely Runner', id: 230923 },
  { name: 'High School Return of a Gangster', id: 224030 },
  { name: 'The Judge from Hell', id: 235577 }
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
          console.log('Vote:', j.vote_average, '| Count:', j.vote_count);
          console.log('Genres:', j.genres ? j.genres.map(g => g.name).join(', ') : 'none');
          console.log('Poster:', j.poster_path || 'NO');
          console.log('Overview:', (j.overview || '').substring(0, 150) + '...');
          console.log('');
        } catch(e) { console.log('ERROR:', s.name); }
      });
    });
  }, i * 400);
});