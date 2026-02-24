const https = require('https');
const fs = require('fs');

// Load current shows to check for duplicates
let c = fs.readFileSync('data/core/ranked.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const ranked = JSON.parse(c);
const existingSlugs = new Set(ranked.shows.map(s => s.slug));

console.log('=== DISCOVERY SCAN ===');
console.log('Current pool:', existingSlugs.size, 'shows\n');

// Discover new dramas from TMDB (2024-2025 releases)
const discoveries = [];
const urls = [
  'https://api.themoviedb.org/3/discover/tv?api_key=ca9b21cb89de2d1debed1050f603d7ad&with_genres=18&first_air_date.gte=2024-01-01&sort_by=popularity.desc&page=1',
  'https://api.themoviedb.org/3/discover/tv?api_key=ca9b21cb89de2d1debed1050f603d7ad&with_genres=18&first_air_date.gte=2024-01-01&sort_by=vote_average.desc&vote_count.gte=50&page=1'
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
              const year = (r.first_air_date || '').substring(0, 4);
              
              // Filter: Drama, 2020+, not already in pool
              if (!existingSlugs.has(slug) && parseInt(year) >= 2020 && r.vote_count >= 20) {
                discoveries.push({
                  title: r.name,
                  slug: slug,
                  year: parseInt(year),
                  tmdbId: r.id,
                  vote: r.vote_average,
                  count: r.vote_count,
                  poster: r.poster_path
                });
              }
            });
          }
        } catch(e) {}
        completed++;
        if (completed === urls.length) {
          // Dedupe and sort
          const unique = [...new Map(discoveries.map(d => [d.slug, d])).values()];
          unique.sort((a, b) => b.vote - a.vote);
          
          console.log('=== CANDIDATES FOUND: ' + unique.length + ' ===\n');
          unique.slice(0, 20).forEach((d, i) => {
            console.log((i+1) + '. ' + d.title + ' (' + d.year + ') - ' + d.vote + '/10 (' + d.count + ' votes)');
          });
          
          // Save candidates
          fs.writeFileSync('data/core/queue.json', '\ufeff' + JSON.stringify({
            meta: { total: unique.length, generated: new Date().toISOString() },
            candidates: unique
          }, null, 2));
          console.log('\nSaved to queue.json');
        }
      });
    });
  }, i * 600);
});