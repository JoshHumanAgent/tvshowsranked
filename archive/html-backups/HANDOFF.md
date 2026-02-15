# TV Shows Ranked - Project Handoff

## Current Status
Building a premium TV show ranking platform with advanced filtering and visualization.

## Location
`C:\Users\randl\Desktop\OpenClaw-Workspace\10-Projects\tvshowsranked\HTML\index-dark.html`

## Working Features
- 100 TV shows with full scoring data (7 categories each)
- Dark theme with gold accents
- Filters: Era (All/2020s/2010s/2000s/Pre-2000), Genre (14 categories incl. Cop Show), Minimum Score
- List view with vertical stacked score bars (default on page load)
- Radar/Spider chart view (SVG-based)
- Score tier color coding: Gold (9+), Silver (7-8), Bronze (<7)
- AND logic for multi-filter selection (show must match ALL selected genres)
- Sort options: Rank, Score, Year, Alphabetical
- View toggle between List and Radar (List is default, renders on load)

## Resolved Issues

### View Toggle Not Initializing on Page Load (FIXED 2026-02-14)
**Problem:** Cards didn't render on first page load. User had to click "List View" or "Radar View" to trigger render.

**Root Cause:** The score filter slider (`#score-filter`) and its display element (`#score-value`) were removed from the HTML but their JS references were left behind. When `scoreFilter.addEventListener('input', ...)` ran on a `null` element, it threw an uncaught TypeError that **silently killed the script** before `renderShows()` could execute. The view toggle buttons worked because their event listeners were registered *before* the crash point in the code.

**Fix:** Added null guards around all `scoreFilter` and `scoreValue` references:
- `scoreFilter.addEventListener(...)` wrapped in `if (scoreFilter) { ... }`
- `scoreFilter.value = ...` and `scoreValue.textContent = ...` in `clearAllFilters()` and `removeFilter()` guarded with `if (scoreFilter)` / `if (scoreValue)`

**Lesson for future work:** When removing UI elements from the HTML, always search the entire JS for references to those elements and remove or guard them. A null reference on an `.addEventListener()` call will crash the script silently — the browser console may not make this obvious if you're not watching for it.

## Architecture Notes
- Single-file HTML app (all CSS + JS inline in `index-dark.html`)
- `index.html` is the older light-themed version (not actively maintained)
- Default view state: `viewMode = 'list'`, set in JS, with matching `active` class on the List View button in HTML
- `renderShows()` is called once at script end for initial render

## Backup Files
- `index-dark-v2-backup-2026-02-14-1244.html`
- `index-dark-v3-backup-2026-02-14-1313.html`
- `index-dark-backup-2026-02-14-1228.html`

## Quick Test
Open `index-dark.html` in browser — cards should appear immediately without clicking anything.
