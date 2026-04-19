/**
 * Scene 01 — Attack on Titan
 * Earthy bronze tones, rim light, breathe camera.
 */
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { BaseScene } from './BaseScene';
import { SCENE_CONFIGS } from '../config/scenes';
import { useSceneTexture } from '../utils/useSceneTexture';

const CONFIG = SCENE_CONFIGS[0]; // id: 'aot'

export const Scene01AOT: React.FC = () => {
  const localFrame = useCurrentFrame();
  const texture    = useSceneTexture(CONFIG.asset);
  return <BaseScene config={CONFIG} localFrame={localFrame} texture={texture} />;
};
