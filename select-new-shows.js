const fs = require('fs');
const path = require('path');

const PROJECT_DIR = 'C:\\Users\\randl\\Desktop\\OpenClaw-Workspace\\10-Projects\\tvshowsranked';

// Load candidates
let content = fs.readFileSync(path.join(PROJECT_DIR, 'data', 'show_candidates', 'candidates_500.json'), 'utf8');
if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
const data = JSON.parse(content);

// Filter high confidence candidates
const highConfidence = data.candidates.filter(c => c.confidence === 'high');

// Top 20 picks (diverse genres, widely acclaimed)
const picks = [
    { title: "The Simpsons", year: 1989, genres: ["animation", "comedy"], rank: 110 },
    { title: "Seinfeld", year: 1989, genres: ["comedy"], rank: 111 },
    { title: "Friends", year: 1994, genres: ["comedy"], rank: 112 },
    { title: "The Office (US)", year: 2005, genres: ["comedy"], rank: 113 },
    { title: "Parks and Recreation", year: 2009, genres: ["comedy"], rank: 114 },
    { title: "Fargo", year: 2014, genres: ["crime", "drama"], rank: 115 },
    { title: "The Wire", year: 2002, genres: ["crime", "drama"], rank: 116 },
    { title: "The Sopranos", year: 1999, genres: ["crime", "drama"], rank: 117 },
    { title: "The Crown", year: 2016, genres: ["drama", "historical"], rank: 118 },
    { title: "The Leftovers", year: 2014, genres: ["drama", "fantasy"], rank: 119 },
    { title: "Six Feet Under", year: 2001, genres: ["drama"], rank: 120 },
    { title: "The Expanse", year: 2015, genres: ["sci-fi", "drama"], rank: 121 },
    { title: "Battlestar Galactica", year: 2004, genres: ["sci-fi", "drama"], rank: 122 },
    { title: "Mindhunter", year: 2017, genres: ["crime", "thriller"], rank: 123 },
    { title: "Ozark", year: 2017, genres: ["crime", "drama"], rank: 124 },
    { title: "True Detective", year: 2014, genres: ["crime", "mystery"], rank: 125 },
    { title: "The Haunting of Hill House", year: 2018, genres: ["horror", "drama"], rank: 126 },
    { title: "Severance", year: 2022, genres: ["sci-fi", "thriller"], rank: 127 },
    { title: "Andor", year: 2022, genres: ["sci-fi", "drama"], rank: 128 },
    { title: "House of the Dragon", year: 2022, genres: ["fantasy", "drama"], rank: 129 }
];

console.log('Selected 20 shows to add:');
picks.forEach(p => console.log(`  ${p.rank}. ${p.title} (${p.year})`));

// Save picks to file
fs.writeFileSync(
    path.join(PROJECT_DIR, 'new_shows_to_add.json'),
    JSON.stringify(picks, null, 2)
);

console.log('\nSaved to: new_shows_to_add.json');
