/**
 * update-fallback.js
 * Replaces the FALLBACK_SHOWS array in index.html with the content from FALLBACK_OUTPUT.txt
 * Run: node scripts/update-fallback.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const htmlPath = path.join(ROOT, 'index.html');
const fallbackPath = path.join(ROOT, 'scripts/FALLBACK_OUTPUT.txt');

let html = fs.readFileSync(htmlPath, 'utf8');
const fallback = fs.readFileSync(fallbackPath, 'utf8');

// Find the FALLBACK_SHOWS block
const startMarker = 'const FALLBACK_SHOWS = [';
const startIdx = html.indexOf(startMarker);
if (startIdx === -1) {
    console.error('Could not find FALLBACK_SHOWS start marker');
    process.exit(1);
}

// Find the closing ]; after the start
const endMarker = '];';
const searchFrom = startIdx + startMarker.length;
const endIdx = html.indexOf(endMarker, searchFrom);
if (endIdx === -1) {
    console.error('Could not find FALLBACK_SHOWS end marker');
    process.exit(1);
}

const endOfBlock = endIdx + endMarker.length;
const before = html.substring(0, startIdx);
const after = html.substring(endOfBlock);

html = before + fallback.trim() + after;

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Updated FALLBACK_SHOWS in index.html');
console.log(`Replaced ${endOfBlock - startIdx} chars at position ${startIdx}`);
