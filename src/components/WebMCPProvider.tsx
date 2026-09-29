"use client";

import { useEffect } from "react";

/**
 * Registers the site's WebMCP tools when the browser has the API
 * (document.modelContext, Chrome with the WebMCP flag on). Everything else
 * pays nothing: the tool code and the site data are only fetched after the
 * API is detected, and any failure is logged and leaves the page untouched.
 */
export function WebMCPProvider() {
  useEffect(() => {
    if (typeof document === "undefined" || !document.modelContext) return;
    const controller = new AbortController();

    (async () => {
      try {
        const [{ registerWebMCPTools }, res] = await Promise.all([
          import("@/lib/webmcp"),
          fetch("/site-data.json", { signal: controller.signal }),
        ]);
        if (!res.ok) throw new Error(`site-data.json ${res.status}`);
        const data = await res.json();
        if (controller.signal.aborted) return;
        await registerWebMCPTools(data, controller.signal);
      } catch (err) {
        if (!controller.signal.aborted) {
          console.warn("[webmcp] tools not registered:", err instanceof Error ? err.message : err);
        }
      }
    })();

    // Aborting unregisters every tool registered with this signal.
    return () => controller.abort();
  }, []);

  return null;
}
