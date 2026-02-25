const https = require('https');
const fs = require('fs');

const TMDB_API_KEY = 'ca9b21cb89de2d1debed1050f603d7ad';

function fetchTMDB(title, year) {
  return new Promise((resolve, reject) => {
    const searchQuery = encodeURIComponent(title);
    const url = `https://api.themoviedb.org/3/search/tv?api_key=${TMDB_API_KEY}&query=${searchQuery}&first_air_date_year=${year}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.results && json.results.length > 0) {
            const result = json.results[0];
            resolve({
              poster: result.poster_path ? `https://image.tmdb.org/t/p/w500${result.poster_path}` : null,
              backdrop: result.backdrop_path ? `https://image.tmdb.org/t/p/w780${result.backdrop_path}` : null,
              tmdbId: result.id
            });
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function main() {
  const data = JSON.parse(fs.readFileSync('data/shows/index.json', 'utf8'));
  const ranked = JSON.parse(fs.readFileSync('data/core/ranked.json', 'utf8'));
  const shows = data.shows;
  const placeholderShows = shows.filter(s => s.poster && s.poster.includes('placeholder'));
  
  console.log('Fetching posters for', placeholderShows.length, 'shows...');
  
  let updated = 0;
  const updates = [];
  
  for (const show of placeholderShows) {
    const result = await fetchTMDB(show.title, show.year);
    if (result && result.poster) {
      console.log('✓', show.title);
      updates.push({
        slug: show.slug,
        poster: result.poster,
        backdrop: result.backdrop,
        tmdbId: result.tmdbId
      });
      updated++;
    } else {
      console.log('✗', show.title);
    }
    await new Promise(r => setTimeout(r, 200)); // Rate limit
  }
  
  // Apply updates
  updates.forEach(u => {
    const idx = data.shows.findIndex(s => s.slug === u.slug);
    if (idx >= 0) {
      data.shows[idx].poster = u.poster;
      if (u.backdrop) data.shows[idx].backdrop = u.backdrop;
      if (!data.shows[idx].tmdbId) data.shows[idx].tmdbId = u.tmdbId;
    }
    const idx2 = ranked.shows.findIndex(s => s.slug === u.slug);
    if (idx2 >= 0) {
      ranked.shows[idx2].poster = u.poster;
      if (u.backdrop) ranked.shows[idx2].backdrop = u.backdrop;
      if (!ranked.shows[idx2].tmdbId) ranked.shows[idx2].tmdbId = u.tmdbId;
    }
  });
  
  // Save
  fs.writeFileSync('data/shows/index.json', JSON.stringify(data, null, 2));
  fs.writeFileSync('data/core/ranked.json', JSON.stringify(ranked, null, 2));
  
  console.log('\nUpdated', updated, 'shows with real posters');
}

main().catch(console.error);