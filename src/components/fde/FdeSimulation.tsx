"use client";

/* FDE Simulation workspace: phase tabs, narration side panel, 6 phase content
   renderers. Ported from sim.jsx and reskinned to editorial theme. */

import { useState, useEffect, useRef } from "react";
import type { Preset } from "./fdeData";
import { PHASES, NARRATION, RECEIPTS } from "./fdeData";
import { FdeArchDiagram } from "./FdeArchDiagram";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

interface Props {
  /** Partial while a live run streams. Presets and cache hits arrive complete. */
  payload: Partial<Preset>;
  brief: string;
  source: 'preset' | 'live';
  onExit: () => void;
  /** True while sections are still arriving. Presets and cache hits are never streaming. */
  streaming?: boolean;
}

const SECTION_KEYS: (keyof Preset)[] = ['scope', 'decomposition', 'architecture', 'sprint', 'risks'];

// Which payload key each phase tab needs before it has anything to show.
// `receipts` is the closing summary, so it waits for the whole answer.
const PHASE_SECTION: Record<string, keyof Preset | null> = {
  scope: 'scope',
  decomp: 'decomposition',
  arch: 'architecture',
  plan: 'sprint',
  risks: 'risks',
  receipts: null,
};

function sectionReady(payload: Partial<Preset>, phaseKey: string): boolean {
  const section = PHASE_SECTION[phaseKey];
  if (section === null) return SECTION_KEYS.every((k) => payload[k] != null);
  return payload[section] != null;
}


export function FdeSimulation({ payload, brief, source, onExit, streaming = false }: Props) {
  const [phase, setPhase] = useState(0);
  const [revealed, setRevealed] = useState(0);
  const sideRef = useRef<HTMLElement>(null);

  const currentKey = PHASES[phase].key;
  const narration = NARRATION[currentKey] || [];

  const prefersReducedMotion = usePrefersReducedMotion();

  // Reset narration reveal progress synchronously during render when the
  // phase changes, instead of via an unconditional setState in an effect.
  const [renderedPhase, setRenderedPhase] = useState(phase);
  if (phase !== renderedPhase) {
    setRenderedPhase(phase);
    setRevealed(0);
  }

  // Under reduced motion every line is visible immediately, with no timers.
  const narrationVisible = prefersReducedMotion ? narration.length : revealed;

  useEffect(() => {
    if (prefersReducedMotion) return; // no timers at all under reduced motion
    const timers: ReturnType<typeof setTimeout>[] = [];
    const reveal = (i: number) => {
      if (i > narration.length) return;
      const t = setTimeout(() => {
        setRevealed(i);
        reveal(i + 1);
      }, 300 + i * 250);
      timers.push(t);
    };
    reveal(1);
    return () => timers.forEach(t => clearTimeout(t));
  }, [phase, prefersReducedMotion, narration.length]);

  const next = () => setPhase(p => Math.min(p + 1, PHASES.length - 1));
  // The tab for an unfinished section is disabled, so the nav button that walks
  // onto it has to be too. Without this the two controls disagree and one of
  // them lands the reader on a spinner.
  const nextReady = phase < PHASES.length - 1 && sectionReady(payload, PHASES[phase + 1].key);
  const prev = () => setPhase(p => Math.max(p - 1, 0));

  return (
    <div className="fde fde-sim">
      {/* Head */}
      <div className="fde-sim-head">
        <button className="fde-sim-exit" onClick={onExit} type="button">
          × EXIT SIM
        </button>
        <div className="fde-sim-brief" title={brief}>{brief}</div>
        <div className="fde-sim-status">
          {source === 'live' ? '* LIVE · ' : '◆ DEMO · '}
          PHASE {PHASES[phase].num} · {PHASES[phase].status.toUpperCase()}
        </div>
      </div>

      {/* Phase tabs */}
      <div className="fde-phasetabs" role="tablist" aria-label="Simulation phases">
        {PHASES.map((p, i) => {
          const ready = sectionReady(payload, p.key);
          const state = i === phase ? 'active' : (i < phase ? 'done' : 'pending');
          return (
            <button
              key={p.key}
              className="fde-phasetab"
              data-state={state}
              role="tab"
              aria-selected={i === phase}
              aria-controls={`fde-panel-${p.key}`}
              onClick={() => setPhase(i)}
              type="button"
              // Opening a tab whose section has not arrived would show an empty
              // panel, so it stays shut until there is something behind it.
              disabled={!ready}
              aria-disabled={!ready}
              title={ready ? undefined : 'still generating'}
            >
              <span className="fde-tab-num">{state === 'done' && ready ? '✓ ' : ''}{p.num}</span>
              <span className="fde-tab-title">{p.title}</span>
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div className="fde-sim-body">
        <div
          className="fde-sim-main"
          id={`fde-panel-${currentKey}`}
          role="tabpanel"
          aria-label={`Phase ${PHASES[phase].title}`}
        >
          <PhaseContent phase={currentKey} payload={payload} streaming={streaming} />

          <div className="fde-phase-nav">
            <button
              className="fde-navbtn"
              onClick={prev}
              disabled={phase === 0}
              type="button"
            >
              &larr; previous
            </button>
            <span className="fde-nav-count">
              {phase + 1} / {PHASES.length}
            </span>
            <button
              className="fde-navbtn fde-navbtn-primary"
              onClick={next}
              disabled={phase === PHASES.length - 1 || !nextReady}
              type="button"
            >
              {phase === PHASES.length - 2 ? 'see the receipts →' : 'continue →'}
            </button>
          </div>
        </div>

        <aside className="fde-sim-side" ref={sideRef}>
          <h3 className="fde-side-label">{"// Jay, narrating"}</h3>
          {narration.slice(0, narrationVisible).map((n, i) => (
            <div
              key={`${phase}-${i}`}
              className={`fde-narration-line${n.who === 'sys' ? ' fde-narration-sys' : ''}`}
            >
              <span className="fde-narration-who">{n.who === 'jay' ? '$ jay' : '~ sys'}</span>
              <span>{n.text}</span>
            </div>
          ))}

          <hr className="fde-rule" style={{ margin: '24px 0 16px' }} />

          <h3 className="fde-side-label">{"// Brief"}</h3>
          <div className="fde-side-brief">&quot;{brief}&quot;</div>

          <hr className="fde-rule" style={{ margin: '24px 0 16px' }} />

          <h3 className="fde-side-label">{"// Stack"}</h3>
          <div className="fde-side-stack">
            LangGraph · MCP · RAG<br />
            Python · FastAPI · Node<br />
            evals · postgres · redis<br />
            kafka · k8s
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─── Phase content ────────────────────────────────────────────────────────────

/** Shown in the panel for a section that has not arrived yet. */
function AwaitingSection({ title }: { title: string }) {
  return (
    <div className="fde-loading" aria-live="polite">
      <span className="fde-spinner" aria-hidden="true" />
      <span>generating {title.toLowerCase()}<span className="fde-dots" aria-hidden="true" /></span>
    </div>
  );
}

function PhaseContent({
  phase,
  payload,
  streaming,
}: { phase: string; payload: Partial<Preset>; streaming: boolean }) {
  // Every branch below indexes into a section. While streaming, one may not be
  // there yet, and an unguarded .map on undefined takes the whole page down.
  if (!sectionReady(payload, phase)) {
    const title = PHASES.find((p) => p.key === phase)?.title ?? 'this section';
    return streaming ? <AwaitingSection title={title} /> : null;
  }
  if (!payload) return null;

  switch (phase) {
    case 'scope':
      return (
        <div>
          <h2 className="fde-phase-title">
            First: <span className="fde-em">three questions</span> I need answered.
          </h2>
          <div className="fde-phase-sub">{"// scoping. before any building, before any architecture, before anything."}</div>
          {(payload.scope ?? []).map((s, i) => (
            <div
              key={i}
              className="fde-scope-q"
              style={{ animationDelay: `${i * 0.18}s` }}
            >
              <div className="fde-qnum">Q{i + 1}</div>
              <div>
                <div className="fde-q">{s.q}</div>
                <div className="fde-why">{s.why}</div>
              </div>
            </div>
          ))}
        </div>
      );

    case 'decomp':
      return (
        <div>
          <h2 className="fde-phase-title">
            The <span className="fde-em">subproblems</span>.
          </h2>
          <div className="fde-phase-sub">{"// each one has a clean boundary. each one is shippable on its own."}</div>
          <div className="fde-decomp">
            {(payload.decomposition ?? []).map((d, i) => (
              <div
                key={d.id}
                className="fde-decomp-row"
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                <div className="fde-decomp-id">{d.id}</div>
                <div>
                  <div className="fde-decomp-title">{d.title}</div>
                  <div className="fde-decomp-why">{d.why}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'arch':
      return (
        <div>
          <h2 className="fde-phase-title">
            How the <span className="fde-em">system</span> wants to be drawn.
          </h2>
          <div className="fde-phase-sub">{"// services · data flows · failure boundaries · where humans are in the loop."}</div>
          <FdeArchDiagram architecture={payload.architecture} />
        </div>
      );

    case 'plan':
      return (
        <div>
          <h2 className="fde-phase-title">
            <span className="fde-em">Fourteen days</span> to something working.
          </h2>
          <div className="fde-phase-sub">{"// real deliverables. each row is something a human can observe was done."}</div>
          <div className="fde-sprint-grid">
            {(payload.sprint ?? []).map((s, i) => (
              <div
                key={i}
                className="fde-sprint-row"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="fde-sprint-day">{s.day}</div>
                <div>
                  <div className="fde-sprint-title">{s.title}</div>
                  <div className="fde-sprint-deliv">{s.deliv}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'risks':
      return (
        <div>
          <h2 className="fde-phase-title">
            What I&apos;m <span className="fde-em">honest about</span>, on day one.
          </h2>
          <div className="fde-phase-sub">{"// the failure modes I would name in the SOW. specific to your problem."}</div>
          <div className="fde-risk-grid">
            {(payload.risks ?? []).map((r, i) => (
              <div
                key={i}
                className="fde-risk-row"
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                <div className="fde-risk-col">
                  <h5>Risk</h5>
                  <p>{r.risk}</p>
                </div>
                <div className="fde-risk-col fde-risk-mit">
                  <h5>Mitigation</h5>
                  <p>{r.mitigation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'receipts':
      return (
        <div>
          <h2 className="fde-phase-title">
            And every phase above: <span className="fde-em">I&apos;ve done that work</span>.
          </h2>
          <div className="fde-phase-sub">{"// brief -> receipts. each phase mapped to evidence in production code, shipped systems, or current work."}</div>
          <div className="fde-receipts">
            {RECEIPTS.map((r, i) => (
              <div
                key={i}
                className="fde-receipt"
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                <div className="fde-receipt-phase">{r.phase}</div>
                <div className="fde-receipt-project">{r.project}</div>
                <h3 className="fde-receipt-title">{r.title}</h3>
                <p className="fde-receipt-desc">{r.desc}</p>
                {r.note && (
                  <div className="fde-receipt-note">
                    <span className="fde-receipt-note-label">note / </span>
                    {r.note}
                  </div>
                )}
                {r.link && (
                  <a
                    className="fde-receipt-link"
                    href={r.link.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    ↗ {r.link.label}
                  </a>
                )}
              </div>
            ))}
          </div>

          <div className="fde-receipts-cta">
            You just experienced what a 30-minute scoping call with me feels like, on your real problem.
            <br />
            <span className="fde-receipts-cta-accent">If that landed → </span>
            <a
              href="mailto:jayhemnani992000@gmail.com"
              className="fde-receipts-cta-link"
            >
              jayhemnani992000@gmail.com
            </a>
          </div>
        </div>
      );

    default:
      return null;
  }
}
