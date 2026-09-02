"use client";

import { useId, useState } from "react";
import Image from "next/image";

export type ComparisonPair = { before: string; after: string; label?: string };

/**
 * Drag-to-compare figure for a project's before/after frames. Position is
 * driven entirely by a native range input (labelled, full-bleed, opacity-0
 * over the figure) so dragging, clicking and arrow-key nudging all come from
 * the platform for free rather than a custom pointer-capture handler.
 */
export function ComparisonSlider({
  projectTitle,
  pairs,
}: {
  projectTitle: string;
  pairs: ComparisonPair[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [pos, setPos] = useState(50);
  const sliderId = useId();
  const active = pairs[activeIndex];
  const pairLabel = active.label ?? `frame ${activeIndex + 1}`;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-[family-name:var(--ff-mono)] text-[length:var(--tr-t-mono)] tracking-[.05em] text-tr-text-faint">
          <span aria-hidden="true" className="text-tr-ember">
            ◆
          </span>{" "}
          INPUT FRAME → PIPELINE OUTPUT · drag
        </p>

        {pairs.length > 1 && (
          <div role="group" aria-label="Choose a frame pair" className="flex flex-wrap gap-1.5">
            {pairs.map((p, i) => (
              <button
                key={i}
                type="button"
                aria-pressed={i === activeIndex}
                onClick={() => setActiveIndex(i)}
                className={`inline-flex h-7 items-center rounded-full border px-3 font-[family-name:var(--ff-mono)] text-[length:var(--tr-t-mono-sm)] transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] ${
                  i === activeIndex
                    ? "border-tr-ember bg-tr-ember text-tr-on-ember"
                    : "border-tr-hairline text-tr-text-mute hover:border-tr-ember"
                }`}
              >
                {p.label ?? `Frame ${i + 1}`}
              </button>
            ))}
          </div>
        )}
      </div>

      <figure className="relative mt-4 aspect-video select-none overflow-hidden rounded-[var(--tr-r-lg)] border border-tr-hairline bg-tr-surface-1">
        <Image
          src={active.after}
          alt={`${projectTitle}, ${pairLabel}: output after the pipeline runs on this frame`}
          fill
          sizes="(max-width: 980px) 100vw, 820px"
          className="object-cover"
        />
        {/* These two corner labels sit on top of a photograph, where a --tr-*
            token can't promise contrast against arbitrary imagery underneath.
            A fixed dark scrim with white text is the one hex exception on
            this page, reserved for exactly this case. */}
        <span
          className="absolute right-3 top-3 rounded px-2 py-1 font-[family-name:var(--ff-mono)] text-[11px] text-white"
          style={{ background: "rgba(0,0,0,.6)" }}
        >
          PIPELINE OUTPUT
        </span>

        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <Image
            src={active.before}
            alt={`${projectTitle}, ${pairLabel}: raw input frame before the pipeline runs`}
            fill
            sizes="(max-width: 980px) 100vw, 820px"
            className="object-cover"
          />
          <span
            className="absolute left-3 top-3 rounded px-2 py-1 font-[family-name:var(--ff-mono)] text-[11px] text-white"
            style={{ background: "rgba(0,0,0,.6)" }}
          >
            RAW
          </span>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-px bg-tr-ember"
          style={{ left: `${pos}%` }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-tr-ember font-[family-name:var(--ff-mono)] text-[13px] text-tr-on-ember"
          style={{ left: `${pos}%` }}
        >
          ‹&nbsp;›
        </div>

        <label htmlFor={sliderId} className="sr-only">
          Comparison position for {pairLabel}: raw input frame versus pipeline output
        </label>
        <input
          id={sliderId}
          type="range"
          min={0}
          max={100}
          step={1}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-ew-resize appearance-none opacity-0"
        />
      </figure>
    </div>
  );
}
