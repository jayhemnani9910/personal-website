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
 * Unified scroll helper that prefers Lenis when available. `offset`, the
 * target's scroll-margin-top and the page's scroll-padding-top are applied on
 * both paths (Lenis reads the last two itself), so a target lands where a
 * #hash link would put it, with or without Lenis (Lenis is off for
 * reduced-motion and reader visitors).
 */
export function scrollToTarget(
  target: string | Element,
  lenis?: { scrollTo: (el: HTMLElement | string, opts?: { offset?: number }) => void } | null,
  offset = 0
) {
  const el = typeof target === "string" ? document.querySelector(target) : target;

  if (el && lenis) {
    lenis.scrollTo(el as HTMLElement, { offset });
    return;
  }
  if (el) {
    const margin = Number.parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
    const padding = Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    const top = el.getBoundingClientRect().top + window.scrollY + offset - margin - padding;
    window.scrollTo({ top, behavior: scrollBehavior() });
    return;
  }
  if (typeof target === "string") window.location.href = target;
}
