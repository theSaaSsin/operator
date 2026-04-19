/**
 * BOSS · framer/fade-up.jsx
 * Reusable Framer Motion stagger-in component.
 * Used by Remotion compositions and the Lovable landing.
 *
 * Usage:
 *   <FadeUp delay={0.2}>I rise from below</FadeUp>
 *   <FadeUpList items={['One', 'Two', 'Three']} stagger={0.08} />
 */
import React from 'react';
import { motion } from 'framer-motion';

export const FadeUp = ({ children, delay = 0, y = 24, duration = 0.7, ...rest }) => (
  <motion.div
    initial={{ opacity: 0, y }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration, ease: [0.22, 1, 0.36, 1], delay }}
    {...rest}
  >
    {children}
  </motion.div>
);

export const FadeUpList = ({ items = [], stagger = 0.08, ...rest }) => (
  <>
    {items.map((it, i) => (
      <FadeUp key={i} delay={i * stagger} {...rest}>{it}</FadeUp>
    ))}
  </>
);

export default FadeUp;
