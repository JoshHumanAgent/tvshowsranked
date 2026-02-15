# TV Shows Ranked - Project Status for Opus

**Last updated:** 2026-02-15

---

## 🔴 Live Files (for GitHub Pages deployment)

| File | Status | Notes |
|------|--------|-------|
| `index.html` | ⚠️ NEEDS UPDATE | Root file, has 109 shows (outdated) |
| `data/shows/index.json` | ✅ CURRENT | 103 shows, sorted by score (descending) |
| `docs/shows/*.md` | ✅ DONE | ~100 shows have 7-dimension breakdowns |

**GitHub Repo:** https://github.com/JoshHumanAgent/tvshowsranked  
**Live Site:** https://joshhumanagent.github.io/tvshowsranked/

---

## 📊 Current Data State

- **index.json:** 103 shows (Ranks 1-103)
- **index.html (root):** 109 shows (outdated - needs sync)
- **HTML/index.html:** Updated today but may differ from index.json

### Top 10
1. Game of Thrones (S1-4): 9.50
2. Breaking Bad: 8.89
3. Better Call Saul: 8.74
4. The Wire: 8.74
5. Chernobyl: 8.54
6. The Sopranos: 8.38
7. The Americans: 8.33
8. The Shield: 8.17
9. The Expanse: 8.09
10. Succession: 8.03

### Bottom 3
- 101. Killing Eve: 6.90
- 102. Barry: 6.88
- 103. Westworld: 6.83

---

## ⚠️ What Needs Doing

The HTML file needs to be updated to load from `data/shows/index.json` (dynamic JSON loading) instead of the hardcoded 100-show array.

**Key constraint:** The site should load show data from JSON, not have it hardcoded in HTML.

---

## 📁 Key Files

```
tvshowsranked/
├── index.html                    # Main HTML (NEEDS UPDATE)
├── data/
│   └── shows/
│       ├── index.json           # Master list (103 shows)
│       ├── *.json               # Individual show data
│       ├── by_genre.json        # Genre index
│       ├── by_era.json          # Era index
│       ├── by_network.json      # Network index
│       ├── by_status.json       # Status index
│       ├── by_country.json     # Country index
│       └── rankings_export*.{json,csv}  # Exports
└── docs/
    └── shows/
        └── *.md                 # Show documentation (7D breakdowns)
```

---

## 🔧 TMDB API

- **Key:** `ca9b21cb89de2d1debed1050f603d7ad`
- **Rate limit:** 200ms between calls

---

## 📝 Notes

- Content filter applied: No comedies or animations
- Shows evaluated at peak season only
- 7-dimension scoring: Characters 20%, World 15%, Cinematography 10%, Spectacle 10%, Conceptual Density 15%, Drive 15%, Resolution 15%
