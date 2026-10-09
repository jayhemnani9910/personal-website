"use client";

import { useSyncExternalStore } from "react";
import { isReaderMode, setReaderMode } from "@/lib/reader-mode";

function subscribe(callback: () => void) {
  window.addEventListener("readermodechange", callback);
  return () => window.removeEventListener("readermodechange", callback);
}

/**
 * The visible switch for reader mode (a calm, motion-free view). Reader mode is
 * saved across visits, so whoever turned it on, a visitor or an agent through
 * the switch_mode tool, can see it is on and turn it off here.
 */
export function ReaderToggle({ className }: { className?: string }) {
  const on = useSyncExternalStore(subscribe, isReaderMode, () => false);
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => setReaderMode(!on)}
      className={className}
    >
      reader mode: {on ? "on" : "off"}
    </button>
  );
}
