# FLUX Prompt Library — TheSaaSsin Intro

**Convention:** every prompt that produced a usable plate gets logged here with the seed, settings, and the asset ID it became.

**Brand palette — locked:**
- Background: `#0a0a0f` deep ink black
- Accent / glow: `#ff2a2a` arterial red
- Text / highlights: `#f0f0f5` near-white
- Muted: `#6b6b80` slate

**Style anchor (paste into every prompt):**
> *Cinematic still, anamorphic 2.39:1, 35mm film grain, deep ink black palette (#0a0a0f) with single arterial red accent (#ff2a2a), low-key lighting, volumetric haze, sharp focus on subject, blurred background, A24 colour grade, no text, no watermark, no logo, photoreal not illustrated.*

---

## CHR-01 — The Operator (back to camera)

**Goal:** Hooded figure at a terminal, walls of monitors, back to camera. The hero plate. Everything reuses this.

### Prompt v1
```
A solitary hooded figure seated at a wide command terminal, back to camera,
silhouette only, surrounded by a curved wall of monitors displaying scrolling
data and SaaS dashboards. Deep ink black room, single arterial red accent glow on the
nearest monitor. Volumetric haze, low-key lighting, anamorphic widescreen,
35mm film grain. The figure wears a long technical coat with seam detail —
not fantasy, not military — utilitarian operator wear. No visible face.
Cinematic still, A24 colour grade, photoreal, no text, no watermark.
```

**Settings:** Guidance 4.5, steps 28, seed TBD, 16:9.

**Result:** _______ (paste resulting filename when generated)

---

## CHR-02 — The Operator (front, hood off, mask reveal)

**Goal:** Same figure, front-on, hood pulled back, half-mask covering nose and mouth, mono-line operator sigil glowing arterial red on the forehead of the mask.

### Prompt v1
```
Medium close-up portrait of the same hooded operator figure now turned to
camera, hood pulled back to reveal a matte-black half-mask covering nose and
mouth. A single thin geometric sigil glows arterial red on the forehead of the mask.
Eyes in shadow above the mask. Deep ink black background, low-key rim light,
volumetric haze, 35mm grain, anamorphic. No skin showing apart from a sliver
of jaw and the bridge above the mask. Photoreal, A24 colour grade, no text.
```

---

## CHR-03 — The Founder

**Goal:** Slumped at a desk, daylight, empty inbox visible.

### Prompt v1
```
Wide medium shot of a young SaaS founder slumped over a desk in a small
home office, head on forearm, asleep. Cold morning daylight from a window
to the left. On the desk: a laptop showing an empty email inbox (zero
unread), a cold mug of coffee, a notebook with a single line crossed out.
Realistic exhaustion, not styled. Documentary photographic style, 50mm,
shallow depth of field, A24 colour grade, photoreal, no text. NOT a stock
photo. Specific clothing — black hoodie, no logo. Real desk clutter.
```

---

## ENV-01 — Operator Command Room (establishing wide)

**Goal:** Wide of the room with the operator centred, monitor wall wrapping.

### Prompt v1
```
Wide establishing shot of a near-future operator command room, single
hooded figure at the centre seated at a terminal, back to camera, dwarfed
by a curved wraparound wall of dozens of monitors all running different
SaaS dashboards in soft arterial red and warm white. Concrete floor, exposed structural
columns, no Hollywood gloss — utilitarian SOC aesthetic. Deep ink shadows,
volumetric haze, single arterial red accent. Anamorphic 2.39:1, 35mm grain,
A24 colour grade, photoreal cinematic still, no text or watermark.
```

---

## ENV-02 — Cathedral Terminal Array

**Goal:** Hundreds of identical operator stations stretching to vanishing point.

### Prompt v1
```
Vista shot — endless industrial hall stretching to a vanishing point, lined
with hundreds of identical operator workstations, each with a hooded figure
seated at a curved monitor wall. Each station glows softly arterial red. Foreground
station in sharp focus, background fades into volumetric haze. Cathedral
sense of scale. Deep ink palette, low-key, no warm colour anywhere.
Anamorphic, 35mm grain, A24 grade, photoreal, no text.
```

---

## Notes
- Prompt the *style* into the prompt every time. FLUX does not remember.
- Always include negative cues even though FLUX doesn't formally support them: "no text, no watermark, no logo, no stock photo feel."
- Save every generated PNG to `assets/01_hero-plates/` with the seed in the filename.
