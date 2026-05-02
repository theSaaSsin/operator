# TheSaaSsin Studio — Ecosystem v1 (canonical)

**Locked:** 2026-05-02
**Reference build:** [`nexu-io/open-design`](https://github.com/nexu-io/open-design) — open-source Claude Design alternative; modular monorepo, BYOK at every layer. We borrow its structural patterns (apps/packages/skills/design-systems/templates/tools), not its code.

---

## The three repos

| Repo | Role | Public? | Status |
|---|---|---|---|
| **`thesaassin`** | Public hub: landing page (live at thesaassin.com), brand, funnel, future client portal | Public | LIVE — homepage shipping |
| **`operator`** (this repo) | Internal control panel: Operator Panel UI, modules, integrations, workflows | Private | v1 in build |
| **`TheSaaSsin-vol1-16-systems`** | Systems library: 16 reusable systems (lead intake, CRO, ads launch, etc.) consumed by `operator` workflows | Public (lead-gen asset) | Pending creation |

---

## Repo `operator` — v1 folder structure (THIS repo)

```
operator/
├── public/                       # existing app shell — Operator Panel UI
│   ├── operator.html             # main app — keep, evolve
│   ├── operator.css              # brand CSS — palette already locked
│   └── operator.js               # client logic — 1,460 lines, in use
├── server.js                     # Node entry — 189 lines
├── TheSaaSsin-launch.vbs         # launcher
├── modules/                      # NEW — feature modules per Operator Panel section
│   ├── clients/                  # client cards, status, last run, next action
│   ├── workflows/                # workflow runner + templates per workflow type
│   ├── assets/                   # asset library (3D / video / audio / copy / pages)
│   └── automations/              # n8n / Make / Zapier flows + status + logs
├── integrations/                 # NEW — adapters per external tool
│   ├── claude/                   # Claude Max API/web wrapper
│   ├── meshy/                    # Meshy 3D model gen
│   ├── monday/                   # Monday.com client tracking
│   ├── crm/                      # generic CRM adapter
│   └── ads/                      # ads API adapter
├── config/                       # NEW — static config consumed by app
│   ├── systems.json              # mapping to 16 systems repo
│   └── workflows.json            # workflow definitions
├── api/                          # NEW — backend (later)
│   └── (placeholder)
├── docs/                         # docs root
│   ├── ECOSYSTEM_v1.md           # this file
│   ├── CLAUDE_MAX_OPERATOR_PROMPT.md  # canonical master prompt
│   ├── architecture/             # internal architecture notes
│   ├── intro-video/              # the Ip Man / cinematic intro work
│   └── (more)
└── variants/                     # legacy variant pages
```

## Repo `thesaassin` — proposed structure (separate repo)

```
thesaassin/
├── index.html                    # landing page (live)
├── CNAME                         # domain
├── robots.txt
├── sitemap.xml
├── studio/
│   └── index.html                # shell that loads Operator Panel
├── systems/
│   └── index.html                # sales page for 16 systems
├── assets/
│   ├── img/
│   ├── 3d/
│   ├── video/                    # ← intro promo MP4s land here
│   └── brand/
└── docs/
    ├── about.md
    └── case-studies.md
```

## Repo `TheSaaSsin-vol1-16-systems` — proposed structure (separate repo)

```
TheSaaSsin-vol1-16-systems/
├── README.md
├── LICENSE
└── systems/
    ├── 01-lead-intake/
    │   ├── system.md
    │   ├── inputs.json
    │   ├── outputs.json
    │   ├── prompt-claude.txt
    │   ├── scripts.js
    │   └── examples/
    ├── 02-offer-clarity/
    ├── 03-cro-audit/
    ├── 04-crm-setup/
    ├── 05-ads-launch/
    └── ... up to 16
```

---

## Where the Ip Man / cinematic video work fits

The intro-video work currently lives at `docs/intro-video/` in this repo. **It does not get thrown away.** It becomes the canonical example of one workflow type — promo video production — and slots into the ecosystem as follows:

| Asset | Lives in v1 | Final home |
|---|---|---|
| `docs/intro-video/PRODUCTION_BIBLE.md` | `operator/docs/intro-video/` | Becomes `operator/modules/workflows/promo-video/BIBLE_TEMPLATE.md` (re-used per client) |
| `docs/intro-video/PROMPTS.md` | same | `operator/modules/workflows/promo-video/PROMPTS.md` |
| `docs/intro-video/scripts/test_dolly.py` | same | `operator/modules/workflows/promo-video/blender/dolly.py` (parameterised) |
| `docs/intro-video/assets/04_renders/` | same | `operator/modules/assets/<client-id>/renders/` |
| Final 60s master MP4 | (when delivered) | `thesaassin/assets/video/intro-2026-05.mp4` |
| The intro-video as a productised workflow | n/a | `TheSaaSsin-vol1-16-systems/systems/17-promo-video/` (becomes system #17 in v2) |

**Decision:** the brand-promo work continues as a workflow inside `operator`. Once we ship v1 of the Ip Man piece, we extract the workflow into the systems library so it's repeatable for any client wanting a brand-promo video.

---

## How the 3 repos talk to each other

```
                      ┌──────────────────────┐
                      │      thesaassin      │
                      │  (public, branding,  │
                      │   funnel, video,     │
                      │     case studies)    │
                      └──────────┬───────────┘
                                 │ embeds
                                 ▼
                      ┌──────────────────────┐
                      │   thesaassin/studio  │
                      │   (loads operator)   │
                      └──────────┬───────────┘
                                 │ iframe / direct
                                 ▼
                      ┌──────────────────────┐
                      │      operator        │
                      │  (control panel,     │
                      │  workflows, assets,  │
                      │   integrations)      │
                      └──────────┬───────────┘
                                 │ reads
                                 ▼
                      ┌──────────────────────┐
                      │ TheSaaSsin-vol1-     │
                      │ 16-systems           │
                      │ (system definitions, │
                      │  prompts, scripts)   │
                      └──────────────────────┘
```

`config/systems.json` in `operator` is the manifest that points at `TheSaaSsin-vol1-16-systems/systems/<n>/system.md` for each. `operator` runs workflows that compose multiple systems.

---

## Next moves (from the user's "your next three moves" plan)

1. **GitHub:** apply folder structures to all 3 repos.
   - ✅ `operator` — done in this commit (modules/, integrations/, config/, api/, docs/architecture/)
   - 🔲 `thesaassin` — separate repo, needs its own PR
   - 🔲 `TheSaaSsin-vol1-16-systems` — needs to be created or restructured separately
2. **Claude Max:** paste `docs/CLAUDE_MAX_OPERATOR_PROMPT.md` content as the system prompt of a new Claude project named **"TheSaaSsin Operator"**.
3. **First workflow:** ask the operator project:
   > "Operator online: design a full 3D parallax sales page workflow for a struggling SaaS founder, using my 16 systems."
   Save the response into `operator/modules/workflows/3d-parallax-sales-page/v1.md`.

After those three: zoom into one workflow end-to-end. Recommended first lock = **3D Parallax Sales Page** (the user's flagship in the 90-day plan).

---

## Patterns we're borrowing from `nexu-io/open-design`

| Their pattern | Our application |
|---|---|
| `apps/web` + `apps/desktop` + `apps/daemon` split | `thesaassin` (web) + `operator` (panel) + `operator/api` (daemon, later) |
| `packages/` shared libs | `operator/modules/` shared logic + `TheSaaSsin-vol1-16-systems/` system defs |
| `skills/` composable workflows | `operator/modules/workflows/` |
| `design-systems/` brand-grade kits (72 of them) | `thesaassin/assets/brand/` + Figma library, our brand is locked to one (black + red + grey + 暗殺) |
| `templates/` seed projects | per-system `examples/` folder in `TheSaaSsin-vol1-16-systems` |
| `tools/` build/dev scripts | `operator/scripts/` (later) |
| BYOK at every layer | Free-tier first; Adobe / paid layer optional |
| Pre-flight checklist culture | §13 Creative Review Checkpoints (already in intro-video bible) |

We are NOT cloning their code. We're stealing the discipline of their structure.
