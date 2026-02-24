const https = require('https');
const fs = require('fs');

let c = fs.readFileSync('data/core/ranked.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const ranked = JSON.parse(c);
const existingSlugs = new Set(ranked.shows.map(s => s.slug));

console.log('=== DISCOVERY: CRIME/THRILLER DRAMAS ===');
console.log('Pool:', existingSlugs.size);

const discoveries = [];
const urls = [
  'https://api.themoviedb.org/3/discover/tv?api_key=ca9b21cb89de2d1debed1050f603d7ad&with_genres=18,80&sort_by=vote_average.desc&vote_count.gte=150&page=1',
  'https://api.themoviedb.org/3/discover/tv?api_key=ca9b21cb89de2d1debed1050f603d7ad&with_genres=18,9648&sort_by=vote_average.desc&vote_count.gte=150&page=1'
];

let completed = 0;
urls.forEach((url, i) => {
  setTimeout(() => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const j = JSON.parse(data);
          if (j.results) {
            j.results.forEach(r => {
              const slug = r.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
              const year = parseInt((r.first_air_date || '2020').substring(0, 4));
              
              if (!existingSlugs.has(slug) && year >= 2015 && r.vote_count >= 100 && r.vote_average >= 7.3) {
                discoveries.push({ title: r.name, slug, year, tmdbId: r.id, vote: r.vote_average, count: r.vote_count });
              }
            });
          }
        } catch(e) {}
        completed++;
        if (completed === urls.length) {
          const unique = [...new Map(discoveries.map(d => [d.slug, d])).values()];
          unique.sort((a, b) => b.vote - a.vote);
          
          console.log('\n=== CANDIDATES: ' + unique.length + ' ===\n');
          unique.slice(0, 15).forEach((d, i) => console.log((i+1) + '. ' + d.title + ' (' + d.year + ') - ' + d.vote));
          
          fs.writeFileSync('data/core/queue.json', '\ufeff' + JSON.stringify({ meta: { total: unique.length }, candidates: unique }, null, 2));
        }
      });
    });
  }, i * 400);
});