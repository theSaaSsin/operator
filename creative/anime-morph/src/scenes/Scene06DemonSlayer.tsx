/**
 * Scene 06 — Demon Slayer Style
 * Crimson / total concentration breathing pattern.
 * Breathing sweep overlay synced to scene progress.
 */
import React from 'react';
import { useCurrentFrame, interpolate, Easing, AbsoluteFill } from 'remotion';
import { BaseScene } from './BaseScene';
import { SCENE_CONFIGS } from '../config/scenes';
import { useSceneTexture } from '../utils/useSceneTexture';
import { SCENE_FRAMES } from '../config/scenes';

const CONFIG = SCENE_CONFIGS[5]; // id: 'demonslayer'

export const Scene06DemonSlayer: React.FC = () => {
  const localFrame = useCurrentFrame();
  const texture    = useSceneTexture(CONFIG.asset);

  // Breath form diagonal slash — sweeps across screen mid-scene
  const slashProgress = interpolate(
    localFrame,
    [SCENE_FRAMES * 0.3, SCENE_FRAMES * 0.55],
    [0, 1],
    { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const slashOpacity = interpolate(
    localFrame,
    [SCENE_FRAMES * 0.3, SCENE_FRAMES * 0.4, SCENE_FRAMES * 0.55, SCENE_FRAMES * 0.7],
    [0, 0.6, 0.4, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  return (
    <>
      <BaseScene config={CONFIG} localFrame={localFrame} texture={texture} />
      {/* Water Breathing slash arc */}
      <AbsoluteFill
        style={{
          overflow:     'hidden',
          pointerEvents:'none',
        }}
      >
        <div
          style={{
            position:  'absolute',
            top:       `${(1 - slashProgress) * 120 - 20}%`,
            left:      '-10%',
            width:     '120%',
            height:    '4px',
            background:'linear-gradient(90deg, transparent, #ff1133cc, #ff6644, transparent)',
            boxShadow: '0 0 40px 16px #ff113344',
            transform: `rotate(-12deg)`,
            opacity:   slashOpacity,
          }}
        />
      </AbsoluteFill>
    </>
  );
};
