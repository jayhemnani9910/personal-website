import { isMotionReduced } from "@/hooks/usePrefersReducedMotion";

/**
 * "auto" (an instant jump) under reduced motion or reader mode, else "smooth".
 * Every scripted scroll uses this: an explicit behavior passed to scrollTo or
 * scrollIntoView overrides the CSS scroll-behavior backstop, so each call has
 * to ask for itself.
 */
export function scrollBehavior(): ScrollBehavior {
  return isMotionReduced() ? "auto" : "smooth";
}

/**
 * Unified scroll helper that prefers Lenis when available. `offset` is applied
 * on both paths, so a target lands below the sticky masthead with or without
 * Lenis (Lenis is off for reduced-motion and reader visitors).
 */
export function scrollToTarget(
  target: string | Element,
  lenis?: { scrollTo: (el: HTMLElement | string, opts?: { offset?: number }) => void } | null,
  offset = -100
) {
  const el = typeof target === "string" ? document.querySelector(target) : target;

  if (el && lenis) {
    lenis.scrollTo(el as HTMLElement, { offset });
    return;
  }
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: scrollBehavior() });
    return;
  }
  if (typeof target === "string") window.location.href = target;
}
