"use client";

/* FDE Console: brief textarea, preset buttons, submit. Handles live and preset
   simulation activation, routes custom briefs to /api/fde-sim.
   Ported from app.jsx, reskinned to editorial theme. */

import { useState, useRef } from "react";
import type { Preset } from "./fdeData";
import { PRESETS, PHASES } from "./fdeData";
import { FdeSimulation } from "./FdeSimulation";

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

export function FdeConsole() {
  const [briefInput, setBriefInput] = useState('');
  const [simState, setSimState] = useState<SimState>({
    active: false,
    brief: '',
    payload: null,
    source: null,
    streaming: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const simRef = useRef<HTMLDivElement>(null);

  const scrollToSim = () => {
    setTimeout(() => {
      simRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const startPreset = (preset: Preset) => {
    setError(null);
    setSimState({ active: true, brief: preset.brief, payload: preset, source: 'preset', streaming: false });
    scrollToSim();
  };

  // Last fallback tier. When the model is unreachable the page currently dead-ends
  // on an error telling the visitor to go and find a preset themselves; this picks
  // the nearest one for them. It is deliberately NOT presented as an answer to
  // their brief: the run is loaded with source 'preset', which FdeSimulation
  // labels "◆ DEMO" rather than "* LIVE".
  const closestPreset = (brief: string): Preset => {
    const words = new Set(
      brief.toLowerCase().split(/\W+/).filter((w) => w.length > 3)
    );
    let best = PRESETS[0];
    let bestScore = -1;
    for (const p of PRESETS) {
      const score = p.brief
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => words.has(w)).length;
      if (score > bestScore) {
        bestScore = score;
        best = p;
      }
    }
    return best;
  };

  const PARSE_ERROR = "The agent had trouble parsing. Try a more specific brief, or pick a preset.";
  const NO_RUNTIME_ERROR = "The live agent needs a runtime (this only works on the hosted preview). Try one of the preset scenarios above: they're fully prepared.";

  const startCustom = async () => {
    if (!briefInput.trim() || loading) return;
    setError(null);
    setLoading(true);
    try {
      // ?stream=1 asks for sections as they finish rather than the whole object
      // at the end. Measured on production, the first section lands around 13s
      // where the complete answer takes about 21s, so this is the difference
      // between reading and watching a spinner.
      const res = await fetch('/api/fde-sim?stream=1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief: briefInput }),
      });

      // The limit is 8 per minute per IP. Telling someone their brief failed to
      // parse when they were actually throttled sends them off rewriting a brief
      // that was fine.
      if (res.status === 429) {
        setError("That's a few too many runs in a minute. Give it about a minute, or pick a preset scenario in the meantime.");
        setLoading(false);
        return;
      }

      if (!res.ok || !res.body) {
        // The streaming path reports a missing runtime as a 200 carrying an
        // error event, but a non-streaming failure still answers with JSON, and
        // "no runtime" must not be reported as "your brief was bad".
        const code = await res.json().then((b) => b?.error).catch(() => null);
        setError(code === 'no-runtime' ? NO_RUNTIME_ERROR : PARSE_ERROR);
        setLoading(false);
        return;
      }

      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = '';
      let started = false;
      let failed: string | null = null;

      for (;;) {
        const { done, value } = await reader.read();
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
            failed = parsed.error === 'no-runtime' ? NO_RUNTIME_ERROR : PARSE_ERROR;
            continue;
          }

          if (type === 'section') {
            setSimState((prev) => ({
              active: true,
              brief: briefInput,
              payload: { ...(prev.active ? prev.payload : null), [parsed.key]: parsed.value },
              source: 'live',
              streaming: true,
            }));
            // Reveal on the FIRST section, not the last: waiting for `done`
            // would keep the spinner up for the whole run and waste the point.
            if (!started) {
              started = true;
              setLoading(false);
              scrollToSim();
            }
          }

          if (type === 'done') {
            setSimState((prev) => ({ ...prev, streaming: false }));
          }
        }
      }

      if (failed) {
        setError(failed);
        // A run that produced nothing should not leave a half-built panel behind.
        if (!started) setSimState({ active: false, brief: '', payload: null, source: null, streaming: false });
      }
    } catch {
      setError(PARSE_ERROR);
    }
    setLoading(false);
  };

  const exitSim = () =>
    setSimState({ active: false, brief: '', payload: null, source: null, streaming: false });

  return (
    <div className="fde">
      {/* Brief card */}
      <div className="fde-brief-card">
        <div className="fde-brief-head">
          <div className="fde-term-dots" aria-hidden="true">
            <span className="fde-term-dot" />
            <span className="fde-term-dot" />
            <span className="fde-term-dot" />
          </div>
          <span>fde.sim: awaiting customer brief</span>
          <span className="fde-ready-badge">● READY</span>
        </div>

        <div className="fde-brief-body">
          <div className="fde-brief-prompt">
            <span className="fde-prompt-arrow" aria-hidden="true">❯ </span>
            tell me what you want built. ambiguity is fine, that&apos;s the point.
          </div>

          <textarea
            className="fde-brief-input"
            value={briefInput}
            onChange={e => setBriefInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) startCustom();
            }}
            placeholder="we have a customer support team drowning in tickets…"
            rows={3}
            aria-label="Enter your problem brief"
          />

          <div className="fde-brief-foot">
            <div className="fde-presets">
              <span className="fde-presets-label" aria-hidden="true">or start with:</span>
              {PRESETS.map(p => (
                <button
                  key={p.id}
                  className="fde-preset-btn"
                  onClick={() => startPreset(p)}
                  type="button"
                >
                  {p.chip}
                </button>
              ))}
            </div>
            <button
              className="fde-submit"
              onClick={startCustom}
              disabled={!briefInput.trim() || loading}
              type="button"
            >
              {loading ? 'scoping…' : 'run sim ↵'}
            </button>
          </div>

          {/* Phase strip preview */}
          <div className="fde-phasestrip" aria-label="Simulation phases overview">
            <span className="fde-phasestrip-label">flow:</span>
            {PHASES.map((p, i) => (
              <span key={p.key} className="fde-phasestrip-group">
                <span className="fde-phasestrip-step">
                  <span className="fde-phasestrip-num">{i + 1}</span>
                  {p.title.toLowerCase()}
                </span>
                {i < PHASES.length - 1 && (
                  <span className="fde-phasestrip-arr" aria-hidden="true">→</span>
                )}
              </span>
            ))}
          </div>

          {loading && (
            <div className="fde-loading" aria-live="polite">
              <span className="fde-spinner" aria-hidden="true" />
              <span>routing your brief through the agent<span className="fde-dots" aria-hidden="true" /></span>
            </div>
          )}

          {error && (
            <div className="fde-error-block" role="alert">
              <span className="fde-error-label">ERROR · </span>
              {error}
              <div className="fde-error-actions">
                <button
                  className="fde-preset-btn"
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
        <div ref={simRef} style={{ marginTop: 24 }}>
          <FdeSimulation
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
