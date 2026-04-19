/**
 * Scene 09 — Solo Leveling Style
 * Pitch black, violet/purple system UI artifacts, push-in camera.
 * System status window floats in corner with HP/mana bars.
 */
import React from 'react';
import { useCurrentFrame, interpolate, Easing, AbsoluteFill } from 'remotion';
import { BaseScene } from './BaseScene';
import { SCENE_CONFIGS } from '../config/scenes';
import { useSceneTexture } from '../utils/useSceneTexture';
import { SCENE_FRAMES } from '../config/scenes';

const CONFIG = SCENE_CONFIGS[8]; // id: 'sololeveling'

export const Scene09SoloLeveling: React.FC = () => {
  const localFrame = useCurrentFrame();
  const texture    = useSceneTexture(CONFIG.asset);

  // System window slides in
  const sysOpacity = interpolate(
    localFrame,
    [SCENE_FRAMES * 0.15, SCENE_FRAMES * 0.3, SCENE_FRAMES * 0.8, SCENE_FRAMES * 0.95],
    [0, 1, 1, 0],
    { easing: Easing.out(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const sysX = interpolate(
    localFrame,
    [SCENE_FRAMES * 0.15, SCENE_FRAMES * 0.3],
    [60, 0],
    { easing: Easing.out(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // HP bar fills from 30% → 100% over scene
  const hpFill = interpolate(localFrame, [0, SCENE_FRAMES], [30, 100], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const baseFontSize = 13;

  const panelStyle: React.CSSProperties = {
    position:    'absolute',
    top:         '5%',
    right:       `calc(4% + ${sysX}px)`,
    width:       '260px',
    background:  'rgba(10,0,30,0.82)',
    border:      '1px solid #aa00ff88',
    borderRadius:'6px',
    padding:     '14px 18px',
    fontFamily:  '"Courier New", monospace',
    fontSize:    `${baseFontSize}px`,
    color:       '#cc88ff',
    boxShadow:   '0 0 24px #aa00ff44, inset 0 0 12px #6600cc22',
    opacity:     sysOpacity,
    pointerEvents:'none',
    letterSpacing:'0.06em',
  };

  return (
    <>
      <BaseScene config={CONFIG} localFrame={localFrame} texture={texture} />

      {/* System Status Panel */}
      <AbsoluteFill style={{ pointerEvents: 'none' }}>
        <div style={panelStyle}>
          <div style={{ color: '#ffffff', fontWeight: 700, marginBottom: '10px',
            textShadow: '0 0 10px #aa00ff', letterSpacing: '0.15em' }}>
            ▶ SYSTEM STATUS
          </div>

          {/* HP Bar */}
          <div style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span>HP</span>
              <span style={{ color: '#ff6688' }}>{Math.round(hpFill)} / 100</span>
            </div>
            <div style={{ background: '#1a0030', height: '8px', borderRadius: '4px',
              border: '1px solid #6600cc66' }}>
              <div style={{ width: `${hpFill}%`, height: '100%', background:
                'linear-gradient(90deg, #cc0044, #ff3366)', borderRadius: '4px',
                boxShadow: '0 0 8px #ff336688' }} />
            </div>
          </div>

          {/* MP Bar */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span>MP</span>
              <span style={{ color: '#8844ff' }}>9,999 / 9,999</span>
            </div>
            <div style={{ background: '#1a0030', height: '8px', borderRadius: '4px',
              border: '1px solid #6600cc66' }}>
              <div style={{ width: '100%', height: '100%', background:
                'linear-gradient(90deg, #4400cc, #aa00ff)', borderRadius: '4px',
                boxShadow: '0 0 8px #aa00ff88' }} />
            </div>
          </div>

          <div style={{ borderTop: '1px solid #6600cc44', paddingTop: '8px',
            color: '#8844ff', fontSize: '11px', lineHeight: 1.6 }}>
            <div>LEVEL &nbsp;&nbsp;&nbsp;&nbsp;S-RANK</div>
            <div>CLASS &nbsp;&nbsp;&nbsp;&nbsp;SHADOW MONARCH</div>
            <div style={{ color: '#ffffff', marginTop: '4px',
              textShadow: '0 0 8px #aa00ff' }}>
              ⬛ ARISE
            </div>
          </div>
        </div>
      </AbsoluteFill>
    </>
  );
};
