/**
 * VideoRoot — Remotion composition registry.
 * Register all compositions here.
 */
import React from 'react';
import { Composition } from 'remotion';
import { AnimeMorph } from './compositions/AnimeMorph';
import { FPS, TOTAL_FRAMES } from './config/scenes';

export const VideoRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AnimeMorph"
        component={AnimeMorph}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
    </>
  );
};
