const fs = require('fs');
const path = require('path');

// Read shows data
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/shows/index.json'), 'utf8'));
const shows = data.shows;

// Generate sitemap XML
let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://dynamicrankengine.com/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
`;

// Reviews live in docs/shows, not /shows. Exclude duplicate and unverified archives.
const published = shows.filter(show => !show.duplicateOf && show.verificationStatus !== 'unverified' && !show.reviewStatus && show.assessment?.review.status !== 'withheld');
published.forEach(show => {
  const reviewPath = path.join(__dirname, '../docs/shows', show.slug + '.html');
  if (!fs.existsSync(reviewPath)) throw new Error('Missing review: ' + show.slug);
  xml += `  <url>
    <loc>https://dynamicrankengine.com/docs/shows/${show.slug}.html</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`;
});

xml += '</urlset>';

// Write sitemap
fs.writeFileSync(path.join(__dirname, '../sitemap.xml'), xml);
console.log(`Generated sitemap with ${published.length + 1} existing URLs`);
