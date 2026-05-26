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
  payload: Preset | null;
  source: 'preset' | 'live' | null;
}

export function FdeConsole() {
  const [briefInput, setBriefInput] = useState('');
  const [simState, setSimState] = useState<SimState>({
    active: false,
    brief: '',
    payload: null,
    source: null,
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
    setSimState({ active: true, brief: preset.brief, payload: preset, source: 'preset' });
    scrollToSim();
  };

  const startCustom = async () => {
    if (!briefInput.trim() || loading) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/fde-sim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief: briefInput }),
      });

      if (res.status === 503) {
        const body = await res.json().catch(() => ({}));
        if (body?.error === 'no-runtime') {
          setError("The live agent needs a runtime (this only works on the hosted preview). Try one of the preset scenarios above: they're fully prepared.");
        } else {
          setError("The live agent needs a runtime. Try one of the preset scenarios above: they're fully prepared.");
        }
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (body?.error === 'parse') {
          setError("The agent had trouble parsing. Try a more specific brief, or pick a preset.");
        } else {
          setError("The agent had trouble parsing. Try a more specific brief, or pick a preset.");
        }
        setLoading(false);
        return;
      }

      const payload = await res.json();
      setSimState({ active: true, brief: briefInput, payload, source: 'live' });
      scrollToSim();
    } catch {
      setError("The agent had trouble parsing. Try a more specific brief, or pick a preset.");
    }
    setLoading(false);
  };

  const exitSim = () =>
    setSimState({ active: false, brief: '', payload: null, source: null });

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
          />
        </div>
      )}
    </div>
  );
}
