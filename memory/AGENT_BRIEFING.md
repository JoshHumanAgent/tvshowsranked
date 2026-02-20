# TV Shows Ranked — Agent Briefing

Use this to get up to speed before making any changes to the project.

---

## What This Project Is

A single-page web app called **"Dynamic Rank Engine"** — a curated ranking of the top 100 TV shows scored across 7 dimensions. Users can:
- Adjust category **weights** to match their preferences
- Tweak **individual show scores** per category
- Save preferences to **Firebase Firestore** (synced across devices)
- Filter by genre, era, score threshold, search
- Pin shows, toggle episode multiplier, sort by multiple criteria

**Live site:** deployed via GitHub Pages (CNAME present)
**Root file:** `C:/Users/randl/Desktop/OpenClaw-Workspace/10-Projects/tvshowsranked/index.html` (~6,339 lines, contains ALL HTML + CSS + JS in one file)
**Data file:** `C:/Users/randl/Desktop/OpenClaw-Workspace/10-Projects/tvshowsranked/data/shows/index.json` (~3,200 lines, 100 shows)

---

## File Structure

```
tvshowsranked/
├── index.html                  ← ENTIRE APP (HTML + CSS + JS, ~6,339 lines)
├── data/
│   └── shows/
│       ├── index.json          ← Master show data (100 shows, ranks 1–100)
│       ├── {slug}.json         ← Individual show detail files (narrative, consensus, quotes)
│       ├── by_genre.json
│       ├── by_era.json
│       ├── by_network.json
│       └── by_country.json
├── assets/                     ← Static assets
├── scripts/                    ← Utility/scraping scripts
├── memory/                     ← Agent briefings and notes
└── FIREBASE_SETUP.md
```

---

## index.json Show Schema

Each show entry looks like:

```json
{
    "rank": 1,
    "slug": "game-of-thrones-s1-s4",
    "title": "Game of Thrones S1-S4",
    "year": 2011,
    "month": 4,
    "genres": ["fantasy", "drama", "action"],
    "final": 9.45,
    "tmdbId": 1399,
    "char": 10,
    "world": 10,
    "cine": 8,
    "spect": 9.5,
    "conc": 9,
    "drive": 10,
    "resol": 9,
    "episodes": 40,
    "poster": "https://image.tmdb.org/t/p/w500/{hash}.jpg",
    "streaming": { "us": ["Max"], "uk": ["Sky Atlantic"] },
    "backdrop": "https://image.tmdb.org/t/p/w780/{hash}.jpg"
}
```

**The 7 scoring categories:**
| Key | Label | Default Weight |
|-----|-------|---------------|
| char | Characters | 20% |
| world | World-Building | 15% |
| cine | Cinematography | 15% |
| spect | Visual Spectacle | 10% |
| conc | Ideas/Concepts | 15% |
| drive | Narrative Drive | 15% |
| resol | Story Resolution | 10% |

**Weights MUST sum to 100.** Current default config: `20/15/15/10/15/15/10`

---

## Scoring Formula

```js
// In recalcFinal() and recalculateWithWeights():
let val = (
    (char * weights.char) +
    (world * weights.world) +
    (cine * weights.cine) +
    (spect * weights.spect) +
    (conc * weights.conc) +
    (drive * weights.drive) +
    (resol * weights.resol)
) / 100;

// Episode multiplier (applied if multiplierEnabled = true):
function getMultiplier(episodes) {
    if (episodes <= 10) return 0.96;
    if (episodes <= 20) return 0.95;
    if (episodes <= 30) return 0.97;
    if (episodes <= 40) return 1.00;
    if (episodes <= 50) return 1.02;
    if (episodes <= 60) return 1.03;
    if (episodes <= 75) return 1.04;
    if (episodes <= 100) return 1.05;
    return 1.06;
}

final = val * getMultiplier(show.episodes);
```

The `final` stored in index.json is a **pre-computed baseline** for initial sort order. The app **always recalculates finals on load** via `recalculateWithWeights()`, so the stored finals only need to be approximately correct.

---

## Key JavaScript Architecture (index.html)

**Line ranges (approximate):**
- `~12–3830`: All CSS (styles, responsive, mobile)
- `~3840`: Firebase init + Firestore persistence
- `~3990–4030`: State variables (`weights`, `currentGenres`, `sortBy`, etc.)
- `~4031`: `recalcFinal()` — single-show score computation
- `~4149`: `initWeightSliders()` — syncs weight UI
- `~4229`: `recalculateWithWeights()` — recalculates all show finals and re-renders
- `~4391`: `getMultiplier(episodes)`
- `~4403`: `fetchPosters()` — TMDB poster fallback (SKIPS shows that already have poster)
- `~4506`: `renderShows()` — main render function
- `~5503`: Header stats HTML (`<span class="stat-value">500</span>` Shows Ranked, `100` Showing)
- `~5720`: `resetAllState(andRender)` — wipes all state to defaults
- `~5766`: `saveUserPreferences()` — async Firestore write (full document replace, NO merge)
- `~5804`: `loadUserPreferences()` — async Firestore read on login

**Critical state variables:**
```js
let weights = { ...defaultWeights };       // Current weight config
let multiplierEnabled = true;              // Episode bonus toggle
let currentGenres = ['all'];               // Active genre filters
let currentEras = [];                      // Active era filters
let sortBy = 'rank';                       // Sort mode
const baseScores = {};                     // Original scores from JSON (NEVER mutate)
const activeScores = {};                   // Current scores (with user overrides)
const modifiedShows = new Set();           // Titles with user modifications
const pinnedShows = new Set();             // Pinned show titles
```

---

## Firebase / Firestore

- **Firebase SDK:** v10.12.0 (compat mode)
- **Auth:** Google Sign-In only
- **Persistence:** `db.enablePersistence({ synchronizeTabs: true })` — writes to IndexedDB, survives refresh
- **Save format:** Full document replace (`set(data)` — NO `{merge: true}`)
  - `merge: true` was a bug: `scoreOverrides: {}` with merge doesn't clear existing keys
- **Document path:** `users/{uid}`
- **Saved fields:** `weights`, `multiplierEnabled`, `currentGenres`, `currentEras`, `sortBy`, `filtersCollapsed`, `pinnedShows`, `scoreOverrides`
- **Reset guard:** `localStorage.setItem('tvranked_reset_pending', '1')` is set before async reset write; if page refreshes mid-save, `loadUserPreferences()` detects the flag and re-applies the reset

---

## Per-Card Slider Lock System

Each show card starts **locked** (sliders inert) to prevent accidental mobile input:

- Card HTML has class `sliders-locked` by default
- Lock button (🔒/🔓) toggles `sliders-locked` on the `.show-card-panel`
- CSS: `.show-card-panel.sliders-locked .cat-slider-input { pointer-events: none; opacity: 0.25; }`
- All slider event handlers (`mousedown`, `touchstart`, `input`, `click`) check for `sliders-locked` before processing
- Mobile: lock button has larger tap target (34×28px min)

---

## Mobile Behavior

- Save bar (`#score-save-bar`) and login banner (`#login-save-banner`) are **hidden on mobile** (`display: none !important` in `@media (max-width: 768px)`)
- No localStorage save UI shown on mobile — Firestore only
- Mobile popup typography uses smaller font sizes and larger line-height

---

## TMDB Poster Rules

**CRITICAL:** `fetchPosters()` now **skips shows with an existing poster URL**. This is intentional — all 100 shows have curated poster hashes in index.json. If fetchPosters() ran, it would overwrite season-specific posters (e.g., True Detective S1) with the show's current main TMDB poster (which for True Detective is Night Country).

**Poster URL format:** `https://image.tmdb.org/t/p/w500/{hash}.jpg`
**Backdrop URL format:** `https://image.tmdb.org/t/p/w780/{hash}.jpg`

To find a correct season-specific poster hash, use:
- `https://www.themoviedb.org/tv/{tmdbId}/seasons` — shows thumbnail for each season
- `https://api.themoviedb.org/3/tv/{tmdbId}/season/{n}/images?api_key=ca9b21cb89de2d1debed1050f603d7ad` — season image list

**Known poster fixes already applied:**
- Twin Peaks: The Return — correct hash: `ei7odFMfdnNV9pr5LyfrAAQOFes`
- True Detective S3 — correct hash: `qnD7ExuaBF4QdcgxlB1B1HyLxXA`
- True Detective S1 — correct hash: `gf5PFAwzcrRjd26zqcumqeMZV0W` (from TMDB seasons page)

---

## Header Stats (hardcoded)

```html
<span class="stat-value">500</span>  <!-- Shows Ranked (aspirational) -->
<span class="stat-value">100</span>  <!-- Showing -->
<span class="stat-value">7</span>    <!-- Dimensions -->
<span class="stat-value date">Feb 2026</span>  <!-- Updated -->
```

---

## Things NOT to Break

1. **`baseScores` is read-only after init** — never write computed values back to it
2. **`saveUserPreferences()` uses `set(data)` NOT `set(data, {merge: true})`** — merge breaks reset
3. **`fetchPosters()` must skip shows with existing poster** — do not remove the `if (show.poster) continue` guard
4. **Slider lock checks** — all 4 event handlers (mousedown, touchstart, input, click) must check `sliders-locked`
5. **Reset handler must be async with await** — `await saveUserPreferences()` before removing guard flag

---

## Current Default Weights

```js
const defaultWeights = { char: 20, world: 15, cine: 15, spect: 10, conc: 15, drive: 15, resol: 10 };
// Sum = 100 ✓
```

---

## Show Count

100 shows at ranks 1–100. Shows ranked 101–103 (Hill Street Blues, The Affair, Homicide: Life on the Street) were removed. The "Shows Ranked" stat displays 500 (aspirational total across all ranking categories the site plans to cover).

---

## Workflow Notes

- The app is a **single HTML file** — all CSS and JS are inline in index.html
- index.json is the **single source of truth** for show data; individual `{slug}.json` files contain narrative/consensus text for detail popups
- When changing weights, verify they still sum to 100
- When changing individual show scores, optionally update the `final` field (app recalculates anyway)
- Always read a file before editing it
