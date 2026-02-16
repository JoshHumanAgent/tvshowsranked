# 06 — Change History & Features
*What we built, when we built it, why*

---

## 2026-02-17 — Weight Section Redesign

### Early Morning: Visual Hierarchy Overhaul

**Problem:** Weight section cluttered — total indicator, guidance text, methodology button scattered

| Element | Before | After |
|---------|--------|-------|
| Header | Title only | Title + badge + Reset (grouped right) |
| Subheader | Guidance below | New `.weight-subheader` row with guidance + methodology |
| Sliders | `.weight-slider-row` flex | Grid-based layout, full-width tracks |
| Episode Multiplier | Featured block with gradient | Integrated row, cleaner |

**CSS Classes Added:**
- `.weight-header-right` — flex group for badge + button
- `.weight-subheader` — guidance + methodology link row
- `.weight-total-badge` — elevated total display (replaces inline wrapper)

**JavaScript Updated:**
- `updateWeightTotal()` now targets `#weight-total-badge` instead of `.weight-total-row`

**Result:** Cleaner visual hierarchy, consistent with site's dark aesthetic

---

## 2026-02-16 — Agent Instrumentation Day

### Morning: Bug Fixes (Commits 5920af8)
**Problem:** Site completely broken — no shows displaying

| Issue | Fix | Line |
|-------|-----|------|
| `filterAndRender()` undefined | Changed to `renderShows()` | ~4565 |
| Search bar DOM timing | Moved HTML after `</main>` | ~827 |

**Result:** Site restored, deployed to GitHub Pages

---

### Afternoon: UI Refinements (Commit b0d7749)

| Feature | Change | Before → After |
|---------|--------|----------------|
| Search bar | Compact padding | `1rem 2rem` → `0.5rem 1rem` |
| Search input | Reduced | `0.9rem` → `0.6rem` |
| Main padding | Bottom space | `80px` → `50px` |
| Total badge | Compact layout | Full-width → `inline-flex` auto |
| Methodology button | Position | Header → Above sliders |
| Episode multiplier | Featured | Plain → Gradient green |

**Reason:** Cleaner UI, better information hierarchy

---

### Evening: Agent-Native Instrumentation (REVOLUTIONARY)

**What we did:** Invisible hooks on every UI element

```javascript
// Global API exposed
window.tvshowsAgent = {
  search(), filterEra(), filterGenre(),
  setWeight(), setShowSlider(),
  scrollToShow(), openShowDetail(),
  toggleEpisodeMultiplier(), sortBy(), on()
}
```

**Data attributes injected:**
- `data-agent-target` — search, sliders
- `data-agent-action` — buttons
- `data-agent-show` — show cards
- `data-agent-category` — category links

**Tested at 20:38 GMT+13:**
```javascript
browser(profile="openclaw", action="act", request={"kind":"type","ref":"e42","text":"9.5"})
// Result: GoT Characters 10 → 9.5 ✓
// Score: 9.45 → 9.35 ✓
// Modified badge appeared ✓
```

**Status:** FULLY OPERATIONAL — can puppet entire UI

---

### Night: Weight Adjustments

**Final configuration:**
- Characters: 20% → **25%**
- Resolution: 15% → **20%**
- Cinematography: 10% → **5%**
- Spectacle: 10% → **5%**

**Result:** GoT #1, Breaking Bad #2, The Wire #3

---

## 2026-02-15 — Feature Drop Day

### Per-Category Score Sliders
**Every show card** now has 7 sliders:
- Characters, World Building, Cinematography
- Visual Spectacle, Conceptual Density
- Narrative Drive, Narrative Resolution

**Features:**
- 0.5 increment adjustments
- Real-time score updates
- Blue tint for modified values
- Persistence to localStorage
- Export/import JSON

---

### Streaming Availability
- US/UK streaming data for all 109 shows
- JustWatch integration
- Shows: Netflix, HBO, Prime, Hulu, etc.

---

### Index Files Generated
- `by_genre.json`
- `by_era.json`
- `by_network.json`
- `by_status.json`
- `by_country.json`
- `rankings_export.csv`

---

## 2026-02-14 — Expansion Day

- Added 9 new shows (100 → 109 total)
- Updated posters via TMDB API
- Generated batch narratives

---

## Key Commits Reference

| Commit | Date | What |
|--------|------|------|
| `5920af8` | 2026-02-16 | Bugfix: filterAndRender → renderShows |
| `b0d7749` | 2026-02-16 | UI refinements |
| `157711d` | 2026-02-16 | EP multiplier fixes |
| `60dc905` | 2026-02-16 | Multiplier toggle |
| `5122972` | 2026-02-16 | Reset recalc |
| `df91752` | 2026-02-16 | Storage version bump |

---

## Architecture Decisions

### Single-File App
** index.html = 4,600+ lines**
- CSS inline (no external stylesheet)
- JS inline (no external script)
- Easier deployment to GitHub Pages
- No build step required

### Agent Instrumentation Pattern
```
BUILD → INSTRUMENT → SELF-TEST
```
1. Build feature
2. Add `data-agent-*` attributes
3. Expose global API
4. Test via browser automation

### Weight System v3
- 7 dimensions (0-10 scale each)
- Adjustable weights (sum must = 100%)
- EP multipliers for show length
- Modified scores persist

---

## Lessons Learned

**2026-02-16:**
- `filterAndRender()` was a ghost function — always exists
- PowerShell `&&` doesn't work — use separate commands
- Browser control needs fresh targetId — don't reuse stale refs
- `profile=openclaw` only — Chrome extension is garbage

**2026-02-15:**
- Slider stopPropagation prevents category modal opening
- localStorage quota ~5MB — plenty for 100 shows
- Debounced reorder (300ms) keeps UI responsive

---

## Next Potential Features

1. Shareable URLs with encoded weights/scores
2. Comparison mode (side-by-side shows)
3. Import from IMDb/Trakt
4. Dark mode variants
5. Mobile app wrapper

---
*"We built a Ferrari in a shipping container."* — Cyberclaw
