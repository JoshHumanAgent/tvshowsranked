/**
 * Batch Scoring Template Generator
 * 
 * Generates CSV templates for batch show scoring.
 * Useful for processing multiple shows efficiently.
 * 
 * Usage:
 *   node scripts/batch-template.js > batch-input.csv
 *   # Fill in the CSV with show data
 *   node scripts/batch-import.js batch-input.csv
 */

const fs = require('fs');
const path = require('path');

const template = `title,year,tmdb_id,episodes,genres,char,world,cine,spect,conc,drive,resol,streaming_us,streaming_uk,notes
Example Show,2020,12345,10,"drama,thriller",8.0,7.5,7.0,6.5,8.0,8.5,7.5,"Netflix,Hulu","Netflix,Prime","Brief notes about scoring rationale"
`;

console.log('═══════════════════════════════════════════');
console.log('  BATCH SCORING TEMPLATE');
console.log('═══════════════════════════════════════════\n');

console.log('CSV format:');
console.log('title,year,tmdb_id,episodes,genres,char,world,cine,spect,conc,drive,resol,streaming_us,streaming_uk,notes\n');

console.log('Fields:');
console.log('  - title: Show name');
console.log('  - year: First air year');
console.log('  - tmdb_id: TMDB show ID (get from themoviedb.org)');
console.log('  - episodes: Total episode count');
console.log('  - genres: Comma-separated list');
console.log('  - char,world,cine,spect,conc,drive,resol: 0-10 scores');
console.log('  - streaming_us: Comma-separated US platforms');
console.log('  - streaming_uk: Comma-separated UK platforms');
console.log('  - notes: Scoring justification\n');

const outputPath = path.join(__dirname, '..', 'batch-scoring-template.csv');
fs.writeFileSync(outputPath, template);
console.log(`✅ Template saved to: batch-scoring-template.csv`);

// Also create an empty queue file
const queuePath = path.join(__dirname, '..', 'data', 'discovery', 'batch-queue.json');
if (!fs.existsSync(queuePath)) {
  fs.writeFileSync(queuePath, JSON.stringify({
    description: "Batch scoring queue - shows waiting to be processed",
    shows: [],
    completed: [],
    lastUpdated: new Date().toISOString()
  }, null, 2));
  console.log(`✅ Queue file created: data/discovery/batch-queue.json`);
}
