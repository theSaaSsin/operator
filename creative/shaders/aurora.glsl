// BOSS · aurora.glsl  (Shadertoy-compatible fragment shader)
// Editorial moving aurora gradient, lime accent, dark base.
// Use as full-screen background or a Remotion shader layer.

#ifdef GL_ES
precision highp float;
#endif

uniform float iTime;
uniform vec2  iResolution;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f*f*(3.0 - 2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), u.x),
             mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv = fragCoord / iResolution.xy;
  vec2 p  = uv * 3.0;
  float t = iTime * 0.15;
  float n = 0.0;
  float a = 0.5, f = 1.0;
  for (int i = 0; i < 5; i++) { n += a * noise(p * f + t); f *= 2.0; a *= 0.5; }
  // Aurora bands
  float band = smoothstep(0.45, 0.85, n + uv.y * 0.6);
  vec3 base = mix(vec3(0.04, 0.04, 0.05), vec3(0.0, 0.18, 0.10), band);
  vec3 lime = vec3(0.78, 1.0, 0.0);
  vec3 col  = mix(base, lime, band * 0.55);
  // vignette
  float vig = smoothstep(1.2, 0.4, length(uv - 0.5));
  col *= vig;
  fragColor = vec4(col, 1.0);
}
