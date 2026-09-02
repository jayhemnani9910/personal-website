"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { RESUME } from "@/data/resume";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

// The personal best lives in the resume data, so the card cannot drift from it.
const cubeAchievement = RESUME.education
  .flatMap((edu) => edu.achievements ?? [])
  .find((s) => s.startsWith("Rubik's Cube"));
const CUBE_PB = cubeAchievement?.match(/([\d.]+)\s*sec/)?.[1] ?? "16.7";

const IDLE_NOTE = "Personal best, official. Click to scramble, I promise I am faster than this animation.";

// Quoting a physical object's stickers, the same way the macOS traffic
// lights are quoted elsewhere in this system: the one place in this file
// allowed to be raw hex instead of a --tr-* token.
const SOLVED_COLORS = [
  "var(--tr-ember)",
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
  const [speed, setSpeed] = useState("14s");
  const [scrambled, setScrambled] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const scramble = () => {
    if (intervalRef.current) return;
    setSpeed("1.2s");
    setNote("scrambling…");
    setTime("0.00");
    setScrambled(false);
    const t0 = performance.now();
    let tick = 0;
    intervalRef.current = setInterval(() => {
      tick += 1;
      setFaces(Array.from({ length: 6 }, randomFace));
      setTime(((performance.now() - t0) / 1000).toFixed(2));
      if (tick >= SCRAMBLE_TICKS) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        const elapsed = ((performance.now() - t0) / 1000).toFixed(2);
        setFaces(null);
        setSpeed("14s");
        setTime(CUBE_PB);
        setNote(`Solved. Yours took ${elapsed} s of watching. Mine is still ${CUBE_PB}.`);
        setScrambled(true);
      }
    }, SCRAMBLE_INTERVAL_MS);
  };

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
          aria-hidden="true"
          className="relative h-[54px] w-[54px]"
          style={{
            transformStyle: "preserve-3d",
            animation: reduced ? undefined : `v4-cube-idle ${speed} linear infinite`,
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
        <p className="m-0 mb-1 font-mono text-[length:var(--tr-t-mono-sm)] tracking-[0.1em] text-tr-text-faint">
          OFF THE CLOCK · WCA
        </p>
        <p className="m-0 text-[length:var(--tr-t-stat)] font-medium leading-[var(--tr-lh-display)] tracking-[-0.03em] tabular-nums text-tr-text">
          {time}
          <span className="text-[length:var(--tr-t-small)] text-tr-text-mute"> s</span>
        </p>
        <p className="mb-0 mt-2 text-[length:var(--tr-t-small)] leading-[var(--tr-lh-prose)] text-tr-text-mute">
          {note}
        </p>
        {scrambled && (
          <p className="mb-0 mt-1 text-[length:var(--tr-t-small)] leading-[var(--tr-lh-prose)] text-tr-text-mute">
            I wrote{" "}
            <Link href="/projects/rubiks-timer" className="underline hover:text-tr-ember">
              the timer app
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}
