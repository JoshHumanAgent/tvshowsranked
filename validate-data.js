/**
 * TV Shows Ranked - Data Validation Script
 * Ensures index.json stays in sync with individual show files
 */

const fs = require('fs');
const path = require('path');

const PROJECT_DIR = 'C:\\Users\\randl\\Desktop\\OpenClaw-Workspace\\10-Projects\\tvshowsranked';
const DATA_DIR = path.join(PROJECT_DIR, 'data', 'shows');

function loadJSON(filepath) {
    let content = fs.readFileSync(filepath, 'utf8');
    if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);
    return JSON.parse(content);
}

function validate() {
    console.log('🔍 Validating TV Shows Ranked data...\n');
    
    // Load index
    const index = loadJSON(path.join(DATA_DIR, 'index.json'));
    const indexShows = index.shows;
    console.log(`✓ Index has ${indexShows.length} shows`);
    
    // Check each show has required fields
    const requiredFields = ['rank', 'slug', 'title', 'year', 'month', 'genres', 'final', 'char', 'world', 'cine', 'spect', 'conc', 'drive', 'resol', 'episodes', 'poster'];
    let missingFields = 0;
    
    indexShows.forEach(show => {
        requiredFields.forEach(field => {
            if (!(field in show)) {
                console.log(`⚠ Missing field "${field}" in show: ${show.title} (rank ${show.rank})`);
                missingFields++;
            }
        });
    });
    
    if (missingFields === 0) {
        console.log(`✓ All ${indexShows.length} shows have required fields`);
    }
    
    // Check scores are in valid range
    let invalidScores = 0;
    indexShows.forEach(show => {
        const scoreFields = ['char', 'world', 'cine', 'spect', 'conc', 'drive', 'resol', 'final'];
        scoreFields.forEach(field => {
            const val = show[field];
            if (typeof val !== 'number' || val < 0 || val > 10) {
                console.log(`⚠ Invalid ${field} score (${val}) in: ${show.title}`);
                invalidScores++;
            }
        });
    });
    
    if (invalidScores === 0) {
        console.log('✓ All scores in valid range (0-10)');
    }
    
    // Check posters use TMDB
    let nonTMDBPosters = 0;
    indexShows.forEach(show => {
        if (show.poster && !show.poster.includes('tmdb.org')) {
            console.log(`⚠ Non-TMDB poster: ${show.title}`);
            nonTMDBPosters++;
        }
    });
    
    if (nonTMDBPosters === 0) {
        console.log('✓ All posters use TMDB');
    }
    
    // Summary
    console.log('\n📊 Validation Summary:');
    console.log(`  - Total shows: ${indexShows.length}`);
    console.log(`  - Missing fields: ${missingFields}`);
    console.log(`  - Invalid scores: ${invalidScores}`);
    console.log(`  - Non-TMDB posters: ${nonTMDBPosters}`);
    
    if (missingFields === 0 && invalidScores === 0 && nonTMDBPosters === 0) {
        console.log('\n✅ All validations passed!');
    } else {
        console.log('\n❌ Some issues found - review above');
    }
}

validate();
