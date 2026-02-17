/**
 * fix-tmdbids.js
 * Fixes incorrect tmdbIds in index.json.
 * Run: node scripts/fix-tmdbids.js
 */

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'data/shows/index.json');
const data = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

const fixes = {
    'Silo': { old: 135699, new: 125988 },
    'The Bear': { old: 135699, new: 136315 },
    'Angels in America': { old: 1887, new: 11245 },
    'Gomorrah': { old: 4057, new: 61068 },
    'Twin Peaks': { old: 1964, new: 1920 },
    'Twin Peaks: The Return': { old: 70809, new: 1920 },
    'Utopia (UK)': { old: 41810, new: 46511 },
    'Adolescence': { old: 234474, new: 249042 },
    'The Day of the Jackal': { old: 241096, new: 222766 },
};

let fixed = 0;
for (const show of data.shows) {
    if (fixes[show.title]) {
        const fix = fixes[show.title];
        console.log(`${show.title}: ${show.tmdbId} -> ${fix.new}`);
        show.tmdbId = fix.new;
        // Clear the old (wrong) backdrop so fetch-backdrops.js will re-fetch
        show.backdrop = '';
        fixed++;
    }
}

fs.writeFileSync(indexPath, JSON.stringify(data, null, 4), 'utf8');
console.log(`\nFixed ${fixed} tmdbIds. Now run: node scripts/fetch-backdrops.js`);
