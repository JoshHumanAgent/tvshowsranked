const https = require('https');
const fs = require('fs');

let c = fs.readFileSync('data/core/queue.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const q = JSON.parse(c);

let c2 = fs.readFileSync('data/core/ranked.json', 'utf8');
if (c2.charCodeAt(0) === 0xFEFF) c2 = c2.substring(1);
const ranked = JSON.parse(c2);
const existing = new Set(ranked.shows.map(s => s.slug));

const valid = [];
let done = 0;

q.candidates.forEach((c, i) => {
  setTimeout(() => {
    https.get(`https://api.themoviedb.org/3/tv/${c.tmdbId}?api_key=ca9b21cb89de2d1debed1050f603d7ad`, res => {
      let d = '';
      res.on('data', ch => d += ch);
      res.on('end', () => {
        try {
          const j = JSON.parse(d);
          const g = j.genres ? j.genres.map(x => x.name.toLowerCase()) : [];
          const notAnime = !g.some(x => x.includes('animation'));
          const isDrama = g.some(x => x.includes('drama'));
          const slug = j.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          
          if (notAnime && isDrama && !existing.has(slug) && j.number_of_episodes >= 4) {
            valid.push({ title: j.name, slug, year: parseInt(j.first_air_date?.substring(0,4) || '2020'), tmdbId: j.id, eps: j.number_of_episodes, vote: j.vote_average });
            console.log('✓', j.name, '-', j.number_of_episodes, 'eps');
          } else {
            console.log('✗', j.name, '-', !notAnime ? 'ANIME' : !isDrama ? 'NOT DRAMA' : 'DUP');
          }
        } catch(e) {}
        done++;
        if (done === q.candidates.length) {
          fs.writeFileSync('data/core/queue.json', '\ufeff' + JSON.stringify({ meta: { total: valid.length }, candidates: valid }, null, 2));
          console.log('\n=== VALID DRAMAS:', valid.length, '===');
        }
      });
    });
  }, i * 250);
});