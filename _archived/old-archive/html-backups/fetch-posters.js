const https = require('https');
const fs = require('fs');
const path = require('path');

const apiKey = 'ca9b21cb89de2d1debed1050f603d7ad';
const base = 'https://image.tmdb.org/t/p/w500';

const htmlPath = path.join(__dirname, 'index-dark.html');

function fetchPoster(title, year) {
    return new Promise((resolve) => {
        const q = encodeURIComponent(title.replace(/\s*\(S\d+.*\)/, '').trim());
        const url = 'https://api.themoviedb.org/3/search/tv?api_key=' + apiKey + '&query=' + q + '&first_air_year=' + year;
        https.get(url, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.results && json.results[0] && json.results[0].poster_path) {
                        resolve(base + json.results[0].poster_path);
                    } else {
                        resolve(null);
                    }
                } catch(e) { resolve(null); }
            });
        }).on('error', () => resolve(null));
    });
}

// Read shows from file
const html = fs.readFileSync(htmlPath, 'utf8');

// Parse shows - get title and year
const showRegex = /\{\s*rank:\s*(\d+),\s*title:\s*"([^"]+)".*?year:\s*(\d+)/g;
const shows = [];
let m;
while ((m = showRegex.exec(html)) !== null) {
    shows.push({ rank: parseInt(m[1]), title: m[2], year: parseInt(m[3]) });
}

console.log('Found', shows.length, 'shows');
console.log('Fetching all posters...\n');

async function run() {
    const results = [];
    for (let i = 0; i < shows.length; i++) {
        const s = shows[i];
        const poster = await fetchPoster(s.title, s.year);
        const status = poster ? '✓' : '✗';
        console.log(status + ' ' + (i+1) + '. ' + s.title);
        results.push({ rank: s.rank, title: s.title, year: s.year, poster: poster });
        
        // Progress every 25
        if ((i+1) % 25 === 0) console.log('\n--- ' + (i+1) + '/100 done ---\n');
        
        await new Promise(r => setTimeout(r, 300));
    }
    
    // Save to JSON
    fs.writeFileSync('posters.json', JSON.stringify(results, null, 2));
    console.log('\n=== Saved to posters.json ===');
    
    // Count success
    const found = results.filter(r => r.poster).length;
    console.log('Found: ' + found + '/100 posters');
}
run();
