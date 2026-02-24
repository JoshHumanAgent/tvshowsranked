const https = require('https');
const fs = require('fs');

let c = fs.readFileSync('data/core/ranked.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const ranked = JSON.parse(c);
const existing = new Set(ranked.shows.map(s => s.slug));

console.log('=== DISCOVERY: MORE DRAMAS ===');
console.log('Pool:', existing.size);

const discoveries = [];
const urls = [
  'https://api.themoviedb.org/3/discover/tv?api_key=ca9b21cb89de2d1debed1050f603d7ad&with_genres=18&first_air_date.gte=2010-01-01&sort_by=vote_average.desc&vote_count.gte=200&page=3',
  'https://api.themoviedb.org/3/discover/tv?api_key=ca9b21cb89de2d1debed1050f603d7ad&with_genres=18&first_air_date.gte=2010-01-01&sort_by=vote_count.desc&vote_count.gte=500&page=2'
];

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
            if (!existing.has(slug) && r.vote_average >= 7.2) {
              discoveries.push({ title: r.name, slug, tmdbId: r.id, vote: r.vote_average, count: r.vote_count });
            }
          });
        } catch(e) {}
        done++;
        if (done === urls.length) {
          const uniq = [...new Map(discoveries.map(d => [d.slug, d])).values()];
          uniq.sort((a, b) => b.vote - a.vote);
          console.log('\n=== FOUND:', uniq.length, '===');
          uniq.slice(0, 20).forEach((d, i) => console.log((i+1) + '.', d.title, '(' + d.vote + ')'));
          fs.writeFileSync('data/core/queue.json', '\ufeff' + JSON.stringify({ meta: { total: uniq.length }, candidates: uniq }, null, 2));
        }
      });
    });
  }, i * 400);
});