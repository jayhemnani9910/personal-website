"use client";

import { useSyncExternalStore } from "react";

type ScrollState = { scrolled: boolean; progress: number };

const SERVER_SNAPSHOT: ScrollState = { scrolled: false, progress: 0 };

// useSyncExternalStore compares snapshots with Object.is, so getSnapshot must
// return this cached object and only replace it when a value actually
// changed. Returning a fresh literal every call causes an infinite
// re-render loop.
let cached: ScrollState = SERVER_SNAPSHOT;

function computeSnapshot(): ScrollState {
  const scrollY = window.scrollY;
  const scrolled = scrollY > 240;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
  if (cached.scrolled === scrolled && cached.progress === progress) return cached;
  cached = { scrolled, progress };
  return cached;
}

function subscribe(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  window.addEventListener("resize", callback);
  return () => {
    window.removeEventListener("scroll", callback);
    window.removeEventListener("resize", callback);
  };
}

function getServerSnapshot(): ScrollState {
  return SERVER_SNAPSHOT;
}

/** scrolled = window.scrollY > 240; progress = scroll fraction, clamped 0..1. */
export function useScrollState(): ScrollState {
  return useSyncExternalStore(subscribe, computeSnapshot, getServerSnapshot);
}
