#!/usr/bin/env node
/**
 * Import Master Export to ranked.json
 * 
 * Usage: node scripts/import-master.js path/to/ranked-master-YYYY-MM-DD.json
 * 
 * This script takes a Master Export from the site and:
 * 1. Validates it's a proper master export
 * 2. Updates data/core/ranked.json with new rankings
 * 3. Updates data/shows/index.json for the live site
 * 4. Backs up old files first
 */

const fs = require('fs');
const path = require('path');

const RANKED_PATH = 'data/core/ranked.json';
const INDEX_PATH = 'data/shows/index.json';
const BACKUP_DIR = 'data/backups';

function readJSON(p) {
    let c = fs.readFileSync(p, 'utf8');
    if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
    return JSON.parse(c);
}

function writeJSON(p, data) {
    fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
}

function backupFile(filePath) {
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupPath = path.join(BACKUP_DIR, path.basename(filePath).replace('.json', `-backup-${ts}.json`));
    fs.copyFileSync(filePath, backupPath);
    console.log(`  Backed up to: ${backupPath}`);
}

function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log('Usage: node scripts/import-master.js <master-export-file>');
        console.log('');
        console.log('Example: node scripts/import-master.js downloads/ranked-master-2026-02-24.json');
        process.exit(1);
    }

    const masterPath = args[0];
    
    if (!fs.existsSync(masterPath)) {
        console.error(`Error: File not found: ${masterPath}`);
        process.exit(1);
    }

    console.log('=== MASTER EXPORT IMPORT ===');
    console.log('');
    
    // Read master export
    console.log('Reading master export...');
    const master = readJSON(masterPath);
    
    if (!master.meta || !master.meta.adminExport) {
        console.error('Error: This is not a Master Export file.');
        console.error('Master Export files have meta.adminExport: true');
        process.exit(1);
    }

    console.log(`  Source: ${master.meta.source}`);
    console.log(`  Generated: ${master.meta.generated}`);
    console.log(`  Total shows: ${master.shows.length}`);
    console.log('');

    // Backup existing files
    console.log('Backing up existing files...');
    backupFile(RANKED_PATH);
    backupFile(INDEX_PATH);
    console.log('');

    // Read existing files
    console.log('Reading existing data...');
    const ranked = readJSON(RANKED_PATH);
    const index = readJSON(INDEX_PATH);
    console.log(`  ranked.json: ${ranked.shows.length} shows`);
    console.log(`  index.json: ${index.shows.length} shows`);
    console.log('');

    // Create lookup maps
    const masterMap = new Map(master.shows.map(s => [s.slug, s]));
    const rankedMap = new Map(ranked.shows.map(s => [s.slug, s]));

    // Check for shows to delete (all scores = 0)
    const toDelete = new Set();
    master.shows.forEach(masterShow => {
        if (masterShow.char === 0 && masterShow.world === 0 && masterShow.cine === 0 &&
            masterShow.spect === 0 && masterShow.conc === 0 && masterShow.drive === 0 && 
            masterShow.resol === 0) {
            toDelete.add(masterShow.slug);
            console.log('  FLAGGED FOR DELETION (all 0):', masterShow.title);
        }
    });
    
    if (toDelete.size > 0) {
        console.log('');
        console.log(`Found ${toDelete.size} shows marked for deletion (all scores = 0)`);
    }

    // Update ranked.json
    console.log('Updating ranked.json...');
    let updatedRanked = 0;
    let newShows = 0;
    let deletedShows = 0;
    
    // Remove flagged shows from ranked
    const beforeCount = ranked.shows.length;
    ranked.shows = ranked.shows.filter(s => !toDelete.has(s.slug));
    deletedShows = beforeCount - ranked.shows.length;
    if (deletedShows > 0) {
        console.log(`  Removed ${deletedShows} shows from ranked.json`);
    }
    
    master.shows.forEach(masterShow => {
        // Skip shows marked for deletion
        if (toDelete.has(masterShow.slug)) return;
        
        const rankedShow = rankedMap.get(masterShow.slug);
        if (rankedShow) {
            // Update existing show
            rankedShow.rank = masterShow.rank;
            rankedShow.final = masterShow.final;
            rankedShow.char = masterShow.char;
            rankedShow.world = masterShow.world;
            rankedShow.cine = masterShow.cine;
            rankedShow.spect = masterShow.spect;
            rankedShow.conc = masterShow.conc;
            rankedShow.drive = masterShow.drive;
            rankedShow.resol = masterShow.resol;
            updatedRanked++;
        } else {
            // New show
            ranked.shows.push({
                ...masterShow,
                locked: false
            });
            newShows++;
        }
    });

    // Re-sort by final score
    ranked.shows.sort((a, b) => b.final - a.final);
    ranked.shows.forEach((s, i) => s.rank = i + 1);
    
    ranked.meta.generated = new Date().toISOString();
    ranked.meta.total = ranked.shows.length;
    
    console.log(`  Updated: ${updatedRanked} shows`);
    console.log(`  New: ${newShows} shows`);
    console.log(`  Total: ${ranked.shows.length} shows`);
    console.log('');

    // Update index.json
    console.log('Updating index.json...');
    let updatedIndex = 0;
    let deletedFromIndex = 0;
    
    // Remove flagged shows from index
    const beforeIndexCount = index.shows.length;
    index.shows = index.shows.filter(s => !toDelete.has(s.slug));
    deletedFromIndex = beforeIndexCount - index.shows.length;
    if (deletedFromIndex > 0) {
        console.log(`  Removed ${deletedFromIndex} shows from index.json`);
    }
    
    master.shows.forEach(masterShow => {
        // Skip shows marked for deletion
        if (toDelete.has(masterShow.slug)) return;
        
        const indexShow = index.shows.find(s => s.slug === masterShow.slug);
        if (indexShow) {
            indexShow.rank = masterShow.rank;
            indexShow.final = masterShow.final;
            indexShow.char = masterShow.char;
            indexShow.world = masterShow.world;
            indexShow.cine = masterShow.cine;
            indexShow.spect = masterShow.spect;
            indexShow.conc = masterShow.conc;
            indexShow.drive = masterShow.drive;
            indexShow.resol = masterShow.resol;
            updatedIndex++;
        }
    });

    // Re-sort index
    index.shows.sort((a, b) => b.final - a.final);
    index.shows.forEach((s, i) => s.rank = i + 1);
    
    console.log(`  Updated: ${updatedIndex} shows`);
    console.log('');

    // Write updated files
    console.log('Writing updated files...');
    writeJSON(RANKED_PATH, ranked);
    writeJSON(INDEX_PATH, index);
    console.log(`  ${RANKED_PATH}`);
    console.log(`  ${INDEX_PATH}`);
    console.log('');

    // Summary
    console.log('=== COMPLETE ===');
    console.log(`Updated ${updatedRanked} shows in ranked.json`);
    console.log(`Added ${newShows} new shows to ranked.json`);
    console.log(`Deleted ${deletedShows} shows from ranked.json`);
    console.log(`Updated ${updatedIndex} shows in index.json`);
    console.log(`Deleted ${deletedFromIndex} shows from index.json`);
    console.log('');
    console.log('Next steps:');
    console.log('  1. Review changes in ranked.json and index.json');
    console.log('  2. git add data/core/ranked.json data/shows/index.json');
    console.log('  3. git commit -m "chore: import master export"');
    console.log('  4. git push origin master');
}

main();