/**
 * Scene 01 — Real Joshua
 * Cold desaturated blue tones, subtle rim light, breathe camera.
 */
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { BaseScene } from './BaseScene';
import { SCENE_CONFIGS } from '../config/scenes';
import { useSceneTexture } from '../utils/useSceneTexture';

const CONFIG = SCENE_CONFIGS[0]; // id: 'real'

export const Scene01Real: React.FC = () => {
  const localFrame = useCurrentFrame();
  const texture    = useSceneTexture(CONFIG.asset);
  return <BaseScene config={CONFIG} localFrame={localFrame} texture={texture} />;
};
