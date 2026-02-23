# 05 — Project Status
*Current state, data sync, weight config*

---

## 📊 Quick Stats

| Metric | Value |
|--------|-------|
| **Total Shows** | 109 |
| **Git Commits** | 40+ (including debug fixes) |
| **Last Deploy** | 2026-02-16 |
| **Status** | 🟢 PRODUCTION READY |
| **All Tests** | ✅ 40/40 PASSED |

---

## ⚖️ Current Weight Configuration

**Last Adjusted:** 2026-02-16 21:40 GMT+13

| Category | Weight | Code | Change |
|----------|--------|------|--------|
| Characters & Acting | 25% | char | ⬆️ +5% |
| World Building | 15% | world | — |
| Cinematography | 5% | cine | ⬇️ -5% |
| Visual Spectacle | 5% | spect | ⬇️ -5% |
| Conceptual Density | 15% | conc | — |
| Narrative Drive | 15% | drive | — |
| Narrative Path & Resolution | 20% | resol | ⬆️ +5% |

**Total:** 100% ✅

**Effect:** Characters and story resolution weighted higher, spectacle lower.

---

## 🏆 Top 10 Rankings (Current)

| Rank | Show | Score | Tier |
|------|------|-------|------|
| 1 | Game of Thrones S1-4 | 9.45 | MASTERPIECE |
| 2 | Breaking Bad | 8.89 | ELITE |
| 3 | The Wire | 8.74 | ELITE |
| 4 | Better Call Saul | 8.74 | ELITE |
| 5 | Chernobyl | 8.54 | ELITE |
| 6 | The Sopranos | 8.38 | ELITE |
| 7 | The Americans | 8.33 | ELITE |
| 8 | The Shield | 8.17 | ELITE |
| 9 | The Expanse | 8.09 | ELITE |
| 10 | Succession | 8.03 | ELITE |

**8.0+ = Elite tier**

---

## 🔧 Project Structure

```
tvshowsranked/
├── index.html              # Main app (single file, 4,600+ lines)
├── data/
│   └── shows/
│       ├── index.json           # Master list (109 shows)
│       ├── [slug].json          # Individual show files
│       ├── by_genre.json
│       ├── by_era.json
│       ├── by_network.json
│       ├── by_country.json
│       ├── by_status.json
│       └── rankings_export.csv  # CSV export
├── docs/
│   ├── shows/              # Individual show docs (109)
│   └── methodology/        # Scoring definitions
├── memory/                 # ← YOU ARE HERE
│   ├── 00-START-HERE.md
│   ├── 01-SETUP.md
│   ├── 02-BROWSER.md
│   ├── 03-SITE-NAV.md
│   ├── 04-GIT.md
│   ├── 05-STATUS.md       # ← This file
│   ├── 06-CHANGES.md
│   └── 07-DEBUG.md
├── scripts/                # Batch processing tools
├── reports/                # Fix reports
├── backups/                # Git bundles
└── README.md
```

---

## 📁 File Sync Status

| File | Status | Notes |
|------|--------|-------|
| `index.html` | ✅ CURRENT | 109 shows, agent instrumentation |
| `data/shows/index.json` | ✅ SYNCED | Master index matches HTML |
| Individual `.json` files | ✅ 109 files | One per show |
| `docs/shows/*.md` | ✅ 109 docs | Human-readable breakdowns |

**Last sync verified:** 2026-02-16

---

## 🎛️ Interactive Features Status

| Feature | Status | Notes |
|---------|--------|-------|
| Weight Sliders | ✅ Working | 7 categories, live recalc |
| Score Sliders | ✅ Working | Per-show, per-category |
| Episode Multiplier | ✅ Working | Toggle on/off |
| Search | ✅ Working | Real-time filter |
| Filters | ✅ Working | Era, genre, network, status |
| Sort | ✅ Working | Multiple criteria |
| Export/Import | ✅ Working | JSON backup |
| Pinned Shows | ✅ Working | Keeps favorites |
| Show Detail Modal | ✅ Working | Narrative + ratings |

---

## 🔌 API Keys

| Service | Key | Status |
|---------|-----|--------|
| TMDB | `ca9b21cb89de2d1debed1050f603d7ad` | ⚠️ Rate limited 200ms |

---

## ⚠️ Known Issues

**NONE — ALL FIXED**

- ✅ `filterAndRender()` undefined — FIXED
- ✅ Episode multiplier toggle — FIXED  
- ✅ Category detail modal — FIXED
- ✅ Import with custom weights — FIXED
- ✅ Genre tag filter — FIXED
- ✅ Reset with multiplier — FIXED
- ✅ Reset recalculates baseScores.final — FIXED

**Last debug session:** 2026-02-16 — 40/40 tests passed

---

## 🚀 What's Next (Optional)

1. **Add more shows** — 500 candidates in `data/show_candidates/`
2. **Streaming data refresh** — JustWatch integration
3. **Score adjustments** — Per-show slider tuning
4. **Feature:** Shareable rankings via URL
5. **Performance:** Lazy loading for 500+ shows

---

## 🔄 Recovery Checklist

**If starting fresh:**
1. Server: `npx http-server -p 3000 -c-1`
2. Gateway: `openclaw gateway start`
3. Browser: `browser(profile="openclaw", action="open", targetUrl="http://localhost:3000")`
4. Verify: See 109 shows, test a slider

**Next:** Go to `06-CHANGES.md` for change history

---
*"109 shows, 7 dimensions, 1 perfect ranking system."* — Cyberclaw
