const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// Check for the DOM elements that renderShows uses
const hasRankings = html.includes('id="rankings"');
const hasNoResults = html.includes('id="no-results"');
const hasSearch = html.includes('id="search"');

console.log('=== DOM ELEMENTS ===');
console.log('id="rankings":', hasRankings);
console.log('id="no-results":', hasNoResults);
console.log('id="search":', hasSearch);

// Check body structure
const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/);
if (bodyMatch) {
    const body = bodyMatch[1];
    // Remove scripts from body
    const cleanBody = body.replace(/<script[\s\S]*?<\/script>/gi, '');
    console.log('');
    console.log('Body content length (without scripts):', cleanBody.length);
    console.log('Body starts with:', cleanBody.trim().substring(0, 200));
}
