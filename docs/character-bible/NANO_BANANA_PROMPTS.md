# Nano Banana (Gemini Imagen) — 6 Asset Prompts

**Open in Chrome:** https://gemini.google.com/ → Image → Imagen / "Nano Banana" mode
**Or:** https://aistudio.google.com/ → New chat → image generation

**Workflow:**
1. Paste prompt 1, generate, regenerate variants until the operator face/silhouette/mask is locked
2. Save the locked image as your **reference** for prompts 2–6
3. For prompts 2–6: paste the prompt + attach the locked reference image so Gemini holds character identity

**Locked from `OPERATOR_CHARACTER_BIBLE.md`:**
- Palette: `#0a0a0f` deep ink black + `#6b6b80` architectural grey + **`#ff2a2a` arterial red (sigil only)**
- Lighting: white architectural studio, NOT warm
- Photoreal cinematic, A24 grade, 35mm grain, anamorphic 2.39:1
- 暗殺 kanji glows red on mask forehead plate
- Half-mask + hood always
- NO anime, NO neon, NO warm tones, NO cyan, NO green

---

## 1. Hero shot (THE FIRST ONE — lock the character here)

```
Cinematic photoreal hero portrait, anamorphic 2.39:1, 35mm grain, A24 colour grade.
A solitary operator stands centre-frame in a vast architectural studio space.
Hood up, deep matte-black long technical coat with grey panel detail at the seams,
half-mask covering nose and mouth (matte-black ceramic), narrow intent eyes
visible above the mask. A single arterial red Japanese kanji glyph glows
on the forehead plate of the mask — the kanji 暗殺.

Lighting: large soft white 5500K key from camera-left high, cooler bounce
fill from camera-right low. Studio photo-shoot energy, gallery proportions,
deep architectural depth behind the figure (concrete walls in #6b6b80 grey,
black glass elements). Volumetric haze barely perceptible.

Palette: deep ink black (#0a0a0f) + architectural grey (#6b6b80) + ONE point
of arterial red (#ff2a2a) on the mask sigil ONLY. No other saturated colour
anywhere in frame. White light only. NO warm orange, NO cyan, NO green,
NO neon, NO anime, photoreal not illustrated, no text, no watermark, no logo.
```

---

## 2. Profile shot (left side, hood up)

```
[ATTACH HERO SHOT AS REFERENCE]

Same operator character, exact same coat, hood, half-mask, and red kanji
sigil. Side profile shot from the LEFT, three-quarter body crop. Operator
faces camera-right, looking forward. Same architectural studio backdrop in
deeper focus. Same lighting setup — white 5500K key from camera-left high.

Maintain 100% character identity from reference: identical mask geometry,
identical sigil glyph, identical coat seam pattern, identical eye shape.

Anamorphic 2.39:1, 35mm grain, A24 colour grade, photoreal not illustrated.
Palette: black + grey + single red sigil. No other saturated colour.
```

---

## 3. Three-quarter angle (right turn)

```
[ATTACH HERO SHOT AS REFERENCE]

Same operator. 3/4 angle from the right side, head turned slightly toward
camera, shoulder in foreground. Hood up. Eyes catching the red glow from
the sigil — subtle red catchlight on the iris.

Same coat, same mask, same kanji sigil, same hood. Same architectural
studio backdrop, slightly defocused. Lighting matches hero shot — white
key + cool fill, single red rim light from behind catching the hood edge.

Anamorphic 2.39:1, 35mm grain, A24 grade, photoreal, palette black + grey
+ red sigil only.
```

---

## 4. Action pose (Wing Chun centre-line stance)

```
[ATTACH HERO SHOT AS REFERENCE]

Same operator. Full body, low slight 45-degree camera angle looking up.
Wing Chun centre-line stance: one foot forward, weight balanced, hands
relaxed at chest height in soft chambered position. Coat tails settled,
no wind, controlled stillness. Hood up, mask + sigil visible.

Around the operator: 10 silhouetted figures dissolving into the shadows
behind, just visible as shapes — the "10 tasks" metaphor (lead gen,
outreach, demos, calendar, etc., implied not labelled). Operator is
illuminated, the silhouettes are not.

Same architectural studio. White 5500K key + red rim catching the back of
the hood. Same palette — black + grey + ONE red sigil + 10 background
silhouettes in deeper black. NO warm tones, NO cyan, NO green.

Anamorphic 2.39:1, 35mm grain, A24 grade, photoreal cinematic still.
```

---

## 5. Close-up (mask + eyes, hero moment)

```
[ATTACH HERO SHOT AS REFERENCE]

Same operator. Tight medium close-up — head and shoulders only. Mask fills
much of frame. The 暗殺 kanji sigil glows arterial red on the forehead plate
of the matte-black ceramic mask. Eyes narrow, intent, looking directly into
camera. Subtle red rim catchlight on the lower edge of the iris from the
sigil glow.

Hood casts soft shadow on the upper half of the eyes. Coat collar with thin
red piping just visible at the base of frame.

Lighting: dramatic close studio light from camera-left, low fill. Shallow
depth of field, the mask sharp, hood softly defocused. Blacks lifted not
crushed (Filmic tone-mapping). NO bloom on the sigil — controlled emission.

Anamorphic 2.39:1, 35mm grain, A24 grade, photoreal portrait. Palette:
deep ink black + matte grey of mask + ONE point of red on sigil. White
key light. NO orange, NO cyan, NO green.
```

---

## 6. Environmental shot (the operator's command room)

```
[ATTACH HERO SHOT AS REFERENCE]

Wide architectural establishing shot. The operator is small in frame
(centre-back), standing at a single deliberate concrete-and-black-glass
workstation in a vast modernist interior. Behind: a curved wall of
matte-black non-emissive monitor panels (NOT glowing dashboards — black
mirror surfaces reflecting the architectural lighting).

Concrete floor in #6b6b80 architectural grey. Exposed structural columns.
Skylights cast white architectural light from above. Volumetric haze
just barely perceptible for depth.

A single arterial red sigil glow visible on the operator's mask
(centre-back, small but readable). That is the ONLY saturated colour
in frame. Everything else is black, grey, white.

Apple keynote photo-shoot energy meets BIG architectural film. Gallery
proportions, deep vanishing-point perspective. NOT a SOC dungeon.

Anamorphic 2.39:1, 35mm grain, A24 colour grade, photoreal cinematic still,
no text, no watermark, no logo.
```

---

## After generating

Save all 6 to `landing/assets/`:
- `01_hero.png`
- `02_profile.png`
- `03_three-quarter.png`
- `04_action.png`
- `05_close-up.png`
- `06_environment.png`

Then move to `KLING_PROMPTS.md` for video generation.
