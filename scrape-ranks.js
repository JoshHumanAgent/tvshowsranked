const fs = require('fs');
const path = require('path');

const showsDir = 'C:\\Users\\randl\\Desktop\\OpenClaw-Workspace\\10-Projects\\tvshowsranked\\docs\\shows';
const outputFile = 'C:\\Users\\randl\\Desktop\\OpenClaw-Workspace\\10-Projects\\tvshowsranked\\docs\\top100currentdefault.md';

const files = fs.readdirSync(showsDir).filter(f => f.endsWith('.md')).map(f => path.join(showsDir, f));

const shows = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  
  const titleMatch = content.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].trim() : path.basename(file, '.md');
  
  const rankMatch = content.match(/\*\*Rank\*\*\s*\|\s*#?(\d+)/i);
  const rank = rankMatch ? parseInt(rankMatch[1]) : null;
  
  const scoreMatch = content.match(/\*\*Score\*\*\s*\|\s*([\d.]+)/i);
  const score = scoreMatch ? parseFloat(scoreMatch[1]) : null;
  
  const yearMatch = content.match(/\*\*Year\*\*\s*\|\s*(\d{4})/i);
  const year = yearMatch ? parseInt(yearMatch[1]) : null;
  
  const episodesMatch = content.match(/\*\*Episodes\*\*\s*\|\s*(\d+)/i);
  const episodes = episodesMatch ? parseInt(episodesMatch[1]) : null;
  
  const genresMatch = content.match(/\*\*Genres\*\*\s*\|\s*(.+)/i);
  const genres = genresMatch ? genresMatch[1].trim() : '';
  
  const tmdbMatch = content.match(/\*\*TMDB ID\*\*\s*\|\s*(\d+)/i);
  const tmdbId = tmdbMatch ? parseInt(tmdbMatch[1]) : null;
  
  const dimensions = {};
  
  for (const line of lines) {
    const charMatch = line.match(/\|\s*Characters\s*&\s*Acting\s*\|\s*([\d.]+)/);
    if (charMatch) dimensions.char = parseFloat(charMatch[1]);
    
    const worldMatch = line.match(/\|\s*World\s*Building\s*\|\s*([\d.]+)/);
    if (worldMatch) dimensions.world = parseFloat(worldMatch[1]);
    
    const cineMatch = line.match(/\|\s*Cinematography\s*\|\s*([\d.]+)/);
    if (cineMatch) dimensions.cine = parseFloat(cineMatch[1]);
    
    const spectMatch = line.match(/\|\s*Visual\s*Spectacle\s*\|\s*([\d.]+)/);
    if (spectMatch) dimensions.spect = parseFloat(spectMatch[1]);
    
    const concMatch = line.match(/\|\s*Conceptual\s*Density\s*\|\s*([\d.]+)/);
    if (concMatch) dimensions.conc = parseFloat(concMatch[1]);
    
    const driveMatch = line.match(/\|\s*Narrative\s*Drive\s*\|\s*([\d.]+)/);
    if (driveMatch) dimensions.drive = parseFloat(driveMatch[1]);
    
    const resolMatch = line.match(/\|\s*Narrative\s*Resolution\s*\|\s*([\d.]+)/);
    if (resolMatch) dimensions.resol = parseFloat(resolMatch[1]);
  }
  
  shows.push({
    title, rank, score, year, episodes, genres, tmdbId,
    char: dimensions.char ?? null,
    world: dimensions.world ?? null,
    cine: dimensions.cine ?? null,
    spect: dimensions.spect ?? null,
    conc: dimensions.conc ?? null,
    drive: dimensions.drive ?? null,
    resol: dimensions.resol ?? null,
  });
}

shows.sort((a, b) => (a.rank || 999) - (b.rank || 999));

let output = '# Top 100 Current Default Rankings\n\n';
output += '*Generated: ' + new Date().toISOString().split('T')[0] + '*\n\n';
output += '| Rank | Title | Score | Year | Episodes | Genres | Char | World | Cine | Spect | Conc | Drive | Resol | TMDB |\n';
output += '|------|-------|-------|------|----------|--------|------|-------|------|-------|------|-------|-------|------|\n';

for (const show of shows) {
  if (show.rank) {
    const vals = [
      show.rank,
      show.title,
      show.score != null ? show.score.toFixed(2) : 'N/A',
      show.year != null ? show.year : 'N/A',
      show.episodes != null ? show.episodes : 'N/A',
      show.genres,
      show.char != null ? show.char : 'N/A',
      show.world != null ? show.world : 'N/A',
      show.cine != null ? show.cine : 'N/A',
      show.spect != null ? show.spect : 'N/A',
      show.conc != null ? show.conc : 'N/A',
      show.drive != null ? show.drive : 'N/A',
      show.resol != null ? show.resol : 'N/A',
      show.tmdbId != null ? show.tmdbId : 'N/A'
    ];
    output += '| ' + vals.join(' | ') + ' |\n';
  }
}

output += '\n---\n\n';
output += '# Detailed Breakdown\n\n';

for (const show of shows) {
  if (show.rank) {
    output += '## #' + show.rank + ' - ' + show.title + '\n\n';
    output += '- **Score:** ' + (show.score != null ? show.score.toFixed(2) : 'N/A') + '\n';
    output += '- **Year:** ' + (show.year != null ? show.year : 'N/A') + '\n';
    output += '- **Episodes:** ' + (show.episodes != null ? show.episodes : 'N/A') + '\n';
    output += '- **Genres:** ' + show.genres + '\n';
    output += '- **TMDB ID:** ' + (show.tmdbId != null ? show.tmdbId : 'N/A') + '\n\n';
    output += '### Dimension Scores\n\n';
    output += '| Dimension | Score |\n';
    output += '|-----------|-------|\n';
    output += '| Characters & Acting | ' + (show.char != null ? show.char : 'N/A') + ' |\n';
    output += '| World Building | ' + (show.world != null ? show.world : 'N/A') + ' |\n';
    output += '| Cinematography | ' + (show.cine != null ? show.cine : 'N/A') + ' |\n';
    output += '| Visual Spectacle | ' + (show.spect != null ? show.spect : 'N/A') + ' |\n';
    output += '| Conceptual Density | ' + (show.conc != null ? show.conc : 'N/A') + ' |\n';
    output += '| Narrative Drive | ' + (show.drive != null ? show.drive : 'N/A') + ' |\n';
    output += '| Narrative Resolution | ' + (show.resol != null ? show.resol : 'N/A') + ' |\n';
    output += '\n---\n\n';
  }
}

fs.writeFileSync(outputFile, output, 'utf8');
console.log('Scraped ' + shows.filter(s => s.rank).length + ' ranked shows.');
console.log('Output written to: ' + outputFile);
