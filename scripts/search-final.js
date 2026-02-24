const https = require('https');
const searches = [
  'Prime Suspect US 2011',
  'Blue Bloods',
  'Nikita 2010',
  'Hawaii Five 0 2010',
  'NCIS Los Angeles',
  'Lewis ITV',
  'CSI NY',
  'CSI Miami',
  'La Femme Nikita 1997'
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