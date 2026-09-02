"use client";

import { m } from "framer-motion";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { EASE, DUR } from "@/lib/motion-tokens";

// framer-motion's `ease` prop wants an exact 4-tuple, not the `number[]` a
// spread of EASE widens to (the same fix Reveal.tsx and Stagger.tsx carry).
const CUBIC_EASE: [number, number, number, number] = [EASE[0], EASE[1], EASE[2], EASE[3]];

// Presentational on purpose: a div, not a section. Every content component in
// this directory already renders its own <section id aria-labelledby>, the way
// the design gives each top-level section its own id. Wrapping those in another
// section would nest one inside the other, and passing the id down to the
// wrapper would put the same id on two elements.
interface RevealSectionProps {
  className?: string;
  children: ReactNode;
}

export function RevealSection({ className, children }: RevealSectionProps) {
  const reduced = usePrefersReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: DUR.slow, ease: CUBIC_EASE }}
    >
      {children}
    </m.div>
  );
}
