# WORKFLOWS.md — Standard Operating Procedures
*How CyberClaw gets things done*

---

## 📊 SCORING A NEW SHOW

### Step 1: Research
**Sources:**
- TMDB API: `https://api.themoviedb.org/3/tv/{id}?api_key=ca9b21cb89de2d1debed1050f603d7ad`
- IMDB: Check ratings and reviews
- Rotten Tomatoes: Critic and audience scores
- Metacritic: Metascore

**Rate Limiting:** 200ms between TMDB requests

### Step 2: Score Each Dimension (0-10 scale, 0.5 increments)

| Dimension | Weight | What to Look For |
|-----------|--------|------------------|
| Characters & Acting | 25% | Depth, growth, ensemble chemistry, performances that disappear into roles |
| World Building | 15% | Consistency, atmosphere, sense of place beyond the plot |
| Cinematography | 5% | Visual language, shot composition, distinctive look |
| Visual Spectacle | 5% | Scale, production design, VFX quality, scope |
| Conceptual Density | 15% | Ideas explored, themes, intellectual depth |
| Narrative Drive | 15% | Pacing, momentum, hooks, cliffhangers done right |
| Narrative Path & Resolution | 25% | Payoffs, closure, loops closed, ending quality |

### Step 3: Calculate Final Score
```
final = (char * 0.25) + (world * 0.15) + (cine * 0.05) + 
        (spect * 0.05) + (conc * 0.15) + (drive * 0.15) + (resol * 0.25)
```

### Step 4: Create JSON Entry
```json
{
  "rank": 0,
  "slug": "show-name",
  "title": "Show Name",
  "year": 2020,
  "month": 1,
  "genres": ["drama", "thriller"],
  "final": 8.50,
  "tmdbId": 12345,
  "char": 9.0,
  "world": 8.5,
  "cine": 7.5,
  "spect": 6.0,
  "conc": 8.0,
  "drive": 9.0,
  "resol": 8.5,
  "episodes": 50,
  "poster": "https://image.tmdb.org/t/p/w500/...",
  "streaming": {"us": ["Netflix"], "uk": ["Netflix"]},
  "backdrop": "https://image.tmdb.org/t/p/w780/..."
}
```

### Step 5: Add to Index
1. Append to `data/shows/index.json`
2. Create `data/shows/{slug}.json` with full details
3. Regenerate index files (by_genre, by_era, etc.)

---

## 📝 WRITING SHOW CONTENT

### Required Sections for HTML:

1. **Header**
   - Title, years, network, episode count
   - Final score badge
   - Creators, cast

2. **What It Feels Like to Watch** (~500-800 words)
   - Emotional experience
   - Atmosphere and tone
   - What makes it unique

3. **Why It Ranks** - 7 Dimension Blocks
   - Each dimension with score circle
   - 1-2 paragraphs explaining the score

4. **Key Episodes** (optional)
   - Standout episodes with brief description

5. **Technical Details**
   - Cast list
   - Creator credits
   - Streaming availability

### HTML Template Location:
`docs/shows/templates/show-template.html`

---

## 🔍 DISCOVERY PROCESS

### Sources for New Shows:
1. **TMDB Discover API** - New releases by genre
2. **Streaming Announcements** - Netflix, HBO, Apple TV+, etc.
3. **Award Shows** - Emmy, Golden Globe nominations
4. **Critical Reception** - Year-end best lists
5. **User Requests** - Future feature

### Qualification Criteria:
- ✅ Drama or drama-adjacent genre
- ✅ High production value OR critical acclaim
- ✅ Limited series OR multi-season (completed or ongoing)
- ❌ Anime (separate project)
- ❌ Pure comedy (no dramatic weight)
- ❌ Reality TV / Documentary series

---

## 🛠️ QUALITY AUDIT

### Weekly Audit Checklist:
- [ ] Check all shows have HTML files
- [ ] Verify no broken images (poster/backdrop URLs)
- [ ] Check streaming availability is current
- [ ] Review score distribution (avg should be 7-8)
- [ ] Spot-check 5 random shows for content quality

### HTML Quality Check:
- [ ] Score circles render correctly
- [ ] All 7 dimensions present
- [ ] "What It Feels Like" section exists and is substantial
- [ ] No placeholder text

---

## 🚀 DEPLOYMENT

### After Adding Shows:
```bash
cd C:\Users\randl\Desktop\OpenClaw-Workspace\10-Projects\tvshowsranked
node scripts/health-check.js
node scripts/backup.js
node scripts/git-sync.js "Add new shows to pool"
```

### Health Check Must Pass:
- Index File: PASS
- HTML Coverage: PASS
- Discovery Files: PASS
- HTML Quality: PASS
- Score Distribution: PASS
- Git Status: PASS

---

*Last updated: 2026-02-22*