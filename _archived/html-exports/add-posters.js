const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index-dark.html');
const postersPath = path.join(__dirname, 'posters.json');

// Read files
const html = fs.readFileSync(htmlPath, 'utf8');
const posters = JSON.parse(fs.readFileSync(postersPath, 'utf8'));

// Create poster map
const posterMap = {};
posters.forEach(p => {
    if (p.poster) posterMap[p.title] = p.poster;
});

console.log('Adding', Object.keys(posterMap).length, 'posters...');

let newHtml = html;

// Add poster to each show
Object.keys(posterMap).forEach(title => {
    const poster = posterMap[title];
    // Replace { rank: X, title: "TITLE", ... genres: [...] }
    // with { rank: X, title: "TITLE", ... genres: [...], poster: "URL" }
    const regex = new RegExp(
        `(\\{ rank: \\d+, title: "${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}",[^}]+genres: \\[[^\\]]*\\])(\\s*\\})`,
        'g'
    );
    newHtml = newHtml.replace(regex, `$1, poster: "${poster}"$2`);
});

fs.writeFileSync(htmlPath, newHtml);
console.log('Done!');
