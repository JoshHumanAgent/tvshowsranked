const fs = require('fs');
const path = require('path');

const showsDir = path.join(__dirname, '../docs/shows');
const files = fs.readdirSync(showsDir).filter(f => f.endsWith('.html'));

console.log(`\n=== SHOW PAGE QUALITY AUDIT ===\n`);
console.log(`Total HTML files: ${files.length}\n`);

let shortPages = [];
let missingElements = [];

files.forEach(file => {
  const content = fs.readFileSync(path.join(showsDir, file), 'utf8');
  const wordCount = content.split(/\s+/).length;
  
  if (wordCount < 500) {
    shortPages.push({ file, words: wordCount });
  }
  
  // Check for key elements
  const hasPoster = content.includes('poster');
  const hasAnalysis = content.includes('Dimension Analysis') || content.includes('dimension');
  const hasWhatItFeels = content.includes('What It Feels Like');
  
  if (!hasPoster || !hasAnalysis || !hasWhatItFeels) {
    missingElements.push({
      file,
      poster: hasPoster,
      analysis: hasAnalysis,
      feels: hasWhatItFeels
    });
  }
});

console.log(`Pages with <500 words: ${shortPages.length}`);
if (shortPages.length > 0 && shortPages.length <= 10) {
  shortPages.forEach(p => console.log(`  ${p.file}: ${p.words} words`));
}

console.log(`\nPages missing elements: ${missingElements.length}`);
if (missingElements.length > 0 && missingElements.length <= 10) {
  missingElements.forEach(p => {
    const missing = [];
    if (!p.poster) missing.push('poster');
    if (!p.analysis) missing.push('analysis');
    if (!p.feels) missing.push('feels');
    console.log(`  ${p.file}: missing ${missing.join(', ')}`);
  });
}

console.log(`\n✅ Audit complete`);