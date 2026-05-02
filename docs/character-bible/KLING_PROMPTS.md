# Kling AI — 5 Video Scene Prompts

**Open in Chrome:** https://app.klingai.com/global/  (or kling.kuaishou.com)

**Workflow:**
1. Sign in (Google / Apple / email)
2. New Video → "Image to Video" or "Reference to Video" with Elements/Reference feature
3. Upload **2–3 of your locked Nano Banana outputs** as reference / Elements:
   - `01_hero.png` (primary identity reference — locks face, mask, sigil)
   - `04_action.png` (locks pose + coat detail)
   - `06_environment.png` (locks setting)
4. For each scene below, paste the prompt + use the references
5. Generate 5–10s clips per scene, download MP4

**Settings per clip:**
- Aspect ratio: **16:9** (landscape) — for the landing-page hero / desktop
- Length: 5s if free tier, 10s if available
- Camera motion: as specified per scene
- Style: Cinematic / Realistic — NOT Anime, NOT Cartoon

**Locked from `OPERATOR_CHARACTER_BIBLE.md`:**
- Black + grey + single red sigil. Photoreal cinematic. White architectural light. No warm tones.

---

## Scene 1 — Opening hook (3s — pre-title)

```
A hooded figure walks slowly into frame from the right, into a vast dark
architectural studio space. Concrete floor, deep ink black walls, single
arterial red sigil 暗殺 glowing on the mask covering nose and mouth. White
architectural studio lighting from above. The figure stops centre-frame,
camera slowly pushes in. Cinematic 35mm anamorphic look, A24 colour grade.
Palette: black + architectural grey + ONE red sigil only. NO warm tones,
NO neon, photoreal not illustrated.
```

**Camera:** slow dolly in
**Vibe:** stillness, anticipation
**Reference uploads:** `01_hero.png` + `06_environment.png`

---

## Scene 2 — Character introduction (5s)

```
Slow rotational camera arc around the same hooded operator standing still
centre-frame in the architectural studio. Hood up, half-mask + arterial red
sigil 暗殺 visible. The operator does not move — only the camera arcs
around at hip height. Behind: black-glass monitor wall, concrete columns,
white architectural skylights. Subtle volumetric haze. White studio
lighting only. Cinematic 35mm anamorphic, A24 grade, photoreal.
Palette: black + grey + single red sigil. NO orange, NO cyan, NO neon.
```

**Camera:** smooth arc orbit, ~120 degrees
**Vibe:** introduction, mastery
**Reference uploads:** `01_hero.png` + `03_three-quarter.png`

---

## Scene 3 — Problem reveal (5s)

```
Wide split-screen feel: foreground shows the hooded operator standing
still in the architectural studio, lit by white key light. Background
fades to a dim daylight scene of a young SaaS founder slumped asleep at a
small desk, empty inbox visible on a laptop, cold morning light.

The two scenes co-exist in the same frame separated by a soft architectural
edge. The contrast is the story: the operator working / the founder
hoping. Camera holds still. The founder side stays defocused.

Photoreal cinematic, 35mm grain, A24 colour grade, anamorphic 2.39:1.
Palette: black + grey + single red sigil on operator's mask. The founder
side is cold daylight (no warm bulbs). NO neon, NO bright colours.
```

**Camera:** locked off, held still
**Vibe:** contrast, "you sleep, the operator works"
**Reference uploads:** `01_hero.png` + `06_environment.png`

---

## Scene 4 — Transformation / climax (5s)

```
The hooded operator stands centre-frame in a Wing Chun centre-line stance.
Around the operator: 10 silhouetted figures appear from the shadows in a
loose arc, just-visible as dark shapes. The operator's hands move in a
single blurred Wing Chun gesture (chain-punch motion).

The 10 silhouettes collapse / dissolve / fall back into the shadows one
after another in rapid sequence. The operator hasn't moved their feet.
The work has been done.

Camera holds at low 45-degree angle looking up. Volumetric haze. White
architectural key light + a small red rim glow building in intensity as
the silhouettes fall.

Cinematic 35mm anamorphic, A24 grade, photoreal, palette black + grey +
red sigil + the slowly-building red rim. The 10 silhouettes stay in
deepest black. NO warm tones, NO neon, NO impact effects.
```

**Camera:** low 45-degree angle, slight upward push
**Vibe:** climax, "10 systems dispatched"
**Reference uploads:** `04_action.png` + `01_hero.png`

---

## Scene 5 — Strong ending (3s)

```
Tight medium close-up. The hooded operator turns to camera, head tilts
slightly down. The 暗殺 kanji sigil on the half-mask glows brighter,
sustained, then holds. Eyes narrow into camera. Hood casts deep shadow on
the upper face. Behind: defocused architectural studio with white light.

Camera holds still. The sigil pulse stays visible for the full 3 seconds.

Photoreal cinematic, 35mm grain, A24 colour grade, anamorphic 2.39:1,
shallow depth of field. Palette: deep ink black + matte mask grey +
the single red sigil glow. White rim light only. NO orange, NO cyan,
NO neon, NO bloom flares.
```

**Camera:** locked off close-up
**Vibe:** "now operating" — the brand stamp
**Reference uploads:** `05_close-up.png`

---

## After generating

Save all 5 MP4s to `landing/assets/`:
- `01_opening.mp4`
- `02_introduction.mp4`
- `03_problem.mp4`
- `04_climax.mp4`
- `05_ending.mp4`

The single-file landing page (`landing/index.html`) loads these directly. No further encoding needed if Kling exports as H.264 MP4 (default).

---

## Stitching them into one video (optional)

If you also want a single 21-second master cut for X / LinkedIn / YouTube:

**Free path — DaVinci Resolve (already in our launchpad):**
1. New Project → New Timeline → 1920×1080 24fps
2. Drag the 5 clips in order onto the V1 track
3. Add 0.5s cross-dissolves between each clip (Effects → Cross Dissolve)
4. Add the brand audio (lo-fi pulse — SFX: keyboard tap on scene 1, single hit on scene 5 logo reveal)
5. Add type cards in DaVinci Fusion:
   - End of scene 1: `> deploy.operator()` (mono cursor type-on)
   - End of scene 5: `THESAASSIN` + `AUTOMATE · ELIMINATE · DOMINATE` + `thesaassin.com`
6. Deliver tab → MP4 H.264 1080p → Render → save as `landing/assets/master.mp4`

Total stitch time: ~15 minutes.
