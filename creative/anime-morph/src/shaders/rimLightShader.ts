import { VERTEX_SHADER } from './shared';

// ── Rim Light + Depth Fog + Anime Outline ─────────────────────────────────────
export const RIM_FRAGMENT_SHADER = /* glsl */`
  uniform sampler2D uTexture;
  uniform float     uTime;
  uniform vec3      uRimColor;
  uniform float     uRimPower;
  uniform float     uRimIntensity;
  uniform vec3      uFogColor;
  uniform float     uFogDensity;
  uniform float     uOutlineWidth;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vec4 tex   = texture2D(uTexture, vUv);
    vec3 color = tex.rgb;

    // ── Rim light based on normal vs view direction ───────────────────────────
    vec3  N         = normalize(vNormal);
    vec3  V         = normalize(vViewPosition);
    float rimFactor = 1.0 - abs(dot(N, V));
    float rim       = pow(rimFactor, uRimPower);

    // Animate the rim color
    float pulse  = sin(uTime * 5.0) * 0.4 + 0.6;
    float pulse2 = cos(uTime * 7.0 + 1.5) * 0.2 + 0.8;
    vec3 animRim = uRimColor * rim * uRimIntensity * pulse;

    // ── Anime hard outline (screen-space edge detection) ──────────────────────
    float w = uOutlineWidth;
    float lum = dot(color, vec3(0.299, 0.587, 0.114));
    float lumL = dot(texture2D(uTexture, vUv + vec2(-w, 0.0)).rgb, vec3(0.299, 0.587, 0.114));
    float lumR = dot(texture2D(uTexture, vUv + vec2( w, 0.0)).rgb, vec3(0.299, 0.587, 0.114));
    float lumU = dot(texture2D(uTexture, vUv + vec2( 0.0, w)).rgb, vec3(0.299, 0.587, 0.114));
    float lumD = dot(texture2D(uTexture, vUv + vec2( 0.0,-w)).rgb, vec3(0.299, 0.587, 0.114));
    float outline = abs(lum - lumL) + abs(lum - lumR) + abs(lum - lumU) + abs(lum - lumD);
    outline = smoothstep(0.05, 0.15, outline);
    color = mix(color, vec3(0.02, 0.02, 0.05), outline);

    // ── Depth fog ─────────────────────────────────────────────────────────────
    float depth     = 1.0 - smoothstep(0.0, 1.0, length(vViewPosition) * uFogDensity);
    color           = mix(color, uFogColor, depth * 0.4);

    // ── Combine ───────────────────────────────────────────────────────────────
    vec3 finalColor = color + animRim;
    // Bloom threshold
    float bloomLuma = dot(finalColor, vec3(0.299, 0.587, 0.114));
    float bloom     = smoothstep(0.7, 1.0, bloomLuma) * 0.5;
    finalColor      = mix(finalColor, finalColor + uRimColor * bloom, pulse2);

    gl_FragColor = vec4(finalColor, tex.a);
  }
`;

export const rimLightShader = {
  vertexShader: VERTEX_SHADER,
  fragmentShader: RIM_FRAGMENT_SHADER,
  uniforms: {
    uTexture:      { value: null },
    uTime:         { value: 0 },
    uRimColor:     { value: [0.114, 0.898, 1.0] },
    uRimPower:     { value: 3.5 },
    uRimIntensity: { value: 1.8 },
    uFogColor:     { value: [0.04, 0.06, 0.12] },
    uFogDensity:   { value: 0.08 },
    uOutlineWidth: { value: 0.002 },
  },
};
