const https = require('https');
const fs = require('fs');

let c = fs.readFileSync('data/core/ranked.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const ranked = JSON.parse(c);
const existing = new Set(ranked.shows.map(s => s.slug));

console.log('=== 2024-2025 DRAMA CHECK ===');
console.log('Pool:', existing.size, 'shows\n');

const urls = [
  'https://api.themoviedb.org/3/discover/tv?api_key=ca9b21cb89de2d1debed1050f603d7ad&with_genres=18&first_air_date.gte=2024-01-01&sort_by=popularity.desc&page=1',
  'https://api.themoviedb.org/3/discover/tv?api_key=ca9b21cb89de2d1debed1050f603d7ad&with_genres=18&first_air_date.gte=2024-01-01&sort_by=vote_average.desc&vote_count.gte=100&page=1'
];

const discoveries = [];
let done = 0;

urls.forEach((url, i) => {
  setTimeout(() => {
    https.get(url, res => {
      let d = '';
      res.on('data', ch => d += ch);
      res.on('end', () => {
        try {
          const j = JSON.parse(d);
          j.results?.forEach(r => {
            const slug = r.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            if (!existing.has(slug) && r.vote_average >= 7) {
              discoveries.push({ title: r.name, slug, year: r.first_air_date?.substring(0,4), vote: r.vote_average, count: r.vote_count, tmdbId: r.id });
            }
          });
        } catch(e) {}
        done++;
        if (done === urls.length) {
          const unique = [...new Map(discoveries.map(d => [d.slug, d])).values()];
          unique.sort((a, b) => b.vote - a.vote);
          console.log('=== MISSING 2024-2025 DRAMAS:', unique.length, '===\n');
          unique.slice(0, 20).forEach((d, i) => console.log((i+1) + '. ' + d.title + ' (' + d.year + ') - ' + d.vote));
          fs.writeFileSync('data/core/queue.json', '\ufeff' + JSON.stringify({ meta: { total: unique.length }, candidates: unique }, null, 2));
        }
      });
    });
  }, i * 400);
});