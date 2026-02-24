const https = require('https');
const fs = require('fs');

let c = fs.readFileSync('data/core/queue.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const q = JSON.parse(c);

let c2 = fs.readFileSync('data/core/ranked.json', 'utf8');
if (c2.charCodeAt(0) === 0xFEFF) c2 = c2.substring(1);
const ranked = JSON.parse(c2);
const existingSlugs = new Set(ranked.shows.map(s => s.slug));

console.log('=== FILTERING ===\n');

const valid = [];
let checked = 0;

q.candidates.forEach((c, i) => {
  setTimeout(() => {
    https.get(`https://api.themoviedb.org/3/tv/${c.tmdbId}?api_key=ca9b21cb89de2d1debed1050f603d7ad`, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const j = JSON.parse(data);
          const genres = j.genres ? j.genres.map(g => g.name.toLowerCase()) : [];
          const eps = j.number_of_episodes || 0;
          const slug = j.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          
          const isDrama = genres.some(g => g.includes('drama'));
          const isAnime = genres.some(g => g.includes('animation'));
          
          if (isDrama && !isAnime && eps >= 4 && eps < 500 && !existingSlugs.has(slug)) {
            valid.push({ title: j.name, slug, year: parseInt(j.first_air_date?.substring(0,4) || '2020'), tmdbId: j.id, eps, vote: j.vote_average, status: j.status });
            console.log('✓ ' + j.name + ' - ' + eps + ' eps');
          } else {
            console.log('✗ ' + j.name + ' - ' + (isAnime ? 'ANIME' : !isDrama ? 'NOT DRAMA' : 'DUP/SKIP'));
          }
        } catch(e) {}
        checked++;
        if (checked === q.candidates.length) {
          console.log('\n=== NEW: ' + valid.length + ' ===');
          fs.writeFileSync('data/core/queue.json', '\ufeff' + JSON.stringify({ meta: { total: valid.length }, candidates: valid }, null, 2));
        }
      });
    });
  }, i * 250);
});