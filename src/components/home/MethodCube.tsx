"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CUBE_ACHIEVEMENT } from "@/data/resume";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useShellIntent } from "@/lib/shell-intent";

// The personal best lives in the resume data, so the card cannot drift from it.
// No fallback number: visuals.test.tsx fails if the resume string stops parsing.
export const CUBE_PB = CUBE_ACHIEVEMENT?.match(/([\d.]+)\s*sec/)?.[1] ?? "";

const IDLE_NOTE = "Personal best, official. Click to scramble, I promise I'm faster than this animation.";

// Quoting a physical object's stickers, the same way the macOS traffic
// lights are quoted elsewhere in this system: the one place in this file
// allowed to be raw hex instead of a --tr-* token.
const SOLVED_COLORS = [
  "var(--tr-accent)",
  "var(--tr-text)",
  "#E2432E",
  "#F28C28",
  "#2E9B4F",
  "#2E63D9",
];

// Ported from docs/design/portfolio-home/Portfolio Home.dc.html, lines
// 167-182 (cube card markup) and 363-367 (scramble()).
const FACE_TRANSFORMS = [
  "translateZ(27px)",
  "rotateY(180deg) translateZ(27px)",
  "rotateY(90deg) translateZ(27px)",
  "rotateY(-90deg) translateZ(27px)",
  "rotateX(90deg) translateZ(27px)",
  "rotateX(-90deg) translateZ(27px)",
];

const SCRAMBLE_TICKS = 15;
const SCRAMBLE_INTERVAL_MS = 120;
const IDLE_SPIN_S = 14;
const SCRAMBLE_SPIN_S = 1.2;

function randomFace(): string[] {
  return Array.from({ length: 9 }, () => SOLVED_COLORS[Math.floor(Math.random() * 6)]);
}

// "OFF THE CLOCK · WCA": a CSS-3D Rubik's cube that idles slowly and
// scrambles on click, next to the personal-best time and a note. The design
// puts the click handler on a plain div, which a keyboard user can't reach;
// here the cube stage itself is the button, and the text column (which needs
// to carry a link once a scramble finishes) sits outside it.
export function MethodCube() {
  const reduced = usePrefersReducedMotion();
  const [faces, setFaces] = useState<string[][] | null>(null);
  const [note, setNote] = useState(IDLE_NOTE);
  const [time, setTime] = useState(CUBE_PB);
  const [scrambled, setScrambled] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cubeRef = useRef<HTMLDivElement>(null);

  // Swapping animation-duration makes the browser recompute the angle from
  // the elapsed time, so the cube jumps. Changing the playback rate keeps the
  // current angle and only changes how fast it turns from there.
  const setSpin = (seconds: number) => {
    cubeRef.current?.getAnimations?.()[0]?.updatePlaybackRate(IDLE_SPIN_S / seconds);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // The shell's `cube` command drives this from anywhere on the page. Kept in
  // a ref for the same reason the Decomposer does it: the listener registers
  // once, and a stale closure would scramble against last render's state.
  // It scrolls to the section itself, as the Decomposer does: the shell's hash
  // write moves nothing when the URL is already at #method.
  const scrambleRef = useRef<() => void>(() => {});
  useEffect(() => {
    const run = () => {
      document.getElementById("method")?.scrollIntoView();
      scrambleRef.current();
    };
    window.addEventListener("v4:cube", run);
    return () => window.removeEventListener("v4:cube", run);
  }, []);

  const scramble = () => {
    if (intervalRef.current) return;
    setSpin(SCRAMBLE_SPIN_S);
    setNote("scrambling…");
    setTime("0.00");
    setScrambled(false);
    const t0 = performance.now();
    let tick = 0;
    intervalRef.current = setInterval(() => {
      tick += 1;
      // Reduced motion keeps the stickers solved: 15 random recolours in under
      // two seconds is a flicker, not a calm view. The timer and notes still run.
      if (!reduced) setFaces(Array.from({ length: 6 }, randomFace));
      setTime(((performance.now() - t0) / 1000).toFixed(2));
      if (tick >= SCRAMBLE_TICKS) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        const elapsed = ((performance.now() - t0) / 1000).toFixed(2);
        setFaces(null);
        setSpin(IDLE_SPIN_S);
        setTime(CUBE_PB);
        setNote(`Solved. Yours took ${elapsed} s of watching. Mine is still ${CUBE_PB}.`);
        setScrambled(true);
      }
    }, SCRAMBLE_INTERVAL_MS);
  };

  // Kept current every render, so the listener registered once on mount always
  // calls the latest closure. Assigning during render trips react-hooks/refs.
  useEffect(() => {
    scrambleRef.current = scramble;
  });
  // A `cube` typed in the shell on another page. After the effect above, so
  // the ref holds the real scramble by the time it runs.
  useShellIntent("cube");

  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-6 rounded-[var(--tr-r-md)] border border-tr-hairline bg-tr-bg p-5">
      <button
        type="button"
        aria-label="Scramble the cube"
        data-cursor="SCRAMBLE"
        onClick={scramble}
        className="grid h-24 w-24 cursor-pointer place-items-center"
        style={{ perspective: "600px" }}
      >
        <div
          ref={cubeRef}
          aria-hidden="true"
          className="relative h-[54px] w-[54px]"
          style={{
            transformStyle: "preserve-3d",
            animation: reduced ? undefined : `v4-cube-idle ${IDLE_SPIN_S}s linear infinite`,
            transform: reduced ? "rotateX(-24deg) rotateY(-32deg)" : undefined,
          }}
        >
          {FACE_TRANSFORMS.map((transform, i) => (
            <div
              key={transform}
              className="absolute inset-0 grid grid-cols-3 gap-0.5 rounded-[3px] bg-tr-hairline p-0.5"
              style={{ transform }}
            >
              {(faces ? faces[i] : Array(9).fill(SOLVED_COLORS[i])).map((color, j) => (
                <span key={j} className="rounded-[1.5px] transition-colors" style={{ background: color }} />
              ))}
            </div>
          ))}
        </div>
      </button>
      <div>
        <p className="m-0 mb-1 font-mono text-[length:var(--tr-t-mono)] tracking-[0.1em] text-tr-text-mute">
          OFF THE CLOCK · WCA
        </p>
        <p className="m-0 text-[1.6rem] font-medium leading-[var(--tr-lh-numeral)] tracking-[-0.03em] tabular-nums text-tr-text">
          {time}
          <span className="text-[length:var(--tr-t-small)] text-tr-text-mute"> s</span>
        </p>
        <p aria-live="polite" className="mb-0 mt-2 text-[12.5px] leading-[var(--tr-lh-prose)] text-tr-text-mute">
          {note}
        </p>
        {scrambled && (
          <p className="mb-0 mt-1 text-[12.5px] leading-[var(--tr-lh-prose)] text-tr-text-mute">
            I wrote{" "}
            <Link href="/projects/rubiks-timer" className="underline hover:text-tr-accent-ink">
              the timer app
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}
