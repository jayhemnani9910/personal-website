"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { DUR } from "@/lib/motion-tokens";

// The "cold open" preloader. It mirrors the approved concept 1:1
// (redesign/concepts/two-readers.html, the `#preloader` markup/CSS and its
// `run()`/`finish()` IIFE). It is a PURE OVERLAY: it renders only the scrim
// (or null) and never wraps `children`, so the real page underneath paints at
// full opacity from the first frame regardless of what this does.
const STORAGE_KEY = "tr-intro-seen";
const FULL_TEXT = "> jayhemnani.me : initializing";
const TYPE_INTERVAL_MS = 16; // ~16ms/char, the concept's typewriter cadence
const HOLD_MS = DUR.base * 1000; // 300ms pause after typing (== DUR.base), not a bare literal
const FADE_MS = 500; // opacity fade-out. The concept hardcodes .5s; no DUR value equals 500ms,
// and DUR.slow (600ms) would push the total past the 1.4s cap with no margin. Bespoke, like
// the masthead status dot's cadence, back when the masthead had one.
const HIDE_BUFFER_MS = 20; // gap between the CSS fade finishing and unmount
const WATCHDOG_MS = 3000; // fail-safe: guarantees teardown even if a timer stalls. finish() is
// idempotent, so in the normal ~1.3s run this fires and no-ops.
const CURSOR_BLINK_KEYFRAMES = "tr-preloader-cursor-blink";

const mono: CSSProperties = { fontFamily: "var(--font-geist-mono)" };

// Whether the cold open should play this pageload: first visit of the session,
// motion allowed. Modelled as external state (sessionStorage) read through
// useSyncExternalStore, which is SSR-safe with ZERO setState-in-effect: the
// server and the first client render both read `false` (so nothing paints over
// the content), then it re-renders to the real value a frame after hydration.
//
// An earlier version flipped a `play` state inside an effect, which either trips
// react-hooks/set-state-in-effect or, if buried in a callback, only hides the
// same synchronous setState from the linter. This removes the setState entirely.
const emptySubscribe = () => () => {}; // sessionStorage does not change under us mid-session
function useShouldPlayIntro(prefersReducedMotion: boolean): boolean {
  const getSnapshot = () => {
    if (prefersReducedMotion) return false;
    try {
      return sessionStorage.getItem(STORAGE_KEY) !== "1";
    } catch {
      return false;
    }
  };
  return useSyncExternalStore(emptySubscribe, getSnapshot, () => false);
}

export function Preloader() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const shouldPlay = useShouldPlayIntro(prefersReducedMotion);
  // `finished` is the only piece of state, and it is set exclusively from timer
  // and event callbacks (never synchronously in an effect), so the play sequence
  // does not trip the setState-in-effect rule.
  const [finished, setFinished] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [typedLength, setTypedLength] = useState(0);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const finishedRef = useRef(false);

  const clearTimers = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    clearTimers();
    setIsLeaving(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // sessionStorage unavailable (privacy mode): the intro may replay next load, an
      // acceptable degrade rather than a broken state.
    }
    // Unmount after the fade completes. `finished` hiding the scrim is what actually
    // stops the render; the sessionStorage write above only prevents a REPLAY on reload.
    timeoutsRef.current.push(setTimeout(() => setFinished(true), FADE_MS + HIDE_BUFFER_MS));
  }, [clearTimers]);

  const active = shouldPlay && !finished && !prefersReducedMotion;

  // Run the typewriter while the scrim is active. The first character is scheduled
  // via setTimeout, not called synchronously here, so NO setState runs synchronously
  // in this effect body: every setTypedLength happens in a timer callback.
  useEffect(() => {
    if (!active) return;

    let i = 0;
    const typeChar = () => {
      try {
        setTypedLength(i);
        i += 1;
        if (i <= FULL_TEXT.length) {
          timeoutsRef.current.push(setTimeout(typeChar, TYPE_INTERVAL_MS));
        } else {
          timeoutsRef.current.push(setTimeout(finish, HOLD_MS));
        }
      } catch {
        finish();
      }
    };
    timeoutsRef.current.push(setTimeout(typeChar, TYPE_INTERVAL_MS));
    timeoutsRef.current.push(setTimeout(finish, WATCHDOG_MS));

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      clearTimers();
    };
  }, [active, finish, clearTimers]);

  if (!active) return null;

  return (
    <div
      aria-hidden="true"
      onClick={finish}
      className="fixed inset-0 z-[var(--tr-z-preloader)] flex cursor-pointer items-center justify-center bg-tr-bg transition-opacity"
      style={{
        opacity: isLeaving ? 0 : 1,
        pointerEvents: isLeaving ? "none" : "auto",
        transitionDuration: `${FADE_MS}ms`,
        transitionTimingFunction: "var(--tr-ease)",
      }}
    >
      <p className="text-[.9375rem] text-tr-text-mute" style={mono}>
        {FULL_TEXT.slice(0, typedLength)}
        <span
          className="ml-[2px] inline-block h-[1.05em] w-[.55em] align-[-0.15em] bg-tr-ember"
          style={{ animation: `${CURSOR_BLINK_KEYFRAMES} 900ms steps(1) infinite` }}
        />
      </p>
      <style>{`@keyframes ${CURSOR_BLINK_KEYFRAMES} { 50%, 100% { opacity: 0; } }`}</style>
    </div>
  );
}
