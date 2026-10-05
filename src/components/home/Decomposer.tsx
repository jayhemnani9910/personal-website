"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import Link from "next/link";
import { FEATURED, PRESETS, COPY } from "@/data/home";
import type { DecomposeOutput } from "@/data/home";
import { BRIEF_MAX, closestPreset, findPreset } from "@/lib/presets";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useShellIntent } from "@/lib/shell-intent";

type Engine = "idle" | "thinking" | "preset" | "model" | "offline" | "limited" | "too_long";

type ColumnKey = "scope" | "architecture" | "plan" | "risks";

const REVEAL_STEP_MS = 160;
const REVEAL_TOTAL = 12;

const COLUMNS: { key: ColumnKey; n: string; label: string }[] = [
  { key: "scope", n: "00", label: "SCOPE" },
  { key: "architecture", n: "01", label: "ARCHITECTURE" },
  { key: "plan", n: "02", label: "PLAN" },
  { key: "risks", n: "03", label: "RISKS" },
];

// The dot is drawn separately and hidden from assistive tech, so the status
// region below announces "live model", not "black circle live model".
const ENGINE_META: Record<Engine, { text: string; className: string }> = {
  idle: { text: "idle", className: "text-tr-text-faint" },
  thinking: { text: "decomposing…", className: "text-tr-accent-ink" },
  preset: { text: "preset", className: "text-tr-ok" },
  model: { text: "live model", className: "text-tr-ok" },
  offline: { text: "closest preset (offline)", className: "text-tr-accent-ink" },
  limited: { text: "closest preset (rate limited)", className: "text-tr-accent-ink" },
  too_long: { text: "closest preset (brief too long)", className: "text-tr-accent-ink" },
};

// Each fallback says why the answer is a saved example, not a reading of the
// brief: a network failure, the per-minute limit, or a brief over the cap.
const FALLBACK_NOTE: Partial<Record<Engine, string>> = {
  offline: COPY.offlineNote,
  limited: COPY.limitedNote,
  too_long: COPY.tooLongNote(BRIEF_MAX),
};

const LINE_ANIM = "animate-[v4-line-in_.4s_cubic-bezier(.16,1,.3,1)_both]";

// The textarea/label pair can't reuse "brief" as its id: Hero.tsx already
// puts id="brief" on the <section> that wraps this component (the scroll
// target for the v4:brief event below), and a second element sharing that id
// would be invalid HTML. This id is only for the label association.
const BRIEF_FIELD_ID = "brief-input";
const BRIEF_COUNT_ID = "brief-count";

export function Decomposer() {
  const reduced = usePrefersReducedMotion();
  const [brief, setBrief] = useState("");
  const [engine, setEngine] = useState<Engine>("idle");
  const [out, setOut] = useState<DecomposeOutput | null>(null);
  const [shown, setShown] = useState(0);
  const revealTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  // Bumped by every run and by unmount. A model answer that comes back after
  // a newer run started (or after the visitor left) sees a different number
  // and is dropped instead of overwriting the newer output.
  const runId = useRef(0);

  useEffect(() => {
    const runs = runId;
    return () => {
      runs.current += 1;
      if (revealTimer.current) clearInterval(revealTimer.current);
    };
  }, []);

  const startReveal = () => {
    if (revealTimer.current) clearInterval(revealTimer.current);
    if (reduced) {
      setShown(REVEAL_TOTAL);
      return;
    }
    revealTimer.current = setInterval(() => {
      setShown((s) => {
        const next = s + 1;
        if (next >= REVEAL_TOTAL && revealTimer.current) {
          clearInterval(revealTimer.current);
          revealTimer.current = null;
        }
        return next;
      });
    }, REVEAL_STEP_MS);
  };

  const runWithText = async (text: string) => {
    const id = ++runId.current;
    if (revealTimer.current) clearInterval(revealTimer.current);
    revealTimer.current = null;
    setEngine("thinking");
    setOut(null);
    setShown(0);

    const preset = findPreset(text);
    if (preset) {
      setOut(preset.out);
      setEngine("preset");
      startReveal();
      return;
    }

    let nextOut: DecomposeOutput;
    let nextEngine: Engine;
    let fallback: Engine = "offline";
    try {
      const res = await fetch("/api/decompose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief: text }),
      });
      if (!res.ok) {
        const code = ((await res.json().catch(() => null)) as { error?: string } | null)?.error;
        if (code === "rate_limited") fallback = "limited";
        else if (code === "too_long") fallback = "too_long";
        throw new Error(`status ${res.status}`);
      }
      const body = (await res.json()) as { out: DecomposeOutput; engine: Engine };
      nextOut = body.out;
      nextEngine = body.engine;
    } catch {
      nextOut = closestPreset(text).out;
      nextEngine = fallback;
    }
    if (id !== runId.current) return;
    setOut(nextOut);
    setEngine(nextEngine);
    startReveal();
  };

  const thinking = engine === "thinking";

  // Kept current every render so the v4:brief listener below (registered
  // once, on mount) always calls the latest closure instead of a stale one.
  const runWithTextRef = useRef(runWithText);
  const thinkingRef = useRef(thinking);
  useEffect(() => {
    runWithTextRef.current = runWithText;
    thinkingRef.current = thinking;
  });

  useEffect(() => {
    const onExternalBrief = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      // Same rule as run(): one model call at a time.
      if (typeof detail !== "string" || thinkingRef.current) return;
      setBrief(detail);
      document.getElementById("brief")?.scrollIntoView();
      runWithTextRef.current(detail);
    };
    window.addEventListener("v4:brief", onExternalBrief);
    return () => window.removeEventListener("v4:brief", onExternalBrief);
  }, []);
  useShellIntent("brief"); // a `brief` typed in the shell on another page

  const run = () => {
    // One model call at a time: a double click would spend two rate-limit slots.
    if (thinking) return;
    const text = brief.trim() || PRESETS[0].text;
    if (!brief.trim()) setBrief(text);
    runWithText(text);
  };

  const pick = (text: string) => {
    setBrief(text);
    runWithText(text);
  };

  const onBriefKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      run();
    }
  };

  const started = engine !== "idle";
  const fallbackNote = out ? FALLBACK_NOTE[engine] : undefined;
  const matches =
    out && shown >= REVEAL_TOTAL
      ? out.match.map((id) => FEATURED.find((p) => p.id === id)).filter((p): p is (typeof FEATURED)[number] => !!p)
      : [];

  return (
    <div
      className="border border-tr-hairline rounded-[var(--tr-r-lg)] bg-tr-surface-1 overflow-hidden"
      style={{ boxShadow: "var(--tr-shadow-card)" }}
    >
      <div className="h-10 px-4 flex items-center gap-2 border-b border-tr-hairline font-mono text-[length:var(--tr-t-mono-xs)] text-tr-text-mute">
        <span className="text-tr-accent-ink">◆</span>
        <span>decompose</span>
        <span className="text-tr-text-mute">· incoming brief</span>
        <span role="status" className={`ml-auto ${ENGINE_META[engine].className}`}>
          {engine !== "idle" && <span aria-hidden="true">● </span>}
          {ENGINE_META[engine].text}
        </span>
      </div>

      <div className="p-4">
        <label htmlFor={BRIEF_FIELD_ID} className="sr-only">
          Your brief
        </label>
        <textarea
          id={BRIEF_FIELD_ID}
          rows={3}
          maxLength={BRIEF_MAX}
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          onKeyDown={onBriefKey}
          aria-describedby={BRIEF_COUNT_ID}
          placeholder="e.g. our support team is drowning in tickets and nobody knows which ones matter"
          className="w-full resize-none border-0 bg-transparent text-tr-text text-[17px] leading-[var(--tr-lh-prose)] focus-visible:outline-offset-4"
        />
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {PRESETS.map((p) => (
            <button
              key={p.short}
              type="button"
              onClick={() => pick(p.text)}
              className="h-7 px-[.7rem] rounded-full border border-tr-hairline bg-transparent text-tr-text-mute text-[12px] transition-colors hover:border-tr-accent hover:text-tr-text"
            >
              {p.short}
            </button>
          ))}
          {/* maxLength cuts a long paste silently; the count shows it happened. */}
          <span
            id={BRIEF_COUNT_ID}
            className={`ml-auto font-mono text-[length:var(--tr-t-mono-xs)] tabular-nums ${
              brief.length >= BRIEF_MAX ? "text-tr-accent-ink" : "text-tr-text-faint"
            }`}
          >
            {brief.length}/{BRIEF_MAX}
            <span className="sr-only"> characters</span>
          </span>
          {/* aria-disabled, not disabled: a disabled button drops keyboard focus. */}
          <button
            type="button"
            data-cursor="RUN"
            onClick={run}
            aria-disabled={thinking}
            className="inline-flex items-center gap-2 h-[34px] px-4 rounded-[var(--tr-r-md)] bg-tr-accent text-tr-on-accent text-[12.5px] font-semibold aria-disabled:opacity-60 aria-disabled:cursor-wait"
          >
            Run{" "}
            <span aria-hidden="true" className="font-mono font-normal opacity-70">
              ⌘↵
            </span>
          </button>
        </div>
      </div>

      {started && (
        <div className="border-t border-tr-hairline bg-tr-bg">
          <div aria-busy={thinking} className="grid gap-px bg-tr-hairline sm:grid-cols-2 lg:grid-cols-4">
            {COLUMNS.map((col, ci) => {
              const items = out ? out[col.key].filter((_, i) => ci * 3 + i < shown) : [];
              const active = shown < REVEAL_TOTAL && Math.floor(shown / 3) === ci;
              return (
                <div key={col.key} className="bg-tr-bg p-4 min-h-[200px]">
                  <p
                    className={`m-0 mb-3 font-mono text-[length:var(--tr-t-mono-sm)] tracking-[.1em] ${
                      active ? "text-tr-accent-ink" : "text-tr-text-faint"
                    }`}
                  >
                    {col.n} {col.label}
                  </p>
                  <ol className="list-none m-0 p-0 flex flex-col gap-[.55rem]">
                    {items.map((item, i) => (
                      <li
                        key={i}
                        className={`text-[13px] leading-[var(--tr-lh-prose)] text-tr-text ${reduced ? "" : LINE_ANIM}`}
                      >
                        {item}
                      </li>
                    ))}
                  </ol>
                  {active && (
                    <span
                      aria-hidden="true"
                      className="mt-2 inline-block h-[14px] w-2 bg-tr-accent animate-[v4-caret_.9s_steps(1)_infinite]"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {matches.length > 0 && (
            <div className="flex flex-wrap items-baseline gap-4 py-[.9rem] px-4 border-t border-tr-hairline text-[13px]">
              <span className="font-mono text-[length:var(--tr-t-mono)] tracking-[.1em] text-tr-text-mute">
                SHIPPED BEFORE
              </span>
              {matches.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  data-cursor="OPEN"
                  className="border-b border-tr-hairline pb-[1px] hover:border-tr-accent"
                >
                  {project.title}{" "}
                  <span aria-hidden="true" className="text-tr-text-faint">
                    ↗
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {!started && (
        <p className="m-0 border-t border-tr-hairline py-[.9rem] px-4 font-mono text-[length:var(--tr-t-body)] leading-[var(--tr-lh-body)] text-tr-text-mute">
          {COPY.idleNote}
        </p>
      )}

      {fallbackNote && (
        <p className="m-0 border-t border-tr-hairline py-[.7rem] px-4 font-mono text-[length:var(--tr-t-mono)] text-tr-accent-ink">
          {fallbackNote}
        </p>
      )}
    </div>
  );
}
