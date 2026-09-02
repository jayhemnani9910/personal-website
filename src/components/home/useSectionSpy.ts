"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

const ROOT_MARGIN = "-45% 0px -45% 0px";

function getServerSnapshot() {
  return -1;
}

/**
 * Index of the section whose id is currently crossing the viewport middle,
 * tracked with one IntersectionObserver. -1 before hydration and until a
 * section has crossed. `ids` is joined into a stable key so the observer is
 * rebuilt only when the actual id list changes, not on every render.
 */
export function useSectionSpy(ids: string[]): number {
  const indexRef = useRef(-1);
  const key = ids.join("|");

  const subscribe = useCallback(
    (callback: () => void) => {
      if (typeof IntersectionObserver === "undefined") return () => {};
      const list = key ? key.split("|") : [];
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            const idx = list.indexOf(entry.target.id);
            if (idx !== -1 && idx !== indexRef.current) {
              indexRef.current = idx;
              callback();
            }
          }
        },
        { rootMargin: ROOT_MARGIN }
      );
      for (const id of list) {
        const el = document.getElementById(id);
        if (el) observer.observe(el);
      }
      return () => observer.disconnect();
    },
    [key]
  );

  const getSnapshot = useCallback(() => indexRef.current, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
