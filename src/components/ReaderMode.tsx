"use client";

import { useEffect } from "react";
import { applyReaderMode } from "@/lib/reader-mode";
import { READER_KEY, readStorage } from "@/lib/storage";

// Applies persisted reader-mode state on load and keeps it synced across tabs.
// The WebMCP `switch_mode` tool and this applier both go through
// applyReaderMode: it writes the `data-reader` attribute on <html> and
// dispatches `readermodechange`, which the shared usePrefersReducedMotion hook
// reads to drop every motion primitive into its calm/static path. Renders
// nothing.
export function ReaderMode() {
  useEffect(() => {
    const apply = () => applyReaderMode(readStorage(READER_KEY) === "on");
    apply();

    const onStorage = (e: StorageEvent) => {
      if (e.key === READER_KEY) apply();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return null;
}
