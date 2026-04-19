/**
 * Scene 05 — Bleach Style
 * Deep indigo/purple, rim shader, pan-left camera.
 * Soul Reaper reiatsu — volatile purple tendrils from vignette.
 */
import React from 'react';
import { useCurrentFrame, interpolate, Easing, AbsoluteFill } from 'remotion';
import { BaseScene } from './BaseScene';
import { SCENE_CONFIGS } from '../config/scenes';
import { useSceneTexture } from '../utils/useSceneTexture';

const CONFIG = SCENE_CONFIGS[4]; // id: 'bleach'

export const Scene05Bleach: React.FC = () => {
  const localFrame = useCurrentFrame();
  const texture    = useSceneTexture(CONFIG.asset);

  // Reiatsu pressure pulse — bursts every ~20 frames
  const burstT  = (localFrame % 20) / 20;
  const burst   = interpolate(burstT, [0, 0.15, 0.4, 1], [0, 0.25, 0.08, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateRight: 'clamp',
  });

  return (
    <>
      <BaseScene config={CONFIG} localFrame={localFrame} texture={texture} />
      <AbsoluteFill
        style={{
          background:   'radial-gradient(ellipse at 50% 50%, transparent 40%, #6600ff55 80%, #1a003099 100%)',
          opacity:      burst,
          pointerEvents:'none',
          mixBlendMode: 'screen',
        }}
      />
    </>
  );
};
