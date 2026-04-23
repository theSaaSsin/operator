# TheSaaSsin Operator Panel

End-to-end **lead → pitch → close** studio for SaaS operators. A local-first workbench that turns cold signal into booked calls without a patchwork of SaaS tools.

> Proprietary. Not accepting external contributions.

---

## What it does

- **Lead feed** — surfaces buying-intent signals from public sources, scored and ranked
- **Brand engine** — one-click brand kits (logo, palette, type, social images)
- **Template studio** — premium landing-page templates, swappable content blocks
- **AI copy** — deal-specific messaging and outreach drafting (Groq)
- **Deploy** — one-click publish to Cloudflare Pages
- **Desktop shell** — Tauri wrapper for macOS, Windows, Linux

## Status

Active development. Phase 2 shipped — stronger intent detection, comment scraping, scoring refinement. Phase 3 on deck.

## Stack

Node · Express · Vanilla JS front-end · Supabase · Groq · Cloudflare Pages · Tauri · Puppeteer

## Architecture

```
operator/
├── server.js                # Express server — routes, scoring, integrations
├── public/                  # Static front-end: dashboard, modules, assets
├── variants/                # Template and brand variants
├── TheSaaSsin-launch.vbs    # Windows one-click launcher
└── package-lock.json
```

## Running locally

```bash
npm install
node server.js
# open http://localhost:3000
```

Windows shortcut: double-click `TheSaaSsin-launch.vbs`.

## License

Proprietary. All rights reserved © TheSaaSsin.

---

Built and maintained by [@theSaaSsin](https://github.com/theSaaSsin).
