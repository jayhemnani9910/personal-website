"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", callback);
  window.addEventListener("readermodechange", callback);
  return () => {
    mql.removeEventListener("change", callback);
    window.removeEventListener("readermodechange", callback);
  };
}

function getSnapshot() {
  return (
    window.matchMedia(QUERY).matches ||
    document.documentElement.dataset.reader === "on"
  );
}

function getServerSnapshot() {
  return false;
}

// True when motion should be suppressed: either the OS prefers reduced motion,
// or the visitor turned on reader mode (a calm, static reading view, toggleable
// by the WebMCP `switch_mode` tool). Every motion primitive reads this hook, so
// reader mode reuses the whole reduced-motion path instead of a parallel one.
// SSR-safe: renders `false` on the server and on the client's first paint, then
// syncs to the real value and reacts to live preference / reader-mode changes.
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
