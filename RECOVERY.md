# RECOVERY.md — CyberClaw's Restart Procedure
*When everything goes wrong, start here*

---

## 🚨 System Health Check

Run this FIRST after any crash or restart:

```bash
cd C:\Users\randl\Desktop\OpenClaw-Workspace\10-Projects\tvshowsranked
node scripts/health-check.js
```

If healthy, you'll see:
- Index File: PASS
- HTML Coverage: PASS
- Discovery Files: PASS
- HTML Quality: PASS
- Score Distribution: PASS
- Git Status: PASS

---

## 🔄 Quick Recovery Steps

### 1. Gateway Issues
```bash
openclaw gateway restart
# Wait 10 seconds
openclaw status
```

### 2. Git Sync Issues
```bash
cd C:\Users\randl\Desktop\OpenClaw-Workspace\10-Projects\tvshowsranked
git status
git add -A
git commit -m "Recovery commit"
git push origin master
```

### 3. Data Loss Recovery
Backups are stored in: `backups/backup-[timestamp]/`

To restore from backup:
```bash
# Latest backup
$latest = Get-ChildItem backups | Sort-Object -Descending | Select-Object -First 1
Copy-Item -Recurse -Force $latest\data\* data\
Copy-Item -Recurse -Force $latest\docs\* docs\
```

### 4. Missing HTML Files
If index shows shows without HTML:
```bash
# Check which are missing
$index = Get-Content data/shows/index.json | ConvertFrom-Json
$slugs = $index.shows.slug
$htmlFiles = Get-ChildItem docs/shows/*.html | ForEach-Object { $_.BaseName }
$missing = $slugs | Where-Object { $_ -notin $htmlFiles }
Write-Output $missing
```

---

## 📋 Daily Operations Checklist

When resuming work:

1. **Read HEARTBEAT.md** — Check priorities
2. **Read DIRECTIVE.md** — Remember the mission
3. **Run health check** — Verify system integrity
4. **Check discovery queue** — `data/discovery/candidates.json`
5. **Pick a task** — Score, write, or audit

---

## 🎯 Priority Tasks

### HIGH PRIORITY (Do First)
1. Add shows from discovery candidates
2. Write quality content for shows missing it
3. Standardize HTML format across all shows

### MEDIUM PRIORITY
1. Quality audit of top 20 shows
2. Add streaming availability data
3. Check for broken links

### LOW PRIORITY
1. Performance optimization
2. UI refinements
3. Documentation updates

---

## 🔧 Common Fixes

### Score-circle format missing in HTML
Look for shows with old format and convert:
```html
<!-- OLD -->
<div class="dimension-value">8.5</div>

<!-- NEW -->
<div class="score-circle" style="--score: 85;"><span>8.5</span></div>
```

### Missing show data
Use TMDB API to fetch:
```
API Key: ca9b21cb89de2d1debed1050f603d7ad
Rate limit: 200ms between requests
```

---

## 💾 Backup Schedule

Backups are created automatically by `scripts/backup.js`
- Run before major changes
- Keeps last 10 backups
- Stored in `backups/` directory

---

*Last updated: 2026-02-22*