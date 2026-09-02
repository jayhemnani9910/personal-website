"use client";

import { m, type Variants } from "framer-motion";
import type { ElementType, ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { EASE, DUR } from "@/lib/motion-tokens";

// framer-motion wants an exact 4-tuple for the `ease` prop, not the `number[]`
// a spread of EASE widens to (the same fix Stagger.tsx carries).
const CUBIC_EASE: [number, number, number, number] = [EASE[0], EASE[1], EASE[2], EASE[3]];

// `containerVariants` never changes the container's own visual style (both
// states are empty objects), so the container stays full-area and unclipped
// at all times. That is deliberate: `whileInView` below watches THIS node via
// its own internal IntersectionObserver, and a node clipped to zero
// paintable area (inset(0 0 100% 0)) reports a permanently-stuck
// intersectionRatio of 0 in Chrome, so an observer on a clipped node fires
// once on load and never again. `maskVariants` carries the actual
// clip-path/y animation on a child instead, which is never itself observed
// and only reacts via variant propagation from the container's hidden/
// visible state. See redesign/concepts/two-readers.html ~line 320 for the
// mockup that found this bug.
const containerVariants: Variants = {
  hidden: {},
  visible: {},
};

const maskVariants: Variants = {
  hidden: { clipPath: "inset(0 0 100% 0)", y: 14 },
  visible: { clipPath: "inset(0 0 0% 0)", y: 0 },
};

interface RevealProps {
  children: ReactNode;
  /** Extra delay in seconds before the wipe starts. Default 0. */
  delay?: number;
  /** Element type for the wrapper. Default "div". */
  as?: ElementType;
  className?: string;
}

export function Reveal({ children, delay = 0, as: Tag = "div", className }: RevealProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <Tag className={className}>
      {/* framer-motion applies `initial` as an inline style synchronously on
          render, so the mask's hidden (clipped) state is baked into
          server-rendered HTML, not only set after mount. If JS never runs to
          flip it to "visible", the content stays invisible forever.
          <noscript> content is only ever parsed as live markup when
          scripting is OFF, so this override is inert for every working
          visitor and only fires for the genuine no-JS case: same fix as the
          approved mockup's `.reveal-mask` noscript rule. */}
      <noscript>
        <style>{".tr-reveal-mask{clip-path:none!important;transform:none!important;}"}</style>
      </noscript>
      <m.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      >
        <m.div
          className="tr-reveal-mask"
          variants={maskVariants}
          transition={{ duration: DUR.slow, ease: CUBIC_EASE, delay }}
          style={{ display: "block" }}
        >
          {children}
        </m.div>
      </m.div>
    </Tag>
  );
}
