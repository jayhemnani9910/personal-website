"use client";

import { m, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { EASE, DUR, STAGGER } from "@/lib/motion-tokens";

// framer-motion wants an exact 4-tuple for the `ease` prop, not the `number[]`
// a spread of EASE widens to (same fix as EditorialMasthead.tsx).
const CUBIC_EASE: [number, number, number, number] = [EASE[0], EASE[1], EASE[2], EASE[3]];

// The container's own variants carry no visual properties, only the
// staggerChildren timing, so it stays unclipped and is safe to observe
// directly via whileInView (see Reveal.tsx for the full writeup of the
// Chrome intersectionRatio-0 bug this sidesteps by construction).
const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: STAGGER } },
};

const itemVariants: Variants = {
  hidden: { clipPath: "inset(0 0 100% 0)", y: 14 },
  visible: {
    clipPath: "inset(0 0 0% 0)",
    y: 0,
    transition: { duration: DUR.slow, ease: CUBIC_EASE },
  },
};

interface StaggerProps {
  children: ReactNode;
  className?: string;
}

export function Stagger({ children, className }: StaggerProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <m.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
    >
      {/* One noscript covers every StaggerItem child: they all share the
          .tr-reveal-mask class, and CSS class rules are not scoped by DOM
          position, so a single override here is enough. Same no-JS
          fail-open reasoning as Reveal.tsx. StaggerItem is meant to be used
          inside Stagger, not standalone, which is why the fix lives here
          instead of duplicated in every item. */}
      <noscript>
        <style>{".tr-reveal-mask{clip-path:none!important;transform:none!important;}"}</style>
      </noscript>
      {children}
    </m.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

// Meant to be used as a direct child of `Stagger`, whose whileInView state
// propagates down to this component's `variants` (no whileInView/observer
// of its own). See Reveal.tsx for the full explanation of that propagation
// mechanism and why it keeps the Chrome intersectionRatio-0 bug from
// applying here in the first place.
export function StaggerItem({ children, className }: StaggerItemProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <m.div
      className={`tr-reveal-mask${className ? ` ${className}` : ""}`}
      variants={itemVariants}
      style={{ display: "block" }}
    >
      {children}
    </m.div>
  );
}
