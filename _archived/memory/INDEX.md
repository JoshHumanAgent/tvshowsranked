# Memory Index
*Quick reference for numbered memory files.*

---

## 📂 Reading Order (DO NOT SKIP)

| Order | File | Purpose |
|-------|------|---------|
| **00** | `00-START-HERE.md` | **READ FIRST** — Recovery protocol, emergency commands |
| **01** | `01-SETUP.md` | Start dev server (port 3000) |
| **02** | `02-BROWSER.md` | Browser control (NO EXTENSION!) |
| **03** | `03-SITE-NAV.md` | Navigate site via `tvshowsAgent` API |
| **04** | `04-GIT.md` | Commit, push, deploy |
| **05** | `05-STATUS.md` | Current data, weights, Top 10 |
| **06** | `06-CHANGES.md` | Feature history, what we built |
| **07** | `07-DEBUG.md` | 40 tests passed, bug fixes |

---

## 🚨 Emergency Commands

### Server Won't Start
```powershell
cd "C:\Users\randl\Desktop\OpenClaw-Workspace\10-Projects\tvshowsranked"
npx http-server -p 3000 -c-1
```

### Gateway Broken
```powershell
taskkill /F /IM openclaw.exe
openclaw gateway start
```

### Browser Won't Control
```powershell
Remove-Item -Recurse "$env:USERPROFILE\.openclaw\browser\chrome" -ErrorAction SilentlyContinue
Remove-Item -Recurse "$env:USERPROFILE\.openclaw\browser\openclaw" -ErrorAction SilentlyContinue
```

---

## 🎯 Quick Links

- **Live Site:** https://joshhumanagent.github.io/tvshowsranked/
- **Local Dev:** http://localhost:3000
- **GitHub:** https://github.com/JoshHumanAgent/tvshowsranked

---
*"00 → 07. Follow the numbers. Stay alive."* — Cyberclaw
