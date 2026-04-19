/**
 * Scene 02 — Naruto Style
 * Orange fire tones, intense pulse shader, push-in camera.
 */
import React from 'react';
import { useCurrentFrame } from 'remotion';
import { BaseScene } from './BaseScene';
import { SCENE_CONFIGS } from '../config/scenes';
import { useSceneTexture } from '../utils/useSceneTexture';

const CONFIG = SCENE_CONFIGS[1]; // id: 'naruto'

export const Scene02Naruto: React.FC = () => {
  const localFrame = useCurrentFrame();
  const texture    = useSceneTexture(CONFIG.asset);
  return <BaseScene config={CONFIG} localFrame={localFrame} texture={texture} />;
};
