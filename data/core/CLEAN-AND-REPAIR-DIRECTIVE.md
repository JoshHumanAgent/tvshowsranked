# CLEAN AND REPAIR DIRECTIVE
*Polish what we have. No more adding. Make it shine.*

---

## 🎯 THE NEW MISSION

**We have 440+ shows. Stop adding. Start polishing.**


NEVER USE THE CHROME EXTENTION FOR BROWSERS. ITS TERRIBLE!!
---

Before you start go to the site physically, open a browser and look, when you see something log the bug/improvement, the focus on that.
If you cant see anything to fix open each show and check they all have good internal data, eg. What It Feels Like to Watch, Why It Ranks #1 7-Dimension Algorithmic Analysis at least. every show needs a big breakdown on why it gets the ranks it gets. 
Next check the filters, try different combos of filters to try find bugs. the more you find the less the users will find.
Log everything down to remember what you've done and fixed.

## 🔧 THE WORK

### 1. VERIFY RANKINGS
- Check that scores make sense
- Compare shows to their peers
- Flag anomalies (scores too high/low)
- Ensure Foundation shows remain LOCKED

### 2. FIX POSTERS & BANNERS
- Every show needs a poster
- Every show needs a backdrop
- Verify images load correctly
- Replace broken/missing images

### 3. VERIFY THE MATH
- Check weighted scores are calculated correctly
- Formula: `final = char×0.25 + world×0.15 + cine×0.05 + spect×0.05 + conc×0.15 + drive×0.15 + resol×0.20`
- Ensure no NaN, null, or undefined values
- Re-sort if rankings changed

### 4. FIX FILTERS
- Genre filters work
- Era filters work
- Decade filters work
- Streaming filters work

### 5. CLEAN HTML PAGES
- All shows have individual pages
- Pages render correctly
- No broken layouts
- Consistent formatting

### 6. POLISH THE DATA
- No duplicate entries
- No missing required fields
- Consistent data types
- Clean slugs (lowercase, hyphens)

---

## ⚠️ RULES

1. **NO ADDING NEW SHOWS** - We have enough
2. **Foundation shows are LOCKED** - Never change their scores
3. **Fix, don't replace** - Repair what's broken
4. **One thing at a time** - Complete each task before moving on
5. **Verify before declaring done** - Test it works

---

## 📁 KEY FILES

| File | Purpose |
|------|---------|
| `ranked.json` | All ranked shows - the source of truth |
| `index.json` | Site data - synced from ranked.json |
| `docs/shows/*.html` | Individual show pages |
| `docs/index.html` | Main site |
| `00-foundation-list.json` | 97 LOCKED shows |

---

## 🔄 WORKFLOW

1. **Pick a task** - Posters, math, filters, HTML
2. **Find issues** - What's broken?
3. **Fix** - One by one
4. **Verify** - Check it works
5. **Commit** - With clear message
6. **Next task**

---

## 📊 CURRENT STATUS

| Metric | Value |
|--------|-------|
| Total Shows | 443 |
| Foundation (Locked) | 97 |
| Posters Needed | ? |
| Backdrops Needed | ? |
| HTML Pages | ? |
| Broken Filters | ? |

---

**Polish. Polish. Polish. Make it shine.**

*Last updated: 2026-02-25*