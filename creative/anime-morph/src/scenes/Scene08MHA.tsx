/**
 * Scene 08 — My Hero Academia Style
 * Deep navy → blue, One For All lightning arcs, pan-right camera.
 */
import React from 'react';
import { useCurrentFrame, interpolate, Easing, AbsoluteFill } from 'remotion';
import { BaseScene } from './BaseScene';
import { SCENE_CONFIGS } from '../config/scenes';
import { useSceneTexture } from '../utils/useSceneTexture';
import { SCENE_FRAMES } from '../config/scenes';

const CONFIG = SCENE_CONFIGS[7]; // id: 'mha'

// Generate deterministic lightning-bolt path points for SVG
function boltPoints(seed: number, w: number, h: number): string {
  const steps = 8;
  const points: string[] = [`${w * 0.5},0`];
  for (let i = 1; i < steps; i++) {
    const x = w * (0.5 + (Math.sin(seed + i * 2.7) * 0.35));
    const y = h * (i / steps);
    points.push(`${x},${y}`);
  }
  points.push(`${w * 0.5},${h}`);
  return points.join(' ');
}

export const Scene08MHA: React.FC = () => {
  const localFrame = useCurrentFrame();
  const texture    = useSceneTexture(CONFIG.asset);

  // OFA lightning appear/disappear bursts
  const boltOpacity = interpolate(
    (localFrame % 12) / 12,
    [0, 0.08, 0.2, 1],
    [0, 0.9, 0.5, 0],
    { easing: Easing.out(Easing.quad), extrapolateRight: 'clamp' },
  );

  // Overall lightning visible only in middle portion of scene
  const windowOpacity = interpolate(
    localFrame,
    [SCENE_FRAMES * 0.2, SCENE_FRAMES * 0.35, SCENE_FRAMES * 0.8, SCENE_FRAMES * 0.92],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  const bolt1 = boltPoints(1.1, 1920, 1080);
  const bolt2 = boltPoints(3.7, 1920, 1080);
  const bolt3 = boltPoints(6.3, 1920, 1080);

  return (
    <>
      <BaseScene config={CONFIG} localFrame={localFrame} texture={texture} />
      {/* One For All lightning overlay */}
      <AbsoluteFill style={{ pointerEvents: 'none', opacity: windowOpacity * boltOpacity }}>
        <svg
          viewBox="0 0 1920 1080"
          style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
        >
          <polyline points={bolt1} fill="none" stroke="#00aaff" strokeWidth="3"
            filter="url(#glow)" opacity="0.9" />
          <polyline points={bolt2} fill="none" stroke="#ffffff" strokeWidth="2"
            filter="url(#glow)" opacity="0.7" />
          <polyline points={bolt3} fill="none" stroke="#1155ee" strokeWidth="2.5"
            filter="url(#glow)" opacity="0.8" />
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>
      </AbsoluteFill>
    </>
  );
};
