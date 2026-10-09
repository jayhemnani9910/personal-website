"use client";

import { useVisits } from "./deskStore";

export function greetingFor(visits: number): string {
  if (visits <= 1) return "oh hi, first time? →";
  if (visits === 2) return "welcome back! today's pick changed.";
  if (visits < 6) return `visit #${visits}. you're basically a regular.`;
  return `visit #${visits}. at this point just email me.`;
}

/**
 * The hero's handwritten hello. Empty until the visit count is known, so a
 * returning visitor never sees the first-timer line flash first; the space is
 * held so nothing below it moves.
 */
export function Greeting() {
  const visits = useVisits();
  return (
    <p className="mb-2 inline-block min-h-[1.2em] -rotate-2 font-desk-hand text-[26px] text-desk-tomato">
      {visits === null ? " " : greetingFor(visits)}
    </p>
  );
}

export function VisitCount() {
  const visits = useVisits();
  if (visits === null) return null;
  return <> · you&apos;ve been here {visits}×</>;
}
