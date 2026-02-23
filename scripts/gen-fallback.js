const fs = require('fs');
function readJSON(p) {
    let c = fs.readFileSync(p, 'utf8');
    if(c.charCodeAt(0)===0xFEFF) c=c.substring(1);
    return JSON.parse(c);
}

const top100 = readJSON('data/core/01-current-index.json');

// Generate FALLBACK_SHOWS array for top 20
const fallback = top100.shows.slice(0, 20).map(s => {
    return `            { rank: ${s.rank}, title: "${s.title}", year: ${s.year}, month: ${s.month || 1}, episodes: ${s.episodes}, char: ${s.char}, world: ${s.world}, cine: ${s.cine}, spect: ${s.spect}, conc: ${s.conc}, drive: ${s.drive}, resol: ${s.resol}, final: ${s.final}, genres: ${JSON.stringify(s.genres)}, poster: "${s.poster}", backdrop: "${s.backdrop}" }`;
}).join(',\n');

console.log('const FALLBACK_SHOWS = [');
console.log(fallback);
console.log('];');
