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

type CursorKind = "run" | "open" | "proof" | "cube" | "buddy" | "default";

const KINDS: Record<CursorKind, { size: number; ring: string; fill: string }> = {
  default: { size: 22, ring: "var(--tr-text-mute)", fill: "transparent" },
  run:     { size: 44, ring: "var(--tr-accent)",    fill: "var(--tr-accent-soft)" },
  open:    { size: 40, ring: "var(--tr-text)",      fill: "transparent" },
  proof:   { size: 40, ring: "var(--tr-ok)",        fill: "transparent" },
  cube:    { size: 56, ring: "var(--tr-accent)",    fill: "transparent" },
  buddy:   { size: 48, ring: "var(--tr-accent)",    fill: "transparent" },
};

/** The design keys ring size and colour off a `kind`. Our call sites only carry
 *  a label, so derive the kind from it and let `data-cursor-kind` win when set. */
const KIND_BY_LABEL: Record<string, CursorKind> = {
  RUN: "run",
  OPEN: "open",
  JUMP: "open",
  WRITE: "open",
  PROOF: "proof",
  SCRAMBLE: "cube",
  LABEL: "buddy",
  FLIP: "run",
};

// Ported 1:1 from the cursor in redesign/concepts/Portfolio Home.dc.html: a
// ring that tracks the pointer with no lerp, sized and coloured per kind, an
// accent dot on the point, and a label chip in inverted (light bg, dark text)
// colours. Lives here instead of globals.css so this component stays
// self-contained.
const CURSOR_STYLE = `
  .tr-cursor { position: fixed; left: 0; top: 0; z-index: var(--tr-z-cursor);
    pointer-events: none; transform: translate(-100px, -100px); will-change: transform; }
  .tr-cursor-ring { position: absolute; left: 0; top: 0; border-radius: 50%;
    border: 1.5px solid var(--tr-text-mute); background: transparent;
    transition: width .2s var(--tr-ease), height .2s var(--tr-ease),
                margin .2s var(--tr-ease), background .2s, border-color .2s; }
  .tr-cursor-dot { position: absolute; left: 0; top: 0; width: 4px; height: 4px;
    margin: -2px; border-radius: 50%; background: var(--tr-accent); }
  .tr-cursor-label { position: absolute; left: 18px; top: 14px; white-space: nowrap;
    font-family: var(--font-geist-mono); font-size: 10px; letter-spacing: .12em;
    padding: 3px 7px; border-radius: 4px;
    background: var(--tr-text); color: var(--tr-bg);
    opacity: 0; transform: translateY(4px); transition: opacity .2s, transform .2s; }
  .tr-cursor.is-hover .tr-cursor-label { opacity: 1; transform: none; }
  @media (pointer: fine) {
    body.has-cursor,
    body.has-cursor a,
    body.has-cursor button,
    body.has-cursor [data-cursor] {
      cursor: none;
    }
  }
`;

// Custom cursor: a ring that follows the pointer directly (no lerp) and
// resizes/recolours per kind over any [data-cursor="LABEL"] element it
// hovers. Desktop-fine-pointer-only, and inert under reduced motion. The
// markup always mounts (so `active` being false in tests, e.g. jsdom's
// matchMedia stub, doesn't stop the ring/dot/label from rendering), but an
// inactive visitor gets `display: none` on the root, same as the comp
// (`display: s.fine && !s.reduce ? "block" : "none"`), so nothing is ever
// laid out or painted for them and the tracking effect below is skipped too.
export function Cursor() {
  const finePointer = useFinePointer();
  const prefersReducedMotion = usePrefersReducedMotion();
  const active = finePointer && !prefersReducedMotion;

  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) return;
    const cursor = cursorRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!cursor || !ring || !label) return;

    document.body.classList.add("has-cursor");

    let activeEl: Element | null = null;

    const applyKind = (kind: CursorKind) => {
      const k = KINDS[kind];
      ring.style.width = `${k.size}px`;
      ring.style.height = `${k.size}px`;
      ring.style.marginLeft = `${-k.size / 2}px`;
      ring.style.marginTop = `${-k.size / 2}px`;
      ring.style.borderColor = k.ring;
      ring.style.background = k.fill;
    };
    applyKind("default");

    const onMouseMove = (e: MouseEvent) => {
      cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    };

    // mouseover/mouseout (not mouseenter/mouseleave, which don't bubble) on
    // document so [data-cursor] elements added by later route changes are
    // covered without re-querying on every navigation.
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const el = target.closest("[data-cursor]");
      if (!el || el === activeEl) return;
      activeEl = el;
      const labelText = el.getAttribute("data-cursor") ?? "";
      label.textContent = labelText;
      const attrKind = el.getAttribute("data-cursor-kind") as CursorKind | null;
      applyKind(attrKind ?? KIND_BY_LABEL[labelText] ?? "default");
      cursor.classList.add("is-hover");
    };

    const onMouseOut = (e: MouseEvent) => {
      if (!activeEl) return;
      const related = e.relatedTarget;
      // Still inside the active target (moved to a descendant), not a real exit.
      if (related instanceof Node && activeEl.contains(related)) return;
      activeEl = null;
      applyKind("default");
      cursor.classList.remove("is-hover");
    };

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseover", onMouseOver);
    document.addEventListener("mouseout", onMouseOut);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseover", onMouseOver);
      document.removeEventListener("mouseout", onMouseOut);
      document.body.classList.remove("has-cursor");
    };
  }, [active]);

  return (
    <>
      <style>{CURSOR_STYLE}</style>
      <div ref={cursorRef} className="tr-cursor" aria-hidden="true" style={{ display: active ? "block" : "none" }}>
        <div ref={ringRef} className="tr-cursor-ring" />
        <div className="tr-cursor-dot" />
        <div ref={labelRef} className="tr-cursor-label" />
      </div>
    </>
  );
}
