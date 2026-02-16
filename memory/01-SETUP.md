# 01 — Setup & Server Start
*Get the site running locally*

---

## Step 1: Navigate to Project
```powershell
cd "C:\Users\randl\Desktop\OpenClaw-Workspace\10-Projects\tvshowsranked"
```

## Step 2: Start HTTP Server
```powershell
npx http-server -p 3000 -c-1
```

**Expected output:**
```
Starting up http-server, serving ./
Available on:
  http://192.168.1.100:3000
  http://127.0.0.1:3000
Hit CTRL-C to stop the server
```

## Step 3: Verify Server Running
```powershell
curl http://localhost:3000 -UseBasicParsing | Select-Object -First 3
```

Should show HTML content.

---

## 🔴 NEVER DO THIS

❌ **Don't use PowerShell's `&&`** — it fails  
❌ **Don't run from wrong directory** — can't find index.html  
❌ **Don't use port 8080** — conflicts with other stuff  

---

## ✅ Checklist

- [ ] Server running on port 3000
- [ ] http://localhost:3000 loads in browser
- [ ] Shows display (not blank)

**Next:** Go to `02-BROWSER.md`

---
*Server's hot. Time to wake up the browser.*
