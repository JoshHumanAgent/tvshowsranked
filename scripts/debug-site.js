const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// Check body structure
const bodyStart = html.indexOf('<body');
const bodyEnd = html.indexOf('</body>');
const body = html.substring(bodyStart, bodyEnd);

// Find the rankings element
const rankingsIdx = body.indexOf('id="rankings"');
console.log('rankings element position in body:', rankingsIdx);

// Check what's between body and rankings
const beforeRankings = body.substring(0, rankingsIdx);
console.log('');
console.log('Content before rankings element:');
console.log('- Length:', beforeRankings.length, 'chars');
console.log('- Has header:', beforeRankings.includes('<header'));

// Check rankings element content
const rankingsContent = body.substring(rankingsIdx, rankingsIdx + 500);
console.log('');
console.log('rankings element starts with:');
console.log(rankingsContent.substring(0, 300));

// Check if renderShows is called
const scriptSection = html.substring(html.indexOf('<script>'), html.indexOf('</script>'));
const hasRenderCall = scriptSection.includes('renderShows()');
console.log('');
console.log('renderShows() called in script:', hasRenderCall);

// Check for syntax errors in key functions
console.log('');
console.log('=== KEY FUNCTION CHECK ===');
const loadMatch = html.match(/async function loadShowsData[\s\S]{0,800}/);
if (loadMatch) {
    console.log('loadShowsData found, first 400 chars:');
    console.log(loadMatch[0].substring(0, 400));
}
