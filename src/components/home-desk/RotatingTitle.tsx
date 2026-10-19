"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const TITLES = ["Forward Deployed Engineer", "Software, Data and ML Engineer"];
const EVERY_MS = 3200;

/**
 * The hero's job title, taking turns. The box eases to the width of the title
 * on show, so the words after it slide over instead of jumping or leaving a
 * gap. The first title stays in the flow (it sets the height and the width
 * before anything is measured); the rest sit on top of it. Screen readers get
 * both titles once, as plain text. Reduced motion and reader mode hold the
 * first one still.
 */
export function RotatingTitle() {
  const reduced = usePrefersReducedMotion();
  const [i, setI] = useState(0);
  const [widths, setWidths] = useState<number[]>([]);
  const refs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    if (reduced) return;
    // The hero's font size follows the viewport, so the widths do too.
    const measure = () => setWidths(refs.current.map((el) => el?.offsetWidth ?? 0));
    document.fonts.ready.then(measure);
    window.addEventListener("resize", measure);
    const id = setInterval(() => setI((n) => (n + 1) % TITLES.length), EVERY_MS);
    return () => {
      clearInterval(id);
      window.removeEventListener("resize", measure);
    };
  }, [reduced]);

  const shown = reduced ? 0 : i;
  const width = reduced ? undefined : widths[shown];

  return (
    <>
      <span className="sr-only">{TITLES.join(" and ")}</span>
      <span
        aria-hidden="true"
        className="relative inline-block whitespace-nowrap align-bottom transition-[width] duration-[var(--tr-dur-base)] ease-[var(--tr-ease)]"
        style={width ? { width } : undefined}
      >
        {TITLES.map((t, n) => (
          <span
            key={t}
            ref={(el) => {
              refs.current[n] = el;
            }}
            className={`${n === 0 ? "" : "absolute left-0 top-0"} transition-opacity duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] ${
              n === shown ? "opacity-100" : "opacity-0"
            }`}
          >
            {t}
          </span>
        ))}
      </span>
    </>
  );
}
