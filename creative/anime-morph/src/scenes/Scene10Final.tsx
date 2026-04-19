/**
 * Scene 10 — Final Pulse Multiverse Form
 * All-colour convergence. Teal/cyan pulse, breathe camera.
 * Spinning colour rings + constellation particle field at full intensity.
 */
import React from 'react';
import { useCurrentFrame, interpolate, Easing, AbsoluteFill } from 'remotion';
import { BaseScene } from './BaseScene';
import { SCENE_CONFIGS } from '../config/scenes';
import { useSceneTexture } from '../utils/useSceneTexture';
import { SCENE_FRAMES } from '../config/scenes';

const CONFIG = SCENE_CONFIGS[9]; // id: 'final'

// Previous scene transition colours — collapse into one rainbow ring
const RING_COLORS = [
  '#4488ff', // real
  '#ff6600', // naruto
  '#0088ff', // onepiece
  '#ffff00', // dbz
  '#8800ff', // bleach
  '#ff1133', // demonslayer
  '#00ff44', // jjk
  '#1155ff', // mha
  '#aa00ff', // sololeveling
  '#1de5ff', // final
];

export const Scene10Final: React.FC = () => {
  const localFrame = useCurrentFrame();
  const texture    = useSceneTexture(CONFIG.asset);

  // Rings spiral in
  const ringsOpacity = interpolate(
    localFrame,
    [0, SCENE_FRAMES * 0.2, SCENE_FRAMES * 0.85, SCENE_FRAMES],
    [0, 1, 1, 0],
    { easing: Easing.out(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const ringsScale = interpolate(
    localFrame,
    [0, SCENE_FRAMES * 0.2],
    [0.4, 1],
    { easing: Easing.bezier(0.16, 1, 0.3, 1), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // Full rotation over scene
  const rotation = interpolate(localFrame, [0, SCENE_FRAMES], [0, 360], {
    extrapolateRight: 'clamp',
  });

  return (
    <>
      <BaseScene config={CONFIG} localFrame={localFrame} texture={texture} />

      {/* Multiverse convergence rings */}
      <AbsoluteFill
        style={{
          display:      'flex',
          alignItems:   'center',
          justifyContent:'center',
          pointerEvents:'none',
          opacity:      ringsOpacity,
        }}
      >
        {RING_COLORS.map((color, i) => {
          const size   = 120 + i * 50;
          const offset = (i / RING_COLORS.length) * 36; // stagger rotation
          return (
            <div
              key={i}
              style={{
                position:    'absolute',
                width:       `${size}px`,
                height:      `${size}px`,
                borderRadius:'50%',
                border:      `2px solid ${color}`,
                boxShadow:   `0 0 16px 4px ${color}88, inset 0 0 8px ${color}44`,
                transform:   `scale(${ringsScale}) rotate(${rotation + offset}deg)`,
                opacity:     0.6 + (i / RING_COLORS.length) * 0.4,
                mixBlendMode:'screen',
              }}
            />
          );
        })}

        {/* Central convergence burst */}
        <div
          style={{
            position:    'absolute',
            width:       '6px',
            height:      '6px',
            borderRadius:'50%',
            background:  '#1de5ff',
            boxShadow:   `0 0 80px 40px #1de5ff88, 0 0 160px 80px #1de5ff33`,
            transform:   `scale(${ringsScale})`,
          }}
        />
      </AbsoluteFill>
    </>
  );
};
