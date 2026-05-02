# FLUX Prompt Library — TheSaaSsin Intro

**Convention:** every prompt that produced a usable plate gets logged here with the seed, settings, and the asset ID it became.

**Brand palette v1.4 — locked:**
- Ground / shadows: `#0a0a0f` deep ink black
- Architectural grey: `#6b6b80` (concrete, fabric, mid-tone surfaces)
- Mid-grey: `#3a3a44` (walls, deeper concrete)
- Accent (sigil only): `#ff2a2a` arterial red
- Light source: white (5500K), studio architectural, NOT warm
- Text / highlights: `#f0f0f5` near-white

**Lighting philosophy v1.4:**
- Monitors are **matte black surfaces — they DO NOT self-emit**.
- Primary illumination = white architectural studio light.
- Red is reserved for the **operator sigil only** — not on monitors, walls, or the floor.
- Grey is structural. Carries the architectural weight.

**Style anchor — paste into every prompt v1.4:**
> *Cinematic architectural still, anamorphic 2.39:1, 35mm grain, palette black + grey + single red accent (#0a0a0f / #6b6b80 / #ff2a2a). White architectural studio lighting (5500K), large soft key with cooler bounce fill. Clean light perspective, deep negative space, gallery proportions. Monitors are matte black surfaces, NOT glowing. Red is on the operator sigil ONLY. A24 colour grade, photoreal not illustrated. No emoji, no text, no watermark, no logo, no stock photo feel, no warm orange, no cyan, no green.*

---

## CHR-01 — The Operator (back to camera, establishing wide-medium)

**Goal:** Hooded figure at a single deliberate workstation, matte-black monitor wall behind, lit by clean architectural white light. The hero plate. Reused for F02, F07, F09 (ENV-02 cathedral version).

### Prompt v1.4
```
Cinematic architectural wide-medium of a solitary hooded operator seated at a
single, deliberate concrete-and-black-glass workstation. Back three-quarter to
camera. Behind the operator: a wide curved wall of large matte-black monitor
panels — non-emissive, mirror-finish, reflecting the room's white light, NOT
glowing dashboards. Concrete walls and floor in architectural grey (#6b6b80).
The operator wears a long technical coat in deep matte black and #6b6b80 grey
panel detail — utilitarian, tailored, premium, not fantasy or military.

Lighting: large soft 5500K key light from camera-left high, cooler bounce fill
from camera-right low. Light is white, clean, controlled — gallery photography
energy, NOT moody hacker dungeon. Volumetric haze barely perceptible.

A single arterial red point of light visible somewhere on the operator's coat
or workstation — sigil glow only, the only saturated colour anywhere in frame.

Anamorphic 2.39:1, 35mm grain, A24 colour grade, sharp focus on operator,
deep architectural perspective into the monitor wall, photoreal not illustrated.
No emoji, no text, no watermark, no logo. Apple keynote photo-shoot composition.
```

**Settings:** Guidance 4.5, steps 28, seed TBD, 16:9.

**Result:** _______ (paste filename when generated)

---

## CHR-02 — The Operator (front, hood off, mask reveal at F10)

**Goal:** Same figure, front-on, hood pulled back, half-mask covering nose and mouth, single mono-line operator sigil glowing arterial red on the forehead of the mask. The single moment of brand-mark hero glow.

### Prompt v1.4
```
Cinematic medium close-up portrait of a hooded operator turned to camera, hood
pulled back to reveal a matte-black half-mask covering nose and mouth, sitting
across the bridge of the nose. A single thin geometric sigil — clean line work,
no decoration — glows arterial red (#ff2a2a) on the forehead plate of the mask.
Eyes in shadow above the mask line.

The figure wears a long technical coat in deep matte black with #6b6b80 grey
panel detail. Skin showing only a sliver of jaw and the bridge above the mask.
Background is architectural concrete grey (#6b6b80) and deep black, defocused.

Lighting: large soft 5500K key from camera-left at eye level, cooler bounce
fill from camera-right. White light. Subtle red rim light from behind catches
the hood edge — only place red appears outside the sigil. Studio photo-shoot
energy, gallery proportions, clean light perspective.

Anamorphic 2.39:1, 35mm grain, A24 colour grade, photoreal not illustrated,
no emoji, no text, no watermark, no logo, no warm tones, no cyan or green.
```

---

## CHR-03 — The Founder (sleeping at desk, F08)

**Goal:** Slumped at a desk, daylight, empty inbox. Cold contrast to the architectural operator scenes.

### Prompt v1.4
```
Documentary-photographic medium shot of a young SaaS founder slumped over a
small home-office desk, head on forearm, asleep. Cold morning daylight from a
window to the left, slightly overcast — light grey, not warm. On the desk: a
laptop showing an empty email inbox (zero unread visible), a cold mug of black
coffee, a notebook with a single line crossed out.

Founder wears a plain black hoodie, no logo. Specific exhausted exhaustion —
not styled, not glamour. Real domestic clutter — a half-empty water bottle,
tangled cable, paper bills.

Lighting: cold daylight only, no warm bulbs. Palette stays in #0a0a0f / #6b6b80
range — black, grey, cold white. NO red here (this is the contrast shot — the
world *without* the operator).

50mm, shallow depth of field, A24 colour grade, photoreal not illustrated,
NOT a stock photo, no text or watermark.
```

---

## ENV-01 — Operator Command Room (establishing wide for F02)

**Goal:** Wide architectural establishing of the room with the operator centred.

### Prompt v1.4
```
Wide architectural establishing shot of a purpose-built operator command space.
Concrete-and-glass interior, gallery proportions, exposed structural columns
in architectural grey (#6b6b80). A single deliberate workstation centred in
the frame — black-glass desk, single matte-black monitor wall behind it
(non-emissive, mirror finish). One hooded operator figure seated, back
three-quarter to camera, dwarfed by the architecture but composed within it.

Lighting: large soft white 5500K key from above, cooler bounce off the
concrete floor. Clean architectural light, deep perspective, gallery
photography energy. NOT a SOC dungeon — this is the showroom version.

A single arterial red sigil glow visible on the operator (forehead or coat).
That is the only saturated colour. Floor, walls, monitors, ceiling all in
black + grey. Volumetric haze just barely perceptible for depth.

Anamorphic 2.39:1, 35mm grain, A24 colour grade, photoreal not illustrated,
Apple keynote x cinematic operator energy, no emoji, no text, no watermark,
no warm orange, no cyan, no green.
```

---

## ENV-02 — Cathedral Terminal Array (F07)

**Goal:** Hundreds of identical workstations stretching to a vanishing point. Architectural grandeur.

### Prompt v1.4
```
Vista shot — vast architectural hall in concrete and black glass, stretching
to a vanishing point, lined with hundreds of identical operator workstations.
Each station: black-glass desk, matte-black monitor wall (non-emissive), one
hooded figure seated. Cathedral sense of scale, gallery proportions.

Foreground station in sharp focus — its operator's red sigil visible. As the
hall recedes, sigils become smaller red points — like stars in a dark gallery.
Concrete floor, exposed structural ribs in architectural grey, deep perspective
lines pulling the eye to the vanishing point.

Lighting: clean architectural white from overhead skylights or strip fixtures.
Volumetric haze for depth, no warm tones, no menace. The grandeur is calm and
controlled, not threatening.

Anamorphic 2.39:1, 35mm grain, A24 colour grade, photoreal not illustrated,
no emoji, no text, no watermark.
```

---

## Notes (v1.4 update)
- Prompt the *style* into the prompt every time. FLUX does not remember.
- Always include negative cues at the end: "no emoji, no text, no watermark, no logo, no stock photo feel, no warm orange, no cyan, no green."
- Save every generated PNG to `assets/01_hero-plates/` with the seed in the filename.
- **If a plate comes back glowing red on every monitor, re-prompt.** Brand discipline: red is sigil-only.
- **If a plate comes back warm-toned (golden hour, orange light, candle), re-prompt.** Light is 5500K white only.
- **If a plate comes back cyan or teal, re-prompt.** That's the off-brand reference style we rejected.
