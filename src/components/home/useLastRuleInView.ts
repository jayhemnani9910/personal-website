"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

/**
 * How far a section's opening rule has to be inside the bottom of the viewport
 * before it counts as arrived. At zero the handover lands on the exact pixel
 * the rule appears, which puts Buddy on a line that has not been drawn yet.
 */
const ARRIVAL_INSET = "-6%";

function getServerSnapshot() {
  return -1;
}

/**
 * Index of the last section whose opening rule has come into view.
 *
 * Deliberately not useSectionSpy. That one answers "which section is being
 * read", which is the right question for the nav rail and the wrong one here:
 * it fires on the middle band of the viewport, but a rule sits at the top of
 * its section, so by the time a section reaches the middle its rule is already
 * most of a screen above. Between the two events Buddy stood on a rule nobody
 * could see while a visible rule below him stood empty.
 *
 * So: track which sections intersect at all and take the highest index. That
 * is the same as the last rule to have entered from the bottom, and it reverses
 * correctly on the way back up.
 *
 * When nothing intersects, the index is left where it was rather than reset.
 * That happens on a section taller than the viewport (the work section is
 * around 3950px on a phone), and dropping Buddy for the duration would be
 * worse than leaving him on the rule that is nearest, just off screen.
 */
export function useLastRuleInView(ids: readonly string[]): number {
  const indexRef = useRef(-1);
  const key = ids.join("|");

  const subscribe = useCallback(
    (callback: () => void) => {
      if (typeof IntersectionObserver === "undefined") return () => {};
      const list = key ? key.split("|") : [];
      const onScreen = new Array<boolean>(list.length).fill(false);

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const i = list.indexOf(entry.target.id);
            if (i !== -1) onScreen[i] = entry.isIntersecting;
          }
          const last = onScreen.lastIndexOf(true);
          if (last !== -1 && last !== indexRef.current) {
            indexRef.current = last;
            callback();
          }
        },
        { rootMargin: `0px 0px ${ARRIVAL_INSET} 0px` }
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
