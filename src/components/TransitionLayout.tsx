"use client";

import { m, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { EASE, DUR } from "@/lib/motion-tokens";

interface TransitionLayoutProps {
  children: ReactNode;
}

// framer-motion's `ease` wants an exact 4-tuple, not the `number[]` a spread
// of EASE widens to, so re-tuple it here off the same token values.
const CUBIC_EASE: [number, number, number, number] = [EASE[0], EASE[1], EASE[2], EASE[3]];

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  enter: { opacity: 1, y: 0, transition: { duration: DUR.slow, ease: CUBIC_EASE } },
  exit: { opacity: 0, y: -8, transition: { duration: DUR.base, ease: CUBIC_EASE } },
};

export function TransitionLayout({ children }: TransitionLayoutProps) {
  const pathname = usePathname();
  const prefersReducedMotion = usePrefersReducedMotion();

  // Bypassed entirely under reduced motion: no wrapper, no AnimatePresence,
  // nothing to opt out of.
  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <m.div key={pathname} variants={pageVariants} initial="initial" animate="enter" exit="exit">
        {children}
      </m.div>
    </AnimatePresence>
  );
}
