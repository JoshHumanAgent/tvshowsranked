const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// New FALLBACK_SHOWS (top 11)
const newFallback = `const FALLBACK_SHOWS = [
            { rank: 1, title: "Game of Thrones (S1-4)", year: 2011, month: 4, episodes: 40, char: 10, world: 10, cine: 8, spect: 9.5, conc: 9, drive: 10, resol: 9, final: 9.45, genres: ["fantasy","drama","action"], poster: "https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg", backdrop: "https://image.tmdb.org/t/p/w780/zZqpAXxVSBtxV9qPBcscfXBcL2w.jpg" },
            { rank: 2, title: "The Singing Detective", year: 1986, month: 11, episodes: 6, char: 9, world: 8.5, cine: 7.5, spect: 5, conc: 9.5, drive: 8, resol: 9, final: 9.03, genres: ["drama","musical","mystery"], poster: "https://image.tmdb.org/t/p/w500/1xUAh6d239ABRU8KiTqXOijNPuJ.jpg", backdrop: "https://image.tmdb.org/t/p/w780/2slV9gF3070EIRA45SODHnIYsEe.jpg" },
            { rank: 3, title: "Smileys People", year: 1982, month: 9, episodes: 6, char: 9, world: 8.5, cine: 7, spect: 5, conc: 9, drive: 8, resol: 9, final: 8.93, genres: ["drama","spy","thriller"], poster: "https://image.tmdb.org/t/p/w500/aGNRfWcIjIlVJfHsIgSfH7ZcMSq.jpg", backdrop: "https://image.tmdb.org/t/p/w780/zkOKjygpb41yZHJUoVRPUm6yj5B.jpg" },
            { rank: 4, title: "Tinker Tailor Soldier Spy", year: 1979, month: 9, episodes: 7, char: 9, world: 8.5, cine: 7, spect: 5, conc: 9, drive: 7.5, resol: 9, final: 8.85, genres: ["drama","spy","thriller"], poster: "https://image.tmdb.org/t/p/w500/3HlMztiMrTnhU1u807MGUizEXxH.jpg", backdrop: "https://image.tmdb.org/t/p/w780/6IPIqdc7J0hXxTgWjzfgk6DRTXX.jpg" },
            { rank: 5, title: "Breaking Bad", year: 2008, month: 1, episodes: 62, char: 9, world: 7, cine: 10, spect: 6, conc: 9, drive: 10, resol: 10, final: 8.8, genres: ["crime","drama","thriller","cop-show"], poster: "https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg", backdrop: "https://image.tmdb.org/t/p/w780/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg" },
            { rank: 6, title: "Goblin", year: 2016, month: 12, episodes: 16, char: 9, world: 9, cine: 8.5, spect: 8.5, conc: 7.5, drive: 8.5, resol: 7.5, final: 8.72, genres: ["drama","fantasy","romance"], poster: "https://image.tmdb.org/t/p/w500/sPkxHNw5BFvuCFGWw825TS7n6X3.jpg", backdrop: "https://image.tmdb.org/t/p/w780/smSbK5cd8T9XHcxEUcems23BDEF.jpg" },
            { rank: 7, title: "Band of Brothers", year: 2001, month: 9, episodes: 10, char: 7.5, world: 9, cine: 8, spect: 10, conc: 8.5, drive: 9, resol: 9.5, final: 8.7, genres: ["drama","historical","war"], poster: "https://image.tmdb.org/t/p/w500/8JMXquNmdMUy2n2RgW8gfOM0O3l.jpg", backdrop: "https://image.tmdb.org/t/p/w780/2yDV0xLyqW88dn5qE7YCRnoYmfy.jpg" },
            { rank: 8, title: "I, Claudius", year: 1976, month: 9, episodes: 12, char: 9, world: 8.5, cine: 6, spect: 5, conc: 9, drive: 8.5, resol: 8, final: 8.70, genres: ["drama","historical"], poster: "https://image.tmdb.org/t/p/w500/oztxNqan7wKvFuCDS55WyUmKNMU.jpg", backdrop: "https://image.tmdb.org/t/p/w780/ep6X0ekrWS0go3UXPRXmtN6AfNs.jpg" },
            { rank: 9, title: "Brideshead Revisited", year: 1981, month: 10, episodes: 11, char: 9, world: 9, cine: 8, spect: 6, conc: 8.5, drive: 7.5, resol: 8, final: 8.70, genres: ["drama","period"], poster: "https://image.tmdb.org/t/p/w500/cW8q58wK151DdpbT0Zlt42G5JVF.jpg", backdrop: "https://image.tmdb.org/t/p/w780/ztxUkm7zbYuDuD7M4ZISn7PZ4dO.jpg" },
            { rank: 10, title: "The Jewel in the Crown", year: 1984, month: 1, episodes: 14, char: 8.5, world: 9, cine: 7.5, spect: 6, conc: 9, drive: 7.5, resol: 8, final: 8.63, genres: ["drama","historical"], poster: "https://image.tmdb.org/t/p/w500/88NRL7zQhc587n3yDEl0SW6vwE1.jpg", backdrop: "https://image.tmdb.org/t/p/w780/qNcjBQyQBHKH5OY2fBvDF1fgJMO.jpg" },
            { rank: 11, title: "True Detective", year: 2014, month: 1, episodes: 30, char: 9, world: 8.5, cine: 9, spect: 7, conc: 8.5, drive: 8, resol: 7, final: 8.55, genres: ["drama","mystery","thriller"], poster: "https://image.tmdb.org/t/p/w500/cuV2O5ZyDLHSOWzg3nLVljp1ubw.jpg", backdrop: "https://image.tmdb.org/t/p/w780/bPLRjO2pcBx0WL73WUPzuNzQ3YN.jpg" }
];`;

// Find FALLBACK_SHOWS location
const startMarker = 'const FALLBACK_SHOWS = [';
const startIdx = html.indexOf(startMarker);

// Find closing bracket
let bracketCount = 0;
let endIdx = startIdx;
let foundStart = false;

for (let i = startIdx; i < html.length; i++) {
    if (html[i] === '[') {
        bracketCount++;
        foundStart = true;
    } else if (html[i] === ']') {
        bracketCount--;
        if (bracketCount === 0 && foundStart) {
            endIdx = i;
            break;
        }
    }
}

// Replace
const newHtml = html.substring(0, startIdx) + newFallback + html.substring(endIdx + 1);

fs.writeFileSync('index.html', newHtml);
console.log('Updated FALLBACK_SHOWS');
console.log('Old size:', html.length);
console.log('New size:', newHtml.length);
