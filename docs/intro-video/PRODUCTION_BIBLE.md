# THESAASSIN — INTRO VIDEO
## Production Bible v1.0

**Project codename:** OPERATOR-INTRO-01
**Working title:** *TheSaaSsin — Now Operating*
**Format:** 60-second cinematic launch piece + platform cuts
**Client:** TheSaaSsin (internal — Josh)
**Status:** Pre-production / treatment lock

---

## 1. PROJECT BRIEF

### 1.1 Logline
*A hooded operator runs an entire SaaS acquisition machine in a dark room of monitors while a sleeping founder's inbox stays empty.* TheSaaSsin is the operator class that doesn't wait.

### 1.2 Why we're making it
- **Primary use:** Hero video on `thesaassin.com` homepage. First thing a new visitor sees.
- **Secondary use:** Launch ad on X, LinkedIn, YouTube pre-roll, Reddit r/SaaS, IG Reels.
- **Tertiary use:** Embed on the Operator Panel onboarding screen so new users see the why before they see the what.
- **Pitch demo:** Plays at the start of every client call. Sets tone in 60 seconds without you saying a word.

### 1.3 Audience
- **Primary:** Solo SaaS founders, indie operators, early-stage agency owners — drowning in funnel work.
- **Secondary:** Growth contractors evaluating tools, prospective TheSaaSsin clients.
- Aspirational viewer is someone who watches Mr. Robot, reads Pieter Levels, follows MKBHD's production values.

### 1.4 Success criteria
| Metric | Target |
|---|---|
| Avg watch time on landing page | ≥ 35s of 60s |
| Click-through to sign-up CTA | ≥ 8% |
| Social share rate (X) | ≥ 2% |
| "Wait what is this" comments / DMs | qualitative — should be the dominant reaction |

### 1.5 Distribution & deliverables
| Cut | Aspect | Length | Format |
|---|---|---|---|
| Master | 16:9 | 60s | 1080p H.264, SDR |
| Hero (homepage) | 16:9 | 60s | WebM + MP4, muted-autoplay safe (text on screen for sound-off) |
| Reels / Shorts / TikTok | 9:16 | 60s + 15s teaser | 1080×1920 H.264 |
| LinkedIn / Square IG feed | 1:1 | 30s | 1080×1080 H.264 |
| YouTube long-form | 16:9 | 60s | 4K H.265 if achievable, else 1080p |
| Email banner GIF | 16:9 | 6s loop | <2MB GIF |
| Press still | 16:9 | static | 3840×2160 PNG |
| Audio-only podcast bumper | n/a | 15s | WAV 48kHz stereo |

### 1.6 Constraints
- **Budget:** £0 cash, $0 cloud spend if achievable. Free tools or trial tiers only for v1.
- **Crew:** 1 operator (Josh). Claude as creative collaborator + asset orchestrator.
- **Timeline:** 5 working days from script-lock to delivered master.
- **Quality bar:** Apple-event polish on a Pixabay-music budget. If it looks like a Fiverr explainer we tear it up and start over.
- **Brand:** Deep-ink palette, mono type, no emoji, builder voice. **Ever.**

### 1.7 Brand palette (locked — inherited from `public/operator.css`)
| Role | Hex | Use |
|---|---|---|
| Ground | `#0a0a0f` | Base background, deepest shadows |
| Surface | `#0f0f17` / `#121218` | Card / panel surfaces, mid-shadow |
| **Accent** | **`#ff2a2a`** | **Single brand-red glow — the only saturated colour on screen** |
| Accent dim | `rgba(255,42,42,0.12)` | Faint glows, secondary monitors in background |
| Accent edge | `rgba(255,42,42,0.35)` | Sigil edge bloom, key-light rim |
| Text | `#f0f0f5` | Logotype, near-white UI elements |
| Muted | `#6b6b80` | Inactive UI, vignette transitions |

**Discipline rule:** every shot must contain `#0a0a0f` and `#ff2a2a` and *nothing* warm or green. If a render comes back with cyan, blue, or any other hue we re-prompt. The brand reads black + red or it doesn't read.

---

## 2. CREATIVE TREATMENT

### 2.1 World
A near-future operator's command room. Off-grid, deliberately analog in places (real keyboard, real mug of black coffee), digital where it matters (walls of monitors, holographic data overlays). Not Hollywood-glossy — utilitarian. Closer to a SOC analyst's desk than a Tony Stark lab. The room exists *outside* normal SaaS founder reality — a glimpse of how the work could be done.

### 2.2 Tone
- **Confidence over hype.** No "10X your business." No exclamation marks. No emoji.
- **Quiet menace.** The operator isn't intimidating; the *work getting done* is.
- **Builder honesty.** What's on screen is recognisably real product UI, not faked dashboards. The viewer's brain registers "wait, that's actually working."

### 2.3 Visual references
| Ref | What we're stealing |
|---|---|
| *The Social Network* (2010) — opening | Dialogue cadence, restrained palette, subliminal speed |
| *Mr. Robot* — title sequence | Mono type, asymmetric framing, code-as-character |
| *Sicario* — *The Beast* sequence | Tension via stillness, percussion as menace |
| *Death Stranding* — Kojima trailers | Hooded silhouette, otherworldly tech, lonely competence |
| *Ghost in the Shell* (1995) — opening | Dissolves between data and body |
| Apple — "Privacy. That's iPhone." | Tight VO/visual sync, blacks crushed but not muddy |
| *Hereditary* trailer (A24) | One-word VO punches landing on cuts |

### 2.4 Sound references
- *The Social Network* — *In Motion* (Reznor/Ross)
- *Sicario* — *The Beast* (Jóhannsson)
- *Mr. Robot* — *Hack The Planet* (Mac Quayle)
- Pixabay search seeds: `cinematic minimal pulse`, `low synth tension`, `builder operator score`

### 2.5 Performance notes (VO)
- Read **under**, never over. Bored authority.
- Pause on punctuation. Trust silence.
- No smiles in voice. No upturned questions. No theatrical breath.
- Reference: a pilot calmly reporting an engine failure.

---

## 3. SCRIPT — Final draft v1.0

```
[0–3s]  BLACK. Mono cursor types: > initiate.protocol("acquire_client")
SFX:    Single mechanical-keyboard keystroke per character. No music yet.
VO:     "There's a version of your business..."

[3–8s]  Hooded figure at a terminal. Dark room. Walls of monitors —
        each a different SaaS dashboard in motion.
SFX:    Low room-tone hum. Music enters at 5s — single sub-pulse.
VO:     "...where the lead is found. The message is written.
        The call is booked."

[8–15s] Close on monitors:
         (a) LinkedIn profile resolves into a lead card.
         (b) AI writes a personalised message in real time.
         (c) Calendar invite lands.
         (d) Slack notification: "Demo confirmed."
SFX:    Soft UI ticks per resolve. Music: pulse continues, second layer enters.
VO:     "The deal is signed. And you didn't touch a thing."

[15–22s] Pull back. Hundreds of glowing terminals — array stretching to vanishing
         point. One per client. Each running its own sequence.
SFX:    Music: bass enters. Room becomes a cathedral.
VO:     "Most founders are still refreshing their inbox. Hoping."

[22–30s] Hard cut. Daylight. A founder asleep at a desk. Inbox: 0 unread.
         Lead spreadsheet untouched. The cursor blinks alone.
SFX:    Cut to silence — only the cursor blink. 2-second hold.
VO:     "TheSaaSsin doesn't hope."

[30–40s] Cut back to the operator's room. Walls erupt — leads streaming in,
         sequences firing, calendar slots filling, deal counters incrementing.
         Visual orchestra. No frenzy. Precision.
SFX:    Music returns full. Percussion enters. Each VO word lands on a hit.
VO:     "Brand. Leads. Outreach. Deck. Demo. Deal.
        One operator. Every system. Always running."

[40–50s] The hooded figure stands. Turns to camera. Pulls back the hood —
         half-mask underneath. Mono-line operator sigil glowing on the
         forehead of the mask.
SFX:    Music drops to single sustained low note. VO front and centre.
VO:     "The work was always going to get done.
        The only question was who's doing it."

[50–58s] Full frame typography:
         THESAASSIN
         ───────
         Operator-class systems for solo builders.
SFX:    Single low percussion hit on logo reveal. Music fades.
VO:     "TheSaaSsin. Now operating."

[58–60s] URL: thesaassin.com — mono, no flourish.
SFX:    Silence. Cursor blink under URL.
```

**Word count:** 73 words. **Speaking time at 0.9× rate:** ~38s of the 60s. Rest is silence, music, sound design.

---

## 4. STORYBOARD / KEY FRAMES

12 hero frames. Each one we render as a still first; the still becomes the cinematographic anchor for the shot.

| # | TC | Frame description | Shot type | Camera move | Length |
|---|---|---|---|---|---|
| F01 | 0:00 | Pure black + green-white mono cursor, 1 line of code | Insert | Locked off | 3s |
| F02 | 0:03 | Wide of operator's command room, figure in centre back-to-camera, monitors wrap around | Establishing wide | Slow dolly in (10%) | 5s |
| F03 | 0:08 | Macro of single monitor — LinkedIn → lead card resolve | ECU | Locked, screen content moves | 1.75s |
| F04 | 0:09:75 | Macro — AI typing a message char by char | ECU | Locked | 1.75s |
| F05 | 0:11:50 | Macro — calendar invite slides in | ECU | Locked | 1.75s |
| F06 | 0:13:25 | Macro — Slack ping "Demo confirmed" | ECU | Locked | 1.75s |
| F07 | 0:15 | Pull back reveal — hundreds of terminals in cathedral array | Wide → Vista | Crane up + back | 7s |
| F08 | 0:22 | Daylight — founder slumped, asleep, empty inbox visible | Medium | Locked, slight push-in on the empty inbox count | 8s |
| F09 | 0:30 | Operator's room re-enters — walls erupt with data | Wide | Crane back down to operator height | 10s |
| F10 | 0:40 | Operator turns to camera, hood comes back, mask + sigil revealed | Medium close | Slow push-in to OTS, stop on mask | 10s |
| F11 | 0:50 | Logotype card — THESAASSIN | Graphic | Locked | 8s |
| F12 | 0:58 | URL card — thesaassin.com | Graphic | Locked, single cursor blink | 2s |

---

## 5. ASSET REGISTER

Every renderable, named, sourced, and tracked. **If it isn't on this list, it doesn't get into the cut.**

### 5.1 Characters
| ID | Name | Description | Source pipeline | Reused in |
|---|---|---|---|---|
| CHR-01 | The Operator (back) | Hooded figure, back to camera, seated at terminal | FLUX → Hunyuan3D → Blender pose | F02, F07, F09 |
| CHR-02 | The Operator (front) | Same figure, turned to camera, hood pulled back, masked, sigil on mask | FLUX dedicated pose | F10 |
| CHR-03 | The Founder | Slumped at desk, daylight, generic startup hoodie | FLUX still only (no 3D needed) | F08 |

### 5.2 Environments
| ID | Name | Description | Source | Reused in |
|---|---|---|---|---|
| ENV-01 | Operator Command Room | Dark, monitor-walled, near-future SOC | FLUX hero plate → Blender extrude for parallax | F02, F07, F09, F10 |
| ENV-02 | Cathedral Terminal Array | Hundreds of operator stations stretching to vanishing point | Same hero plate, Blender array modifier | F07 |
| ENV-03 | Daylight Founder Office | Standard startup desk, window, cold daylight | FLUX still | F08 |

### 5.3 Screen content (real product UI)
**These are screen-recordings of the actual TheSaaSsin Operator Panel, not faked.** This is the asset class that makes the video honest.

| ID | What it shows | Captured how | Used in |
|---|---|---|---|
| UI-01 | LinkedIn profile → lead card resolution | Screen recording of lead-feed flow at 1× | F03 |
| UI-02 | AI writing personalised outreach char-by-char | Record at 1×, slow to 0.85× in edit | F04 |
| UI-03 | Calendar slot filling | Cal.com or Google Calendar embed recording | F05 |
| UI-04 | Slack "Demo confirmed" ping | Slack desktop, live message | F06 |
| UI-05 | Deal counter incrementing | Stripe / Operator Panel dashboard | F09 background |

### 5.4 Graphic / typography
| ID | Description | Source | Used in |
|---|---|---|---|
| GFX-01 | Mono cursor + code line | After Effects / CapCut text | F01 |
| GFX-02 | Operator sigil (the logo, glowing line) | Figma → SVG → After Effects glow | F10, F11 |
| GFX-03 | THESAASSIN logotype card | Figma | F11 |
| GFX-04 | URL card thesaassin.com | Figma / CapCut text | F12 |
| GFX-05 | Lower-third name supers (if used) | Figma template | reserved |

### 5.5 Audio
| ID | Description | Source | Length |
|---|---|---|---|
| VO-01 | Full narration | ElevenLabs (voice TBD) | ~38s active + silences |
| MUS-01 | Cinematic minimal pulse score | Pixabay or Artlist trial | 60s |
| SFX-01 | Mechanical keystroke per character | Freesound CC0 | 1s reusable |
| SFX-02 | Room tone — operator's room | Freesound | 60s loop |
| SFX-03 | UI ticks (4 variants, one per resolve) | Freesound | 0.3s each |
| SFX-04 | Bass-drop on logo reveal | Pixabay / Splice trial | 1.5s |
| SFX-05 | Cursor blink (silent video, but for podcast cut) | Freesound | 2s loop |

---

## 6. SHOT LIST (master sheet)

| Shot | TC | Description | Lens (virtual) | Camera move | Assets needed | v1.2 Pipeline | Duration | Status |
|---|---|---|---|---|---|---|---|---|
| 01 | 0:00 | Cursor + code on black | n/a | Locked | GFX-01 | CapCut text (manual) | 3s | not started |
| 02 | 0:03 | Establishing wide of command room | 35mm equiv | Slow dolly in | CHR-01, ENV-01 | FLUX (Chrome MCP) → Meshy/Hunyuan → **Blender MCP** scripted dolly | 5s | not started |
| 03 | 0:08 | LinkedIn → lead card | macro 90mm | Locked | UI-01 | **Claude Preview MCP** (real Operator Panel capture) | 1.75s | not started |
| 04 | 0:09:75 | AI writing message | macro | Locked | UI-02 | **Claude Preview MCP** | 1.75s | not started |
| 05 | 0:11:50 | Calendar lands | macro | Locked | UI-03 | **Claude Preview MCP** | 1.75s | not started |
| 06 | 0:13:25 | Slack ping | macro | Locked | UI-04 | **Claude Preview MCP** + Slack capture | 1.75s | not started |
| 07 | 0:15 | Cathedral terminal array | 24mm wide | Crane up + back | CHR-01, ENV-02 | **Blender MCP** array modifier + scripted crane | 7s | not started |
| 08 | 0:22 | Sleeping founder | 50mm | Locked, push-in | CHR-03, ENV-03 | FLUX (Chrome MCP) → CapCut Ken Burns | 8s | not started |
| 09 | 0:30 | Walls erupting with data | 35mm | Crane back down | ENV-01 + UI-05 + motion gfx | **Blender MCP** crane down + CapCut motion overlays | 10s | not started |
| 10 | 0:40 | Operator turns, hood off, mask reveal | 50mm | Push-in | CHR-02 | FLUX hero pose + (optional) **`voice-avatar` skill** for lipsync if speaking | 10s | not started |
| 11 | 0:50 | Logotype card | n/a | Locked | GFX-03 | **Figma MCP** → SVG → CapCut | 8s | not started |
| 12 | 0:58 | URL card | n/a | Locked | GFX-04 | **Figma MCP** → SVG → CapCut | 2s | not started |

---

## 7. TECH PIPELINE

### 7.1 Tool stack v1.2 — orchestrated (locked)

**Upgrade:** every manual stage that has an Anthropic skill or MCP equivalent now runs through that — Claude orchestrates the asset pipeline instead of you clicking through 6 web UIs.

| Stage | Primary tool | Driver | Manual fallback | Why this beats v1 |
|---|---|---|---|---|
| Brief → asset plan | `anthropic-skills:operator-pipeline` | Claude | Hand-write each prompt | Skill is purpose-built for ad-grade hero promos; encapsulates brand-hero + image-to-3d + voice-avatar + cutter/tweaker/enhancer/showcase as one orchestration |
| Image gen | FLUX.1 Krea dev (HF Space) | Chrome MCP | Manual prompt iteration | Same model, but Claude can drive the prompt cycle through the HF Space UI |
| Image-to-3D | Meshy free / Hunyuan3D-2 / TRELLIS | Chrome MCP + manual upload | Manual web upload | API call when token available; UI-driven via Chrome MCP otherwise |
| 3D scene assembly | **Blender MCP** (drives Blender 5.1) | Claude writes Python | Manual Blender click-through | Replaces all manual scene setup. Camera moves, lights, array modifier, render queue — all scripted. Reproducible across shots. |
| Voice + lipsync | `anthropic-skills:voice-avatar` | Claude | ElevenLabs alone | Adds lipsync option for F10 (operator speaking on camera). Backends: Hedra+ElevenLabs (closed) or LivePortrait+MegaTTS (open). |
| Music | Pixabay Music | Manual | — | No skill replaces this; license + taste call |
| SFX | Freesound (CC0 only) | Manual | — | Same |
| Screen capture (real UI) | **Claude Preview MCP** | Claude | OBS Studio | Run Operator Panel dev server, capture clean shots programmatically. Repeatable, perfect resolution. |
| Edit / colour / final | CapCut Web | Manual (Josh) | — | No skill replaces — taste call. CapCut still does picture-lock. |
| Typography / sigil | **Figma MCP** | Claude | Figma manual | SVG generated and exported via MCP. Type cards (GFX-03/04) built same way. |
| Static deliverables (press still, email banner) | `anthropic-skills:canvas-design` | Claude | Manual Figma | Skill is built for beautiful PNG/PDF artifacts — handles press still and email banner GIF source frame |
| Theme consistency on derivatives | `anthropic-skills:theme-factory` | Claude | Manual | Storyboard PDF, pitch deck, press kit all use one theme — black + red, mono — locked once, applied everywhere |
| Pitch deck companion | `anthropic-skills:pptx` | Claude | Manual Keynote | The bible becomes a client-facing deck on demand |
| Storyboard / treatment PDF | `anthropic-skills:pdf` | Claude | Manual | Shareable PDF artifact of §3 + §4 + §5 for any external review |
| Backup / source control | Git + Cloudflare R2 (post-v1) | Bash | Manual upload | Same as v1 |
| (Future) one-shot render | `anthropic-skills:skill-creator` → custom skill | Claude (creates skill) | n/a | Bundles the full chain into a single project skill so episode 2 of the brand series ships from a one-line brief |

### 7.1.1 What "Claude orchestrates" actually means in practice

For each shot in §6, the v1.2 flow is:
1. Claude opens the FLUX HF Space tab via Chrome MCP, types the locked prompt from `PROMPTS.md`, runs it, downloads the image.
2. Claude calls Meshy / Hunyuan via API or drives the upload via Chrome MCP.
3. Claude writes the Blender Python script (camera, lights, animation, render queue) and executes it via Blender MCP.
4. Renders land in `assets/04_renders/`.
5. UI captures: Claude runs Operator Panel via Preview MCP, captures the exact frames we need.
6. Voice: Claude calls voice-avatar skill with the script + voice direction.
7. Sigil + type cards: Claude builds them in Figma via Figma MCP, exports SVG.
8. You assemble the rough cut in CapCut. Picture-lock by you. Music + grade by you.

Result: ~70% of asset production becomes scripted and reproducible. You stay in CapCut for the parts that need taste — pacing, music selection, final grade.

### 7.2 File handoff conventions
**Naming:** `[shotID]_[assetID]_[version]_[YYYYMMDD].[ext]`
Example: `S07_ENV-02_v003_20260502.png`

**Folder structure (in `docs/intro-video/assets/`):**
```
assets/
  01_hero-plates/        # FLUX outputs
  02_3d-meshes/          # GLB files from Meshy/Hunyuan
  03_blender-projects/   # .blend files
  04_renders/            # Per-shot rendered MP4/PNG sequences
  05_screen-captures/    # OBS recordings of real UI
  06_voice/              # ElevenLabs WAV exports
  07_music/              # Licensed score tracks
  08_sfx/                # Sound effects library
  09_graphics/           # Figma exports, type cards
  10_master/             # Final cuts per delivery format
```

### 7.3 Project hygiene
- Every asset has a row in the asset register before it lives on disk.
- No "v_FINAL_FINAL.png" — strictly versioned `_v001`, `_v002`, etc.
- Source files (Blender, Figma) live alongside renders.
- Master cuts have a hash in the filename so we can track which version went live.

### 7.4 Backup / version control
- All source assets committed to repo (small ones) or LFS (3D/video).
- Final masters pushed to a Cloudflare R2 bucket (or Drive for v1).
- Git commit after every completed shot, per the project hard rule.

---

## 8. PRODUCTION SCHEDULE

5 working days, single operator. Critical path is the operator character (CHR-01/02) — everything downstream depends on the hero plate landing.

| Day | Block | Output | Owner | Blocked by |
|---|---|---|---|---|
| **Day 1 — Treatment lock + hero plate** | AM | Decision sheet signed off (§12) | Josh | — |
| | PM | CHR-01 hero plate locked (FLUX prompts iterated until right) | Josh + Claude | Decision sheet |
| **Day 2 — 3D + scene** | AM | CHR-01 → 3D mesh in Meshy or Hunyuan | Josh | Day 1 PM |
| | PM | ENV-01 hero plate + Blender scene assembled | Josh + Claude | Day 2 AM |
| **Day 3 — Shots + screens** | AM | Shots 02, 07, 09, 10 rendered from Blender | Claude (orchestrator), Josh (review) | Day 2 |
| | PM | UI-01 to UI-05 captured in OBS | Josh | Operator Panel running locally |
| **Day 4 — Voice + music + cutting** | AM | VO-01 generated in ElevenLabs, take selected | Josh + Claude | Script lock (already done) |
| | PM | Music + SFX picked. Rough cut assembled in CapCut | Josh + Claude | All shots, VO |
| **Day 5 — Polish + delivery** | AM | Colour grade, audio mix, type cards finalised | Josh | Rough cut |
| | PM | All 7 deliverable formats exported, posted to homepage staging | Josh | Master cut |

**Parallelisable work:**
- VO can be generated Day 1 PM (script is locked).
- Music research can run any day.
- Founder shot (F08) doesn't need the operator pipeline — can be done Day 1 in parallel.

---

## 9. ROLES & RACI

| Role | Who | Responsibility |
|---|---|---|
| Creative director | Josh | The vision. Final say on every shot. |
| Director | Josh + Claude | Shot composition, performance direction (within VO/visual), pacing |
| DP / lighting | Claude (prompt-engineering FLUX) | Cinematic plate generation |
| Production designer | Claude (prompt + asset register) | World, props, environment continuity |
| Character designer | Josh + FLUX | Operator silhouette, mask, sigil |
| 3D / VFX supervisor | Claude (orchestration) + Meshy/Hunyuan/Blender (execution) | Mesh quality, scene continuity |
| Editor | Josh + CapCut | Final cut, pacing, type cards |
| Sound designer | Josh + Freesound | SFX selection and placement |
| Composer / music supervisor | Josh + Pixabay | Score selection and timing |
| VO director | Josh (Claude drafts direction) | ElevenLabs settings, take selection |
| Producer | Claude | Schedule, dependencies, asset register hygiene |

### 9.1 RACI per major deliverable
| Deliverable | R (does it) | A (signs off) | C (consulted) | I (informed) |
|---|---|---|---|---|
| Script lock | Claude | Josh | — | — |
| Hero plate (CHR-01) | Josh + FLUX | Josh | Claude | — |
| 3D mesh | Josh + Meshy/Hunyuan | Josh | Claude | — |
| Blender scene | Claude | Josh | — | — |
| UI captures | Josh | Josh | — | Claude |
| Voice | Josh + ElevenLabs | Josh | Claude | — |
| Final cut | Josh | Josh | Claude | — |
| Posting / distribution | Josh | Josh | — | Claude |

---

## 10. RISK REGISTER

| # | Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| R1 | FLUX can't get the operator right in <10 prompts | Day 1 slips | Med | Pre-write 5 prompt variants with reference imagery before starting |
| R2 | Meshy free tier reduced or removed | Pipeline broken | Low | Fallback chain: Meshy → Hunyuan3D-2 → TRELLIS → SAM 3D |
| R3 | Hunyuan3D space gets paused | One-day delay | Med | TRELLIS is mirrored fallback — already open in Chrome |
| R4 | ElevenLabs voice sounds wrong | Re-record, 30 min | Low | Generate 3 voices Day 1, pick before Day 4 |
| R5 | Blender crash on heavy scene | Half-day re-render | Low | Save .blend after every camera move; use Eevee not Cycles for v1 |
| R6 | Final cut too "explainery" not cinematic | Whole project missed | Med | Reference reel at hand during edit. Cut against the picture, not the script. |
| R7 | Founder shot looks like stock photography | Breaks credibility | Med | Use FLUX with explicit anti-stock prompt cues (specific clothing, real desk clutter) |
| R8 | Run over 5 days | Launch slips | Med | Day 6 buffer is implicit. Explicit Day 5 PM = posted. |

---

## 11. DELIVERABLES (final list)

Tied directly to §1.5. Single source of truth — these are what "done" means.

- [ ] `master_60s_1080p.mp4`
- [ ] `master_60s_4k.mp4` (stretch)
- [ ] `vertical_60s_1080x1920.mp4` (Reels/Shorts/TikTok)
- [ ] `vertical_15s_teaser_1080x1920.mp4`
- [ ] `square_30s_1080x1080.mp4` (LinkedIn / IG feed)
- [ ] `homepage_60s_webm.webm` + `homepage_60s_mp4.mp4` (muted-autoplay safe)
- [ ] `email_banner_6s.gif` (<2MB)
- [ ] `press_still_4k.png`
- [ ] `audio_bumper_15s.wav`
- [ ] Source `.blend`, `.fig`, `.aep` (if used) committed

---

## 12. DECISIONS NEEDED — sign off before we shoot frame 1

These block Day 1. None of them are "we'll figure it out later."

| # | Decision | Options | My recommendation | Your call |
|---|---|---|---|---|
| D1 | Operator accent colour | **LOCKED — arterial red `#ff2a2a` on deep ink `#0a0a0f`** to match Operator Panel brand CSS | n/a — palette inherited from product | ✅ locked 2026-05-02 |
| D2 | Operator face | Half-mask + sigil / full hood (no face) / human face (Josh-coded) | **Half-mask + sigil** — keeps mystery, makes the brand mark wearable | _____ |
| D3 | Founder shown on screen at F08 | Generic figure / Josh's face / silhouette only | **Generic figure** — viewer projects themselves in. Avoid Josh's face for now. | _____ |
| D4 | VO accent | British calm (Charlie) / American low (Liam) / Female alt | **Charlie** — adds class, distinguishes from every American startup VO | _____ |
| D5 | Music intensity | Sicario-tense / Social Network-cool / Mr. Robot-glitchy | **Social Network-cool** — confidence over menace. Tense reads as desperate. | _____ |
| D6 | Tagline final | "Operator-class systems for solo builders" / "The work was always going to get done" / write-in | **Operator-class systems for solo builders** — describes the product. Other line is in the VO already. | _____ |
| D7 | URL card animation | Static / cursor blink / glitch reveal | **Cursor blink** — matches opening frame, closes the loop | _____ |
| D8 | Where the master lives at end of Day 5 | Cloudflare R2 / Drive / repo LFS only | **Drive for v1**, R2 once domain is live | _____ |

Once I have D1–D8, I drive FLUX in Chrome and we land the hero plate before end of day.

---

## APPENDICES

### A. Reference shot deck
*To be added — 12-frame Pinterest board screenshotted into `assets/00_refs/` before Day 1.*

### B. FLUX prompt library
*Living document — `docs/intro-video/PROMPTS.md`. Every prompt that produced a usable plate goes in.*

### C. Change log
| Version | Date | Change | Owner |
|---|---|---|---|
| v1.0 | 2026-05-02 | Initial bible — script, treatment, shot list, asset register, schedule, RACI, risks, decisions sheet | Claude (drafted), Josh (sign-off pending) |
| v1.1 | 2026-05-02 | Palette locked to brand black + red (`#0a0a0f` / `#ff2a2a`) inherited from `public/operator.css`. PROMPTS.md updated. D1 closed. | Josh + Claude |
| v1.2 | 2026-05-02 | Tool stack upgraded to MCP-orchestrated: Blender MCP, `operator-pipeline` skill, `voice-avatar` skill, `canvas-design`, `theme-factory`, `pptx`/`pdf`, Figma MCP, Claude Preview MCP. Shot list pipeline column rewritten. Manual fallbacks retained per row. | Josh + Claude |

### D. Tool stack rationale
**Why we layered the skills + MCPs on top instead of staying with v1's manual chain:**

- v1 had 5–6 manual web tabs per shot. v1.2 has Claude driving most of them.
- Reproducibility: every shot becomes a Python script (Blender) + a prompt (FLUX) + an asset ID. Episode 2 of the brand series re-runs the same chain with a new brief.
- Brand discipline: `theme-factory` enforces the locked palette on every derivative artifact, so the storyboard PDF + pitch deck + email banner all read as one piece.
- The `operator-pipeline` skill is on-the-nose for our use case — Anthropic literally shipped a skill called "operator-pipeline" that orchestrates ad-grade hero promos. Coincidence that aligns with our brand name, but we use it.

### E. What still requires you (Josh) hands-on
Even at v1.2, three things stay yours:
1. **Final cut in CapCut** — pacing, music selection, grade. Taste call, not orchestratable.
2. **Voice take selection** — Claude can generate 3 takes, you pick the one with the right energy.
3. **Sign-off on every hero plate** before it propagates downstream into 3D and Blender. One bad operator face poisons every shot that reuses the asset.
