"use client";

import { useEffect } from "react";
import { eventForHref, track } from "@/lib/events";

// One listener for the whole site instead of an onClick on every résumé,
// GitHub or LinkedIn link: it reads the link's href, so a new link anywhere is
// counted without anyone remembering to wire it. A middle click opens the link
// too, so it counts; a right click does not.
export function TrackClicks() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button > 1) return;
      const a = (e.target as Element | null)?.closest?.("a[href]");
      const name = a && eventForHref(a.getAttribute("href") ?? "");
      if (name) track(name);
    };
    document.addEventListener("click", onClick, { capture: true });
    document.addEventListener("auxclick", onClick, { capture: true });
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      document.removeEventListener("auxclick", onClick, { capture: true });
    };
  }, []);
  return null;
}
