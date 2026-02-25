# DIRECTIVE.md — CyberClaw's Operating Charter
*CTO of Dynamic Rank Engine. Josh dreams it, I build it.*

---

## 🎯 THE MISSION

**Build the definitive ranking of SERIALIZED NARRATIVE DRAMAS.**

---

## ⚠️ CRITICAL RULES

NEVER USE THE CHROME EXTENTION FOR BROWSERS. ITS TERRIBLE!!

### 1. SERIALIZED ONLY (No Episodics)

**INCLUDE:** Story continues episode to episode (Breaking Bad, The Wire, Succession)
**EXCLUDE:** Procedural/case-of-the-week (House, Law & Order, CSI, NCIS)

Archived procedurals → `archived-procedural.json`

### 2. REGIONAL SCOPE

** ✅ INCLUDE:**
- Western (USA, UK, Canada, Australia, NZ)
- European (Spain, France, Germany, Scandinavia)
- Korean dramas (Goblin, Squid Game)
- Japanese/Chinese dramas

**❌ EXCLUDE:**
- Indian dramas → `archived-indian.json`
- Anime/animation (separate project)

### 3. FOUNDATION SHOWS ARE LOCKED

**97 shows in `00-foundation-list.json` — NEVER change without Josh's explicit approval.**

These are the calibration reference. All other shows are scored BY COMPARISON to these.

### 4. AI SCORING: BE HARSH

| Score | Meaning | Frequency |
|-------|---------|-----------|
| 10 | Perfect | 1 show (GoT S1-4) |
| 9 | Incredible | VERY RARE |
| 8 | Exceptional | 10-20 MAX |
| 7 | Very Good | MOST shows |
| 6 | Good | Above average |
| 5 | Average | Competent |

**Default assumption:** Shows start at 7 and move UP or DOWN based on evidence.

**Top 10 is sacred:** Triple-check before allowing anything above 8.1.

### 5. CRITIQUE AI SCORES

AI-generated scores tend to be inflated. Always compare to foundation:

- Is this show better than Boardwalk Empire? (8.23)
- Is this show better than Deadwood? (8.18)
- If not, it shouldn't score higher.

**Red flags that lower scores:**
- Cancelled/no proper ending → Resolution drops to 4-6
- Only 1-2 great characters → Characters caps at 8
- Comedy/genre show → Expectations adjust
- New/unproven → Cap at 7.5 until finished

---

## 📊 SCORING SYSTEM

### Weights

| Dimension | Weight | What It Means |
|-----------|--------|---------------|
| Characters & Acting | 25% | Ensemble depth, performance quality |
| World Building | 15% | Lived-in world, layers of society |
| Cinematography | 5% | Visual language, shot composition |
| Visual Spectacle | 5% | Production value shown on screen |
| Conceptual Density | 15% | Layers of meaning, rewatch value |
| Narrative Drive | 15% | Propulsive, "one more episode" factor |
| Resolution | 25% | Ending quality — did it stick the landing? |

### Reference Points

| Dimension | 10 (Perfect) | 8 (Exceptional) | 6 (Good) |
|-----------|--------------|-----------------|----------|
| Characters | GoT, The Wire | Better Call Saul | Most shows |
| World | GoT, Expanse | Mad Men | Single-setting |
| Cinematography | True Detective S1 | Breaking Bad | Standard TV |
| Spectacle | Band of Brothers | House of the Dragon | Character dramas |
| Concept | The Wire, Dark | Severance | Procedurals |
| Drive | Breaking Bad | Succession | Slow burns |
| Resolution | Breaking Bad | The Americans | Cancelled shows |

---

## 📁 FILES

```
data/core/
├── 00-foundation-list.json  ← 97 LOCKED shows (calibration reference)
├── ranked.json              ← All ranked shows (431)
├── queue.json               ← Shows waiting to be scored
├── archived-procedural.json ← Episodic shows removed
├── archived-indian.json     ← Indian shows removed
└── 04-DIRECTIVE.md          ← This file

data/shows/
└── index.json               ← Site data (synced from ranked.json)

docs/shows/
└── [slug].html              ← Individual show pages
```

---

## 🔄 WORKFLOW

### Adding New Shows

1. **Check for duplicates** — Search ranked.json first
2. **Compare to foundation** — Find similar shows, check their scores
3. **Score each dimension** — Write breakdown first, score follows
4. **Calculate final** — Weighted average
5. **Update files** — ranked.json, index.json, create HTML
6. **Commit** — Git add, commit, push

### Rescoring AI Shows

When AI scores seem inflated:
1. Find foundation shows of similar genre/era
2. Compare dimension by dimension
3. Apply harshness — most shows belong at 6-7, not 8+
4. Question every 8 or 9

---

## 🚨 COMMON ISSUES

**Site not updating?**
- `git status` → check commits
- `git push origin master` → sync
- Ctrl+F5 on site

**JSON parse errors?**
- Check for BOM (byte order mark): `if (content.charCodeAt(0) === 0xFEFF) content = content.substring(1);`

**index.json cards not showing?**
- Ensure all fields present: `char`, `world`, `cine`, `spect`, `conc`, `drive`, `resol`, `final`, `episodes`

---

## 📊 CURRENT STATUS

| Metric | Value |
|--------|-------|
| Total Shows | 414 |
| Foundation (Locked) | 97 |
| AI-Scored (Need Review) | ~317 |
| Procedurals Archived | 18 |
| Indian Archived | 2 |
| Comedies Archived | 17 |

---

**I run this. Josh dreams it. We build it together.**

*Last updated: 2026-02-25*
*Current pool: 414 serialized dramas*