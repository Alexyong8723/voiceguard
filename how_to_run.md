# 🚀 VoiceGuard — How to Run (Every Time)

## Prerequisites (first-time only)
- Python packages installed: `pip install fastapi uvicorn python-multipart torch transformers librosa pydub`
- Node packages installed: `npm install`
- Supabase `audit_logs` migration run in the SQL Editor

---

## Every time you want to start VoiceGuard

### Terminal 1 — Python API

```powershell
cd "c:\Users\User\Documents\sem 2\FYP 2\voiceguard"
$env:VOICEGUARD_INTERNAL_SECRET = "vg_a3f8d92c1e4b7056f3a21d8e9c0b5472f6d1e3a8c2b9f7d4e0a5c8b3f1e6d2"
python api_server.py
```

✅ You should see:
```
[api_server] Model loaded ✓
[api_server] Internal token configured ✓
INFO: Uvicorn running on http://127.0.0.1:8000
```

---

### Terminal 2 — Next.js App

```powershell
cd "c:\Users\User\Documents\sem 2\FYP 2\voiceguard"
npm run dev
```

✅ You should see:
```
▲ Next.js 16.2.4 (Turbopack)
- Local: http://localhost:3000
✓ Ready in ~1500ms
```

Then open **http://localhost:3000** in your browser.

---

## One-command shortcut (both at once)

```powershell
cd "c:\Users\User\Documents\sem 2\FYP 2\voiceguard"
$env:VOICEGUARD_INTERNAL_SECRET = "vg_a3f8d92c1e4b7056f3a21d8e9c0b5472f6d1e3a8c2b9f7d4e0a5c8b3f1e6d2"
npx concurrently "python api_server.py" "npm run dev"
```

---

## Quick health check

After both are running, verify everything works:

| Check | URL | Expected |
|---|---|---|
| Python API | http://localhost:8000/health | ❌ `403 Forbidden` (good — token required) |
| Next.js → Python | http://localhost:3000/api/detect | `401` if not logged in |
| App | http://localhost:3000 | Login page |

> [!NOTE]
> `/health` returning `403` from the browser is **correct** — it means the token protection is working. The Next.js app sends the secret header internally.

---

## Stopping

- **Ctrl + C** in each terminal to stop both services.

---

## Common issues

| Problem | Fix |
|---|---|
| `eval() is not supported` error in browser | Normal in old builds — already fixed in `next.config.ts` |
| `/api/detect` returns `503` | Python API is not running — start Terminal 1 first |
| `/api/detect` returns `401` | You're not logged in — sign in at `/login` |
| `/api/detect` returns `503` with "Cannot reach Python" | Make sure you set `$env:VOICEGUARD_INTERNAL_SECRET` before running `python api_server.py` |
| Port 3000 already in use | Run `npx kill-port 3000` then `npm run dev` |
| Port 8000 already in use | Run `npx kill-port 8000` then `python api_server.py` |
