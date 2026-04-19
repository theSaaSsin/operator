import { VERTEX_SHADER } from './shared';

// ── Radial Pulse Transition Shader ────────────────────────────────────────────
export const TRANSITION_FRAGMENT_SHADER = /* glsl */`
  uniform float uProgress;   // 0..1 — transition progress
  uniform vec3  uColor;      // pulse color
  uniform float uRadius;     // current pulse ring radius
  uniform float uEdgeWidth;  // ring edge softness

  varying vec2 vUv;

  void main() {
    vec2  center = vec2(0.5, 0.5);
    float dist   = length(vUv - center);

    // ── Expanding ring ────────────────────────────────────────────────────────
    float ring   = smoothstep(uRadius - uEdgeWidth, uRadius, dist)
                 - smoothstep(uRadius, uRadius + uEdgeWidth, dist);

    // ── Fill behind the ring (screen wipe) ───────────────────────────────────
    float fill   = 1.0 - smoothstep(uRadius - uEdgeWidth * 2.0, uRadius, dist);

    // ── Energy flares radiating outward ──────────────────────────────────────
    float angle  = atan(vUv.y - 0.5, vUv.x - 0.5);
    float flares = pow(abs(sin(angle * 8.0 + uProgress * 12.56637)), 6.0) * ring * 3.0;

    // ── Glow halo ─────────────────────────────────────────────────────────────
    float halo   = exp(-dist * dist / (uRadius * 0.5 + 0.001)) * uProgress;

    float alpha  = clamp(ring * 1.5 + fill * 0.85 + flares + halo * 0.4, 0.0, 1.0);
    vec3  col    = uColor * (1.0 + flares * 2.0 + halo);

    gl_FragColor = vec4(col, alpha);
  }
`;

export const transitionShader = {
  vertexShader: VERTEX_SHADER,
  fragmentShader: TRANSITION_FRAGMENT_SHADER,
  uniforms: {
    uProgress:  { value: 0 },
    uColor:     { value: [0.114, 0.898, 1.0] },
    uRadius:    { value: 0 },
    uEdgeWidth: { value: 0.06 },
  },
};
