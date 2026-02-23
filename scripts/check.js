const fs = require('fs');
const data = JSON.parse(fs.readFileSync('C:/Users/randl/Desktop/OpenClaw-Workspace/10-Projects/tvshowsranked/data/shows/index.json'));
const shows = data.shows;

let noGenres = shows.filter(s => !s.genres);
let noFinal = shows.filter(s => s.final === undefined || s.final === null);
let strFinal = shows.filter(s => typeof s.final === 'string');
let noChar = shows.filter(s => s.char === undefined);
let noPoster = shows.filter(s => !s.poster);

console.log('Total shows:', shows.length);
console.log('No genres:', noGenres.length, noGenres.slice(0,5).map(s => s.title));
console.log('No final:', noFinal.length, noFinal.slice(0,5).map(s => s.title));
console.log('String final:', strFinal.length, strFinal.slice(0,5).map(s => s.title + '=' + s.final));
console.log('No char score:', noChar.length, noChar.slice(0,5).map(s => s.title));
console.log('No poster:', noPoster.length, noPoster.slice(0,5).map(s => s.title));

// Check final score range
const finals = shows.map(s => parseFloat(s.final)).filter(f => !isNaN(f)).sort((a,b) => b-a);
console.log('Final score range:', finals[0], 'to', finals[finals.length-1]);
console.log('Shows with final >= 6.5:', shows.filter(s => parseFloat(s.final) >= 6.5).length);
console.log('Shows with final < 6.5:', shows.filter(s => parseFloat(s.final) < 6.5).length);
