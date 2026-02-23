const fs = require('fs');
const path = 'C:/Users/randl/Desktop/OpenClaw-Workspace/10-Projects/tvshowsranked/data/shows/index.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

let fixed = 0;
data.shows.forEach(show => {
    if (typeof show.final === 'string') {
        show.final = parseFloat(show.final);
        fixed++;
    }
});

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log(`Fixed ${fixed} string finals. Total shows: ${data.shows.length}`);
