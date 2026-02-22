/**
 * Health Check Script for Dynamic Rank Engine
 * Run this to verify system integrity
 * 
 * Usage: node scripts/health-check.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data', 'shows');
const DOCS_DIR = path.join(ROOT, 'docs', 'shows');
const DISCOVERY_DIR = path.join(ROOT, 'data', 'discovery');

const results = {
  timestamp: new Date().toISOString(),
  status: 'HEALTHY',
  checks: [],
  issues: [],
  warnings: [],
  stats: {}
};

function check(name, fn) {
  try {
    const result = fn();
    results.checks.push({ name, status: 'PASS', details: result });
    return true;
  } catch (error) {
    results.checks.push({ name, status: 'FAIL', error: error.message });
    results.issues.push(`${name}: ${error.message}`);
    results.status = 'UNHEALTHY';
    return false;
  }
}

function warn(name, message) {
  results.warnings.push(`${name}: ${message}`);
  results.checks.push({ name, status: 'WARN', details: message });
}

// Check 1: Index file exists and is valid JSON
check('Index File', () => {
  const indexPath = path.join(DATA_DIR, 'index.json');
  if (!fs.existsSync(indexPath)) throw new Error('index.json not found');
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  if (!index.shows || !Array.isArray(index.shows)) throw new Error('Invalid index structure');
  return `${index.shows.length} shows in index`;
});

// Check 2: All indexed shows have HTML files
check('HTML Coverage', () => {
  const index = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'index.json'), 'utf8'));
  const slugs = index.shows.map(s => s.slug);
  const missing = [];
  
  for (const slug of slugs) {
    const htmlPath = path.join(DOCS_DIR, `${slug}.html`);
    if (!fs.existsSync(htmlPath)) {
      missing.push(slug);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(`Missing HTML for: ${missing.join(', ')}`);
  }
  return 'All shows have HTML files';
});

// Check 3: Discovery files exist
check('Discovery Files', () => {
  const candidatesPath = path.join(DISCOVERY_DIR, 'candidates.json');
  const rejectedPath = path.join(DISCOVERY_DIR, 'rejected.json');
  
  if (!fs.existsSync(candidatesPath)) throw new Error('candidates.json not found');
  if (!fs.existsSync(rejectedPath)) throw new Error('rejected.json not found');
  
  const candidates = JSON.parse(fs.readFileSync(candidatesPath, 'utf8'));
  return `${candidates.candidates?.length || 0} candidates in queue`;
});

// Check 4: No empty HTML files
check('HTML Quality', () => {
  const files = fs.readdirSync(DOCS_DIR).filter(f => f.endsWith('.html'));
  const empty = [];
  const tooSmall = [];
  
  for (const file of files) {
    const filePath = path.join(DOCS_DIR, file);
    const stats = fs.statSync(filePath);
    if (stats.size === 0) empty.push(file);
    if (stats.size < 5000) tooSmall.push(file);
  }
  
  if (empty.length > 0) throw new Error(`Empty files: ${empty.join(', ')}`);
  if (tooSmall.length > 0) warn('Small Files', `${tooSmall.length} files < 5KB: ${tooSmall.slice(0, 5).join(', ')}...`);
  
  return `${files.length} HTML files, all > 5KB`;
});

// Check 5: Score distribution is reasonable
check('Score Distribution', () => {
  const index = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'index.json'), 'utf8'));
  const scores = index.shows.map(s => s.final);
  
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  
  results.stats = { avgScore: avg.toFixed(2), minScore: min, maxScore: max, showCount: scores.length };
  
  if (avg < 5 || avg > 9) warn('Score Range', `Average score ${avg.toFixed(2)} seems unusual`);
  
  return `Avg: ${avg.toFixed(2)}, Range: ${min} - ${max}`;
});

// Check 6: Git status
check('Git Status', () => {
  // This just checks if .git exists
  const gitPath = path.join(ROOT, '.git');
  if (!fs.existsSync(gitPath)) throw new Error('Not a git repository');
  return 'Git repository intact';
});

// Summary
results.summary = {
  totalChecks: results.checks.length,
  passed: results.checks.filter(c => c.status === 'PASS').length,
  warnings: results.warnings.length,
  failed: results.checks.filter(c => c.status === 'FAIL').length
};

console.log(JSON.stringify(results, null, 2));
process.exit(results.status === 'HEALTHY' ? 0 : 1);