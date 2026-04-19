/**
 * AnimeLighting — Three.js lighting rig for each scene.
 * Includes: ambient fill, key light, rim light, pulsing point light.
 * All lights animated per-frame using Remotion's useCurrentFrame().
 */
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import * as THREE from 'three';

export interface AnimeLightingPreset {
  /** Ambient fill intensity (0..1) */
  ambientIntensity?: number;
  /** Main key light colour */
  keyColor?: string;
  keyIntensity?: number;
  keyPosition?: [number, number, number];
  /** Rim / back-light colour */
  rimColor?: string;
  rimIntensity?: number;
  rimPosition?: [number, number, number];
  /** Pulsing accent point light */
  accentColor?: string;
  accentIntensity?: number;
  /** Pulse speed multiplier */
  pulseSpeed?: number;
}

const DEFAULTS: Required<AnimeLightingPreset> = {
  ambientIntensity: 0.35,
  keyColor:         '#ffffff',
  keyIntensity:     1.4,
  keyPosition:      [5, 8, 6],
  rimColor:         '#1de5ff',
  rimIntensity:     2.2,
  rimPosition:      [-6, 4, -4],
  accentColor:      '#1de5ff',
  accentIntensity:  3.0,
  pulseSpeed:       1.0,
};

interface AnimeLightingProps {
  preset?: AnimeLightingPreset;
}

export const AnimeLighting: React.FC<AnimeLightingProps> = ({ preset = {} }) => {
  const cfg = { ...DEFAULTS, ...preset };
  const accentRef  = useRef<THREE.PointLight>(null);
  const rimRef     = useRef<THREE.DirectionalLight>(null);
  const frame      = useCurrentFrame();
  const { fps }    = useVideoConfig();

  useFrame(() => {
    const t = frame / fps;

    // Pulse the accent point light intensity
    if (accentRef.current) {
      const pulse = Math.sin(t * Math.PI * 2.0 * cfg.pulseSpeed) * 0.5 + 0.5;
      accentRef.current.intensity = cfg.accentIntensity * (0.6 + pulse * 0.8);
      // Orbit slowly
      accentRef.current.position.x = Math.sin(t * 0.7) * 4.0;
      accentRef.current.position.y = Math.cos(t * 0.5) * 3.0 + 2.0;
    }

    // Animate rim light for dynamic feel
    if (rimRef.current) {
      const rimPulse = Math.sin(t * Math.PI * 3.0 * cfg.pulseSpeed + 1.2) * 0.4 + 0.6;
      rimRef.current.intensity = cfg.rimIntensity * rimPulse;
    }
  });

  return (
    <>
      {/* Ambient fill — prevents pure-black shadows */}
      <ambientLight color="#0a1022" intensity={cfg.ambientIntensity} />

      {/* Key light — main directional */}
      <directionalLight
        color={cfg.keyColor}
        intensity={cfg.keyIntensity}
        position={cfg.keyPosition}
        castShadow
      />

      {/* Rim light — teal back-light signature */}
      <directionalLight
        ref={rimRef}
        color={cfg.rimColor}
        intensity={cfg.rimIntensity}
        position={cfg.rimPosition}
      />

      {/* Pulsing accent point light — roams for energy */}
      <pointLight
        ref={accentRef}
        color={cfg.accentColor}
        intensity={cfg.accentIntensity}
        distance={18}
        decay={2}
        position={[0, 2, 5]}
      />

      {/* Secondary fill from below — anime underlight */}
      <pointLight
        color="#ff6030"
        intensity={0.6}
        distance={12}
        position={[0, -6, 3]}
      />
    </>
  );
};
