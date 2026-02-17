/**
 * sync-master.js
 * Syncs index.json and generates FALLBACK_SHOWS from master list data.
 * Master list: docs/top100currentdefault.md (source of truth)
 * Run: node scripts/sync-master.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// ============================================================
// MASTER LIST DATA (from docs/top100currentdefault.md)
// These ranks, scores, episodes, genres are the SOURCE OF TRUTH.
// ============================================================
const masterShows = [
  { rank:1, title:"Game of Thrones (S1-4)", year:2011, episodes:40, char:10, world:10, cine:8, spect:9.5, conc:9, drive:10, resol:9, final:9.45, genres:["fantasy","drama","action"] },
  { rank:2, title:"Breaking Bad", year:2008, episodes:62, char:9, world:7, cine:10, spect:6, conc:9, drive:10, resol:10, final:8.80, genres:["crime","drama","thriller","cop-show"] },
  { rank:3, title:"Band of Brothers", year:2001, episodes:10, char:7.5, world:9, cine:8, spect:10, conc:8.5, drive:9, resol:9.5, final:8.70, genres:["drama","historical","war"] },
  { rank:4, title:"The Wire", year:2002, episodes:60, char:9, world:9.5, cine:6.5, spect:7.5, conc:10, drive:7.5, resol:9.5, final:8.68, genres:["crime","drama","cop-show"] },
  { rank:5, title:"Better Call Saul", year:2015, episodes:63, char:8.5, world:7, cine:9, spect:6, conc:8, drive:9, resol:10, final:8.30, genres:["crime","drama"] },
  { rank:6, title:"The Sopranos", year:1999, episodes:86, char:9.5, world:8, cine:6.5, spect:5, conc:9.5, drive:8, resol:9.5, final:8.30, genres:["crime","drama","cop-show"] },
  { rank:7, title:"Boardwalk Empire", year:2010, episodes:56, char:9, world:9, cine:8, spect:9.5, conc:8.5, drive:6.5, resol:7.5, final:8.28, genres:["crime","drama","historical"] },
  { rank:8, title:"Chernobyl", year:2019, episodes:5, char:7, world:8, cine:9, spect:8, conc:8, drive:8.5, resol:9, final:8.13, genres:["drama","historical"] },
  { rank:9, title:"Succession", year:2018, episodes:39, char:9, world:7, cine:8, spect:7, conc:7.5, drive:8.5, resol:9, final:8.10, genres:["drama"] },
  { rank:10, title:"Deadwood", year:2004, episodes:36, char:9, world:8.5, cine:7, spect:8, conc:9, drive:7, resol:7.5, final:8.10, genres:["drama","western"] },
  { rank:11, title:"The Expanse", year:2015, episodes:62, char:7.5, world:10, cine:7, spect:10, conc:8, drive:7.5, resol:7, final:8.07, genres:["sci-fi","drama","thriller"] },
  { rank:12, title:"Mad Men", year:2007, episodes:92, char:8.5, world:8, cine:8, spect:8.5, conc:9, drive:7, resol:7.5, final:8.07, genres:["drama"] },
  { rank:13, title:"Andor", year:2022, episodes:12, char:7.5, world:9, cine:8, spect:8.5, conc:8, drive:7.5, resol:8, final:8.03, genres:["sci-fi","drama","action"] },
  { rank:14, title:"True Detective S1", year:2014, episodes:8, char:8, world:7, cine:10, spect:6, conc:8, drive:9, resol:8, final:8.00, genres:["crime","mystery","thriller","cop-show"] },
  { rank:15, title:"The Leftovers", year:2014, episodes:28, char:7, world:8, cine:8, spect:7, conc:9, drive:8, resol:9, final:8.00, genres:["drama","fantasy","mystery"] },
  { rank:16, title:"Dark", year:2017, episodes:26, char:7, world:7.5, cine:8.5, spect:6.5, conc:9, drive:8.5, resol:9, final:8.00, genres:["sci-fi","mystery","thriller"] },
  { rank:17, title:"The Americans", year:2013, episodes:75, char:8.5, world:7.5, cine:7, spect:5, conc:8.5, drive:8, resol:10, final:8.00, genres:["drama","thriller"] },
  { rank:18, title:"Shogun (2024)", year:2024, episodes:10, char:8, world:9, cine:9, spect:9, conc:7, drive:7.5, resol:7, final:7.98, genres:["drama","historical","action"] },
  { rank:19, title:"Babylon Berlin", year:2017, episodes:36, char:7.5, world:8.5, cine:9, spect:9, conc:8, drive:7.5, resol:7, final:7.95, genres:["drama","historical","thriller"] },
  { rank:20, title:"House of the Dragon", year:2022, episodes:18, char:8, world:9, cine:8, spect:9.5, conc:7.5, drive:7.5, resol:6.5, final:7.92, genres:["fantasy","drama","action"] },
  { rank:21, title:"The Knick", year:2014, episodes:20, char:8, world:8.5, cine:9.5, spect:8, conc:8, drive:8, resol:6, final:7.92, genres:["drama","historical"] },
  { rank:22, title:"Penny Dreadful", year:2014, episodes:27, char:8.5, world:8, cine:9, spect:9, conc:8, drive:7.5, resol:6, final:7.92, genres:["horror","drama","fantasy"] },
  { rank:23, title:"Angels in America", year:2003, episodes:6, char:8, world:7, cine:8, spect:7, conc:9, drive:7, resol:9, final:7.90, genres:["drama"] },
  { rank:25, title:"Station Eleven", year:2021, episodes:10, char:7.5, world:8, cine:9, spect:7, conc:9, drive:7, resol:8, final:7.90, genres:["drama","sci-fi"] },
  { rank:26, title:"Silo", year:2023, episodes:20, char:7.5, world:8.5, cine:8, spect:8, conc:8, drive:8.5, resol:7, final:7.90, genres:["sci-fi","drama","mystery"] },
  { rank:27, title:"Euphoria", year:2019, episodes:17, char:8, world:7, cine:9.5, spect:8.5, conc:8, drive:8, resol:7, final:7.90, genres:["drama"] },
  { rank:28, title:"Ozark", year:2017, episodes:44, char:8.5, world:7, cine:8.5, spect:6, conc:8.5, drive:8, resol:8, final:7.88, genres:["crime","drama","thriller","cop-show"] },
  { rank:29, title:"Severance", year:2022, episodes:19, char:7.5, world:8.5, cine:8.5, spect:6.5, conc:9, drive:9, resol:6, final:7.88, genres:["sci-fi","drama","thriller"] },
  { rank:30, title:"Hannibal", year:2013, episodes:39, char:8, world:6.5, cine:10, spect:8.5, conc:8.5, drive:6.5, resol:8, final:7.88, genres:["crime","thriller","horror","cop-show"] },
  { rank:31, title:"Adolescence", year:2025, episodes:4, char:8, world:5, cine:9.5, spect:5, conc:9, drive:9, resol:9, final:7.85, genres:["drama","thriller"] },
  { rank:32, title:"Wolf Hall", year:2015, episodes:6, char:8, world:8.5, cine:9, spect:7, conc:8.5, drive:7, resol:7, final:7.85, genres:["drama","historical"] },
  { rank:33, title:"Rome", year:2005, episodes:22, char:8, world:9, cine:7, spect:9, conc:8, drive:8, resol:6, final:7.85, genres:["drama","historical","action"] },
  { rank:34, title:"The Penguin", year:2024, episodes:8, char:8, world:8.5, cine:8, spect:6.5, conc:8, drive:7.5, resol:8, final:7.85, genres:["crime","drama","superhero"] },
  { rank:35, title:"The Haunting of Hill House", year:2018, episodes:10, char:7.5, world:7, cine:9, spect:7, conc:8, drive:8, resol:8.5, final:7.83, genres:["horror","drama","thriller"] },
  { rank:36, title:"Mr. Robot", year:2015, episodes:45, char:8, world:7, cine:9, spect:6, conc:8, drive:7.5, resol:9, final:7.82, genres:["drama","thriller"] },
  { rank:37, title:"It's a Sin", year:2021, episodes:5, char:8, world:7.5, cine:8, spect:6, conc:8, drive:8, resol:8.5, final:7.80, genres:["drama"] },
  { rank:38, title:"Rectify", year:2013, episodes:30, char:9, world:7, cine:8.5, spect:5, conc:9, drive:6, resol:9, final:7.80, genres:["drama"] },
  { rank:39, title:"The Underground Railroad", year:2021, episodes:10, char:7.5, world:8, cine:10, spect:8, conc:9, drive:6, resol:7, final:7.80, genres:["drama","fantasy","historical"] },
  { rank:40, title:"Halt and Catch Fire", year:2014, episodes:40, char:8.5, world:7.5, cine:7, spect:5, conc:8, drive:8, resol:9, final:7.78, genres:["drama"] },
  { rank:41, title:"Beef", year:2023, episodes:10, char:8, world:6.5, cine:8, spect:5, conc:8, drive:9, resol:9, final:7.78, genres:["drama","comedy"] },
  { rank:42, title:"Sharp Objects", year:2018, episodes:8, char:8.5, world:7.5, cine:9, spect:6, conc:8, drive:7, resol:8, final:7.78, genres:["drama","mystery","thriller"] },
  { rank:43, title:"Utopia (UK)", year:2013, episodes:12, char:7.5, world:7.5, cine:10, spect:7, conc:8, drive:9, resol:6, final:7.78, genres:["sci-fi","thriller","drama"] },
  { rank:44, title:"The Last of Us", year:2023, episodes:16, char:8, world:7.5, cine:8, spect:8, conc:8, drive:8, resol:7, final:7.78, genres:["drama","action","sci-fi"] },
  { rank:45, title:"Black Mirror", year:2011, episodes:29, char:7, world:7, cine:8, spect:7, conc:9.5, drive:8, resol:8, final:7.78, genres:["sci-fi","drama","thriller"] },
  { rank:46, title:"Peaky Blinders", year:2013, episodes:36, char:8, world:8, cine:9, spect:8.5, conc:7, drive:7.5, resol:7, final:7.78, genres:["crime","drama","historical"] },
  { rank:47, title:"Foundation", year:2021, episodes:30, char:7, world:8.5, cine:8.5, spect:9.5, conc:8, drive:7, resol:7, final:7.78, genres:["sci-fi","drama"] },
  { rank:48, title:"Twin Peaks: The Return", year:2017, episodes:18, char:8, world:8, cine:9, spect:9, conc:9, drive:5, resol:7, final:7.75, genres:["mystery","drama","thriller"] },
  { rank:49, title:"Patrick Melrose", year:2018, episodes:5, char:8.5, world:7, cine:8, spect:6, conc:8, drive:7, resol:9, final:7.75, genres:["drama"] },
  { rank:50, title:"The Shield", year:2002, episodes:88, char:8.5, world:7, cine:6, spect:5, conc:7, drive:9, resol:10, final:7.75, genres:["crime","drama","cop-show"] },
  { rank:51, title:"For All Mankind", year:2019, episodes:40, char:7, world:8, cine:8, spect:8, conc:8, drive:8, resol:7.5, final:7.72, genres:["sci-fi","drama"] },
  { rank:52, title:"The Queen's Gambit", year:2020, episodes:7, char:7.5, world:7, cine:8.5, spect:7, conc:7, drive:9, resol:8, final:7.70, genres:["drama"] },
  { rank:53, title:"Generation Kill", year:2008, episodes:7, char:7, world:8, cine:8, spect:7, conc:9, drive:7, resol:8, final:7.70, genres:["drama","war","action"] },
  { rank:54, title:"Midnight Mass", year:2021, episodes:7, char:7.5, world:7, cine:8, spect:6, conc:9, drive:7, resol:9, final:7.70, genres:["horror","drama","mystery"] },
  { rank:55, title:"The White Lotus", year:2021, episodes:21, char:7.5, world:7, cine:9, spect:8, conc:8, drive:7, resol:8, final:7.70, genres:["drama","comedy"] },
  { rank:56, title:"Godless", year:2017, episodes:7, char:7.5, world:8, cine:9, spect:8, conc:7, drive:7, resol:8, final:7.70, genres:["drama","western"] },
  { rank:57, title:"Fargo", year:2014, episodes:51, char:8, world:6.5, cine:8.5, spect:6, conc:8.5, drive:8, resol:8, final:7.70, genres:["crime","drama","thriller"] },
  { rank:58, title:"Girls", year:2012, episodes:62, char:8.5, world:7, cine:7, spect:5, conc:8.5, drive:8.5, resol:8, final:7.70, genres:["drama","comedy"] },
  { rank:59, title:"When They See Us", year:2019, episodes:4, char:7.5, world:6.5, cine:8, spect:5, conc:9, drive:8, resol:9, final:7.67, genres:["drama"] },
  { rank:60, title:"Westworld", year:2016, episodes:36, char:7.5, world:8.5, cine:8.5, spect:9, conc:9.5, drive:6.5, resol:5, final:7.67, genres:["sci-fi","western","drama"] },
  { rank:61, title:"Pose", year:2018, episodes:26, char:7.5, world:8, cine:8, spect:7, conc:8, drive:7, resol:8, final:7.65, genres:["drama"] },
  { rank:62, title:"The Pacific", year:2010, episodes:10, char:7, world:8, cine:8, spect:9, conc:7, drive:7, resol:8, final:7.60, genres:["drama","war","historical"] },
  { rank:63, title:"The Crown", year:2016, episodes:60, char:7.5, world:8, cine:9, spect:8.5, conc:7, drive:7, resol:7, final:7.60, genres:["drama","historical"] },
  { rank:64, title:"The Handmaid's Tale", year:2017, episodes:56, char:7.5, world:8.5, cine:8.5, spect:7.5, conc:8.5, drive:7, resol:6, final:7.60, genres:["drama","sci-fi","thriller"] },
  { rank:65, title:"Squid Game", year:2021, episodes:18, char:6.5, world:7.5, cine:8, spect:7.5, conc:7, drive:9, resol:8, final:7.58, genres:["thriller","drama","sci-fi"] },
  { rank:66, title:"Stranger Things", year:2016, episodes:42, char:7, world:8.5, cine:8, spect:8, conc:6.5, drive:8.5, resol:7, final:7.58, genres:["sci-fi","horror","drama"] },
  { rank:67, title:"Escape at Dannemora", year:2018, episodes:7, char:8, world:7, cine:8, spect:5, conc:7, drive:8, resol:9, final:7.55, genres:["drama","crime","thriller"] },
  { rank:68, title:"The Plot Against America", year:2020, episodes:6, char:7.5, world:8, cine:8, spect:6, conc:9, drive:7, resol:7, final:7.55, genres:["drama","historical","thriller"] },
  { rank:69, title:"The Bureau", year:2015, episodes:50, char:8, world:7.5, cine:7, spect:5, conc:8, drive:8, resol:8, final:7.52, genres:["drama","thriller"] },
  { rank:70, title:"Mare of Easttown", year:2021, episodes:7, char:8, world:7.5, cine:7, spect:5, conc:7, drive:8, resol:9, final:7.52, genres:["crime","drama","mystery","cop-show"] },
  { rank:71, title:"Narcos", year:2015, episodes:30, char:7.5, world:8, cine:8, spect:7, conc:7, drive:8, resol:7, final:7.50, genres:["crime","drama","cop-show"] },
  { rank:72, title:"Dopesick", year:2021, episodes:8, char:7.5, world:7, cine:7, spect:5, conc:9, drive:8, resol:8, final:7.50, genres:["drama"] },
  { rank:73, title:"Borgen", year:2010, episodes:40, char:8, world:7, cine:7, spect:5, conc:8, drive:8, resol:8, final:7.45, genres:["drama","political"] },
  { rank:74, title:"Happy Valley", year:2014, episodes:18, char:8, world:7, cine:7, spect:5, conc:7, drive:8, resol:9, final:7.45, genres:["crime","drama","thriller","cop-show"] },
  { rank:75, title:"Justified", year:2010, episodes:78, char:8, world:7.5, cine:7, spect:5, conc:7.5, drive:8, resol:8, final:7.45, genres:["crime","drama","thriller"] },
  { rank:76, title:"Broadchurch", year:2013, episodes:24, char:7.5, world:7, cine:8, spect:6, conc:7, drive:8, resol:8, final:7.40, genres:["crime","drama","mystery","cop-show"] },
  { rank:77, title:"Six Feet Under", year:2001, episodes:63, char:8, world:6.5, cine:7, spect:5, conc:8, drive:6, resol:10, final:7.38, genres:["drama"] },
  { rank:78, title:"Watchmen (2019)", year:2019, episodes:9, char:7, world:7.5, cine:7.5, spect:8, conc:7, drive:7, resol:8, final:7.38, genres:["drama","sci-fi","superhero"] },
  { rank:79, title:"Interview with the Vampire", year:2022, episodes:18, char:8, world:7.5, cine:8, spect:7, conc:7, drive:7, resol:7, final:7.38, genres:["horror","drama","fantasy"] },
  { rank:80, title:"Twin Peaks", year:1990, episodes:30, char:7.5, world:8, cine:8, spect:7, conc:9, drive:6, resol:6, final:7.35, genres:["mystery","drama","thriller"] },
  { rank:81, title:"Big Little Lies", year:2017, episodes:14, char:7.5, world:7, cine:8, spect:7, conc:7, drive:7, resol:8, final:7.35, genres:["drama","thriller"] },
  { rank:82, title:"The Boys", year:2019, episodes:40, char:7, world:7.5, cine:7, spect:8, conc:8, drive:8, resol:6, final:7.32, genres:["superhero","action","drama"] },
  { rank:83, title:"True Detective S3", year:2019, episodes:8, char:7.5, world:7.5, cine:8, spect:6, conc:7, drive:7, resol:8, final:7.32, genres:["crime","mystery","thriller"] },
  { rank:84, title:"The Bear", year:2022, episodes:28, char:7.5, world:6.5, cine:9, spect:6, conc:7, drive:8, resol:7, final:7.28, genres:["drama","comedy"] },
  { rank:85, title:"The Day of the Jackal", year:2024, episodes:8, char:7.5, world:7, cine:8, spect:6, conc:7, drive:8, resol:7, final:7.25, genres:["thriller","drama","action"] },
  { rank:86, title:"Slow Horses", year:2022, episodes:18, char:8, world:7, cine:7, spect:6, conc:7, drive:8, resol:7, final:7.25, genres:["thriller","drama","action"] },
  { rank:87, title:"Homeland", year:2011, episodes:96, char:8, world:7, cine:7, spect:6, conc:7, drive:8, resol:7, final:7.25, genres:["drama","thriller","action"] },
  { rank:88, title:"The Marvelous Mrs. Maisel", year:2017, episodes:43, char:7, world:7, cine:8, spect:7, conc:7, drive:7, resol:8, final:7.25, genres:["drama","comedy","historical"] },
  { rank:89, title:"Friday Night Lights", year:2006, episodes:76, char:8, world:7.5, cine:7, spect:5, conc:7, drive:7, resol:8, final:7.22, genres:["drama"] },
  { rank:90, title:"Downton Abbey", year:2010, episodes:52, char:7, world:8, cine:8, spect:8, conc:6, drive:7, resol:7, final:7.20, genres:["drama","historical"] },
  { rank:91, title:"Line of Duty", year:2012, episodes:37, char:7.5, world:7, cine:7, spect:5, conc:7, drive:9, resol:7, final:7.20, genres:["crime","drama","thriller","cop-show"] },
  { rank:92, title:"The Killing (DK)", year:2007, episodes:40, char:7.5, world:7, cine:7, spect:5, conc:7, drive:8, resol:8, final:7.20, genres:["crime","drama","mystery","cop-show"] },
  { rank:93, title:"Gomorrah", year:2014, episodes:58, char:7, world:8, cine:8, spect:6, conc:7, drive:7, resol:7, final:7.15, genres:["crime","drama"] },
  { rank:94, title:"Lost", year:2004, episodes:121, char:9, world:8, cine:7.5, spect:7.5, conc:7, drive:9.5, resol:1, final:7.13, genres:["sci-fi","drama","mystery"] },
  { rank:95, title:"Battlestar Galactica", year:2004, episodes:75, char:7, world:7, cine:7, spect:8, conc:8, drive:7, resol:6, final:7.10, genres:["sci-fi","drama","action"] },
  { rank:96, title:"Barry", year:2018, episodes:32, char:7.5, world:6, cine:8, spect:6, conc:7, drive:8, resol:7, final:7.10, genres:["crime","drama","comedy"] },
  { rank:97, title:"Killing Eve", year:2018, episodes:32, char:7, world:6.5, cine:7, spect:7, conc:7, drive:8, resol:7, final:7.08, genres:["thriller","action","drama"] },
  { rank:98, title:"The X-Files", year:1993, episodes:218, char:7.5, world:7.5, cine:7, spect:7, conc:7, drive:7, resol:6, final:7.02, genres:["sci-fi","mystery","thriller"] },
  { rank:99, title:"Oz", year:1997, episodes:56, char:7.5, world:7.5, cine:6, spect:5, conc:8, drive:7, resol:7, final:7.02, genres:["crime","drama"] },
  { rank:100, title:"24", year:2001, episodes:192, char:7, world:6, cine:6, spect:7, conc:6, drive:9.5, resol:7, final:6.97, genres:["action","drama","thriller","cop-show"] },
  { rank:101, title:"Hill Street Blues", year:1981, episodes:146, char:7.5, world:7, cine:6, spect:5, conc:8, drive:7, resol:7, final:6.95, genres:["drama","crime","cop-show"] },
  { rank:102, title:"The Affair", year:2014, episodes:53, char:7.5, world:6.5, cine:8, spect:5, conc:8, drive:7, resol:6, final:6.92, genres:["drama"] },
  { rank:103, title:"Homicide: Life on the Street", year:1993, episodes:122, char:7.5, world:6.5, cine:6, spect:5, conc:7, drive:7, resol:7, final:6.72, genres:["crime","drama","cop-show"] },
];

// ============================================================
// Current metadata from index.json (posters, streaming, slugs, months, tmdbIds)
// ============================================================
const currentIndex = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/shows/index.json'), 'utf8'));

// Build lookup by title AND slug (handling name differences)
const titleMap = {};
const slugMap = {};
currentIndex.shows.forEach(s => {
  titleMap[s.title] = s;
  if (s.slug) slugMap[s.slug] = s;
});
// Manual title mappings for mismatches
titleMap["Beef"] = titleMap["Beef"] || titleMap["BEEF"];
titleMap["True Detective S3"] = titleMap["True Detective S3"] || titleMap["True Detective: Season 3"];
// Slug-based fallback for Shogun (handles encoding issues)
titleMap["Shogun (2024)"] = titleMap["Shogun (2024)"] || slugMap["shogun-2024"];

// ============================================================
// Build corrected index.json
// ============================================================
const correctedShows = masterShows.map(master => {
  const current = titleMap[master.title];
  if (!current) {
    console.warn(`WARNING: No metadata found for "${master.title}" — using defaults`);
  }
  return {
    rank: master.rank,
    slug: current ? current.slug : master.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    title: master.title,
    year: master.year,
    month: current ? (typeof current.month === 'string' ? parseInt(current.month) : current.month) : 1,
    genres: master.genres,
    final: master.final,
    tmdbId: current ? current.tmdbId : null,
    char: master.char,
    world: master.world,
    cine: master.cine,
    spect: master.spect,
    conc: master.conc,
    drive: master.drive,
    resol: master.resol,
    episodes: master.episodes,
    poster: current ? current.poster : "",
    streaming: current ? current.streaming : { us: [], uk: [] }
  };
});

const indexJson = {
  description: "Index of all shows in Dynamic Rank Engine",
  generated: new Date().toISOString().split('T')[0],
  shows: correctedShows
};

// Write corrected index.json
fs.writeFileSync(
  path.join(ROOT, 'data/shows/index.json'),
  JSON.stringify(indexJson, null, 4),
  'utf8'
);
console.log(`✅ Wrote corrected index.json with ${correctedShows.length} shows`);

// ============================================================
// Generate FALLBACK_SHOWS for index.html
// ============================================================
const fallbackLines = correctedShows.map(s => {
  const genresStr = s.genres.map(g => `"${g}"`).join(', ');
  const posterStr = s.poster || '';
  return `            { rank: ${s.rank}, title: "${s.title.replace(/"/g, '\\"')}", year: ${s.year}, month: ${s.month}, episodes: ${s.episodes}, char: ${s.char}, world: ${s.world}, cine: ${s.cine}, spect: ${s.spect}, conc: ${s.conc}, drive: ${s.drive}, resol: ${s.resol}, final: ${s.final}, genres: [${genresStr}], poster: "${posterStr}" }`;
});

const fallbackText = `        const FALLBACK_SHOWS = [\n${fallbackLines.join(',\n')}\n        ];`;

fs.writeFileSync(
  path.join(ROOT, 'scripts/FALLBACK_OUTPUT.txt'),
  fallbackText,
  'utf8'
);
console.log(`✅ Wrote FALLBACK_OUTPUT.txt (paste into index.html to replace FALLBACK_SHOWS)`);

// ============================================================
// Summary of changes
// ============================================================
console.log('\n--- SYNC SUMMARY ---');
console.log(`Master list: ${masterShows.length} shows`);
console.log(`Previous index: ${currentIndex.shows.length} shows`);

// Shows removed
const masterTitles = new Set(masterShows.map(s => s.title));
const removedShows = currentIndex.shows.filter(s => {
  // Check against master titles with name normalization
  if (masterTitles.has(s.title)) return false;
  if (s.title === 'BEEF' && masterTitles.has('Beef')) return false;
  if (s.title === 'True Detective: Season 3' && masterTitles.has('True Detective S3')) return false;
  if (s.title.includes('Shogun') && masterTitles.has('Shogun (2024)')) return false;
  return true;
});
if (removedShows.length > 0) {
  console.log(`\nREMOVED (not in master list):`);
  removedShows.forEach(s => console.log(`  - ${s.title} (was rank ${s.rank})`));
}

console.log('\nTitle fixes:');
console.log('  BEEF → Beef');
console.log('  ShÅgun (2024) → Shogun (2024)');
console.log('  True Detective: Season 3 → True Detective S3');
console.log('\nDone! Now paste FALLBACK_OUTPUT.txt content into index.html replacing the FALLBACK_SHOWS array.');
