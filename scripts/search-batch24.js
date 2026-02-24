const https = require('https');
const fs = require('fs');

let c = fs.readFileSync('data/core/ranked.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const ranked = JSON.parse(c);
const existingSlugs = new Set(ranked.shows.map(s => s.slug));

const titles = [
  'The Loyal Pin Thai',
  'Heated Rivalry Korean 2025',
  'Good Boy Korean 2025',
  'Head Over Heels Korean',
  'Friendly Rivalry Korean',
  'Can This Love Be Translated'
];

const found = [];
let completed = 0;

titles.forEach((q, i) => {
  setTimeout(() => {
    https.get(`https://api.themoviedb.org/3/search/tv?api_key=ca9b21cb89de2d1debed1050f603d7ad&query=${encodeURIComponent(q)}`, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const j = JSON.parse(data);
          if (j.results && j.results[0]) {
            const r = j.results[0];
            const slug = r.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            if (!existingSlugs.has(slug)) {
              found.push({
                title: r.name,
                slug: slug,
                year: parseInt((r.first_air_date || '2025').substring(0, 4)),
                tmdbId: r.id,
                vote: r.vote_average,
                count: r.vote_count
              });
            } else {
              console.log('DUP: ' + r.name);
            }
          } else {
            console.log('NOT FOUND: ' + q);
          }
        } catch(e) {}
        completed++;
        if (completed === titles.length) {
          console.log('\n=== FOUND: ' + found.length + ' ===\n');
          found.forEach((s, i) => {
            console.log(s.tmdbId + ' | ' + s.title + ' | ' + s.year + ' | ' + s.vote);
          });
        }
      });
    });
  }, i * 500);
});