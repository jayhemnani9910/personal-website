"use client";

import { m, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface ParallaxProps {
  children: ReactNode;
  /** Total vertical travel in pixels across the element's scroll-through range. Default 48. */
  distance?: number;
  className?: string;
}

export function Parallax({ children, distance = 48, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  // Called unconditionally (rules of hooks); the resulting `y` motion value
  // is simply never applied to the DOM below when reduced motion is on.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const half = distance / 2;
  const y = useTransform(scrollYProgress, [0, 1], [half, -half]);

  if (prefersReducedMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <m.div ref={ref} className={className} style={{ y }}>
      {children}
    </m.div>
  );
}
