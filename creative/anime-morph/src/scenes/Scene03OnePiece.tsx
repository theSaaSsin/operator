/**
 * Scene 03 — One Piece Style
 * Ocean blues, chromatic aberration pulse, pan-right camera.
 */
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { BaseScene } from './BaseScene';
import { SCENE_CONFIGS } from '../config/scenes';
import { useSceneTexture } from '../utils/useSceneTexture';

const CONFIG = SCENE_CONFIGS[2]; // id: 'onepiece'

export const Scene03OnePiece: React.FC = () => {
  const localFrame = useCurrentFrame();
  const texture    = useSceneTexture(CONFIG.asset);
  return <BaseScene config={CONFIG} localFrame={localFrame} texture={texture} />;
};
