"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { scrollBehavior } from "@/lib/scroll";
import { useDesk } from "./SecretsProvider";

const LETTERS = ["J", "A", "Y"];
const WORDS = ["python", "kafka", "langgraph", "airflow", "pytorch", "sql", "next.js", "rubik's"];
// A phone-width box holds fewer before the pile buries the letters.
const NARROW = 480;
const NARROW_WORDS = 6;
const STORM = ["wheee", "sql", "dbt", "oops", "k8s", "pandas", "ship it", "λ", "GPU", "chai"];
const LETTER_BG = ["var(--tr-accent)", "var(--tr-text)", "var(--tr-sky)"];
const WORD_BG = ["var(--tr-accent)", "var(--tr-butter)", "var(--tr-sky)", "var(--tr-mint)", "var(--tr-lilac)", "var(--tr-pink)"];

const GRAVITY = 0.55;
const AIR = 0.995;
const FLOOR_BOUNCE = -0.38;
const FLOOR_FRICTION = 0.88;
const WALL_BOUNCE = -0.6;
const MAX_THROW = 45;
const FLING_SPEED = 38;
// Konami can be entered again and again; past this, each new storm tile
// replaces the oldest one, so the pairwise collision pass stays small.
const MAX_TILES = 40;
// The loop stops after this many frames in which no tile moved more than
// REST_PX, and starts again on a grab, a wave, a storm or a resize.
const REST_FRAMES = 60;
const REST_PX = 0.1;

const TILE = "absolute left-0 top-0 flex select-none transition-none items-center justify-center border-[1.5px] border-tr-hairline shadow-[3px_3px_0_var(--tr-text)] [will-change:transform]";
const LETTER = "size-[72px] rounded-[14px] text-[52px] sm:size-24 sm:rounded-[18px] sm:text-[68px] font-extrabold";
const WORD = "rounded-full px-3 py-2 text-[13px] sm:px-4 sm:py-2.5 sm:text-[15px] font-mono font-semibold whitespace-nowrap";

type Body = {
  el: HTMLDivElement;
  w: number;
  h: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  /** Once a tile has dropped into the box, the top edge holds it in. */
  inside: boolean;
  drag: boolean;
  ox: number;
  oy: number;
  lx: number;
  ly: number;
  /** Where the tile was painted last frame, to tell when the pile is still. */
  px: number;
  py: number;
};

/**
 * The hero's tile box: letters and skills that fall in, stack, and can be
 * grabbed and thrown. A plain requestAnimationFrame loop writing transforms
 * straight to the tiles, so React never re-renders per frame. The tiles are
 * decorative (aria-hidden); the hero copy carries the meaning.
 *
 * Under reduced motion or reader mode the tiles sit in a still pile on the
 * floor: no gravity, no dragging.
 */
export function PhysicsPlayground() {
  const hostRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const { found, playgroundRef } = useDesk();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const bodies: Body[] = [];
    let dragging: Body | null = null;
    // Only the pointer that grabbed a tile moves or drops it. A second finger
    // on another tile is ignored rather than stealing the drag, which left the
    // first tile hanging in the air with nothing to release it.
    let dragPointer = -1;
    let quietFrames = 0;
    let raf = 0;
    let visible = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const paint = (b: Body) => {
      b.el.style.transform = `translate(${b.x}px,${b.y}px) rotate(${b.rot}deg)`;
    };

    const addTile = (label: string, kind: "letter" | "word") => {
      const el = document.createElement("div");
      const letter = kind === "letter";
      const bg = letter ? LETTER_BG[bodies.length % LETTER_BG.length] : WORD_BG[bodies.length % WORD_BG.length];
      el.className = `${TILE} ${letter ? LETTER : WORD} ${reduced ? "" : "cursor-grab [touch-action:none]"}`;
      el.style.background = bg;
      el.style.color = bg === "var(--tr-text)" ? "var(--tr-butter)" : "var(--tr-text)";
      el.textContent = label;
      host.appendChild(el);

      const W = host.clientWidth;
      const b: Body = {
        el,
        w: el.offsetWidth,
        h: el.offsetHeight,
        x: 20 + Math.random() * Math.max(10, W - 160),
        y: -120 - Math.random() * 300,
        vx: (Math.random() - 0.5) * 4,
        vy: 0,
        rot: (Math.random() - 0.5) * 20,
        inside: false,
        drag: false,
        ox: 0,
        oy: 0,
        lx: 0,
        ly: 0,
        px: 0,
        py: 0,
      };
      if (!reduced) {
        el.addEventListener("pointerdown", (e) => {
          e.preventDefault();
          if (dragging) return;
          dragPointer = e.pointerId;
          b.drag = true;
          b.ox = e.clientX - b.x;
          b.oy = e.clientY - b.y;
          b.lx = e.clientX;
          b.ly = e.clientY;
          b.vx = b.vy = 0;
          el.style.cursor = "grabbing";
          dragging = b;
          start();
        });
      }
      bodies.push(b);
      return b;
    };

    // Still mode: lay the tiles along the floor, wrapping upward, slightly tilted.
    // A tile's size is set by CSS breakpoints (72px letters on a phone, 96px
    // from sm up), so a resize across one changes it; re-read before laying out.
    const measure = () => {
      for (const b of bodies) {
        b.w = b.el.offsetWidth;
        b.h = b.el.offsetHeight;
      }
    };

    const pile = () => {
      const W = host.clientWidth;
      const H = host.clientHeight;
      let x = 16;
      let rowBottom = H;
      let rowHeight = 0;
      for (const b of bodies) {
        if (x + b.w > W - 16) {
          x = 16;
          rowBottom -= rowHeight + 6;
          rowHeight = 0;
        }
        b.x = x;
        b.y = rowBottom - b.h;
        b.rot = ((bodies.indexOf(b) * 37) % 9) - 4;
        x += b.w + 8;
        rowHeight = Math.max(rowHeight, b.h);
        paint(b);
      }
    };

    const step = () => {
      const W = host.clientWidth;
      const H = host.clientHeight;
      for (const b of bodies) {
        if (b.drag) continue;
        b.vy += GRAVITY;
        b.vx *= AIR;
        b.x += b.vx;
        b.y += b.vy;
        if (b.y + b.h > H) {
          b.y = H - b.h;
          b.vy *= FLOOR_BOUNCE;
          b.vx *= FLOOR_FRICTION;
          if (Math.abs(b.vy) < 1) b.vy = 0;
        }
        if (b.y >= 0) b.inside = true;
        if (b.inside && b.y < 0) {
          b.y = 0;
          b.vy *= FLOOR_BOUNCE;
        }
        if (b.x < 0) {
          b.x = 0;
          b.vx *= WALL_BOUNCE;
        }
        if (b.x + b.w > W) {
          b.x = W - b.w;
          b.vx *= WALL_BOUNCE;
        }
        b.rot += b.vx * 0.15 - b.rot * 0.04;
      }
      // Pairwise AABB: push apart along the axis of least overlap. A dragged
      // tile does not move, so the other one takes the whole push.
      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          const a = bodies[i];
          const c = bodies[j];
          const ox = Math.min(a.x + a.w, c.x + c.w) - Math.max(a.x, c.x);
          const oy = Math.min(a.y + a.h, c.y + c.h) - Math.max(a.y, c.y);
          if (ox <= 0 || oy <= 0) continue;
          const ka = a.drag ? 0 : c.drag ? 1 : 0.5;
          const kc = 1 - ka;
          if (ox < oy) {
            const s = a.x < c.x ? -1 : 1;
            a.x += s * ox * ka;
            c.x -= s * ox * kc;
            const v = (a.vx + c.vx) / 2;
            if (!a.drag) a.vx = v * 0.8;
            if (!c.drag) c.vx = v * 0.8;
          } else {
            const s = a.y < c.y ? -1 : 1;
            a.y += s * oy * ka;
            c.y -= s * oy * kc;
            if (!a.drag) a.vy *= 0.3;
            if (!c.drag) c.vy *= 0.3;
          }
        }
      }
      let moved = 0;
      for (const b of bodies) {
        moved = Math.max(moved, Math.abs(b.x - b.px) + Math.abs(b.y - b.py));
        b.px = b.x;
        b.py = b.y;
        paint(b);
      }
      quietFrames = moved < REST_PX ? quietFrames + 1 : 0;
      raf = dragging || (visible && quietFrames < REST_FRAMES) ? requestAnimationFrame(step) : 0;
    };

    const start = () => {
      quietFrames = 0;
      if (!reduced && !raf) raf = requestAnimationFrame(step);
    };

    LETTERS.forEach((l) => addTile(l, "letter"));
    (host.clientWidth < NARROW ? WORDS.slice(0, NARROW_WORDS) : WORDS).forEach((w) => addTile(w, "word"));
    const initialTiles = bodies.length;

    if (reduced) {
      pile();
      const onResize = () => {
        measure();
        pile();
      };
      window.addEventListener("resize", onResize);
      playgroundRef.current = {
        storm: () => window.scrollTo({ top: 0, behavior: scrollBehavior() }),
        wave: () => {},
      };
      return () => {
        window.removeEventListener("resize", onResize);
        playgroundRef.current = null;
        host.replaceChildren();
      };
    }

    const onMove = (e: PointerEvent) => {
      const b = dragging;
      if (!b || e.pointerId !== dragPointer) return;
      b.vx = e.clientX - b.lx;
      b.vy = e.clientY - b.ly;
      b.lx = e.clientX;
      b.ly = e.clientY;
      b.x = e.clientX - b.ox;
      b.y = e.clientY - b.oy;
    };
    const onUp = (e: PointerEvent) => {
      const b = dragging;
      if (!b || e.pointerId !== dragPointer) return;
      b.drag = false;
      b.el.style.cursor = "grab";
      if (Math.hypot(b.vx, b.vy) > FLING_SPEED) found("fling", "That tile has left the building.");
      b.vx = Math.max(-MAX_THROW, Math.min(MAX_THROW, b.vx));
      b.vy = Math.max(-MAX_THROW, Math.min(MAX_THROW, b.vy));
      dragging = null;
      start();
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    // A narrower box pushes tiles back inside on the next frame, so wake up.
    const onResize = () => {
      measure();
      start();
    };
    window.addEventListener("resize", onResize);

    // Off screen, the loop stops; it picks up again when the box scrolls back.
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    io.observe(host);

    playgroundRef.current = {
      storm: () => {
        STORM.forEach((t, i) =>
          timers.push(
            setTimeout(() => {
              if (bodies.length >= MAX_TILES) {
                const [oldest] = bodies.splice(initialTiles, 1);
                if (oldest === dragging) dragging = null;
                oldest.el.remove();
              }
              addTile(t, "word");
              start();
            }, i * 90),
          ),
        );
        window.scrollTo({ top: 0, behavior: scrollBehavior() });
        start();
      },
      wave: () => {
        bodies.forEach((b) => {
          b.vy = -12 - Math.random() * 8;
        });
        start();
      },
    };

    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("resize", onResize);
      playgroundRef.current = null;
      host.replaceChildren();
    };
  }, [reduced, found, playgroundRef]);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className="relative mt-[22px] h-[340px] overflow-hidden rounded-[20px] border-[1.5px] border-tr-hairline bg-tr-surface-1 bg-[radial-gradient(var(--tr-dot-grid)_1px,transparent_1px)] bg-size-[22px_22px] shadow-[6px_6px_0_var(--tr-text)]"
    />
  );
}
