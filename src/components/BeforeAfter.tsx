"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";

export function BeforeAfter({
  before,
  after,
  label,
  beforeLabel = "Input",
  afterLabel = "Detected",
}: {
  before: string;
  after: string;
  label?: string;
  beforeLabel?: string;
  afterLabel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const dragging = useRef(false);

  const setFromClientX = useCallback((clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, pct)));
  }, []);

  return (
    <figure className="ba" style={{ margin: 0 }}>
      <div
        ref={ref}
        className="ba-stage"
        onPointerDown={(e) => {
          dragging.current = true;
          (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
          setFromClientX(e.clientX);
        }}
        onPointerMove={(e) => dragging.current && setFromClientX(e.clientX)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
      >
        {/* after (full) underneath */}
        <Image src={after} alt={afterLabel} fill sizes="(max-width: 980px) 100vw, 820px" style={{ objectFit: "cover" }} />
        <span className="ba-pill ba-pill-after">{afterLabel}</span>

        {/* before (full, clipped to the left of the handle) */}
        <div className="ba-before-layer" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <Image src={before} alt={beforeLabel} fill sizes="(max-width: 980px) 100vw, 820px" style={{ objectFit: "cover" }} />
          <span className="ba-pill ba-pill-before">{beforeLabel}</span>
        </div>

        {/* handle */}
        <div className="ba-handle" style={{ left: `${pos}%` }} aria-hidden="true">
          <span className="ba-handle-grip">‹&nbsp;›</span>
        </div>
      </div>
      {label && <figcaption className="ba-cap mono xs upper muted">{label}</figcaption>}
    </figure>
  );
}
