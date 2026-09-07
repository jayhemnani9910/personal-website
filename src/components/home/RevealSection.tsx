"use client";

import { m } from "framer-motion";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { EASE, DUR } from "@/lib/motion-tokens";
import { DividerBuddy } from "./DividerBuddy";

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
  /**
   * Position of this section's opening rule among the page's five, if it has
   * one. Buddy stands on whichever rule belongs to the section being read, and
   * this wrapper is where he goes: its top edge and the section's rule are the
   * same line, so the slot needs no measurement. Omit it and nothing renders.
   */
  divider?: number;
  children: ReactNode;
}

export function RevealSection({ className, divider, children }: RevealSectionProps) {
  const reduced = usePrefersReducedMotion();
  const slot = divider === undefined ? null : <DividerBuddy index={divider} />;
  // `relative` only when there is something to position against it, so the
  // sections without a rule keep the exact box they had.
  const cls = [slot ? "relative" : "", className ?? ""].filter(Boolean).join(" ") || undefined;

  if (reduced) {
    return (
      <div className={cls}>
        {slot}
        {children}
      </div>
    );
  }

  return (
    <m.div
      className={cls}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: DUR.slow, ease: CUBIC_EASE }}
    >
      {slot}
      {children}
    </m.div>
  );
}
