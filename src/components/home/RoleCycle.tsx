import { ROLES } from "@/data/home";

// Seconds each title holds before the next one takes over. The full loop is
// this times ROLES.length, so it stays readable rather than flickering.
const ROLE_SECONDS = 2.4;

/**
 * The hero's rotating job title.
 *
 * Deliberately CSS-only. A timer in React would mean client state, a
 * `"use client"` boundary around a line of static text, and a first paint that
 * disagrees with the server-rendered HTML. Stacked absolute spans driven by one
 * keyframe animation with staggered negative delays cost none of that: the
 * markup is server-rendered, every title is in the document, and the animation
 * is a paint-only opacity change.
 *
 * Accessibility: the animated stack is `aria-hidden`, and the same titles are
 * repeated once as a plain comma list for assistive tech. A screen reader
 * reads the range once instead of being interrupted every few seconds by a
 * region that changes on a timer.
 *
 * Reduced motion and reader mode both collapse it to that same static list,
 * handled in globals.css next to the keyframes rather than here, because the
 * reader-mode signal is a `data-` attribute on `<html>` and not a media query.
 */
export function RoleCycle({ className = "" }: { className?: string }) {
  const total = ROLES.length;

  return (
    <span className={`role-cycle ${className}`}>
      {/* Reserves the width of the longest title so the items after it on the
          status line do not shuffle sideways on every rotation. */}
      <span aria-hidden className="role-cycle__sizer">
        {ROLES.reduce((a, b) => (b.length > a.length ? b : a))}
      </span>

      <span aria-hidden className="role-cycle__stack">
        {ROLES.map((role, i) => (
          <span
            key={role}
            className="role-cycle__item"
            style={{
              animationDelay: `${(i * ROLE_SECONDS).toFixed(2)}s`,
              animationDuration: `${(total * ROLE_SECONDS).toFixed(2)}s`,
            }}
          >
            {role}
          </span>
        ))}
      </span>

      <span className="sr-only">{ROLES.join(", ")}</span>
    </span>
  );
}
