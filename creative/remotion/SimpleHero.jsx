/**
 * BOSS · remotion/SimpleHero.jsx
 * The "hello world" Remotion composition. Headline + subline + lime accent.
 *
 * To register in your Remotion project:
 *   import { SimpleHero } from './creative/remotion/SimpleHero';
 *   <Composition id="SimpleHero" component={SimpleHero}
 *     durationInFrames={150} fps={30} width={1920} height={1080}
 *     defaultProps={{ headline: 'B.O.S.S', subline: 'Business Optimization System Service' }} />
 *
 * Then `npx remotion render SimpleHero out.mp4`.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';

export const SimpleHero = ({
  headline = 'B.O.S.S',
  subline  = 'Business Optimization System Service',
  accent   = '#c8ff00',
  bg       = '#0a0a0a',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 16, stiffness: 90 } });
  const subY  = interpolate(frame, [10, 40], [40, 0], { extrapolateRight: 'clamp' });
  const subO  = interpolate(frame, [10, 40], [0, 1],  { extrapolateRight: 'clamp' });
  const lineW = interpolate(frame, [25, 60], [0, 200], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ background: bg, alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui' }}>
      <div style={{ transform: `scale(${enter})`, color: accent, fontSize: 220, fontWeight: 900, letterSpacing: -8 }}>
        {headline}
      </div>
      <div style={{ width: lineW, height: 4, background: accent, marginTop: 24, opacity: 0.85 }} />
      <div style={{ marginTop: 28, color: '#fff', fontSize: 32, opacity: subO, transform: `translateY(${subY}px)` }}>
        {subline}
      </div>
    </AbsoluteFill>
  );
};

export default SimpleHero;
