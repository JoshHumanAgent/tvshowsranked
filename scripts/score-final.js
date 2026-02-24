const fs = require('fs');

let c = fs.readFileSync('data/core/ranked.json', 'utf8');
if (c.charCodeAt(0) === 0xFEFF) c = c.substring(1);
const ranked = JSON.parse(c);

const newShows = [
  {
    title: 'Prime Suspect (US)',
    slug: 'prime-suspect-us',
    year: 2011,
    tmdbId: 39684,
    episodes: 13,
    genres: ['crime', 'drama'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/gT6CX14E83hd4JSR00iQOHukc0j.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // Maria Bello. US remake. One season. Cancelled.
    char: 6.5,   // Bello good, not Mirren
    world: 6,    // NYPD
    cine: 6.5,   // Network TV
    spect: 3,    // No spectacle
    conc: 6.5,   // Gender, policing
    drive: 7,    // Procedural
    resol: 5     // Canceled
  },
  {
    title: 'Blue Bloods',
    slug: 'blue-bloods',
    year: 2010,
    tmdbId: 32692,
    episodes: 293,
    genres: ['crime', 'drama'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/q1WlrxnCvNhBjJ4N7V0JQXjnIBN.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // Tom Selleck. Reagan family NYPD. 14 seasons.
    char: 7,     // Selleck anchors
    world: 6.5,  // NYPD family
    cine: 6,     // Network procedural
    spect: 3,    // No spectacle
    conc: 6.5,   // Family, duty, justice
    drive: 6.5,  // Procedural + family
    resol: 7     // Complete after 14 seasons
  },
  {
    title: 'NCIS: Los Angeles',
    slug: 'ncis-los-angeles',
    year: 2009,
    tmdbId: 17610,
    episodes: 323,
    genres: ['action', 'crime', 'drama'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/TIIgcznwNfNr3KOZvxn26eKV99.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // LL Cool J, Chris O'Donnell. 14 seasons. Military procedural.
    char: 6.5,   // Ensemble procedural
    world: 6,    // NCIS LA
    cine: 6,     // Network TV
    spect: 5,    // Action sequences
    conc: 6,     // Military crime
    drive: 6.5,  // Procedural
    resol: 7     // Complete
  },
  {
    title: 'CSI: NY',
    slug: 'csi-ny',
    year: 2004,
    tmdbId: 2458,
    episodes: 197,
    genres: ['crime', 'drama', 'mystery'],
    status: 'Canceled',
    poster: 'https://image.tmdb.org/t/p/w500/4TGV4Bb3OPay4cHkQRlfwghv3vC.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // Gary Sinise. NY spinoff. 9 seasons.
    char: 6.5,   // Sinise solid
    world: 6,    // NY forensics
    cine: 6,     // Procedural gloss
    spect: 4,    // Forensic spectacle
    conc: 6,     // Crime solving
    drive: 6.5,  // Procedural
    resol: 6.5   // Canceled but ran long
  },
  {
    title: 'CSI: Miami',
    slug: 'csi-miami',
    year: 2002,
    tmdbId: 1620,
    episodes: 232,
    genres: ['crime', 'drama', 'mystery'],
    status: 'Ended',
    poster: 'https://image.tmdb.org/t/p/w500/pNW64pjaHvf6purNaFhq4SHYRfl.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w780/placeholder.jpg',
    // David Caruso. Miami spinoff. 10 seasons. Iconic sunglasses.
    char: 6,     // Caruso meme-worthy
    world: 6,    // Miami forensics
    cine: 6.5,   // Sunny procedural style
    spect: 4,    // Forensic spectacle
    conc: 5.5,   // Crime solving
    drive: 6.5,  // Procedural
    resol: 6.5   // Complete but campy
  }
];

function calcFinal(show) {
  const base = (show.char * 0.20) + (show.world * 0.15) + (show.cine * 0.15) +
               (show.spect * 0.10) + (show.conc * 0.15) + (show.drive * 0.15) +
               (show.resol * 0.10);
  const eps = show.episodes || 40;
  let mult = 1.0;
  if (eps <= 10) mult = 0.96;
  else if (eps <= 20) mult = 0.95;
  else if (eps <= 30) mult = 0.97;
  else if (eps <= 40) mult = 1.00;
  else mult = 1.02;
  return Math.round(base * mult * 100) / 100;
}

console.log('=== FINAL BATCH SCORED ===\n');
newShows.forEach(s => {
  s.final = calcFinal(s);
  s.locked = false;
  console.log(s.title + ': ' + s.final + ' (' + s.status + ', ' + s.episodes + ' eps)');
});

newShows.forEach(ns => {
  const exists = ranked.shows.find(s => s.slug === ns.slug);
  if (!exists) ranked.shows.push(ns);
});

ranked.shows.sort((a, b) => {
  if (b.final !== a.final) return b.final - a.final;
  return a.title.localeCompare(b.title);
});
ranked.shows.forEach((s, i) => s.rank = i + 1);
ranked.meta.total = ranked.shows.length;
ranked.meta.generated = new Date().toISOString();

fs.writeFileSync('data/core/ranked.json', '\ufeff' + JSON.stringify(ranked, null, 2));

console.log('\n=== ADDED ===');
newShows.forEach(ns => {
  const s = ranked.shows.find(x => x.slug === ns.slug);
  if (s) console.log(s.title + ' -> Rank #' + s.rank);
});
console.log('Total: ' + ranked.shows.length);