"use client";

import { useLenis } from "lenis/react";
import type { MouseEvent } from "react";
import { scrollToTarget } from "@/lib/scroll";

/**
 * Click handler for in-page hash links (the nav and the footer). It glides
 * through Lenis like the rest of the page, then does what the cancelled hash
 * navigation would have done: moves focus to the section, so the next Tab
 * starts there, and puts the hash in the URL, so the section can be linked.
 */
export function useJump() {
  const lenis = useLenis();

  return (href: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    scrollToTarget(href, lenis);
    const target = document.querySelector<HTMLElement>(href);
    if (!target) return;
    if (!target.hasAttribute("tabindex")) target.tabIndex = -1;
    target.focus({ preventScroll: true });
    history.replaceState(history.state, "", href);
    // Once the visitor scrolls on, the hash no longer says where they are, and
    // Back from another page would jump to it instead of restoring their place.
    const clear = () => {
      if (location.hash === href) history.replaceState(history.state, "", location.pathname + location.search);
    };
    for (const e of ["wheel", "touchmove"] as const) window.addEventListener(e, clear, { once: true, passive: true });
  };
}
