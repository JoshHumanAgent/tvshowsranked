const https = require('https');
const fs = require('fs');

const titles = [
  'The Loyal Pin 2024',
  'Heated Rivalry 2025',
  'When Life Gives You Tangerines',
  'Good Boy 2025 Korean',
  'Head Over Heels 2025',
  'Friendly Rivalry 2025',
  'Lovely Runner 2024',
  'High School Return of a Gangster',
  'The Judge from Hell 2024'
];

const shows = [];
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
            shows.push({
              title: r.name,
              slug: r.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
              year: parseInt((r.first_air_date || '2024').substring(0, 4)),
              tmdbId: r.id,
              vote: r.vote_average,
              count: r.vote_count
            });
          } else {
            console.log('NOT FOUND: ' + q);
          }
        } catch(e) {}
        completed++;
        if (completed === titles.length) {
          shows.sort((a, b) => b.vote - a.vote);
          console.log('\n=== FOUND: ' + shows.length + ' ===\n');
          shows.forEach((s, i) => {
            console.log(s.tmdbId + ' | ' + s.title + ' | ' + s.year + ' | ' + s.vote);
          });
        }
      });
    });
  }, i * 500);
});