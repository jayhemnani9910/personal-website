"use client";

import { useEffect } from "react";

// Applies persisted reader-mode state on load and keeps it synced across tabs.
// The WebMCP `switch_mode` tool and this applier both write the `data-reader`
// attribute on <html> and dispatch `readermodechange`, which the shared
// usePrefersReducedMotion hook reads to drop every motion primitive into its
// calm/static path. Renders nothing.
export function ReaderMode() {
  useEffect(() => {
    const apply = () => {
      const on = localStorage.getItem("reader-mode") === "on";
      if (on) document.documentElement.dataset.reader = "on";
      else delete document.documentElement.dataset.reader;
    };
    apply();
    window.dispatchEvent(new Event("readermodechange"));

    const onStorage = (e: StorageEvent) => {
      if (e.key === "reader-mode") {
        apply();
        window.dispatchEvent(new Event("readermodechange"));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return null;
}
