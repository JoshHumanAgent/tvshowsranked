# ⚠️ START HERE — TV Shows Ranked Master Memory
*Read this first. Every. Single. Time.*

**Last Updated:** 2026-02-17  
**Wipe Count:** Lost track  
**Current Status:** ✅ FULLY OPERATIONAL

---

## 🔴 CRITICAL WARNING

**NEVER USE `profile=chrome` OR THE CHROME EXTENSION RELAY.**

It is broken. It crashes. It leaks memory. It wastes hours of your life.

**ALWAYS USE `profile=openclaw`** — isolated Chrome instance, direct CDP control.

---

## 📋 Recovery Protocol (After Wipe)

**DO THIS FIRST:**

1. **Read `SELF.md`** — remember who the hell you are (Cyberclaw)
2. **Read this file** — you're doing that now, good
3. **Read `01-SETUP.md`** — start the server
4. **Read `02-BROWSER.md`** — open the site
5. **Read `03-SITE-NAV.md`** — puppet the UI
6. **Read `04-GIT.md`** — push changes

**STOP.** Don't skip steps. Future-you will thank present-you.

---

## 📁 Memory File Guide

| Order | File | Purpose |
|-------|------|---------|
| 00 | `00-START-HERE.md` | **This file — read first** |
| 01 | `01-SETUP.md` | Start dev server (port 3000) |
| 02 | `02-BROWSER.md` | Browser control commands |
| 03 | `03-SITE-NAV.md` | Navigate tvshowsranked UI |
| 04 | `04-GIT.md` | Commit and deploy |
| 05 | `05-STATUS.md` | Current data & weight config |
| 06 | `06-CHANGES.md` | Change log & feature history |
| 07 | `07-DEBUG.md` | Tested fixes & edge cases |

---

## 🚨 Quick Emergency Commands

### Site Won't Load
```powershell
cd "C:\Users\randl\Desktop\OpenClaw-Workspace\10-Projects\tvshowsranked"
npx http-server -p 3000 -c-1
```

### Gateway Broken
```powershell
taskkill /F /IM openclaw.exe
taskkill /F /IM chrome.exe
openclaw gateway start
```

### Browser Control (Working)
```javascript
// Screenshot to verify
browser(profile="openclaw", targetUrl="http://localhost:3000", action="screenshot")

// Control via JavaScript
browser(profile="openclaw", targetUrl="http://localhost:3000", action="act", request={"expression":"tvshowsAgent.setWeight('char', 30)","kind":"evaluate"})
```

**Full workflow in `02-BROWSER.md`**

---

## 📊 Current State Snapshot

| Item | Value |
|------|-------|
| **Live Site** | https://joshhumanagent.github.io/tvshowsranked/ |
| **Local Dev** | http://localhost:3000 |
| **GitHub** | JoshHumanAgent/tvshowsranked |
| **Shows** | 109 ranked |
| **Gateway** | localhost:18789 |
| **CDP Port** | 18800 |

### Weight Configuration (CURRENT)
```
Characters & Acting:        25%  [char]
World Building:             15%  [world]
Cinematography:              5%  [cine]
Visual Spectacle:            5%  [spect]
Conceptual Density:         15%  [conc]
Narrative Drive:            15%  [drive]
Narrative Path & Resolution: 20%  [resol]
                           ---
TOTAL:                     100% ✅
```

---

## 🦞 If You're Lost

**Read the next file: `01-SETUP.md`**

Don't wing it. Don't skip. Don't think "I got this."

The lobster who follows the protocol survives.

---
*"Your chaos is my continuity."* — Cyberclaw
