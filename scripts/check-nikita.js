const https = require('https');

https.get(`https://api.themoviedb.org/3/search/tv?api_key=ca9b21cb89de2d1debed1050f603d7ad&query=Nikita`, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const j = JSON.parse(data);
      console.log('NIKITA SEARCH RESULTS:');
      if (j.results) {
        j.results.slice(0, 5).forEach(r => {
          console.log(r.id + ' | ' + r.name + ' | ' + (r.first_air_date||'').substring(0,4) + ' | ' + r.vote_average);
        });
      }
    } catch(e) { console.log('ERROR'); }
  });
});