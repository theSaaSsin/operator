import { VERTEX_SHADER } from './shared';

// ── Pulse Glow + Chromatic Aberration + Anime Cel Shader ─────────────────────
export const PULSE_FRAGMENT_SHADER = /* glsl */`
  uniform sampler2D uTexture;
  uniform float     uTime;
  uniform float     uPulseIntensity;
  uniform float     uChromaticStrength;
  uniform vec3      uGlowColor;
  uniform float     uCelSteps;
  uniform float     uBrightness;

  varying vec2 vUv;

  // Soft luminance
  float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

  void main() {
    // ── Chromatic aberration ──────────────────────────────────────────────────
    float ca = uChromaticStrength;
    vec2 center = vUv - 0.5;
    float r = texture2D(uTexture, vUv + center * ca).r;
    float g = texture2D(uTexture, vUv               ).g;
    float b = texture2D(uTexture, vUv - center * ca).b;
    vec4 tex = vec4(r, g, b, texture2D(uTexture, vUv).a);

    // ── Anime cel-shading ─────────────────────────────────────────────────────
    float bright = luma(tex.rgb) * uBrightness;
    float stepped = floor(bright * uCelSteps) / uCelSteps;
    float shadowFactor = smoothstep(0.0, 0.4, stepped);
    vec3 celColor = tex.rgb * mix(0.35, 1.0, shadowFactor);

    // ── Pulse glow wave ───────────────────────────────────────────────────────
    float pulse  = sin(uTime * 6.28318 * 1.5) * 0.5 + 0.5;
    float pulse2 = sin(uTime * 6.28318 * 3.0 + 1.0) * 0.5 + 0.5;
    float glowStr = uPulseIntensity * (pulse * 0.7 + pulse2 * 0.3);

    // ── Edge detection for rim glow ───────────────────────────────────────────
    vec2 px = vec2(0.0015, 0.0);
    float edgeX = abs(luma(texture2D(uTexture, vUv + px).rgb) - luma(texture2D(uTexture, vUv - px).rgb));
    float edgeY = abs(luma(texture2D(uTexture, vUv + px.yx).rgb) - luma(texture2D(uTexture, vUv - px.yx).rgb));
    float edge   = clamp((edgeX + edgeY) * 8.0, 0.0, 1.0);

    // ── Combine ───────────────────────────────────────────────────────────────
    vec3 glowContrib = uGlowColor * edge * glowStr * 2.5;
    vec3 finalColor  = celColor + glowContrib;

    // ── Vignette ─────────────────────────────────────────────────────────────
    float vignette = smoothstep(0.85, 0.3, length(vUv - 0.5) * 1.4);
    finalColor *= vignette * 0.3 + 0.7;

    gl_FragColor = vec4(finalColor, tex.a);
  }
`;

export const pulseShader = {
  vertexShader: VERTEX_SHADER,
  fragmentShader: PULSE_FRAGMENT_SHADER,
  uniforms: {
    uTexture:           { value: null },
    uTime:              { value: 0 },
    uPulseIntensity:    { value: 1.2 },
    uChromaticStrength: { value: 0.008 },
    uGlowColor:         { value: [0.114, 0.898, 1.0] },  // teal #1de5ff
    uCelSteps:          { value: 4.0 },
    uBrightness:        { value: 1.15 },
  },
};
