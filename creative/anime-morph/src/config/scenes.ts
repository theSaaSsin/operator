/**
 * scenes.ts — master scene config.
 * All timing, colours, and lighting presets live here.
 * Change here → every scene updates automatically.
 */
import type { AnimeLightingPreset } from '../components/AnimeLighting';
import type { CameraMotion } from '../components/CameraRig';

export const FPS              = 30;
export const SCENE_FRAMES     = 60;   // 2 seconds per scene
export const TRANSITION_FRAMES = 15;  // 0.5 second pulse transition
export const SCENES_COUNT     = 10;

// Total duration = 10 scenes + 9 transitions
export const TOTAL_FRAMES =
  SCENES_COUNT * SCENE_FRAMES + (SCENES_COUNT - 1) * TRANSITION_FRAMES;
// = 600 + 135 = 735 frames = 24.5 seconds

export interface SceneConfig {
  id: string;
  label: string;
  /** Asset filename — replace with your image */
  asset: string;
  /** Background gradient colour (fallback when no texture) */
  bgFrom: string;
  bgTo:   string;
  /** Shader on the main character plane */
  shader: 'pulse' | 'rim';
  /** Glow / rim colour (teal by default, overridden per scene) */
  glowColor: [number, number, number];
  /** Three.js lighting preset */
  lighting: AnimeLightingPreset;
  /** Camera motion style */
  camera: CameraMotion;
  /** Pulse transition colour going INTO the next scene */
  transitionColor?: string;
}

export const SCENE_CONFIGS: SceneConfig[] = [
  // ── 1. Attack on Titan ──────────────────────────────────────────────────────
  {
    id:    'aot',
    label: 'Attack on Titan Style',
    asset: 'assets/aot.png',
    bgFrom: '#0d0a06',
    bgTo:   '#2a1a08',
    shader: 'rim',
    glowColor: [0.8, 0.65, 0.3],
    lighting: {
      ambientIntensity: 0.4,
      keyColor: '#e8c87a',
      keyIntensity: 1.3,
      rimColor: '#c8a040',
      rimIntensity: 2.0,
      accentColor: '#a07820',
      pulseSpeed: 0.8,
    },
    camera: 'breathe',
    transitionColor: '#c8a040',
  },
  // ── 2. Naruto ───────────────────────────────────────────────────────────────
  {
    id:    'naruto',
    label: 'Naruto Style',
    asset: 'assets/naruto.png',
    bgFrom: '#ff6600',
    bgTo:   '#001a2e',
    shader: 'pulse',
    glowColor: [1.0, 0.4, 0.05],
    lighting: {
      ambientIntensity: 0.3,
      keyColor: '#ffaa44',
      keyIntensity: 1.8,
      rimColor: '#ff6600',
      rimIntensity: 3.0,
      accentColor: '#ff9900',
      accentIntensity: 4.0,
      pulseSpeed: 1.4,
    },
    camera: 'push-in',
    transitionColor: '#ff6600',
  },
  // ── 3. One Piece ────────────────────────────────────────────────────────────
  {
    id:    'onepiece',
    label: 'One Piece Style',
    asset: 'assets/onepiece.png',
    bgFrom: '#002244',
    bgTo:   '#0077cc',
    shader: 'pulse',
    glowColor: [0.1, 0.5, 1.0],
    lighting: {
      ambientIntensity: 0.4,
      keyColor: '#88ccff',
      keyIntensity: 1.5,
      rimColor: '#1de5ff',
      rimIntensity: 2.4,
      accentColor: '#0044ff',
      accentIntensity: 3.0,
      pulseSpeed: 1.0,
    },
    camera: 'pan-right',
    transitionColor: '#0088ff',
  },
  // ── 4. Dragon Ball Z ────────────────────────────────────────────────────────
  {
    id:    'dbz',
    label: 'Dragon Ball Z Style',
    asset: 'assets/dbz.png',
    bgFrom: '#000000',
    bgTo:   '#ffffaa',
    shader: 'pulse',
    glowColor: [1.0, 1.0, 0.1],
    lighting: {
      ambientIntensity: 0.2,
      keyColor: '#ffffee',
      keyIntensity: 2.5,
      rimColor: '#ffff00',
      rimIntensity: 5.0,
      accentColor: '#ffffaa',
      accentIntensity: 8.0,
      pulseSpeed: 2.0,
    },
    camera: 'static',
    transitionColor: '#ffff00',
  },
  // ── 5. Bleach ───────────────────────────────────────────────────────────────
  {
    id:    'bleach',
    label: 'Bleach Style',
    asset: 'assets/bleach.png',
    bgFrom: '#050510',
    bgTo:   '#1a0030',
    shader: 'rim',
    glowColor: [0.4, 0.0, 1.0],
    lighting: {
      ambientIntensity: 0.25,
      keyColor: '#aa88ff',
      keyIntensity: 1.6,
      rimColor: '#6600ff',
      rimIntensity: 3.5,
      accentColor: '#cc44ff',
      accentIntensity: 4.0,
      pulseSpeed: 1.2,
    },
    camera: 'pan-left',
    transitionColor: '#8800ff',
  },
  // ── 6. Demon Slayer ─────────────────────────────────────────────────────────
  {
    id:    'demonslayer',
    label: 'Demon Slayer Style',
    asset: 'assets/demonslayer.png',
    bgFrom: '#1a0000',
    bgTo:   '#660011',
    shader: 'pulse',
    glowColor: [1.0, 0.05, 0.1],
    lighting: {
      ambientIntensity: 0.2,
      keyColor: '#ff4444',
      keyIntensity: 1.8,
      rimColor: '#ff1133',
      rimIntensity: 4.0,
      accentColor: '#ff0022',
      accentIntensity: 5.0,
      pulseSpeed: 1.6,
    },
    camera: 'breathe',
    transitionColor: '#ff1133',
  },
  // ── 7. Jujutsu Kaisen ───────────────────────────────────────────────────────
  {
    id:    'jjk',
    label: 'Jujutsu Kaisen Style',
    asset: 'assets/jjk.png',
    bgFrom: '#000000',
    bgTo:   '#0a1a0a',
    shader: 'rim',
    glowColor: [0.0, 0.9, 0.3],
    lighting: {
      ambientIntensity: 0.15,
      keyColor: '#00ff88',
      keyIntensity: 1.4,
      rimColor: '#00ff44',
      rimIntensity: 3.8,
      accentColor: '#00ff66',
      accentIntensity: 5.0,
      pulseSpeed: 1.3,
    },
    camera: 'push-in',
    transitionColor: '#00ff44',
  },
  // ── 8. My Hero Academia ─────────────────────────────────────────────────────
  {
    id:    'mha',
    label: 'My Hero Academia Style',
    asset: 'assets/mha.png',
    bgFrom: '#001133',
    bgTo:   '#003388',
    shader: 'pulse',
    glowColor: [0.1, 0.4, 1.0],
    lighting: {
      ambientIntensity: 0.4,
      keyColor: '#5599ff',
      keyIntensity: 1.6,
      rimColor: '#1155ee',
      rimIntensity: 2.8,
      accentColor: '#00aaff',
      accentIntensity: 4.0,
      pulseSpeed: 1.1,
    },
    camera: 'pan-right',
    transitionColor: '#1155ff',
  },
  // ── 9. Solo Leveling ────────────────────────────────────────────────────────
  {
    id:    'sololeveling',
    label: 'Solo Leveling Style',
    asset: 'assets/sololeveling.png',
    bgFrom: '#000000',
    bgTo:   '#110022',
    shader: 'rim',
    glowColor: [0.5, 0.0, 1.0],
    lighting: {
      ambientIntensity: 0.1,
      keyColor: '#8844ff',
      keyIntensity: 1.3,
      rimColor: '#6600cc',
      rimIntensity: 4.5,
      accentColor: '#aa00ff',
      accentIntensity: 6.0,
      pulseSpeed: 1.5,
    },
    camera: 'push-in',
    transitionColor: '#aa00ff',
  },
  // ── 10. Final Pulse Multiverse Form ─────────────────────────────────────────
  {
    id:    'final',
    label: 'Final Pulse Multiverse Form',
    asset: 'assets/final.png',
    bgFrom: '#000000',
    bgTo:   '#001a1a',
    shader: 'pulse',
    glowColor: [0.114, 0.898, 1.0],
    lighting: {
      ambientIntensity: 0.3,
      keyColor: '#ffffff',
      keyIntensity: 2.0,
      rimColor: '#1de5ff',
      rimIntensity: 6.0,
      accentColor: '#1de5ff',
      accentIntensity: 8.0,
      pulseSpeed: 2.5,
    },
    camera: 'breathe',
    transitionColor: '#1de5ff',
  },
];
