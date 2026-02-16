# 04 — Git Workflow
*Commit, push, deploy*

---

## Step 1: Check Status
```powershell
cd "C:\Users\randl\Desktop\OpenClaw-Workspace\10-Projects\tvshowsranked"
git status
```

**Look for:**
- Modified files (red)
- Untracked files (white/red)

---

## Step 2: Stage Changes
```powershell
git add index.html
```

**Or stage everything:**
```powershell
git add .
```

---

## Step 3: Commit
```powershell
git commit -m "Describe what changed"
```

**Good commit messages:**
```powershell
git commit -m "Fix: resolve null pointer in renderShows"
git commit -m "Feature: add episode multiplier toggle"
git commit -m "UI: compact search bar padding"
git commit -m "Bugfix: filterAndRender undefined function"
```

---

## Step 4: Push to GitHub
```powershell
git push origin master
```

**If that fails, try:**
```powershell
git push
```

---

## Step 5: Verify Deploy
GitHub Pages deploys automatically. Check:

**Live site:** https://joshhumanagent.github.io/tvshowsranked/

Takes 1-5 minutes to propagate.

---

## 📦 Emergency: Create Backup Bundle
```powershell
git bundle create backups/tvshowsranked_backup_$(Get-Date -Format "yyyy-MM-dd_HH-mm").bundle --all
```

**Restores with:**
```powershell
git clone backups/tvshowsranked_backup_YYYY-MM-DD_HH-mm.bundle
```

---

## 🚨 Common Git Problems

### "Please tell me who you are"
```powershell
git config --global user.email "you@example.com"
git config --global user.name "Your Name"
```

### Line Ending Issues
```powershell
git config --global core.autocrlf true
```

### Large Files Blocking Push
Check `.gitignore` — should exclude:
- `node_modules/`
- Large data files

### Permission Denied
Check SSH key or use HTTPS.

---

## 🔀 Branch Workflow

**Create feature branch:**
```powershell
git checkout -b feature-new-thing
```

**Work, commit, push:**
```powershell
git add .
git commit -m "Feature: new thing"
git push origin feature-new-thing
```

**Merge to master:**
```powershell
git checkout master
git merge feature-new-thing
git push
```

---

## ✅ Git Checklist

- [ ] `git status` shows expected files
- [ ] `git diff` shows expected changes
- [ ] `git add .` staged
- [ ] `git commit -m "clear message"` committed
- [ ] `git push` pushed
- [ ] Live site reflects changes (wait 2-5 min)

---

## 📝 Remember

**Commit often, push carefully.**

A good commit is a save point you can roll back to.

**Next:** Go to `05-STATUS.md` for current data state

---
*"git commit -m 'fix that thing' is not a commit message. Try harder."* — Cyberclaw
