const https = require('https');

// Correct IDs - need to find Cracker
const ids = [
  { name: 'Spiral', id: 11726 },
  { name: "Foyle's War", id: 3163 },
  { name: 'CSI: Crime Scene Investigation', id: 1431 },
  { name: 'Law & Order: SVU', id: 2734 }
];

console.log('Checking known shows...\n');

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
          console.log('Poster:', j.poster_path);
          console.log('');
        } catch(e) { console.log('ERROR:', s.name); }
      });
    });
  }, i * 400);
});

// Search for Cracker separately
setTimeout(() => {
  console.log('\nSearching for Cracker...\n');
  https.get(`https://api.themoviedb.org/3/search/tv?api_key=ca9b21cb89de2d1debed1050f603d7ad&query=Cracker%20Jimmy%20Coltrane`, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const j = JSON.parse(data);
      if (j.results) {
        j.results.slice(0, 5).forEach(r => {
          console.log(r.id + ' | ' + r.name + ' | ' + (r.first_air_date||'').substring(0,4) + ' | ' + r.overview?.substring(0, 50));
        });
      }
    });
  });
}, 2000);