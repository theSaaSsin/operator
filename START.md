# B.O.S.S — Single Entry Point

> **One server. One brain. One command.**

```bash
npm run boss
```

That runs `server.js` on `PORT` (default **4000**). Open `http://localhost:4000` — you'll land on the public studio. Login at `/login` (password = `OPERATOR_PASSWORD` from `.env`) to enter the gated Operator app.

Or just double-click **B.O.S.S** on your Desktop (after running `npm run shortcut:install` once).

---

## Why one server?

The whole project is intentionally **one Node process** binding **one port**. Every capability is a route inside `server.js`:

| Surface | Route prefix | Source |
|---|---|---|
| Public landing | `/` `/studio.html` `/assets/*` | `public/` |
| Operator app (gated) | `/operator.html` `/operator.js` | `public/` |
| BOSS chat / agents | `/api/boss/*` | `ai/` |
| Tool Kit | `/api/tools/*` | `tools/` |
| Webhooks (n8n) | `/api/hooks/*` | `automation/webhooks.js` |
| Auth | `/api/auth/*` | `automation/auth.js` |
| Creative templates | `/api/creative/*` | `creative/` |

There is **no second server** on a second port. The earlier draft suggesting a separate `boss-server.js` on port 5050 would have *added* a port conflict, not removed one.

---

## Locked variables (`.env`)

```ini
# Required for chat / agents
ANTHROPIC_API_KEY=sk-ant-...

# Optional providers (router falls back through these)
GROQ_API_KEY=...
OPENAI_API_KEY=...
OOBABOOGA_URL=http://127.0.0.1:5000

# Tools
MODELSLAB_API_KEY=...
FAL_API_KEY=...
UNSPLASH_ACCESS_KEY=...

# Privacy gate
OPERATOR_PASSWORD=pick-something-strong
PRIVATE_MODE=1

# Multi-user (off by default)
BOSS_MULTI_USER=0
BOSS_AUTH_SECRET=long-random-string
OWNER_EMAIL=thesaasguy101@gmail.com

# Webhooks
WEBHOOK_SECRET=long-random-string
WEBHOOK_OUT={"in.lead":["http://localhost:5678/webhook/boss-lead"]}

# Cron tuning
BOSS_CRON_DISABLE=    # comma-list: coach,surface

# Server
PORT=4000
```

All paths and model policy live in `config/boss.config.js`.

---

## Boot output you should see

```
B.O.S.S → http://localhost:4000
  🔒 Private mode ON · password gate active
```

If you see `EADDRINUSE`, something else is already on 4000:

```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <pid> /F
```

---

## Always-on Jarvis loop

The cron module (`automation/cron.js`) starts automatically on boot:
- **every 30 min** → Coach tick (writes `coach_latest` into project-state for the topbar pulse badge)
- **every 24 h** → GitHub repo surface (recommends new tools to integrate)

Disable per-job via `BOSS_CRON_DISABLE=coach,surface`.

---

## Memory Palace

Shared state across Claude / Bolt / local models:

- `memory/project-state.json` — current goal, active/completed tasks, issues, next steps, coach_latest
- `memory/goals.json` — long-running goals
- `memory/decisions.log` — append-only audit trail (every agent call writes here)
- `memory/outputs/` — generated artefacts (lessons, repos, hooks, coach snapshots)
- `memory/users.json` — multi-user store (auto-created on first boot)

---

## Test in 60 seconds

```bash
curl http://localhost:4000/api/health
# {"ok":true,"ts":...}

curl http://localhost:4000/api/boss/state
# full memory palace JSON

curl -X POST http://localhost:4000/api/boss/chat \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"Status check?"}]}'
# {"ok":true,"reply":"...","provider":"anthropic","model":"claude-haiku-4-5-..."}

curl -X POST http://localhost:4000/api/boss/coach/tick
# {"ok":true,"headline":"...","do_now":[...],"vibe":"green"}
```

---

## Step-up to Tauri (later)

When you want a true desktop app with no browser involved, wrap `public/operator.html` in a Tauri window pointing at the local server. The single-port design means Tauri config is one line.
