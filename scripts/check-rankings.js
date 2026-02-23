const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

// Find the rankings element content
const idx = html.indexOf('id="rankings"');
if (idx >= 0) {
    console.log('=== rankings element context ===');
    console.log('Position:', idx);
    console.log('');
    console.log('Surrounding HTML:');
    console.log(html.substring(idx - 50, idx + 300));
}
