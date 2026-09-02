"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const FINE_POINTER_QUERY = "(pointer: fine)";

function subscribeFinePointer(callback: () => void) {
  const mql = window.matchMedia(FINE_POINTER_QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getFinePointerSnapshot() {
  return window.matchMedia(FINE_POINTER_QUERY).matches;
}

function getFinePointerServerSnapshot() {
  return false;
}

// Same SSR-safe shape as usePrefersReducedMotion: `false` on the server and
// on the client's first paint, then syncs to the real value. Duplicated here
// (rather than extracted to a shared hook) because this file must stand alone
// per the build brief's file scope.
function useFinePointer(): boolean {
  return useSyncExternalStore(subscribeFinePointer, getFinePointerSnapshot, getFinePointerServerSnapshot);
}

const IDLE_SIZE = 20; // px, matches the mockup's idle reticle
const POINTER_LERP = 0.22;
const BOX_LERP = 0.28;

type TargetRect = { x: number; y: number; w: number; h: number };

// Ported 1:1 from the cursor reticle in redesign/concepts/two-readers.html
// (class names, structure, lerp constants), with --accent/--hairline/--bg/--ease/
// --font-mono swapped for their --tr-*/--font-geist-mono equivalents. Lives here
// instead of globals.css so this component is fully self-contained.
const RETICLE_STYLE = `
  .tr-reticle {
    position: fixed;
    top: 0;
    left: 0;
    width: ${IDLE_SIZE}px;
    height: ${IDLE_SIZE}px;
    pointer-events: none;
    z-index: var(--tr-z-cursor);
    transform: translate(-9999px, -9999px);
    will-change: transform, width, height;
  }
  .tr-reticle-mark {
    position: absolute;
    inset: 0;
    stroke: var(--tr-accent);
    stroke-width: 1;
    fill: none;
    opacity: 1;
    transition: opacity 0.2s var(--tr-ease);
  }
  .tr-reticle-box {
    position: absolute;
    inset: 0;
    border: 1px solid var(--tr-accent);
    opacity: 0;
    transition: opacity 0.2s var(--tr-ease);
  }
  .tr-reticle.is-hover .tr-reticle-mark { opacity: 0; }
  .tr-reticle.is-hover .tr-reticle-box { opacity: 1; }
  .tr-reticle-label {
    position: absolute;
    left: calc(100% + 10px);
    top: 50%;
    transform: translateY(-50%);
    display: inline-block;
    font-family: var(--font-geist-mono);
    font-size: var(--tr-t-mono-sm);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--tr-accent);
    background: var(--tr-bg);
    border: 1px solid var(--tr-hairline);
    padding: 0.25em 0.5em;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.2s var(--tr-ease);
  }
  .tr-reticle.is-hover .tr-reticle-label { opacity: 1; }
  @media (pointer: fine) {
    body.has-reticle,
    body.has-reticle a,
    body.has-reticle button,
    body.has-reticle [data-cursor] {
      cursor: none;
    }
  }
`;

// Custom reticle cursor: a hollow crosshair that lerps toward the pointer and
// snaps to a thin accent outline around any [data-cursor="LABEL"] element it
// hovers. Desktop-fine-pointer-only, and inert under reduced motion.
export function Cursor() {
  const finePointer = useFinePointer();
  const prefersReducedMotion = usePrefersReducedMotion();
  const active = finePointer && !prefersReducedMotion;

  const reticleRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!active) return;
    const reticle = reticleRef.current;
    const label = labelRef.current;
    if (!reticle || !label) return;

    document.body.classList.add("has-reticle");

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let curX = mouseX;
    let curY = mouseY;
    let targetRect: TargetRect | null = null;
    let boxX: number | undefined;
    let boxY: number | undefined;
    let boxW: number | undefined;
    let boxH: number | undefined;
    let activeEl: Element | null = null;
    let rafId = 0;

    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * t;
    }

    // Arrow-function `const`s (not `function` declarations) from here down:
    // TS's control-flow narrowing of `reticle`/`label` to non-null only
    // survives into closures shaped this way, not into hoisted declarations.
    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const frame = () => {
      curX = lerp(curX, mouseX, POINTER_LERP);
      curY = lerp(curY, mouseY, POINTER_LERP);

      if (targetRect) {
        boxX = lerp(boxX === undefined ? targetRect.x : boxX, targetRect.x, BOX_LERP);
        boxY = lerp(boxY === undefined ? targetRect.y : boxY, targetRect.y, BOX_LERP);
        boxW = lerp(boxW === undefined ? targetRect.w : boxW, targetRect.w, BOX_LERP);
        boxH = lerp(boxH === undefined ? targetRect.h : boxH, targetRect.h, BOX_LERP);
        reticle.style.width = `${boxW}px`;
        reticle.style.height = `${boxH}px`;
        reticle.style.transform = `translate(${boxX}px, ${boxY}px)`;
      } else {
        boxX = boxY = boxW = boxH = undefined;
        reticle.style.width = `${IDLE_SIZE}px`;
        reticle.style.height = `${IDLE_SIZE}px`;
        reticle.style.transform = `translate(${curX - IDLE_SIZE / 2}px, ${curY - IDLE_SIZE / 2}px)`;
      }
      rafId = requestAnimationFrame(frame);
    };
    rafId = requestAnimationFrame(frame);

    // mouseover/mouseout (not mouseenter/mouseleave, which don't bubble) on
    // document so [data-cursor] elements added by later route changes are
    // covered without re-querying on every navigation.
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const el = target.closest("[data-cursor]");
      if (!el || el === activeEl) return;
      activeEl = el;
      const r = el.getBoundingClientRect();
      targetRect = { x: r.left, y: r.top, w: r.width, h: r.height };
      label.textContent = el.getAttribute("data-cursor");
      reticle.classList.add("is-hover");
    };

    const onMouseOut = (e: MouseEvent) => {
      if (!activeEl) return;
      const related = e.relatedTarget;
      // Still inside the active target (moved to a descendant) — not a real exit.
      if (related instanceof Node && activeEl.contains(related)) return;
      activeEl = null;
      targetRect = null;
      reticle.classList.remove("is-hover");
    };

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseout", onMouseOut);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
      document.body.classList.remove("has-reticle");
    };
  }, [active]);

  if (!active) return null;

  return (
    <>
      <style>{RETICLE_STYLE}</style>
      <div ref={reticleRef} className="tr-reticle" aria-hidden="true">
        <svg className="tr-reticle-mark" viewBox="0 0 20 20" width="20" height="20">
          <line x1="0" y1="0" x2="9" y2="0" />
          <line x1="11" y1="0" x2="20" y2="0" />
          <line x1="20" y1="0" x2="20" y2="9" />
          <line x1="20" y1="11" x2="20" y2="20" />
          <line x1="20" y1="20" x2="11" y2="20" />
          <line x1="9" y1="20" x2="0" y2="20" />
          <line x1="0" y1="20" x2="0" y2="11" />
          <line x1="0" y1="9" x2="0" y2="0" />
        </svg>
        <span className="tr-reticle-box" />
        <span ref={labelRef} className="tr-reticle-label" />
      </div>
    </>
  );
}
