/**
 * Scene 04 — Dragon Ball Z Style
 * Blinding yellow-white SSJ aura, static camera, max pulse intensity.
 */
import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { AbsoluteFill } from 'remotion';
import { BaseScene } from './BaseScene';
import { SCENE_CONFIGS } from '../config/scenes';
import { useSceneTexture } from '../utils/useSceneTexture';

const CONFIG = SCENE_CONFIGS[3]; // id: 'dbz'

export const Scene04DBZ: React.FC = () => {
  const localFrame = useCurrentFrame();
  const texture    = useSceneTexture(CONFIG.asset);

  // Extra SSJ power-up aura flicker overlay
  const flickerOpacity = interpolate(
    Math.sin(localFrame * 0.8 + Math.cos(localFrame * 0.3)),
    [-1, 1],
    [0, 0.15],
  );

  return (
    <>
      <BaseScene config={CONFIG} localFrame={localFrame} texture={texture} />
      {/* SSJ corona overlay */}
      <AbsoluteFill
        style={{
          background:   'radial-gradient(ellipse at 50% 80%, #ffff0044 0%, transparent 60%)',
          opacity:      flickerOpacity,
          pointerEvents:'none',
          mixBlendMode: 'screen',
        }}
      />
    </>
  );
};
