# AGENTS.md

## Cursor Cloud specific instructions

### Overview

TheSaaSsin is a zero-dependency Node.js SaaS operator panel (client management + marketing automation). There is no build step, no package manager install, and no external database.

### Running the application

```bash
mkdir -p data
node server.js
```

The server listens on **port 4000** and serves both the REST API (`/api/*`) and the static frontend (`public/`).

The `data/` directory must exist before the server writes to it. The server reads/writes three JSON files: `data/clients.json`, `data/leads.json`, `data/outreach_queue.json`. If they don't exist, `readJSON` returns `{}` gracefully, but the first write will fail if `data/` itself is missing. Seed them with empty structures:

```bash
echo '{"clients":[]}' > data/clients.json
echo '{"leads":[]}' > data/leads.json
echo '{"queue":[]}' > data/outreach_queue.json
```

### Key facts

- **Zero npm dependencies.** `package-lock.json` exists but has empty packages. No `npm install` needed.
- **No `package.json`.** Only `package-lock.json` is present (lockfileVersion 3, empty packages).
- **No linter/test framework configured.** There are no ESLint, Jest, or other tooling configs in the repo.
- **Frontend is vanilla HTML/CSS/JS** served statically from `public/`. No transpilation or bundling.
- **`data/` is gitignored.** JSON data files are local-only.
- **Font Awesome is loaded from CDN** (`cdnjs.cloudflare.com`). Icons won't render without internet, but the app still functions.
- **`variants/`** contains static HTML landing page variants with a preview switcher (`variants/preview.html`).
