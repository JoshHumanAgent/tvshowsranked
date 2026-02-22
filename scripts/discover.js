/**
 * Automated Discovery System for Dynamic Rank Engine
 * 
 * Finds new TV dramas from TMDB and adds them to the discovery queue.
 * Run via cron: node scripts/discover.js
 * 
 * Usage:
 *   node scripts/discover.js --check-new    # Check for new releases
 *   node scripts/discover.js --popular      # Find popular dramas
 *   node scripts/discover.js --upcoming     # Check upcoming releases
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data', 'shows');
const DISCOVERY_DIR = path.join(ROOT, 'data', 'discovery');
const TMDB_API_KEY = 'ca9b21cb89de2d1debed1050f603d7ad';
const BASE_URL = 'api.themoviedb.org';

// Rate limiting: 200ms between requests
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to read JSON with BOM handling
function readJson(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(content.replace(/^\uFEFF/, ''));
}

// Helper to write JSON
function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Make TMDB API request
function tmdbRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      path: `/3${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${TMDB_API_KEY}`,
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error(`JSON parse error: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Get existing show slugs and TMDB IDs
function getExistingShows() {
  try {
    const index = readJson(path.join(DATA_DIR, 'index.json'));
    const slugs = new Set(index.shows.map(s => s.slug));
    const tmdbIds = new Set(index.shows.map(s => s.tmdbId).filter(Boolean));
    return { slugs, tmdbIds };
  } catch (e) {
    console.error('Error reading index:', e.message);
    return { slugs: new Set(), tmdbIds: new Set() };
  }
}

// Get existing candidates
function getExistingCandidates() {
  try {
    const candidates = readJson(path.join(DISCOVERY_DIR, 'candidates.json'));
    const titles = new Set(candidates.candidates.map(c => c.title.toLowerCase()));
    return titles;
  } catch (e) {
    return new Set();
  }
}

// Check if show qualifies for the pool
function qualifies(show) {
  // Must be drama or drama-adjacent
  const dramaGenres = [18, 80, 9648, 10768, 10751]; // Drama, Crime, Mystery, War, Family
  const hasDrama = show.genre_ids?.some(g => dramaGenres.includes(g));
  
  // Must have reasonable episode count (not a movie)
  const hasEpisodes = show.episode_count > 1 || show.number_of_episodes > 1;
  
  // Must have reasonable rating
  const hasRating = show.vote_average >= 6.0;
  
  // Not anime (separate category)
  const isAnime = show.genre_ids?.includes(16) && show.origin_country?.includes('JP');
  
  // Not reality TV
  const isReality = show.genre_ids?.includes(10764);
  
  return hasDrama && hasEpisodes && hasRating && !isAnime && !isReality;
}

// Create candidate object from TMDB data
function createCandidate(show) {
  const year = show.first_air_date ? parseInt(show.first_air_date.split('-')[0]) : null;
  
  return {
    title: show.name,
    year: year,
    status: 'pending',
    priority: show.vote_average >= 8.0 ? 'high' : show.vote_average >= 7.0 ? 'medium' : 'low',
    reason: `Discovered via TMDB. Rating: ${show.vote_average}/10. ${show.overview?.substring(0, 100)}...`,
    discoveredAt: new Date().toISOString().split('T')[0],
    tmdbId: show.id,
    notes: `Genres: ${show.genre_ids?.join(', ')}, Episodes: ${show.episode_count || show.number_of_episodes}, Country: ${show.origin_country?.join(', ')}`
  };
}

// Discover popular dramas
async function discoverPopular() {
  console.log('🔍 Discovering popular dramas...');
  
  const { slugs, tmdbIds } = getExistingShows();
  const existingCandidates = getExistingCandidates();
  const newCandidates = [];
  
  // Query TMDB discover endpoint
  const data = await tmdbRequest('/discover/tv?with_genres=18&sort_by=vote_average.desc&vote_count.gte=100&page=1');
  
  if (data.results) {
    for (const show of data.results) {
      // Check if already in index or candidates
      if (tmdbIds.has(show.id)) continue;
      if (existingCandidates.has(show.name.toLowerCase())) continue;
      
      // Check if qualifies
      if (qualifies(show)) {
        const candidate = createCandidate(show);
        newCandidates.push(candidate);
        console.log(`  ✨ Found: ${show.name} (${show.vote_average}/10)`);
      }
      
      await delay(200); // Rate limit
    }
  }
  
  return newCandidates;
}

// Check for new releases
async function checkNewReleases() {
  console.log('📅 Checking new releases...');
  
  const { slugs, tmdbIds } = getExistingShows();
  const existingCandidates = getExistingCandidates();
  const newCandidates = [];
  
  // Get shows from last 90 days
  const today = new Date();
  const ninetyDaysAgo = new Date(today - 90 * 24 * 60 * 60 * 1000);
  const dateStr = ninetyDaysAgo.toISOString().split('T')[0];
  
  const data = await tmdbRequest(`/discover/tv?with_genres=18&first_air_date.gte=${dateStr}&sort_by=popularity.desc`);
  
  if (data.results) {
    for (const show of data.results) {
      if (tmdbIds.has(show.id)) continue;
      if (existingCandidates.has(show.name.toLowerCase())) continue;
      
      if (qualifies(show)) {
        const candidate = createCandidate(show);
        candidate.priority = 'high'; // New releases get priority
        candidate.reason += ' [NEW RELEASE]';
        newCandidates.push(candidate);
        console.log(`  🆕 New: ${show.name} (${show.first_air_date})`);
      }
      
      await delay(200);
    }
  }
  
  return newCandidates;
}

// Save candidates to file
function saveCandidates(newCandidates) {
  if (newCandidates.length === 0) {
    console.log('No new candidates found.');
    return;
  }
  
  const candidatesPath = path.join(DISCOVERY_DIR, 'candidates.json');
  const candidates = readJson(candidatesPath);
  
  candidates.candidates.push(...newCandidates);
  candidates.discoveryLog.push({
    date: new Date().toISOString(),
    action: `Auto-discovered ${newCandidates.length} new shows`,
    shows: newCandidates.map(c => c.title)
  });
  
  writeJson(candidatesPath, candidates);
  console.log(`\n✅ Added ${newCandidates.length} candidates to queue`);
  console.log(`📊 Total candidates: ${candidates.candidates.length}`);
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || '--popular';
  
  console.log('═══════════════════════════════════════');
  console.log('  DYNAMIC RANK ENGINE - DISCOVERY');
  console.log('  ' + new Date().toISOString());
  console.log('═══════════════════════════════════════\n');
  
  let newCandidates = [];
  
  try {
    if (mode === '--popular') {
      newCandidates = await discoverPopular();
    } else if (mode === '--check-new') {
      newCandidates = await checkNewReleases();
    } else if (mode === '--all') {
      const popular = await discoverPopular();
      await delay(1000);
      const releases = await checkNewReleases();
      newCandidates = [...popular, ...releases];
    } else {
      console.log('Usage: node discover.js [--popular|--check-new|--all]');
      process.exit(1);
    }
    
    saveCandidates(newCandidates);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
