"use client";

/* FDE Simulation workspace: phase tabs, narration side panel, 6 phase content
   renderers. Ported from sim.jsx and reskinned to editorial theme. */

import { useState, useEffect, useRef } from "react";
import type { KeyboardEvent } from "react";
import type { Preset } from "./fdeData";
import { PHASES, NARRATION, RECEIPTS } from "./fdeData";
import { FdeArchDiagram } from "./FdeArchDiagram";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { SITE_CONFIG } from "@/../content/site";
import { SECTION_ORDER } from "@/lib/fde-payload";

interface Props {
  /** Partial while a live run streams. Presets and cache hits arrive complete. */
  payload: Partial<Preset>;
  brief: string;
  source: 'preset' | 'live';
  onExit: () => void;
  /** True while sections are still arriving. Presets and cache hits are never streaming. */
  streaming?: boolean;
}

const MONO = "font-[family-name:var(--ff-mono)]";

// The server's list, so a renamed or added section cannot drift out of step here.
const SECTION_KEYS: readonly (keyof Preset)[] = SECTION_ORDER;

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

  // Tabs pattern: one tab stop, arrows/Home/End move between the tabs that
  // have something behind them. The current phase is always one of those.
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const onTabKey = (e: KeyboardEvent) => {
    const ready = PHASES.flatMap((p, i) => (sectionReady(payload, p.key) ? [i] : []));
    const at = ready.indexOf(phase);
    let target: number;
    switch (e.key) {
      case 'ArrowRight': target = ready[(at + 1) % ready.length]; break;
      case 'ArrowLeft': target = ready[(at - 1 + ready.length) % ready.length]; break;
      case 'Home': target = ready[0]; break;
      case 'End': target = ready[ready.length - 1]; break;
      default: return;
    }
    e.preventDefault();
    setPhase(target);
    tabRefs.current[target]?.focus();
  };

  // Always mounted, so screen readers hear when a tab is waiting on its section.
  const awaiting = streaming && !sectionReady(payload, currentKey)
    ? `generating ${PHASES[phase].title.toLowerCase()}`
    : '';

  return (
    <div className="overflow-hidden rounded-[var(--tr-r-md)] border border-tr-hairline bg-tr-surface-1">
      {/* Head */}
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-2 sm:grid-cols-[auto_minmax(0,1fr)_auto] border-b border-tr-hairline bg-tr-surface-2 px-5 py-3.5">
        <button
          className={`whitespace-nowrap rounded-[var(--tr-r-sm)] border border-tr-hairline px-2.5 py-1.5 ${MONO} text-[length:var(--tr-t-mono-sm)] tracking-[.06em] text-tr-text transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] hover:border-tr-accent hover:text-tr-accent-ink`}
          onClick={onExit}
          type="button"
        >
          × EXIT SIM
        </button>
        <div className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[length:var(--tr-t-h3)] italic text-tr-text" title={brief}>
          &ldquo;{brief}&rdquo;
        </div>
        {/* On a phone the status drops to its own row rather than squeezing the brief to nothing. */}
        <div className={`col-span-2 sm:col-span-1 sm:whitespace-nowrap ${MONO} text-[length:var(--tr-t-mono-sm)] tracking-[.1em] text-tr-text-mute`}>
          {source === 'live' ? '* LIVE · ' : '◆ DEMO · '}
          PHASE {PHASES[phase].num} · {PHASES[phase].status.toUpperCase()}
        </div>
      </div>

      {/* Phase tabs */}
      <div className="grid grid-cols-3 border-b border-tr-hairline bg-tr-surface-1 sm:grid-cols-6" role="tablist" aria-label="Simulation phases" onKeyDown={onTabKey}>
        {PHASES.map((p, i) => {
          const ready = sectionReady(payload, p.key);
          const state = i === phase ? 'active' : (i < phase ? 'done' : 'pending');
          return (
            <button
              key={p.key}
              ref={(el) => { tabRefs.current[i] = el; }}
              className={`border-b-2 border-r border-r-tr-hairline px-3.5 py-3.5 text-left ${MONO} text-[length:var(--tr-t-mono-sm)] tracking-[.06em] transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] last:border-r-0 disabled:cursor-not-allowed ${
                state === 'active'
                  ? 'border-b-tr-accent bg-tr-surface-2 text-tr-accent-ink'
                  : state === 'done'
                    ? 'border-b-transparent text-tr-text hover:bg-tr-surface-2'
                    : 'border-b-transparent text-tr-text-faint hover:enabled:bg-tr-surface-2 hover:enabled:text-tr-text'
              }`}
              data-state={state}
              role="tab"
              aria-selected={i === phase}
              aria-controls="fde-panel"
              tabIndex={i === phase ? 0 : -1}
              onClick={() => setPhase(i)}
              type="button"
              // Opening a tab whose section has not arrived would show an empty
              // panel, so it stays shut until there is something behind it.
              disabled={!ready}
              aria-disabled={!ready}
              title={ready ? undefined : streaming ? 'still generating' : 'not generated'}
            >
              <span>{state === 'done' && ready ? '✓ ' : ''}{p.num}</span>
              <span className="mt-0.5 block text-[length:var(--tr-t-small)] font-medium text-tr-text">{p.title}</span>
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div className="grid min-h-[520px] grid-cols-1 lg:grid-cols-[1fr_320px]">
        <div
          className="min-w-0 overflow-x-hidden px-5 py-6 sm:px-9 sm:py-8"
          id="fde-panel"
          role="tabpanel"
          aria-label={`Phase ${PHASES[phase].title}`}
        >
          <p className="sr-only" aria-live="polite">{awaiting}</p>
          <PhaseContent phase={currentKey} payload={payload} streaming={streaming} source={source} />

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3.5 border-t border-tr-hairline pt-5">
            <button
              className={`rounded-[var(--tr-r-sm)] border border-tr-hairline bg-tr-surface-2 px-4 py-2 ${MONO} text-[length:var(--tr-t-mono-sm)] tracking-[.04em] text-tr-text transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] hover:enabled:border-tr-accent disabled:cursor-not-allowed disabled:opacity-40`}
              onClick={prev}
              disabled={phase === 0}
              type="button"
            >
              &larr; previous
            </button>
            <span className={`${MONO} text-[length:var(--tr-t-mono-sm)] tracking-[.08em] text-tr-text-faint`}>
              {phase + 1} / {PHASES.length}
            </span>
            <button
              className={`rounded-[var(--tr-r-sm)] bg-tr-accent px-4 py-2 ${MONO} text-[length:var(--tr-t-mono-sm)] font-semibold tracking-[.04em] text-tr-on-accent transition-opacity duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] disabled:cursor-not-allowed disabled:opacity-40`}
              onClick={next}
              disabled={phase === PHASES.length - 1 || !nextReady}
              type="button"
            >
              {phase === PHASES.length - 2 ? 'see the receipts →' : 'continue →'}
            </button>
          </div>
        </div>

        <aside
          className={`border-t border-tr-hairline bg-tr-surface-2 px-5 py-6 ${MONO} text-[length:var(--tr-t-mono-sm)] leading-[var(--tr-lh-body)] text-tr-text lg:border-l lg:border-t-0 lg:px-6 lg:py-7`}
        >
          <h3 className="mb-3.5 text-[length:var(--tr-t-mono-sm)] uppercase tracking-[.18em] text-tr-accent-ink">{"// Jay, narrating"}</h3>
          {narration.slice(0, narrationVisible).map((n, i) => (
            <div key={`${phase}-${i}`} className={`mb-2.5 ${n.who === 'sys' ? 'text-tr-text-mute' : ''}`}>
              <span className={`mr-1.5 ${n.who === 'sys' ? 'text-tr-text-faint' : 'text-tr-accent-ink'}`}>{n.who === 'jay' ? '$ jay' : '~ sys'}</span>
              <span>{n.text}</span>
            </div>
          ))}

          <hr className="my-6 border-0 border-t border-tr-hairline" />

          <h3 className="mb-3.5 text-[length:var(--tr-t-mono-sm)] uppercase tracking-[.18em] text-tr-accent-ink">{"// Brief"}</h3>
          <div className="italic text-tr-text-mute">&quot;{brief}&quot;</div>

          <hr className="my-6 border-0 border-t border-tr-hairline" />

          <h3 className="mb-3.5 text-[length:var(--tr-t-mono-sm)] uppercase tracking-[.18em] text-tr-accent-ink">{"// Stack"}</h3>
          <div className="text-tr-text-mute">
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

const PHASE_TITLE = `mb-2 max-w-[22ch] text-[length:var(--tr-t-h2)] leading-[var(--tr-lh-h2)] tracking-[-.01em] font-medium text-tr-text`;
const PHASE_SUB = `mb-7 ${MONO} text-[length:var(--tr-t-mono-sm)] tracking-[.04em] text-tr-text-mute`;
const EM = "italic text-tr-accent-ink";

/** Shown in the panel for a section that has not arrived yet. */
function AwaitingSection({ title }: { title: string }) {
  return (
    <div className={`flex items-center gap-2.5 py-6 ${MONO} text-[length:var(--tr-t-mono)] text-tr-text-mute`} aria-hidden="true">
      <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-tr-hairline border-t-tr-accent" aria-hidden="true" />
      <span>
        generating {title.toLowerCase()}
        <span className="animate-pulse" aria-hidden="true">...</span>
      </span>
    </div>
  );
}

function PhaseContent({
  phase,
  payload,
  streaming,
  source,
}: { phase: string; payload: Partial<Preset>; streaming: boolean; source: 'preset' | 'live' }) {
  // Every branch below indexes into a section. While streaming, one may not be
  // there yet, and an unguarded .map on undefined takes the whole page down.
  if (!sectionReady(payload, phase)) {
    const title = PHASES.find((p) => p.key === phase)?.title ?? 'this section';
    return streaming ? <AwaitingSection title={title} /> : null;
  }
  switch (phase) {
    case 'scope':
      return (
        <div>
          <h2 className={PHASE_TITLE}>
            First: <span className={EM}>three questions</span> I need answered.
          </h2>
          <div className={PHASE_SUB}>{"// scoping. before any building, before any architecture, before anything."}</div>
          {(payload.scope ?? []).map((s, i) => (
            <div key={i} className="grid grid-cols-[2.5rem_1fr] gap-4 border-t border-tr-hairline py-[18px] last:border-b">
              <div className="pt-1 text-[length:var(--tr-t-stat)] italic leading-[var(--tr-lh-numeral)] text-tr-accent-ink">Q{i + 1}</div>
              <div>
                <div className="max-w-[50ch] text-[length:var(--tr-t-h3)] leading-[var(--tr-lh-h3)] text-tr-text">{s.q}</div>
                <div className={`mt-1.5 flex gap-1 ${MONO} text-[length:var(--tr-t-mono-sm)] tracking-[.04em] text-tr-text-mute`}>
                  <span className="text-tr-accent-ink" aria-hidden="true">{"//"}</span>
                  <span>{s.why}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      );

    case 'decomp':
      return (
        <div>
          <h2 className={PHASE_TITLE}>
            The <span className={EM}>subproblems</span>.
          </h2>
          <div className={PHASE_SUB}>{"// each one has a clean boundary. each one is shippable on its own."}</div>
          <div className="grid gap-2.5">
            {(payload.decomposition ?? []).map((d) => (
              <div
                key={d.id}
                className="grid grid-cols-[3.75rem_1fr] items-start gap-[18px] rounded-[var(--tr-r-sm)] border-l-2 border-tr-accent bg-tr-surface-2 px-4 py-3.5"
              >
                <div className={`pt-0.5 ${MONO} text-[length:var(--tr-t-mono-sm)] tracking-[.08em] text-tr-accent-ink`}>{d.id}</div>
                <div>
                  <div className="mb-1 font-medium text-tr-text">{d.title}</div>
                  <div className={`${MONO} text-[length:var(--tr-t-mono-sm)] leading-[var(--tr-lh-body)] text-tr-text-mute`}>{d.why}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'arch':
      return (
        <div>
          <h2 className={PHASE_TITLE}>
            How the <span className={EM}>system</span> wants to be drawn.
          </h2>
          <div className={PHASE_SUB}>{"// services · data flows · failure boundaries · where humans are in the loop."}</div>
          <FdeArchDiagram architecture={payload.architecture} />
        </div>
      );

    case 'plan':
      return (
        <div>
          <h2 className={PHASE_TITLE}>
            <span className={EM}>Fourteen days</span> to something working.
          </h2>
          <div className={PHASE_SUB}>{"// real deliverables. each row is something a human can observe was done."}</div>
          <div className="grid gap-3">
            {(payload.sprint ?? []).map((s, i) => (
              <div
                key={i}
                className="grid grid-cols-[6.25rem_1fr] items-start gap-[18px] rounded-[var(--tr-r-sm)] border border-tr-hairline bg-tr-surface-2 px-[18px] py-4"
              >
                <div className={`pt-0.5 ${MONO} text-[length:var(--tr-t-mono-sm)] tracking-[.08em] text-tr-accent-ink`}>{s.day}</div>
                <div>
                  <div className="mb-1.5 font-medium text-tr-text">{s.title}</div>
                  <div className={`${MONO} text-[length:var(--tr-t-mono-sm)] leading-[var(--tr-lh-body)] text-tr-text-mute`}>
                    <span className="text-tr-accent-ink">deliverable: </span>
                    {s.deliv}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'risks':
      return (
        <div>
          <h2 className={PHASE_TITLE}>
            What I&apos;m <span className={EM}>honest about</span>, on day one.
          </h2>
          <div className={PHASE_SUB}>{"// the failure modes I would name in the SOW. specific to your problem."}</div>
          <div className="grid gap-3">
            {(payload.risks ?? []).map((r, i) => (
              <div
                key={i}
                className="grid grid-cols-1 gap-[22px] rounded-[var(--tr-r-sm)] border border-tr-hairline border-l-2 border-l-tr-accent bg-tr-surface-2 px-[18px] py-4 sm:grid-cols-2"
              >
                <div>
                  <h3 className={`mb-2 ${MONO} text-[length:var(--tr-t-mono-sm)] uppercase tracking-[.16em] text-tr-accent-ink`}>Risk</h3>
                  <p className="text-tr-text">{r.risk}</p>
                </div>
                <div>
                  <h3 className={`mb-2 ${MONO} text-[length:var(--tr-t-mono-sm)] uppercase tracking-[.16em] text-tr-accent-ink`}>Mitigation</h3>
                  <p className="text-tr-text">{r.mitigation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'receipts':
      return (
        <div>
          <h2 className={PHASE_TITLE}>
            And every phase above: <span className={EM}>I&apos;ve done that work</span>.
          </h2>
          <div className={PHASE_SUB}>{"// brief -> receipts. each phase mapped to evidence in production code, shipped systems, or current work."}</div>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {RECEIPTS.map((r, i) => (
              <div key={i} className="rounded-[var(--tr-r-sm)] border border-tr-hairline bg-tr-surface-2 px-5 py-[18px]">
                <div className={`mb-2.5 ${MONO} text-[length:var(--tr-t-mono-sm)] tracking-[.14em] text-tr-accent-ink`}>{r.phase}</div>
                <div className={`mb-2 ${MONO} text-[length:var(--tr-t-mono-sm)] tracking-[.06em] text-tr-accent-ink`}>{r.project}</div>
                <h3 className="mb-2 text-[length:var(--tr-t-h3)] leading-[var(--tr-lh-h3)] font-medium text-tr-text">{r.title}</h3>
                <p className="mb-3 leading-[var(--tr-lh-prose)] text-tr-text">{r.desc}</p>
                {r.note && (
                  <div className={`mb-3 border-l-2 border-tr-accent pl-2.5 ${MONO} text-[length:var(--tr-t-mono-sm)] text-tr-text-faint`}>
                    <span className="tracking-[.1em] text-tr-accent-ink">note / </span>
                    {r.note}
                  </div>
                )}
                {r.links && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                    {r.links.map((l) => (
                      <a
                        key={l.href}
                        className={`${MONO} border-b border-dashed border-tr-hairline pb-px text-[length:var(--tr-t-mono-sm)] text-tr-text no-underline transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] hover:border-tr-accent hover:text-tr-accent-ink`}
                        href={l.href}
                        {...(l.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                      >
                        ↗ {l.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-9 rounded-[var(--tr-r-md)] border border-dashed border-tr-accent bg-tr-surface-2 px-7 py-6 text-[length:var(--tr-t-h3)] leading-[var(--tr-lh-h3)] italic text-tr-text">
            {source === 'live'
              ? 'You just experienced what a 30-minute scoping call with me feels like, on your real problem.'
              : 'That was a prepared example of a 30-minute scoping call with me. Bring your real problem and it gets the same treatment.'}
            <br />
            <span className="text-tr-accent-ink">If that landed → </span>
            <a
              href={`mailto:${SITE_CONFIG.social.email}`}
              className="not-italic text-tr-accent-ink underline decoration-current underline-offset-2"
            >
              {SITE_CONFIG.social.email}
            </a>
          </div>
        </div>
      );

    default:
      return null;
  }
}
