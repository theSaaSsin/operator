/**
 * CameraRig — sets up the Three.js perspective camera for all scenes.
 * Provides subtle per-scene motion: breathe, push-in, pan.
 */
import React from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';

export type CameraMotion = 'breathe' | 'push-in' | 'pan-left' | 'pan-right' | 'static';

interface CameraRigProps {
  motion?: CameraMotion;
  /** How far into this scene we are (0..1) */
  sceneProgress?: number;
  fov?: number;
}

export const CameraRig: React.FC<CameraRigProps> = ({
  motion       = 'breathe',
  sceneProgress = 0,
  fov          = 50,
}) => {
  const { camera } = useThree();
  const frame      = useCurrentFrame();
  const { fps }    = useVideoConfig();
  const t          = frame / fps;

  useFrame(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = fov;
    cam.updateProjectionMatrix();

    switch (motion) {
      case 'breathe': {
        const breathe = Math.sin(t * Math.PI) * 0.06;
        cam.position.set(0, breathe, 10 - breathe * 0.3);
        break;
      }
      case 'push-in': {
        const z = interpolate(sceneProgress, [0, 1], [12, 8], { extrapolateRight: 'clamp' });
        cam.position.set(0, 0, z);
        break;
      }
      case 'pan-left': {
        const x = interpolate(sceneProgress, [0, 1], [1.5, -1.5], { extrapolateRight: 'clamp' });
        cam.position.set(x, 0, 10);
        break;
      }
      case 'pan-right': {
        const x = interpolate(sceneProgress, [0, 1], [-1.5, 1.5], { extrapolateRight: 'clamp' });
        cam.position.set(x, 0, 10);
        break;
      }
      case 'static':
      default: {
        cam.position.set(0, 0, 10);
        break;
      }
    }
    cam.lookAt(0, 0, 0);
  });

  return null;
};
