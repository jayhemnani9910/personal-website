"use client";

import { m } from "framer-motion";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { EASE, DUR } from "@/lib/motion-tokens";

// framer-motion's `ease` prop wants an exact 4-tuple, not the `number[]` a
// spread of EASE widens to (same fix as Reveal.tsx / EditorialMasthead.tsx).
const CUBIC_EASE: [number, number, number, number] = [EASE[0], EASE[1], EASE[2], EASE[3]];

interface RevealSectionProps {
  id?: string;
  className?: string;
  labelledBy?: string;
  children: ReactNode;
}

export function RevealSection({ id, className, labelledBy, children }: RevealSectionProps) {
  const reduced = usePrefersReducedMotion();

  if (reduced) {
    return (
      <section id={id} className={className} aria-labelledby={labelledBy}>
        {children}
      </section>
    );
  }

  return (
    <m.section
      id={id}
      className={className}
      aria-labelledby={labelledBy}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: DUR.slow, ease: CUBIC_EASE }}
    >
      {children}
    </m.section>
  );
}
