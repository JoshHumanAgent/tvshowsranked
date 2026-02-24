const https = require('https');
const fs = require('fs');

let c = fs.readFileSync('data/core/queue.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const q = JSON.parse(c);

let c2 = fs.readFileSync('data/core/ranked.json', 'utf8');
if (c2.charCodeAt(0) === 0xFEFF) c2 = c2.substring(1);
const ranked = JSON.parse(c2);
const existingSlugs = new Set(ranked.shows.map(s => s.slug));

console.log('=== VALIDATING NEW CANDIDATES ===\n');

const valid = [];
let checked = 0;

q.candidates.slice(0, 20).forEach((c, i) => {
  setTimeout(() => {
    https.get(`https://api.themoviedb.org/3/tv/${c.tmdbId}?api_key=ca9b21cb89de2d1debed1050f603d7ad`, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const j = JSON.parse(data);
          const genres = j.genres ? j.genres.map(g => g.name.toLowerCase()) : [];
          const eps = j.number_of_episodes || 0;
          const year = parseInt((j.first_air_date || '2024').substring(0, 4));
          const slug = j.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          
          // Filter: Drama, not anime, enough eps, not already in pool, year >= 2020
          const isDrama = genres.some(g => g.includes('drama'));
          const isAnime = genres.some(g => g.includes('animation'));
          const isReality = genres.some(g => g.includes('reality'));
          const hasEnoughEps = eps >= 3;
          const notInPool = !existingSlugs.has(slug);
          const isRecent = year >= 2020;
          
          if (isDrama && !isAnime && !isReality && hasEnoughEps && notInPool && isRecent) {
            valid.push({
              title: j.name,
              slug: slug,
              year: year,
              tmdbId: j.id,
              eps: eps,
              vote: j.vote_average,
              count: j.vote_count,
              status: j.status,
              genres: genres.join(', '),
              poster: j.poster_path
            });
            console.log('✓ ' + j.name + ' (' + year + ') - ' + eps + ' eps');
          } else {
            console.log('✗ ' + j.name + ' - ' + (isAnime ? 'ANIME' : isReality ? 'REALITY' : !isDrama ? 'NOT DRAMA' : eps < 3 ? 'TOO SHORT' : !notInPool ? 'DUP' : 'SKIP'));
          }
        } catch(e) {}
        checked++;
        if (checked === 20) {
          console.log('\n=== VALID: ' + valid.length + ' ===');
          fs.writeFileSync('data/core/queue.json', '\ufeff' + JSON.stringify({
            meta: { total: valid.length, generated: new Date().toISOString() },
            candidates: valid
          }, null, 2));
        }
      });
    });
  }, i * 400);
});