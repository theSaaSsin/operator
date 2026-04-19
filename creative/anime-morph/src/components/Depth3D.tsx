/**
 * Depth3D — creates a parallax depth stack.
 * Renders multiple image layers at different Z positions,
 * each shifting on mouse or frame-driven motion for a 3D parallax feel.
 */
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import * as THREE from 'three';
import { ShaderPlane } from './ShaderPlane';

interface DepthLayer {
  texture: THREE.Texture | null;
  z: number;
  parallaxStrength?: number;
  shaderType?: 'pulse' | 'rim';
}

interface Depth3DProps {
  layers: DepthLayer[];
  /** Camera bob amplitude */
  cameraBob?: number;
  /** Camera drift speed */
  driftSpeed?: number;
}

export const Depth3D: React.FC<Depth3DProps> = ({
  layers,
  cameraBob    = 0.08,
  driftSpeed   = 0.4,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const frame    = useCurrentFrame();
  const { fps }  = useVideoConfig();

  useFrame(({ camera }) => {
    const t = frame / fps;

    // Gentle camera drift for 3D depth feel
    camera.position.x = Math.sin(t * driftSpeed) * 0.3;
    camera.position.y = Math.cos(t * driftSpeed * 0.7) * cameraBob;
    camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={groupRef}>
      {layers.map((layer, i) => (
        <ShaderPlane
          key={i}
          texture={layer.texture}
          z={layer.z}
          shaderType={layer.shaderType ?? 'pulse'}
          // Slightly larger for farther layers
          scale={[19.2 + Math.abs(layer.z) * 0.5, 10.8 + Math.abs(layer.z) * 0.3]}
        />
      ))}
    </group>
  );
};
