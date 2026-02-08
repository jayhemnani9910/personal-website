"use client";

import { useReducedMotion } from "framer-motion";

export function GradientOrb() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      {/* Blue Orb - Top Right */}
      <div
        className={`gradient-orb gradient-orb-1 ${prefersReducedMotion ? '' : ''}`}
        style={prefersReducedMotion ? { animation: 'none' } : {}}
      />

      {/* Purple Orb - Bottom Left */}
      <div
        className={`gradient-orb gradient-orb-2`}
        style={prefersReducedMotion ? { animation: 'none' } : {}}
      />

      {/* Pink Orb - Center */}
      <div
        className={`gradient-orb gradient-orb-3`}
        style={prefersReducedMotion ? { animation: 'none', transform: 'translate(-50%, -50%)' } : {}}
      />
    </div>
  );
}
