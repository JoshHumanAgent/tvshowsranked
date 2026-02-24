const https = require('https');
const searches = [
  'Luke Cage Marvel',
  'Preacher 2016',
  'Occupied 2015',
  'Fear the Walking Dead'
];

searches.forEach((q, i) => {
  setTimeout(() => {
    const url = `https://api.themoviedb.org/3/search/tv?api_key=ca9b21cb89de2d1debed1050f603d7ad&query=${encodeURIComponent(q)}`;
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const j = JSON.parse(data);
          if (j.results && j.results[0]) {
            const r = j.results[0];
            console.log(r.id + ' | ' + r.name + ' | ' + (r.first_air_date||'').substring(0,4) + ' | ' + r.vote_average);
          } else {
            console.log('NOT FOUND: ' + q);
          }
        } catch(e) { console.log('ERROR: ' + q); }
      });
    });
  }, i * 500);
});