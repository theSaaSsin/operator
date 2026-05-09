# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Run / develop

```bash
node server.js          # starts on http://localhost:4000  (NOT 3000 — README is wrong)
```

There is no `package.json`, no build step, no test suite, and no lint config. `package-lock.json` is empty. Do not introduce `npm install` workflows unless the user asks — the project is intentionally dependency-free.

The server requires a `data/` directory next to `server.js` containing three seed files, otherwise the POST/PATCH routes crash on `db.clients.push` / `db.leads.push` / `db.queue.push` (because `readJSON` swallows missing-file errors and returns `{}`). Seed shape:

```
data/clients.json         { "clients": [] }
data/leads.json           { "leads":   [] }
data/outreach_queue.json  { "queue":   [] }
```

`data/*.json` is gitignored — it holds live customer data and must stay local.

## README vs. reality

`README.md` advertises a stack that is **not in the code**: Express, Supabase, Groq, Cloudflare Pages, Tauri, Puppeteer. The actual implementation is a single pure-Node `http` server with zero dependencies and a vanilla-JS frontend. Treat the README as marketing/roadmap copy, not as a description of the current code. If a task references one of those integrations, ask the user whether to add it — it isn't there yet.

## Architecture

Two-layer app, file-as-database:

- **`server.js`** — ~120 lines. A `ROUTES` table keyed by `"METHOD /path"` handles `/api/clients`, `/api/leads`, `/api/outreach` (GET / POST / PATCH). Anything else falls through to a static-file handler rooted at `public/`, with `/` rewriting to `/operator.html`. Persistence is `JSON.parse`/`JSON.stringify` round-trips against the files in `data/`. `Date.now()` is used as the primary key on inserts.
- **`public/operator.{html,css,js}`** — the entire SPA. Three panels (Client Creator, CRM, Outreach Queue) toggled by `.nav-item[data-panel]`. The frontend hits `http://localhost:4000/api` as an absolute URL (see `const API` at the top of `operator.js`) — if you change the server port, update that constant too.

The interesting code in `operator.js` is the **niche intelligence engine** (~`getNicheProfile` onward, ~line 337). It keyword-matches the user's `niche + offer` text against hardcoded profiles (plumber, electrician, etc.) and returns a `{ audience, scenarios, painPoints, outcomes, headline, subline, cta, proof, form }` object that drives every downstream generator: `buildLandingPage`, `buildOutreachSequence`, `buildCRMStructure`, `buildOfferDefinition`, `buildPackageSummary`. Tone is layered on top via `applyTone(profile, tone)`. When adding a new niche, extend `getNicheProfile` and (if needed) `getNicheImage` — generators consume the profile shape, so nothing else has to change.

Clicking **Generate** on the Client Creator panel: builds the landing page in-memory, writes the page to a sandboxed `<iframe>` via `doc.write` (see `showPreview`), POSTs each outreach message to `/api/outreach`, and PATCHes the selected client with `systems = { landingPage, outreach, crm, generatedAt }`. The CRM and offer-definition objects are only `console.log`'d — they are not persisted server-side beyond what's embedded in `client.systems`.

`variants/` is independent of the operator app — three hand-tuned landing-page HTMLs (`v1`/`v2`/`v3`) plus `preview.html`, an iframe switcher used to A/B-compare them visually. Editing operator generators does not affect these files and vice-versa.

## Conventions worth knowing

- HTML strings are user-data-laden; the existing code escapes via the `esc()` helper at the bottom of `operator.js`. Use it for any new field rendered into innerHTML.
- The PATCH `/api/clients` route does a shallow `{ ...c, ...data }` merge — nested objects like `systems` are replaced wholesale, not deep-merged.
- `TheSaaSsin-launch.vbs` is a Windows convenience launcher with a hardcoded path (`C:\Users\joshu\...`). It is the user's personal launcher, not portable — don't "fix" the path unless asked.
- The project is proprietary and not accepting external contributions (per README). Don't add open-source-style contribution scaffolding (CONTRIBUTING.md, issue templates, etc.).
