"use client";

import { m } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
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
};

// Enter-only. An exit animation needs AnimatePresence to keep the old page
// mounted, but in the App Router the exiting copy re-renders with the new
// route, so it only ever showed the new page twice (two <main>s, every effect
// run twice). The element type never changes either, so the reduced-motion
// switch after hydration cannot remount the page.
export function TransitionLayout({ children }: TransitionLayoutProps) {
  const pathname = usePathname();
  const reduced = usePrefersReducedMotion();

  // Count client navigations, so the first paint (server HTML) never starts
  // hidden. Adjusting state during render is React's pattern for this.
  const [lastPath, setLastPath] = useState(pathname);
  const [navigations, setNavigations] = useState(0);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setNavigations((n) => n + 1);
  }

  return (
    <m.div
      key={pathname}
      variants={pageVariants}
      initial={navigations === 0 || reduced ? false : "initial"}
      animate="enter"
    >
      {children}
    </m.div>
  );
}
