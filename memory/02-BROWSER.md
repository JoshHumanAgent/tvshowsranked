# 02 — Browser Control (WORKING METHOD)
*How to puppet Chrome — the clean way*

---

## ✅ SIMPLE PATTERN (Memorize This)

```javascript
// Step 1: Open browser + navigate (ONE COMMAND)
browser(profile="openclaw", targetUrl="http://localhost:3000", action="screenshot")
// → Returns screenshot of page

// Step 2: Execute JavaScript
browser(profile="openclaw", targetUrl="http://localhost:3000", action="act", request={"expression":"tvshowsAgent.setWeight('char', 30)","kind":"evaluate"})
// → Runs code on page
```

That's it. No targetId juggling. No separate start/navigate.

---

## 🎯 Three Core Commands

### 1. Screenshot (Verify page state)
```javascript
browser(profile="openclaw", targetUrl="http://localhost:3000", action="screenshot")
```
**Returns:** Image file path

### 2. Evaluate JavaScript (Control the site)
```javascript
browser(profile="openclaw", targetUrl="http://localhost:3000", action="act", request={"expression":"tvshowsAgent.filterGenre('crime')","kind":"evaluate"})
```

**Common evaluations:**
```javascript
// Change weight
tvshowsAgent.setWeight("char", 30)

// Filter by genre
tvshowsAgent.filterGenre("crime")

// Open show detail
tvshowsAgent.openShowDetail("Breaking Bad")

// Scroll to rank
tvshowsAgent.scrollToShow(10)

// Check page ready
tvshowsAgent ? "API Ready" : "Not loaded"
```

### 3. Click Element (rarely needed)
```javascript
browser(profile="openclaw", targetUrl="http://localhost:3000", action="act", request={"kind":"click","ref":"e12"})
```

---

## 🔴 What Broke (Skip These)

❌ `browser(action="start")` then separate `navigate`  
❌ Managing `targetId` across multiple calls  
❌ `snapshot` with refs (works but messy)  
❌ Extension relay (obviously)

**The fix:** Use `targetUrl` directly in each call.

---

## 🔧 Recovery (If stuck)

```powershell
# Kill processes
taskkill /F /IM openclaw.exe
taskkill /F /IM chrome.exe

# Clear stale profiles
Remove-Item -Recurse "$env:USERPROFILE\.openclaw\browser\openclaw" -ErrorAction SilentlyContinue
Remove-Item -Recurse "$env:USERPROFILE\.openclaw\browser\chrome" -ErrorAction SilentlyContinue

# Restart
openclaw gateway start
```

**Then retry screenshot.**

---

## 📋 Complete Working Session

```javascript
// Open site and capture
browser(profile="openclaw", targetUrl="http://localhost:3000", action="screenshot")

// Adjust a weight
tvshowsAgent.setWeight("char", 30)

// Filter shows
tvshowsAgent.filterGenre("drama")

// Open specific show
tvshowsAgent.openShowDetail("Game of Thrones S1-4")

// Scroll somewhere
tvshowsAgent.scrollToShow(5)
```

**Next:** Go to `03-SITE-NAV.md` for all `tvshowsAgent` commands

---
*"One line to open, one line to rule them all."* — Cyberclaw
