"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useDesk } from "./SecretsProvider";
import { SOLVED, applyMove, applyMoves, faceletAt, parseMove, randomScramble, simplify, undo, type Vec } from "./cube";

const COLOR: Record<string, string> = {
  U: "#ffffff",
  R: "#e8553a",
  F: "#9ed39a",
  D: "#ffd84d",
  L: "#f39a3c",
  B: "#7cc3e8",
};

// Longer than the ~20 moves the solver finds, so its solve is the shorter way back.
const SCRAMBLE_LENGTH = 25;
// The whole scramble plays in about a second and a half.
const SCRAMBLE_MS = 60;
// Medium pace: slow enough to follow each turn, quick enough that ~20 of them
// do not drag.
const SOLVE_MS = 380;
const SOLVE_PAUSE_MS = 120;
// Once the solver has a first answer, it gets this long to find shorter ones.
const SEARCH_BUDGET_MS = 1500;
// The worker never answering (a failed load) falls back to undoing the scramble.
const SEARCH_CAP_MS = 8000;

/** Cubie edge, px. */
const S = 26;
const H = S / 2;

const NORMALS: Vec[] = [[0, 0, 1], [0, 0, -1], [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0]];
const FACE_TRANSFORM = [
  `translateZ(${H}px)`,
  `rotateY(180deg) translateZ(${H}px)`,
  `rotateY(90deg) translateZ(${H}px)`,
  `rotateY(-90deg) translateZ(${H}px)`,
  `rotateX(90deg) translateZ(${H}px)`,
  `rotateX(-90deg) translateZ(${H}px)`,
];

// CSS's y axis points down, the cube's points up, which flips the sense of a
// turn about x and z but not about y.
const cssRotate = (axis: number, angle: number) =>
  axis === 0 ? `rotateX(${-angle}deg)` : axis === 1 ? `rotateY(${angle}deg)` : `rotateZ(${-angle}deg)`;

const CUBIES = [-1, 0, 1]
  .flatMap((x) => [-1, 0, 1].flatMap((y) => [-1, 0, 1].map((z): Vec => [x, y, z])))
  .filter((p) => p.some((v) => v !== 0))
  .map((pos) => ({
    pos,
    base: `translate3d(${pos[0] * S}px,${-pos[1] * S}px,${pos[2] * S}px)`,
    faces: NORMALS.map((n) => faceletAt(pos, n)),
  }));

// The cube is 156 faces of markup, which the home page's HTML budget has no
// room for, and it sits far below the fold. So the server sends the empty box
// and the browser draws the cube into it.
const noSubscribe = () => () => {};
const useInBrowser = () => useSyncExternalStore(noSubscribe, () => true, () => false);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Search = { result: Promise<string[] | null>; stop: () => void };

/** Asks the solver worker for the shortest solve it can find in its budget. */
function search(state: string): Search {
  if (typeof Worker === "undefined") return { result: Promise.resolve(null), stop: () => {} };
  const worker = new Worker(new URL("./cube.worker.ts", import.meta.url));
  let best: string[] | null = null;
  let finish = () => {};
  const result = new Promise<string[] | null>((resolve) => {
    const timers = [setTimeout(() => finish(), SEARCH_CAP_MS)];
    finish = () => {
      timers.forEach(clearTimeout);
      worker.terminate();
      resolve(best);
    };
    worker.onmessage = (e: MessageEvent<string | null>) => {
      if (e.data === null) return finish();
      if (!best) timers.push(setTimeout(finish, SEARCH_BUDGET_MS));
      best = e.data.split(" ").filter(Boolean);
    };
    worker.onerror = () => finish();
  });
  worker.postMessage(state);
  return { result, stop: () => finish() };
}

type Phase = "idle" | "scrambling" | "thinking" | "solving";

/** What the card writes out: the scramble, then the solve as it plays. */
type Notes = { scramble: string[]; solution: string[] | null; at: number };

export function CubeCard({ pb }: { pb: string }) {
  const { found } = useDesk();
  const reduced = usePrefersReducedMotion();
  const inBrowser = useInBrowser();
  const [state, setState] = useState(SOLVED);
  const [phase, setPhase] = useState<Phase>("idle");
  const [notes, setNotes] = useState<Notes | null>(null);
  const cubies = useRef<(HTMLDivElement | null)[]>([]);
  // Every move since the cube was last solved: undoing them is the fallback solve.
  const history = useRef<string[]>([]);
  const pending = useRef<Search | null>(null);

  useEffect(() => () => pending.current?.stop(), []);

  const solved = state === SOLVED;
  // jsdom has no Web Animations, so tests take the instant path, as reader mode does.
  const animated = () => !reduced && typeof cubies.current[0]?.animate === "function";

  /** Turns one layer on screen, then commits the move to the stickers. */
  const turn = async (move: string, ms: number) => {
    const { axis, layer, angle } = parseMove(move);
    const anims = CUBIES.flatMap((c, i) => {
      const el = cubies.current[i];
      if (c.pos[axis] !== layer || !el) return [];
      return [
        el.animate(
          [{ transform: `${cssRotate(axis, 0)} ${c.base}` }, { transform: `${cssRotate(axis, angle)} ${c.base}` }],
          { duration: ms, easing: "ease-in-out", fill: "forwards" },
        ),
      ];
    });
    await Promise.all(anims.map((a) => a.finished));
    // Repaint the stickers in their new places before the layer snaps back
    // unrotated, so no frame shows the old colours at rest.
    flushSync(() => setState((s) => applyMove(s, move)));
    anims.forEach((a) => a.cancel());
  };

  const scramble = async () => {
    if (phase !== "idle") return;
    found("cube", "Scrambled. Now solve it. I'll wait.");
    const moves = randomScramble(SCRAMBLE_LENGTH);
    const target = applyMoves(state, moves);
    history.current.push(...moves);
    pending.current?.stop();
    // The solver starts now, so most of its thinking hides behind the scramble.
    pending.current = search(target);
    // Written out from solved, so it can be followed on a real cube.
    setNotes({ scramble: simplify(history.current), solution: null, at: -1 });
    if (!animated()) return setState(target);
    setPhase("scrambling");
    try {
      for (const m of moves) await turn(m, SCRAMBLE_MS);
    } finally {
      setPhase("idle");
    }
  };

  const solve = async () => {
    if (phase !== "idle" || solved) return;
    setPhase("thinking");
    const searched = (await pending.current?.result) ?? null;
    const fallback = undo(history.current);
    // Trust the solver only for a shorter solve that really does solve it.
    const moves = searched && searched.length < fallback.length && applyMoves(state, searched) === SOLVED ? searched : fallback;
    pending.current = null;
    history.current = [];
    const show = (at: number) => setNotes((n) => n && { ...n, solution: moves, at });
    try {
      if (!animated()) return setState(SOLVED);
      setPhase("solving");
      for (const [i, move] of moves.entries()) {
        show(i);
        await turn(move, SOLVE_MS);
        await sleep(SOLVE_PAUSE_MS);
      }
    } finally {
      show(moves.length);
      setPhase("idle");
    }
  };

  const status =
    phase === "scrambling"
      ? "Scrambling…"
      : phase === "thinking"
        ? "Looking for the shortest solve…"
        : phase === "solving" && notes?.solution
          ? `Solving… move ${notes.at + 1} of ${notes.solution.length}`
          : !solved
            ? `Scrambled. Give me ${pb} seconds, or press solve.`
            : notes?.solution
              ? `Solved in ${notes.solution.length} moves. Click the cube to go again.`
              : "Click the cube to scramble it. I promise I'm faster than this.";

  return (
    <div className="rounded-[18px] border-[1.5px] border-dashed border-tr-hairline bg-tr-surface-1 p-5">
      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={scramble}
          disabled={phase !== "idle"}
          aria-label="Scramble the cube"
          className="desk-cube relative size-[112px] shrink-0 cursor-pointer [perspective:520px] disabled:cursor-default"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 [transform-style:preserve-3d]"
            style={{ transform: "rotateX(-28deg) rotateY(-38deg)" }}
          >
            {inBrowser && CUBIES.map((c, i) => (
              <div
                key={i}
                ref={(el) => {
                  cubies.current[i] = el;
                }}
                className="absolute [transform-style:preserve-3d]"
                style={{ width: S, height: S, left: `calc(50% - ${H}px)`, top: `calc(50% - ${H}px)`, transform: c.base }}
              >
                {c.faces.map((f, n) => (
                  <div
                    key={n}
                    className="absolute inset-0 bg-tr-text p-[2px] [backface-visibility:hidden]"
                    style={{ transform: FACE_TRANSFORM[n] }}
                  >
                    {f >= 0 && <div className="size-full rounded-[4px]" style={{ background: COLOR[state[f]] }} />}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </button>
        <div>
          <p className="font-mono text-[11px] text-tr-text-faint">PERSONAL BEST · WCA OFFICIAL</p>
          <p className="text-[34px] font-extrabold tracking-[-0.03em]">{pb}s</p>
          <p aria-live="polite" className="text-[14px] text-tr-text-faint">
            {status}
          </p>
          <button
            type="button"
            onClick={solve}
            disabled={phase !== "idle"}
            className={`desk-press mt-3 cursor-pointer rounded-full border-[1.5px] border-tr-hairline bg-tr-butter px-3 py-[5px] font-mono text-[12px] shadow-[2px_2px_0_var(--tr-text)] [--desk-press:2px] disabled:cursor-default disabled:opacity-60 ${
              solved && phase === "idle" ? "invisible" : ""
            }`}
          >
            solve it
          </button>
        </div>
      </div>
      {notes && (
        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 border-t-[1.5px] border-dashed border-tr-hairline pt-4 font-mono text-[12px] leading-relaxed">
          <dt className="text-tr-text-faint">scramble</dt>
          <dd>
            {notes.scramble.join(" ")}
            <span className="block text-[11px] text-tr-text-faint">white on top, green in front</span>
          </dd>
          {notes.solution && (
            <>
              <dt className="text-tr-text-faint">solution</dt>
              <dd className="flex flex-wrap gap-x-[1ch]">
                {notes.solution.map((m, i) => (
                  <span
                    key={i}
                    className={
                      i === notes.at ? "rounded-[4px] bg-tr-butter px-1 -mx-1 font-bold" : i > notes.at ? "text-tr-text-faint" : ""
                    }
                  >
                    {m}
                  </span>
                ))}
              </dd>
            </>
          )}
        </dl>
      )}
    </div>
  );
}
