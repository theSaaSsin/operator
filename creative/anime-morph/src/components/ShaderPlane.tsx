/**
 * ShaderPlane — core render primitive.
 * Renders an image on a full-screen Three.js plane with custom GLSL shaders.
 * Accepts pulse or rim-light shader via `shaderType` prop.
 */
import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import * as THREE from 'three';
import { pulseShader } from '../shaders/pulseShader';
import { rimLightShader } from '../shaders/rimLightShader';

export type ShaderType = 'pulse' | 'rim';

interface ShaderPlaneProps {
  texture: THREE.Texture | null;
  shaderType?: ShaderType;
  /** Extra uniforms to override defaults per-scene */
  uniformOverrides?: Record<string, { value: unknown }>;
  /** Z-depth offset — use for parallax layering */
  z?: number;
  /** Scale of the plane (default fills 1920×1080 viewport) */
  scale?: [number, number];
}

export const ShaderPlane: React.FC<ShaderPlaneProps> = ({
  texture,
  shaderType = 'pulse',
  uniformOverrides = {},
  z = 0,
  scale = [19.2, 10.8],
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { size } = useThree();

  // Build shader uniforms — merge defaults with scene-level overrides
  const uniforms = useMemo(() => {
    const base = shaderType === 'pulse' ? pulseShader.uniforms : rimLightShader.uniforms;
    const merged: Record<string, THREE.IUniform> = {};
    for (const [k, v] of Object.entries(base)) {
      const val = v.value;
      if (Array.isArray(val)) {
        merged[k] = { value: new THREE.Vector3(...(val as [number, number, number])) };
      } else {
        merged[k] = { value: val };
      }
    }
    // Apply per-scene overrides
    for (const [k, v] of Object.entries(uniformOverrides)) {
      if (merged[k]) merged[k].value = v.value;
    }
    return merged;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shaderType]);

  // Update texture and time uniform every frame
  useFrame(() => {
    if (!meshRef.current) return;
    const mat = meshRef.current.material as THREE.ShaderMaterial;
    if (texture) mat.uniforms.uTexture.value = texture;
    mat.uniforms.uTime.value = frame / fps;
  });

  const { vertexShader, fragmentShader } = shaderType === 'pulse' ? pulseShader : rimLightShader;

  return (
    <mesh ref={meshRef} position={[0, 0, z]}>
      <planeGeometry args={[scale[0], scale[1], 1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
};
