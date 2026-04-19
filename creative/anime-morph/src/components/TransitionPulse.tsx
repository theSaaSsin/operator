/**
 * TransitionPulse — radial energy pulse between scenes.
 * Rendered as a full-screen HTML overlay (not Three.js) for crisp additive blending.
 * Usage: wrap between scenes in the master composition.
 */
import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';

interface TransitionPulseProps {
  /** Total duration of this transition in frames */
  durationInFrames: number;
  /** Primary energy colour (default teal) */
  color?: string;
  /** Secondary flare colour */
  color2?: string;
}

export const TransitionPulse: React.FC<TransitionPulseProps> = ({
  durationInFrames,
  color  = '#1de5ff',
  color2 = '#ffffff',
}) => {
  const frame = useCurrentFrame();

  // Progress 0 → 1 over the transition
  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
  });

  // Pulse ring radius 0 → 1.5 (overshoots to fill screen)
  const radius = interpolate(progress, [0, 1], [0, 1.5], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  // Peak flash at ~40% through
  const flash = interpolate(progress, [0, 0.4, 0.6, 1], [0, 1, 0.4, 0], {
    extrapolateRight: 'clamp',
  });

  // Screen wipe fill
  const fill = interpolate(progress, [0, 0.45, 0.55, 1], [0, 0.9, 0.9, 0], {
    extrapolateRight: 'clamp',
  });

  const ringStyle: React.CSSProperties = {
    position:    'absolute',
    inset:       0,
    background:  `radial-gradient(circle at 50% 50%,
      transparent ${(radius - 0.08) * 100}%,
      ${color} ${(radius - 0.04) * 100}%,
      ${color2} ${radius * 100}%,
      transparent ${(radius + 0.06) * 100}%)`,
    mixBlendMode: 'screen',
    opacity:      1.0,
  };

  const flashStyle: React.CSSProperties = {
    position:    'absolute',
    inset:       0,
    background:  color2,
    opacity:     flash * 0.85,
    mixBlendMode: 'screen',
  };

  const fillStyle: React.CSSProperties = {
    position:    'absolute',
    inset:       0,
    background:  `radial-gradient(circle at 50% 50%, ${color}cc 0%, transparent 70%)`,
    opacity:     fill * 0.7,
    mixBlendMode: 'screen',
  };

  // Energy particles (CSS)
  const particleStyles = Array.from({ length: 8 }, (_, i) => {
    const angle  = (i / 8) * 360;
    const dist   = radius * 50; // vw units
    const opacity = interpolate(progress, [0, 0.3, 0.7, 1], [0, 1, 0.6, 0], {
      extrapolateRight: 'clamp',
    });
    return {
      position:        'absolute' as const,
      width:           '4px',
      height:          `${8 + Math.sin(i) * 6}px`,
      background:      color,
      boxShadow:       `0 0 12px 4px ${color}`,
      top:             '50%',
      left:            '50%',
      transform:       `rotate(${angle}deg) translate(${dist}vw, -50%)`,
      opacity,
      mixBlendMode:    'screen' as const,
      borderRadius:    '2px',
    };
  });

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div style={ringStyle} />
      <div style={fillStyle} />
      {particleStyles.map((s, i) => (
        <div key={i} style={s} />
      ))}
      <div style={flashStyle} />
    </AbsoluteFill>
  );
};
