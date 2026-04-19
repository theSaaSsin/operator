/**
 * BaseScene — shared scene shell.
 * All 10 scenes extend this. Handles:
 *  - Background gradient
 *  - ThreeCanvas setup (camera, lighting, shader plane)
 *  - Fade-in / fade-out envelope
 *  - Scene label overlay
 */
import React, { useMemo } from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import * as THREE from 'three';
import { AnimeLighting } from '../components/AnimeLighting';
import { CameraRig } from '../components/CameraRig';
import { ShaderPlane } from '../components/ShaderPlane';
import type { SceneConfig } from '../config/scenes';
import { SCENE_FRAMES } from '../config/scenes';

interface BaseSceneProps {
  config: SceneConfig;
  /** Frame offset within this scene (0-based) */
  localFrame: number;
  /** Preloaded texture (null = show fallback gradient) */
  texture?: THREE.Texture | null;
  children?: React.ReactNode;
}

export const BaseScene: React.FC<BaseSceneProps> = ({
  config,
  localFrame,
  texture = null,
  children,
}) => {
  const sceneProgress = localFrame / SCENE_FRAMES;

  // Fade in at start, fade out at end
  const opacity = interpolate(
    localFrame,
    [0, 8, SCENE_FRAMES - 8, SCENE_FRAMES],
    [0, 1, 1, 0],
    { easing: Easing.ease, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  // Label slide-up
  const labelY = interpolate(localFrame, [0, 12], [30, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateRight: 'clamp',
  });

  // Shader glow colour as THREE.Vector3 uniform override
  const glowOverride = useMemo(() => ({
    uGlowColor: {
      value: new THREE.Vector3(...config.glowColor),
    },
  }), [config.glowColor]);

  return (
    <AbsoluteFill style={{ opacity }}>
      {/* Background gradient */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 40%, ${config.bgFrom}, ${config.bgTo})`,
        }}
      />

      {/* Three.js canvas — shader plane + lighting */}
      <AbsoluteFill>
        <ThreeCanvas width={1920} height={1080} style={{ width: '100%', height: '100%' }}>
          <CameraRig motion={config.camera} sceneProgress={sceneProgress} />
          <AnimeLighting preset={config.lighting} />

          {/* Main character shader plane */}
          <ShaderPlane
            texture={texture}
            shaderType={config.shader}
            uniformOverrides={glowOverride as Record<string, { value: unknown }>}
            z={0}
          />

          {/* Background depth layer (same texture, blurred-scale) */}
          <ShaderPlane
            texture={texture}
            shaderType="pulse"
            uniformOverrides={{
              uPulseIntensity:    { value: 0.4 },
              uChromaticStrength: { value: 0.02 },
              ...glowOverride,
            }}
            z={-3}
            scale={[22, 12.4]}
          />

          {/* Extra scene-specific 3D children */}
          {children}
        </ThreeCanvas>
      </AbsoluteFill>

      {/* Scene label */}
      <AbsoluteFill
        style={{
          display:       'flex',
          alignItems:    'flex-end',
          justifyContent:'center',
          paddingBottom: '48px',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            transform:   `translateY(${labelY}px)`,
            color:       '#ffffff',
            fontFamily:  '"Inter", "Helvetica Neue", sans-serif',
            fontSize:    '28px',
            fontWeight:  900,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            textShadow:  `0 0 24px ${config.transitionColor ?? '#1de5ff'}, 0 2px 8px rgba(0,0,0,0.9)`,
          }}
        >
          {config.label}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
