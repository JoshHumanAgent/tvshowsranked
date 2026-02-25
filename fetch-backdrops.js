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
  const indexData = JSON.parse(fs.readFileSync('data/shows/index.json', 'utf8'));
  const rankedData = JSON.parse(fs.readFileSync('data/core/ranked.json', 'utf8'));
  
  // Find shows with real poster but missing/placeholder backdrop
  const needsBackdrop = indexData.shows.filter(s => 
    s.poster && !s.poster.includes('placeholder') && 
    (!s.backdrop || s.backdrop.includes('placeholder'))
  );
  
  console.log('Fetching backdrops for', needsBackdrop.length, 'shows...');
  
  let updated = 0;
  
  for (const show of needsBackdrop) {
    const result = await fetchTMDB(show.title, show.year);
    if (result && result.backdrop) {
      console.log('✓', show.title);
      
      // Update index.json
      const idx = indexData.shows.findIndex(s => s.slug === show.slug);
      if (idx >= 0) {
        indexData.shows[idx].backdrop = result.backdrop;
      }
      
      // Update ranked.json
      const idx2 = rankedData.shows.findIndex(s => s.slug === show.slug);
      if (idx2 >= 0) {
        rankedData.shows[idx2].backdrop = result.backdrop;
      }
      
      updated++;
    } else {
      console.log('✗', show.title);
    }
    await new Promise(r => setTimeout(r, 200));
  }
  
  // Save
  fs.writeFileSync('data/shows/index.json', JSON.stringify(indexData, null, 2));
  fs.writeFileSync('data/core/ranked.json', JSON.stringify(rankedData, null, 2));
  
  console.log('\nUpdated', updated, 'backdrops');
}

main().catch(console.error);