const https = require('https');
const fs = require('fs');

let c = fs.readFileSync('data/core/queue.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const q = JSON.parse(c);

console.log('=== VALIDATING TOP 15 CANDIDATES ===\n');

const valid = [];
const rejected = [];

q.candidates.slice(0, 15).forEach((c, i) => {
  setTimeout(() => {
    https.get(`https://api.themoviedb.org/3/tv/${c.tmdbId}?api_key=ca9b21cb89de2d1debed1050f603d7ad`, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const j = JSON.parse(data);
          const genres = j.genres ? j.genres.map(g => g.name.toLowerCase()) : [];
          const type = j.type || 'scripted';
          const eps = j.number_of_episodes || 0;
          const status = j.status || 'Unknown';
          
          // Check if it's a drama (not anime, cartoon, variety)
          const isDrama = genres.some(g => g.includes('drama')) && 
                         !genres.some(g => g.includes('animation') || g.includes('reality') || g.includes('talk'));
          const hasEnoughEps = eps >= 3;
          
          const result = {
            title: j.name,
            slug: c.slug,
            year: c.year,
            tmdbId: c.tmdbId,
            vote: c.vote,
            count: c.count,
            eps: eps,
            status: status,
            genres: genres.join(', '),
            poster: j.poster_path,
            valid: isDrama && hasEnoughEps
          };
          
          if (result.valid) {
            valid.push(result);
            console.log('✓ ' + j.name + ' (' + c.year + ') - ' + eps + ' eps - ' + genres.join(', '));
          } else {
            rejected.push(result);
            console.log('✗ ' + j.name + ' (' + c.year + ') - ' + eps + ' eps - ' + genres.join(', '));
          }
          
          // After all checked
          if (valid.length + rejected.length === 15) {
            console.log('\n=== VALID DRAMAS: ' + valid.length + ' ===');
            valid.forEach((v, i) => console.log((i+1) + '. ' + v.title));
            console.log('\n=== REJECTED: ' + rejected.length + ' ===');
            rejected.forEach((r, i) => console.log((i+1) + '. ' + r.title + ' - ' + r.genres));
          }
        } catch(e) {
          console.log('ERROR: ' + c.title);
        }
      });
    });
  }, i * 400);
});