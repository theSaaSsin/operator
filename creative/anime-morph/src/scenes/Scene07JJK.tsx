/**
 * Scene 07 — Jujutsu Kaisen Style
 * Near-black, toxic green cursed energy, rim shader, push-in camera.
 * Domain expansion hex grid flickers at mid-scene.
 */
import React from 'react';
import { useCurrentFrame, interpolate, Easing, AbsoluteFill } from 'remotion';
import { BaseScene } from './BaseScene';
import { SCENE_CONFIGS } from '../config/scenes';
import { useSceneTexture } from '../utils/useSceneTexture';
import { SCENE_FRAMES } from '../config/scenes';

const CONFIG = SCENE_CONFIGS[6]; // id: 'jjk'

// SVG hex grid as a data-URL for domain expansion texture
const HEX_GRID_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="92">
    <polygon points="40,4 76,24 76,68 40,88 4,68 4,24"
      fill="none" stroke="%2300ff44" stroke-width="0.8" stroke-opacity="0.35"/>
  </svg>`,
)}`;

export const Scene07JJK: React.FC = () => {
  const localFrame = useCurrentFrame();
  const texture    = useSceneTexture(CONFIG.asset);

  // Domain expansion pulse — reveals hex grid mid-scene
  const domainOpacity = interpolate(
    localFrame,
    [SCENE_FRAMES * 0.25, SCENE_FRAMES * 0.45, SCENE_FRAMES * 0.75, SCENE_FRAMES * 0.9],
    [0, 0.18, 0.14, 0],
    { easing: Easing.inOut(Easing.quad), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  return (
    <>
      <BaseScene config={CONFIG} localFrame={localFrame} texture={texture} />
      {/* Domain hex grid */}
      <AbsoluteFill
        style={{
          backgroundImage:  `url("${HEX_GRID_SVG}")`,
          backgroundRepeat: 'repeat',
          backgroundSize:   '80px 92px',
          opacity:          domainOpacity,
          pointerEvents:    'none',
          mixBlendMode:     'screen',
        }}
      />
    </>
  );
};
