# HANDOFF — TheSaaSsin Operator (ship tonight)

**Date:** 2026-04-17
**Current branch:** `feature/v0.3-creator-system` (pushed to origin)
**Backup:** `backup/pre-v0.3` (pushed)
**Other critical branch:** `feature/lead-feed` (has Cursor's pain-profile tagging work — NOT merged yet)

---

## LOCKED BEHAVIOUR (non-negotiable)

Operator is a **decision-execution engine**, NOT a chat bot. Every response:

```
DIAGNOSIS → OPPORTUNITY → ACTION PLAN → OUTPUT MESSAGE → NEXT STAGE
```

Memory file: `C:\Users\joshu\.claude\projects\C--Users-joshu\memory\operator_v1_locked.md`
Plan file: `C:\Users\joshu\.claude\plans\noble-questing-pearl.md`

---

## WHAT'S DONE ON THIS BRANCH

Commits on `feature/v0.3-creator-system`:
- `5992959` Phase 1 — 3-tab preview panel (Preview/Package/Outreach)
- `8bfc9a1` Phase 2 — Creator type + platform system (web/YT/IG/TikTok/LI/X)
- `2617bd6` Phase 3 — Asset Studio (SVG canvas, 8 presets, 4 templates, PNG export)
- `ae66d42` Phase 4 — Dashboard (platform readiness + next actions)
- `7d7c364` Execution Engine panel (diagnosis→action structured output UI)

Files: `public/operator.html`, `public/operator.css`, `public/operator.js`, `server.js`

---

## CRITICAL UNFINISHED WORK (ship tonight)

### 1. Client Creator must generate DELIVERABLES, not just landing pages
User's words: *"the client creator needs to be able to generate and build posts, videos, client demos anything i could pull in as a lead so i can immediately acquire a product to ease their pain point"*

Each scraped lead → Client Creator should output a **demo artefact matched to that lead's pain** (post draft, short video script, demo page, DM script). Not generic. Pain-driven.

### 2. Lead scraper is broken
User: *"was pulling brilliant leads off it before it got f'd up"*
Check `server.js` `GET /api/feed` + `public/operator.js` `analyzePost()`. Compare against `feature/lead-feed` branch — that branch had the working version plus pain tagging.

### 3. Merge pain-profile tagging from `feature/lead-feed`
Cursor implemented this on `feature/lead-feed`. Fields each lead must carry:
- `leadType` — direct / operator / partner (commercial classification — keep)
- `painKey` — one of: `no_clients`, `low_conversions`, `outreach_gap`, `web_presence_gap`, `low_visibility`, `referrals_dried_up`, `time_overwhelm`, `growth_gap` (fallback)
- `painLabel` — human-readable pain
- `painChallenge` — the concrete blocker
- `demoFocus` — what the Client Creator should build to ease it
- `platform`, `subreddit`, `postTitle` — source context

Flow: scrape → `analyzePost()` tags pain → `saveFeedLead()` persists → outreach uses `painChallenge` → Client Creator `demoFocus` drives artefact generation.

Touchpoints:
- `public/operator.js` → `analyzePost()`, `saveFeedLead()`
- `server.js` → `POST /api/leads`, `POST /api/outreach`

### 4. Optional: Serper API for wider sources
`data/config.json` `serperKey` unlocks LinkedIn / Facebook / Quora / ProductHunt / IndieHackers / Upwork / Fiverr / Maps / directory scraping.

---

## RECOMMENDED NEXT STEPS

1. `git checkout feature/lead-feed` — diff against `feature/v0.3-creator-system` for the `analyzePost` + `saveFeedLead` pain-tag code
2. Cherry-pick or port the pain-tagging into `feature/v0.3-creator-system`
3. Extend Client Creator generator: branch on `painKey` → build deliverable (post / video script / demo page / DM)
4. Wire lead card → "Build demo for this lead" button → Client Creator prefilled with `demoFocus` + `painChallenge`
5. Verify scraper returns results again; compare headers/query shape to `feature/lead-feed`

**User wants this shipped tonight. Do not chat — execute.**
