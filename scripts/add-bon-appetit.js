const fs = require('fs');
const path = require('path');

const rankedPath = path.join(__dirname, '../data/core/ranked.json');
const raw = fs.readFileSync(rankedPath, 'utf8').replace(/^\uFEFF/, '');
const data = JSON.parse(raw);

const newShow = {
  rank: 0, // will be calculated
  slug: "bon-appetit-your-majesty",
  title: "Bon Appétit, Your Majesty",
  year: 2025,
  month: 8,
  genres: ["drama", "romance", "fantasy"],
  final: 6.5,
  tmdbId: 280945,
  char: 7,
  world: 6,
  cine: 7,
  spect: 5,
  conc: 6,
  drive: 7.5,
  resol: 7,
  episodes: 12,
  poster: "https://image.tmdb.org/t/p/w500/bzYSIw9FTzQXUcWsnDSwlcwok3C.jpg",
  streaming: {},
  backdrop: "https://image.tmdb.org/t/p/w780/ttbmzTZHTzqDK4JniKonMrsQath.jpg",
  notes: "K-drama time-travel chef romance. New show, low votes (194), harsh cap applied."
};

// Check for duplicate
const existing = data.shows.find(s => s.tmdbId === newShow.tmdbId || s.slug === newShow.slug);
if (existing) {
  console.log('DUPLICATE FOUND:', existing.title);
  process.exit(1);
}

// Add and sort
data.shows.push(newShow);
data.shows.sort((a, b) => b.final - a.final);

// Re-rank
data.shows.forEach((s, i) => s.rank = i + 1);
data.meta.total = data.shows.length;
data.meta.generated = new Date().toISOString();

// Save
fs.writeFileSync(rankedPath, JSON.stringify(data, null, 2));
console.log('Added:', newShow.title, '- Rank #', data.shows.find(s => s.slug === newShow.slug).rank);