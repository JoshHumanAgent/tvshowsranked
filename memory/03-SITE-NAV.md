# 03 — Site Navigation & Control
*How to puppet tvshowsranked UI — CLEAN METHOD*

---

## ✅ QUICK PATTERN

```javascript
// Screenshot first to verify state
browser(profile="openclaw", targetUrl="http://localhost:3000", action="screenshot")

// Control via JavaScript evaluate
browser(profile="openclaw", targetUrl="http://localhost:3000", action="act", request={"expression":"tvshowsAgent.ACTION_HERE()","kind":"evaluate"})
```

---

## 🎮 Full API Available

Every page has `window.tvshowsAgent`:

### Search & Filter
```javascript
tvshowsAgent.search("breaking")           // Search by title
tvshowsAgent.filterEra("2010s")           // Filter decade
tvshowsAgent.filterGenre("crime")         // Filter genre
tvshowsAgent.clearFilters()               // Reset all
```

### Weight Sliders (7 categories)
```javascript
tvshowsAgent.setWeight("char", 30)        // Characters & Acting
tvshowsAgent.setWeight("world", 15)       // World Building
tvshowsAgent.setWeight("cine", 5)         // Cinematography
tvshowsAgent.setWeight("spect", 5)        // Visual Spectacle
tvshowsAgent.setWeight("conc", 15)        // Conceptual Density
tvshowsAgent.setWeight("drive", 15)       // Narrative Drive
tvshowsAgent.setWeight("resol", 20)       // Narrative Resolution
```

### Show Sliders (per-category scores)
```javascript
// Change GoT character score
tvshowsAgent.setShowSlider("Game of Thrones S1-4", "char", 9.5)

// Change Breaking Bad cinematography
tvshowsAgent.setShowSlider("Breaking Bad", "cine", 10)
```

### Navigation
```javascript
tvshowsAgent.scrollToShow("The Wire")     // By title
tvshowsAgent.scrollToShow(10)             // By rank (1-based)
tvshowsAgent.openShowDetail("The Wire")   // Open modal
tvshowsAgent.sortBy("final")              // Sort options: final, char, world, cine, spect, conc, drive, resol, year
```

### Features
```javascript
tvshowsAgent.toggleEpisodeMultiplier(true)   // Enable multipliers
tvshowsAgent.toggleEpisodeMultiplier(false)  // Disable
```

---

## 🎯 Workflows (Copy-Paste Ready)

### Change Weight Configuration
```javascript
browser(profile="openclaw", targetUrl="http://localhost:3000", action="act", request={"expression":"tvshowsAgent.setWeight('char', 30)","kind":"evaluate"})
browser(profile="openclaw", targetUrl="http://localhost:3000", action="act", request={"expression":"tvshowsAgent.setWeight('spect', 10)","kind":"evaluate"})
browser(profile="openclaw", targetUrl="http://localhost:3000", action="screenshot")
```

### Filter to Crime Shows
```javascript
browser(profile="openclaw", targetUrl="http://localhost:3000", action="act", request={"expression":"tvshowsAgent.clearFilters(); tvshowsAgent.filterGenre('crime')","kind":"evaluate"})
browser(profile="openclaw", targetUrl="http://localhost:3000", action="screenshot")
```

### Modify Show Score
```javascript
browser(profile="openclaw", targetUrl="http://localhost:3000", action="act", request={"expression":"tvshowsAgent.setShowSlider('Game of Thrones S1-4', 'char', 9.0)","kind":"evaluate"})
browser(profile="openclaw", targetUrl="http://localhost:3000", action="screenshot")
```

### Open Show Detail
```javascript
browser(profile="openclaw", targetUrl="http://localhost:3000", action="act", request={"expression":"tvshowsAgent.openShowDetail('Breaking Bad')","kind":"evaluate"})
browser(profile="openclaw", targetUrl="http://localhost:3000", action="screenshot")
```

---

## 📊 Current Weight Config

```
Characters & Acting:        25% [char]
World Building:             15% [world]
Cinematography:              5% [cine]
Visual Spectacle:            5% [spect]
Conceptual Density:         15% [conc]
Narrative Drive:            15% [drive]
Narrative Path & Resolution: 20% [resol]
                           ---
TOTAL:                     100% ✅
```

---

## 🔍 Verify API Exists

```javascript
browser(profile="openclaw", targetUrl="http://localhost:3000", action="act", request={"expression":"typeof tvshowsAgent !== 'undefined' ? 'API Ready' : 'Error: Not loaded'","kind":"evaluate"})
```

---

## 🚀 Verify Everything Works

```javascript
// Chain commands in one evaluate
browser(profile="openclaw", targetUrl="http://localhost:3000", action="act", request={"expression":"tvshowsAgent.clearFilters(); tvshowsAgent.sortBy('final'); tvshowsAgent.scrollToShow(1); 'Top show visible'","kind":"evaluate"})

// Screenshot to confirm
browser(profile="openclaw", targetUrl="http://localhost:3000", action="screenshot")
```

**Next:** Go to `04-GIT.md` to push changes

---
*"JavaScript runs on page, screenshots prove it. Simple."* — Cyberclaw
