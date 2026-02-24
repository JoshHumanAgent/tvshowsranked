const https = require('https');
const fs = require('fs');

let c = fs.readFileSync('data/core/queue.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const q = JSON.parse(c);

let c2 = fs.readFileSync('data/core/ranked.json', 'utf8');
if (c2.charCodeAt(0) === 0xFEFF) c2 = c2.substring(1);
const ranked = JSON.parse(c2);
const existingSlugs = new Set(ranked.shows.map(s => s.slug));

// Skip already processed
const processed = ['the-loyal-pin', 'heated-rivalry', 'good-boy-2025', 'head-over-heels-2025', 'bon-appetit-your-majesty', 
                   'when-life-gives-you-tangerines', 'lovely-runner', 'high-school-return-of-a-gangster', 'the-judge-from-hell',
                   'can-this-love-be-translated'];

console.log('=== CHECKING REMAINING QUEUE ===\n');

const valid = [];
let checked = 0;
const candidates = q.candidates.filter(x => {
  const slug = (x.slug || x.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  return !processed.includes(slug);
});

console.log('Checking ' + candidates.length + ' candidates...\n');

candidates.slice(0, 15).forEach((c, i) => {
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
          
          const isDrama = genres.some(g => g.includes('drama'));
          const isAnime = genres.some(g => g.includes('animation'));
          const isReality = genres.some(g => g.includes('reality'));
          const hasEnoughEps = eps >= 3 && eps < 500;
          const notInPool = !existingSlugs.has(slug);
          const isRecent = year >= 2020;
          
          if (isDrama && !isAnime && !isReality && hasEnoughEps && notInPool && isRecent) {
            valid.push({
              title: j.name, slug, year, tmdbId: j.id, eps, vote: j.vote_average, count: j.vote_count,
              status: j.status, genres: genres.join(', '), poster: j.poster_path
            });
            console.log('✓ ' + j.name + ' (' + year + ') - ' + eps + ' eps - ' + j.status);
          } else {
            console.log('✗ ' + j.name + ' - ' + (isAnime ? 'ANIME' : isReality ? 'REALITY' : !isDrama ? 'NOT DRAMA' : eps < 3 ? 'SHORT' : eps > 500 ? 'TOO LONG' : !notInPool ? 'DUP' : !isRecent ? 'OLD' : 'SKIP'));
          }
        } catch(e) { console.log('ERR: ' + c.title); }
        checked++;
        if (checked === Math.min(15, candidates.length)) {
          console.log('\n=== VALID: ' + valid.length + ' ===');
          valid.forEach((v, i) => console.log((i+1) + '. ' + v.title + ' (' + v.year + ')'));
          fs.writeFileSync('data/core/queue.json', '\ufeff' + JSON.stringify({
            meta: { total: valid.length, generated: new Date().toISOString() },
            candidates: valid
          }, null, 2));
        }
      });
    });
  }, i * 350);
});