# /creative — BOSS Creative Engine

The visual side of B.O.S.S. Each subfolder is a **drop-in template** the
Content Studio + Builder Agent can extend or hand to Remotion to render.

```
creative/
  three/        Three.js scenes (hero backgrounds, 3D product shots)
  shaders/      Raw GLSL fragment shaders (Shadertoy-compatible)
  framer/       Framer Motion components (React, used by Remotion)
  remotion/     Remotion compositions (script -> MP4)
```

## Render flow

```
Brief  →  Script (Claude/Groq)
       →  Shot list
       →  Asset gen (ModelsLab + Three/Shaders)
       →  Compose (Framer Motion components)
       →  Remotion render -> MP4/WebM/GIF -> /memory/outputs/renders/
```

## Adding a new template

1. Drop the file into the right subfolder.
2. It auto-appears in Content Studio's "Template" picker (the picker reads
   `/api/creative/templates`).
3. The Builder Agent can be asked to "extend the <name> template" — it loads
   the file and edits in place.

See `three/hero-particles.html`, `shaders/aurora.glsl`, `framer/fade-up.jsx`,
`remotion/SimpleHero.jsx` for the shape each template should follow.
