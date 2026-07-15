"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const FINE_POINTER_QUERY = "(pointer: fine)";

function subscribeFinePointer(callback: () => void) {
  const mql = window.matchMedia(FINE_POINTER_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getFinePointerSnapshot() {
  return window.matchMedia(FINE_POINTER_QUERY).matches;
}

function getFinePointerServerSnapshot() {
  return false;
}

// Same SSR-safe shape as usePrefersReducedMotion: `false` on the server and
// on the client's first paint, then syncs to the real value. Duplicated here
// (rather than extracted to a shared hook) because this file must stand alone
// per the build brief's file scope.
function useFinePointer(): boolean {
  return useSyncExternalStore(subscribeFinePointer, getFinePointerSnapshot, getFinePointerServerSnapshot);
}

export interface MagneticProps {
  children: ReactNode;
  strength?: number; // multiplier on pointer offset
  max?: number; // px, the displacement clamp
  className?: string;
}

// Wraps `children` in an inline-block box that displaces toward the pointer
// on hover, ported 1:1 from the [data-magnetic] block in
// redesign/concepts/two-readers.html. The wrapper is always present (so the
// tree shape never changes post-mount) but only ever gains a transform when
// active; inline-block means it never adds to the child's own hit-target size.
export function Magnetic({ children, strength = 0.3, max = 10, className }: MagneticProps) {
  const finePointer = useFinePointer();
  const prefersReducedMotion = usePrefersReducedMotion();
  const active = finePointer && !prefersReducedMotion;

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;
    const el = ref.current;
    if (!el) return;

    // Arrow-function `const`s (not `function` declarations): TS's control-flow
    // narrowing of `el` to non-null only survives into closures shaped this
    // way, not into hoisted declarations.
    const onMouseMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const relX = e.clientX - (r.left + r.width / 2);
      const relY = e.clientY - (r.top + r.height / 2);
      const dx = Math.max(-max, Math.min(max, relX * strength));
      const dy = Math.max(-max, Math.min(max, relY * strength));
      el.style.transition = "none";
      el.style.transform = `translate(${dx}px, ${dy}px)`;
    };

    const onMouseLeave = () => {
      el.style.transition = "transform 0.4s var(--tr-ease)";
      el.style.transform = "translate(0, 0)";
    };

    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mouseleave", onMouseLeave);
    return () => {
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mouseleave", onMouseLeave);
      el.style.transition = "";
      el.style.transform = "";
    };
  }, [active, strength, max]);

  return (
    <div ref={ref} className={className} style={{ display: "inline-block" }}>
      {children}
    </div>
  );
}
