"use client";

/* FDE Console: brief textarea, preset buttons, submit. Handles live and preset
   simulation activation, routes custom briefs to /api/fde-sim.
   Ported from app.jsx, reskinned to the Desk design. */

import { useState, useRef, useEffect } from "react";
import type { Preset } from "./fdeData";
import { PRESETS, PHASES } from "./fdeData";
import { FdeSimulation } from "./FdeSimulation";
import { scrollBehavior } from "@/lib/scroll";
import { BTN_PRIMARY, DOT, DOTS, PILL } from "@/components/desk";

const PRESET_PILL = `${PILL} cursor-pointer whitespace-nowrap hover:bg-tr-butter`;

/** The route rejects anything longer with 400 bad-input. */
const MAX_BRIEF = 2000;

interface SimState {
  active: boolean;
  brief: string;
  /**
   * Partial while a live run is still arriving. Presets and cache hits are
   * complete from the first render.
   */
  payload: Partial<Preset> | null;
  source: 'preset' | 'live' | null;
  streaming: boolean;
}

const EMPTY_SIM: SimState = { active: false, brief: '', payload: null, source: null, streaming: false };

// Words that say nothing about which scenario a brief is closest to.
const STOPWORDS = new Set([
  'that', 'this', 'with', 'from', 'have', 'they', 'them', 'their', 'there', 'what',
  'when', 'where', 'which', 'into', 'about', 'than', 'then', 'some', 'more', 'most',
  'also', 'just', 'like', 'each', 'only', 'over', 'very', 'much', 'many', 'your',
  'were', 'been', 'will', 'would', 'could', 'should', 'want', 'need', 'spend', 'time',
]);

const contentWords = (text: string) =>
  new Set(text.toLowerCase().split(/\W+/).filter((w) => w.length > 3 && !STOPWORDS.has(w)));

// Last fallback tier. When the model is unreachable the page currently dead-ends
// on an error telling the visitor to go and find a preset themselves; this picks
// the nearest one for them. It is deliberately NOT presented as an answer to
// their brief: the run is loaded with source 'preset', which FdeSimulation
// labels "◆ DEMO" rather than "* LIVE".
function closestPreset(brief: string): Preset {
  const words = contentWords(brief);
  let best = PRESETS[0];
  let bestScore = -1;
  for (const p of PRESETS) {
    // Unique hits, so a preset that happens to repeat a word gains nothing.
    const score = [...contentWords(p.brief)].filter((w) => words.has(w)).length;
    if (score > bestScore) {
      bestScore = score;
      best = p;
    }
  }
  return best;
}

const PARSE_ERROR = "The agent had trouble parsing. Try a more specific brief, or pick a preset.";
const NO_RUNTIME_ERROR = "The live agent needs a runtime (this only works on the hosted preview). Try one of the preset scenarios above: they're fully prepared.";
const UPSTREAM_ERROR = "The model provider is busy or did not answer in time. Your brief is fine: try again in a minute, or see the closest prepared example.";
const BAD_INPUT_ERROR = `A brief has to be between 1 and ${MAX_BRIEF.toLocaleString('en-US')} characters. Trim it and run it again.`;
const NETWORK_ERROR = "Lost the connection to the agent before the run finished. Check your connection and try again, or see the closest prepared example.";

/** Every error code /api/fde-sim sends, as something a visitor can act on. */
function errorMessage(code: unknown): string {
  switch (code) {
    case 'no-runtime': return NO_RUNTIME_ERROR;
    case 'upstream': return UPSTREAM_ERROR;
    case 'bad-input': return BAD_INPUT_ERROR;
    default: return PARSE_ERROR;
  }
}

export function FdeConsole() {
  const [briefInput, setBriefInput] = useState('');
  const [simState, setSimState] = useState<SimState>(EMPTY_SIM);
  // Bumped per run so FdeSimulation remounts and opens on 01 Scope, not on
  // whatever tab the previous run was left on.
  const [simKey, setSimKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const simRef = useRef<HTMLDivElement>(null);
  const briefRef = useRef<HTMLTextAreaElement>(null);
  // Only the latest live run may write to the panel. Exit, a preset or a new
  // run aborts the fetch and bumps the id, and a stale run drops its events.
  const runRef = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const cancelRun = () => {
    runRef.current++;
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
  };

  useEffect(() => () => abortRef.current?.abort(), []);

  const scrollToSim = () => {
    setTimeout(() => {
      simRef.current?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
    }, 80);
  };

  const startPreset = (preset: Preset) => {
    cancelRun();
    setError(null);
    setSimKey((k) => k + 1);
    setSimState({ active: true, brief: preset.brief, payload: preset, source: 'preset', streaming: false });
    scrollToSim();
  };

  const startCustom = async () => {
    if (!briefInput.trim() || loading) return;
    cancelRun();
    const run = runRef.current;
    const stale = () => runRef.current !== run;
    const controller = new AbortController();
    abortRef.current = controller;
    const brief = briefInput;
    setError(null);
    setLoading(true);

    let started = false;
    // A run that stops after some sections leaves the rest of its tabs empty:
    // they must stop saying "still generating".
    const stopStreaming = () => {
      if (started) setSimState((prev) => ({ ...prev, streaming: false }));
    };

    try {
      // ?stream=1 asks for sections as they finish rather than the whole object
      // at the end. Measured on production, the first section lands around 13s
      // where the complete answer takes about 21s, so this is the difference
      // between reading and watching a spinner.
      const res = await fetch('/api/fde-sim?stream=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief }),
        signal: controller.signal,
      });
      if (stale()) return;

      // The limit is 8 per minute per IP. Telling someone their brief failed to
      // parse when they were actually throttled sends them off rewriting a brief
      // that was fine.
      if (res.status === 429) {
        setError("That's a few too many runs in a minute. Give it about a minute, or pick a preset scenario in the meantime.");
        return;
      }

      if (!res.ok || !res.body) {
        // The streaming path reports a missing runtime as a 200 carrying an
        // error event, but a non-streaming failure still answers with JSON, and
        // "no runtime" must not be reported as "your brief was bad".
        const code = await res.json().then((b) => b?.error).catch(() => null);
        if (!stale()) setError(errorMessage(code));
        return;
      }

      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = '';
      let finished = false;
      let failed: string | null = null;

      for (;;) {
        const { done, value } = await reader.read();
        if (stale()) return;
        if (done) break;
        buffer += value;

        // Frames are separated by a blank line; a trailing partial frame waits
        // for the next chunk.
        let sep: number;
        while ((sep = buffer.indexOf('\n\n')) !== -1) {
          const frame = buffer.slice(0, sep);
          buffer = buffer.slice(sep + 2);
          const type = frame.match(/^event: (.+)$/m)?.[1];
          const data = frame.match(/^data: (.+)$/m)?.[1];
          if (!type || !data) continue;
          const parsed = JSON.parse(data);

          if (type === 'error') {
            failed = errorMessage(parsed.error);
            continue;
          }

          if (type === 'section') {
            // Decided here, not inside the updater: an updater can run after
            // `started` has already flipped.
            const first = !started;
            started = true;
            setSimState((prev) => ({
              active: true,
              brief,
              // The first section starts from nothing, so a preset or an
              // earlier run on screen cannot fill the tabs this run has not sent.
              payload: { ...(first ? {} : prev.payload), [parsed.key]: parsed.value },
              source: 'live',
              streaming: true,
            }));
            // Reveal on the FIRST section, not the last: waiting for `done`
            // would keep the spinner up for the whole run and waste the point.
            if (first) {
              setSimKey((k) => k + 1);
              setLoading(false);
              scrollToSim();
            }
          }

          if (type === 'done') {
            finished = true;
            setSimState((prev) => ({ ...prev, streaming: false }));
          }
        }
      }

      // An error event, or a body that ended without `done`: either way the
      // run is over. A run that produced nothing leaves the panel as it was.
      if (failed || !finished) {
        setError(failed ?? NETWORK_ERROR);
        stopStreaming();
      }
    } catch {
      if (stale()) return;
      setError(NETWORK_ERROR);
      stopStreaming();
    } finally {
      if (!stale()) {
        abortRef.current = null;
        setLoading(false);
      }
    }
  };

  const exitSim = () => {
    cancelRun();
    setSimState(EMPTY_SIM);
    // The exit button unmounts with the panel; keep focus somewhere useful.
    briefRef.current?.focus();
  };

  const status = loading
    ? { label: 'scoping your brief', badge: 'SCOPING' }
    : simState.streaming
      ? { label: 'streaming the simulation', badge: 'STREAMING' }
      : error
        ? { label: 'run failed', badge: 'ERROR' }
        : { label: 'awaiting customer brief', badge: 'READY' };

  return (
    <div>
      {/* Brief card */}
      <div className="overflow-hidden rounded-[var(--tr-r-2xl)] border-[1.5px] border-tr-hairline bg-tr-surface-1 shadow-[var(--tr-shadow-card)]">
        <div className="flex items-center justify-between gap-4 border-b-[1.5px] border-tr-hairline bg-tr-surface-2 px-5 py-3 font-mono text-[12px] text-tr-text-mute">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5" aria-hidden="true">
              {DOTS.slice(0, 3).map((c) => (
                <span key={c} className={`${DOT} size-3`} style={{ background: c }} />
              ))}
            </div>
            <span>fde.sim: {status.label}</span>
          </div>
          <span className="whitespace-nowrap text-tr-accent-ink">● {status.badge}</span>
        </div>

        <div className="px-5 py-6 sm:px-8 sm:py-7">
          <div className="mb-3.5 font-mono text-[12px] text-tr-text-mute">
            <span className="text-tr-accent-ink" aria-hidden="true">❯ </span>
            tell me what you want built. ambiguity is fine, that&apos;s the point.
          </div>

          <textarea
            ref={briefRef}
            className="min-h-[96px] w-full resize-none rounded-[var(--tr-r-md)] border-[1.5px] border-tr-hairline bg-tr-surface-1 px-4 py-3 text-[20px] font-semibold leading-[var(--tr-lh-h2)] tracking-[-0.01em] text-tr-text placeholder:font-normal focus-visible:outline-offset-2"
            value={briefInput}
            onChange={e => setBriefInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) startCustom();
            }}
            placeholder="we have a customer support team drowning in tickets…"
            rows={3}
            maxLength={MAX_BRIEF}
            aria-label="Enter your problem brief"
          />

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t-[1.5px] border-dashed border-tr-rule-soft pt-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 font-mono text-[12px] text-tr-text-mute" aria-hidden="true">
                or start with:
              </span>
              {PRESETS.map(p => (
                <button
                  key={p.id}
                  className={PRESET_PILL}
                  onClick={() => startPreset(p)}
                  type="button"
                >
                  {p.chip}
                </button>
              ))}
            </div>
            <button
              className={`${BTN_PRIMARY} cursor-pointer whitespace-nowrap font-mono text-[13px] disabled:cursor-not-allowed disabled:opacity-40`}
              onClick={startCustom}
              disabled={!briefInput.trim() || loading}
              type="button"
            >
              {loading ? 'scoping…' : 'run sim ↵'}
            </button>
          </div>

          {/* Phase strip preview */}
          <div
            className="mt-5 flex flex-wrap items-center gap-1.5 font-mono text-[12px] text-tr-text-mute"
            aria-label="Simulation phases overview"
          >
            <span className="mr-1.5 text-tr-text-faint">flow:</span>
            {PHASES.map((p, i) => (
              <span key={p.key} className="inline-flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1.5">
                  <span className="inline-flex size-[20px] items-center justify-center rounded-full border-[1.5px] border-tr-hairline bg-tr-surface-2 text-[10px] text-tr-text">
                    {i + 1}
                  </span>
                  {p.title.toLowerCase()}
                </span>
                {i < PHASES.length - 1 && (
                  <span className="mx-0.5 text-tr-text-faint" aria-hidden="true">→</span>
                )}
              </span>
            ))}
          </div>

          {/* Mounted before it has anything to say: a live region inserted
              already filled is often never announced. */}
          <div aria-live="polite">
            {loading && (
              <div className="flex items-center gap-2.5 py-6 font-mono text-[13px] text-tr-text-mute">
                <span className="size-4 shrink-0 animate-spin rounded-full border-2 border-tr-surface-2 border-t-tr-accent" aria-hidden="true" />
                <span>
                  routing your brief through the agent
                  <span className="animate-pulse" aria-hidden="true">...</span>
                </span>
              </div>
            )}
          </div>

          {error && (
            <div
              className="mt-4 rounded-r-[var(--tr-r-md)] border-l-[3px] border-tr-accent bg-tr-accent-soft px-4 py-3 font-mono text-[13px] leading-[var(--tr-lh-body)] text-tr-text"
              role="alert"
            >
              <span className="text-tr-accent-ink">ERROR · </span>
              {error}
              <div className="mt-2.5">
                <button
                  className={PRESET_PILL}
                  type="button"
                  onClick={() => startPreset(closestPreset(briefInput))}
                >
                  show the closest prepared example
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Simulation panel */}
      {simState.active && simState.payload && (
        <div ref={simRef} className="mt-6">
          <FdeSimulation
            key={simKey}
            payload={simState.payload}
            brief={simState.brief}
            source={simState.source as 'preset' | 'live'}
            onExit={exitSim}
            streaming={simState.streaming}
          />
        </div>
      )}
    </div>
  );
}
