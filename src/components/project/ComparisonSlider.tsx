"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { KICKER, PILL, PILL_ACTIVE } from "../desk";

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
  if (!active) return null;
  const pairLabel = active.label ?? `frame ${activeIndex + 1}`;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className={KICKER}>
          <span aria-hidden="true" className="text-tr-accent-ink">
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
                className={`cursor-pointer ${PILL} ${i === activeIndex ? PILL_ACTIVE : ""}`}
              >
                {p.label ?? `Frame ${i + 1}`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* The range input is invisible, so its focus ring would be too: the
          figure draws it instead while the input has keyboard focus. */}
      <figure
        data-testid="comparison-slider"
        className="relative mt-4 aspect-video select-none overflow-hidden rounded-[var(--tr-r-lg)] border-[1.5px] border-tr-hairline bg-tr-surface-1 shadow-[4px_4px_0_var(--tr-text)] has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-tr-accent-ink"
      >
        {/* The figure fills the 1104px content column. */}
        <Image
          src={active.after}
          alt={`${projectTitle}, ${pairLabel}: output after the pipeline runs on this frame`}
          fill
          sizes="(max-width: 1200px) 100vw, 1104px"
          className="object-cover"
        />
        {/* These two corner labels sit on top of a photograph, where a --tr-*
            token can't promise contrast against arbitrary imagery underneath.
            A fixed dark scrim with white text is the one hard-coded colour on
            project pages, reserved for exactly this case. */}
        <span
          className="absolute right-3 top-3 rounded px-2 py-1 font-mono text-[11px] text-white"
          style={{ background: "rgba(0,0,0,.6)" }}
        >
          PIPELINE OUTPUT
        </span>

        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <Image
            src={active.before}
            alt={`${projectTitle}, ${pairLabel}: raw input frame before the pipeline runs`}
            fill
            sizes="(max-width: 1200px) 100vw, 1104px"
            className="object-cover"
          />
          <span
            className="absolute left-3 top-3 rounded px-2 py-1 font-mono text-[11px] text-white"
            style={{ background: "rgba(0,0,0,.6)" }}
          >
            RAW
          </span>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-tr-accent"
          style={{ left: `${pos}%` }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[1.5px] border-tr-hairline bg-tr-accent font-mono text-[13px] font-bold text-tr-on-accent shadow-[2px_2px_0_var(--tr-text)]"
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
          aria-valuetext={`${pos}% raw input`}
          onChange={(e) => setPos(Number(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-ew-resize appearance-none opacity-0"
        />
      </figure>
    </div>
  );
}
