/**
 * Unified scroll helper that prefers Lenis when available.
 */
export function scrollToTarget(
  target: string | Element,
  lenis?: { scrollTo: (el: HTMLElement | string, opts?: { offset?: number }) => void } | null,
  offset = -100
) {
  if (lenis) {
    const selector = typeof target === "string" ? target : undefined;
    if (selector) {
      const el = document.querySelector(selector);
      if (el) {
        lenis.scrollTo(el as HTMLElement, { offset });
        return;
      }
    } else if (target instanceof Element) {
      lenis.scrollTo(target as HTMLElement, { offset });
      return;
    }
  }

  if (typeof target === "string") {
    const el = document.querySelector(target);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    window.location.href = target;
  } else {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
