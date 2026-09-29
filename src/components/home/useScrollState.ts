"use client";

import { useSyncExternalStore } from "react";

// Hysteresis around 240px, wider than the masthead's 12px height change
// (60px to 48px). The header is sticky and in flow, so when it shrinks the
// browser's scroll anchoring pulls scrollY up by 12px; with one threshold that
// lands back under it, the header grows, anchoring pushes it down again, and
// the masthead and rail flip without end.
const SHRINK_AT = 252;
const GROW_AT = 228;

// Module state, not per-subscriber, so every reader agrees. Reading it twice
// at the same scrollY gives the same answer, which useSyncExternalStore needs.
let scrolled = false;

function getScrolled(): boolean {
  const y = window.scrollY;
  if (scrolled ? y < GROW_AT : y > SHRINK_AT) scrolled = !scrolled;
  return scrolled;
}

function getProgress(): number {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
}

function subscribe(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  window.addEventListener("resize", callback);
  return () => {
    window.removeEventListener("scroll", callback);
    window.removeEventListener("resize", callback);
  };
}

const serverScrolled = () => false;
const serverProgress = () => 0;

// Two stores rather than one { scrolled, progress } object: progress changes
// with every pixel, and a reader that only needs `scrolled` (the section rail)
// would otherwise re-render on every scroll event. Both return primitives, so
// useSyncExternalStore's Object.is check needs no cached snapshot.

/** True once the page is scrolled past the masthead threshold (about 240px). */
export function useScrolled(): boolean {
  return useSyncExternalStore(subscribe, getScrolled, serverScrolled);
}

/** Scroll fraction of the whole page, clamped 0..1. */
export function useScrollProgress(): number {
  return useSyncExternalStore(subscribe, getProgress, serverProgress);
}
