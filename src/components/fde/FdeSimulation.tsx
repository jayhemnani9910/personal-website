"use client";

/* FDE Simulation workspace: phase tabs, narration side panel, 6 phase content
   renderers. Ported from sim.jsx and reskinned to the Desk design. */

import { useState, useEffect, useRef } from "react";
import type { KeyboardEvent } from "react";
import type { Preset } from "./fdeData";
import { PHASES, NARRATION, RECEIPTS } from "./fdeData";
import { FdeArchDiagram } from "./FdeArchDiagram";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { SITE_CONFIG } from "@/../content/site";
import { SECTION_ORDER } from "@/lib/fde-payload";
import { BTN, BTN_PRIMARY, HIGHLIGHT, PILL } from "@/components/desk";

interface Props {
  /** Partial while a live run streams. Presets and cache hits arrive complete. */
  payload: Partial<Preset>;
  brief: string;
  source: 'preset' | 'live';
  onExit: () => void;
  /** True while sections are still arriving. Presets and cache hits are never streaming. */
  streaming?: boolean;
}

const LABEL_INK = "mb-3.5 font-mono text-[11px] uppercase tracking-[.08em] text-tr-accent-ink";
const NAV_BTN = "cursor-pointer font-mono text-[13px] disabled:cursor-not-allowed disabled:opacity-40";

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

  // A nav button that disables itself at the first or last phase would drop
  // keyboard focus to <body>, so arriving there hands focus to that tab.
  const goTo = (target: number) => {
    setPhase(target);
    if (target === 0 || target === PHASES.length - 1) requestAnimationFrame(() => tabRefs.current[target]?.focus());
  };
  const next = () => goTo(Math.min(phase + 1, PHASES.length - 1));
  // The tab for an unfinished section is disabled, so the nav button that walks
  // onto it has to be too. Without this the two controls disagree and one of
  // them lands the reader on a spinner.
  const nextReady = phase < PHASES.length - 1 && sectionReady(payload, PHASES[phase + 1].key);
  const prev = () => goTo(Math.max(phase - 1, 0));

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
    <div className="overflow-hidden rounded-[var(--tr-r-2xl)] border-[1.5px] border-tr-hairline bg-tr-surface-1 shadow-[var(--tr-shadow-card)]">
      {/* Head */}
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-2 border-b-[1.5px] border-tr-hairline bg-tr-surface-2 px-5 py-3.5 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
        <button
          className={`${PILL} cursor-pointer whitespace-nowrap hover:bg-tr-butter`}
          onClick={onExit}
          type="button"
        >
          × EXIT SIM
        </button>
        <div className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[18px] font-bold tracking-[-0.01em]" title={brief}>
          &ldquo;{brief}&rdquo;
        </div>
        {/* On a phone the status drops to its own row rather than squeezing the brief to nothing. */}
        <div className="col-span-2 font-mono text-[12px] text-tr-text-mute sm:col-span-1 sm:whitespace-nowrap">
          {source === 'live' ? '* LIVE · ' : '◆ DEMO · '}
          PHASE {PHASES[phase].num} · {PHASES[phase].status.toUpperCase()}
        </div>
      </div>

      {/* Phase tabs */}
      <div className="grid grid-cols-2 gap-2 border-b-[1.5px] border-tr-hairline px-5 py-4 min-[420px]:grid-cols-3 sm:grid-cols-6" role="tablist" aria-label="Simulation phases" onKeyDown={onTabKey}>
        {PHASES.map((p, i) => {
          const ready = sectionReady(payload, p.key);
          const state = i === phase ? 'active' : (i < phase ? 'done' : 'pending');
          return (
            <button
              key={p.key}
              ref={(el) => { tabRefs.current[i] = el; }}
              className={`cursor-pointer rounded-[var(--tr-r-md)] border-[1.5px] border-tr-hairline px-3 py-2 text-left font-mono text-[11px] text-tr-text-mute disabled:cursor-not-allowed disabled:opacity-50 ${
                state === 'active'
                  ? 'bg-tr-butter shadow-[2px_2px_0_var(--tr-text)]'
                  : 'bg-tr-surface-1 hover:enabled:bg-tr-surface-2'
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
              <span className="mt-0.5 block font-sans text-[14px] font-bold text-tr-text">{p.title}</span>
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

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3.5 border-t-[1.5px] border-dashed border-tr-rule-soft pt-5">
            <button
              className={`${BTN} ${NAV_BTN}`}
              onClick={prev}
              disabled={phase === 0}
              type="button"
            >
              &larr; previous
            </button>
            <span className="font-mono text-[12px] text-tr-text-faint">
              {phase + 1} / {PHASES.length}
            </span>
            <button
              className={`${BTN_PRIMARY} ${NAV_BTN}`}
              onClick={next}
              disabled={phase === PHASES.length - 1 || !nextReady}
              type="button"
            >
              {phase === PHASES.length - 2 ? 'see the receipts →' : 'continue →'}
            </button>
          </div>
        </div>

        <aside
          className="border-t-[1.5px] border-tr-hairline bg-tr-surface-2 px-5 py-6 font-mono text-[12px] leading-[var(--tr-lh-body)] text-tr-text lg:border-l-[1.5px] lg:border-t-0 lg:px-6 lg:py-7"
        >
          <h3 className={LABEL_INK}>{"// Jay, narrating"}</h3>
          {narration.slice(0, narrationVisible).map((n, i) => (
            <div key={`${phase}-${i}`} className={`mb-2.5 ${n.who === 'sys' ? 'text-tr-text-mute' : ''}`}>
              <span className={`mr-1.5 ${n.who === 'sys' ? 'text-tr-text-faint' : 'text-tr-accent-ink'}`}>{n.who === 'jay' ? '$ jay' : '~ sys'}</span>
              <span>{n.text}</span>
            </div>
          ))}

          <hr className="my-6 border-0 border-t-[1.5px] border-dashed border-tr-rule-soft" />

          <h3 className={LABEL_INK}>{"// Brief"}</h3>
          <div className="text-tr-text-mute">&quot;{brief}&quot;</div>

          <hr className="my-6 border-0 border-t-[1.5px] border-dashed border-tr-rule-soft" />

          <h3 className={LABEL_INK}>{"// Stack"}</h3>
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

const PHASE_TITLE = "mb-2 max-w-[22ch] text-[length:clamp(24px,2.6vw,32px)] leading-[var(--tr-lh-h2)] tracking-[-0.03em]";
const PHASE_SUB = "mb-7 font-mono text-[12px] text-tr-text-mute";
/** A row inside the panel: a small paper card. */
const ROW = "rounded-[var(--tr-r-lg)] border-[1.5px] border-tr-hairline bg-tr-surface-1";
const ROW_LABEL = "pt-0.5 font-mono text-[12px] text-tr-accent-ink";

/** Shown in the panel for a section that has not arrived yet. */
function AwaitingSection({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2.5 py-6 font-mono text-[13px] text-tr-text-mute" aria-hidden="true">
      <span className="size-4 shrink-0 animate-spin rounded-full border-2 border-tr-surface-2 border-t-tr-accent" aria-hidden="true" />
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
            First: <span className={HIGHLIGHT}>three questions</span> I need answered.
          </h2>
          <div className={PHASE_SUB}>{"// scoping. before any building, before any architecture, before anything."}</div>
          {(payload.scope ?? []).map((s, i) => (
            <div key={i} className="grid grid-cols-[2.75rem_1fr] gap-4 border-t-[1.5px] border-tr-hairline py-[18px] last:border-b-[1.5px]">
              <div className="text-[26px] font-extrabold leading-none tracking-[-0.03em] text-tr-accent-ink">Q{i + 1}</div>
              <div>
                <div className="max-w-[50ch] text-[19px] font-semibold leading-[var(--tr-lh-h2)]">{s.q}</div>
                <div className="mt-1.5 flex gap-1 font-mono text-[12px] text-tr-text-mute">
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
            The <span className={HIGHLIGHT}>subproblems</span>.
          </h2>
          <div className={PHASE_SUB}>{"// each one has a clean boundary. each one is shippable on its own."}</div>
          <div className="grid gap-2.5">
            {(payload.decomposition ?? []).map((d) => (
              <div
                key={d.id}
                className={`${ROW} grid grid-cols-[3.75rem_1fr] items-start gap-[18px] px-4 py-3.5`}
              >
                <div className={ROW_LABEL}>{d.id}</div>
                <div>
                  <div className="mb-1 font-bold">{d.title}</div>
                  <div className="font-mono text-[12px] leading-[var(--tr-lh-body)] text-tr-text-mute">{d.why}</div>
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
            How the <span className={HIGHLIGHT}>system</span> wants to be drawn.
          </h2>
          <div className={PHASE_SUB}>{"// services · data flows · failure boundaries · where humans are in the loop."}</div>
          <FdeArchDiagram architecture={payload.architecture} />
        </div>
      );

    case 'plan':
      return (
        <div>
          <h2 className={PHASE_TITLE}>
            <span className={HIGHLIGHT}>Fourteen days</span> to something working.
          </h2>
          <div className={PHASE_SUB}>{"// real deliverables. each row is something a human can observe was done."}</div>
          <div className="grid gap-3">
            {(payload.sprint ?? []).map((s, i) => (
              <div
                key={i}
                className={`${ROW} grid grid-cols-[6.25rem_1fr] items-start gap-[18px] px-[18px] py-4`}
              >
                <div className={ROW_LABEL}>{s.day}</div>
                <div>
                  <div className="mb-1.5 font-bold">{s.title}</div>
                  <div className="font-mono text-[12px] leading-[var(--tr-lh-body)] text-tr-text-mute">
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
            What I&apos;m <span className={HIGHLIGHT}>honest about</span>, on day one.
          </h2>
          <div className={PHASE_SUB}>{"// the failure modes I would name in the SOW. specific to your problem."}</div>
          <div className="grid gap-3">
            {(payload.risks ?? []).map((r, i) => (
              <div
                key={i}
                className={`${ROW} grid grid-cols-1 gap-[22px] px-[18px] py-4 sm:grid-cols-2`}
              >
                <div>
                  <h3 className="mb-2 font-mono text-[11px] font-normal uppercase tracking-[.08em] text-tr-accent-ink">Risk</h3>
                  <p className="text-[15px] leading-normal">{r.risk}</p>
                </div>
                <div>
                  <h3 className="mb-2 font-mono text-[11px] font-normal uppercase tracking-[.08em] text-tr-ok">Mitigation</h3>
                  <p className="text-[15px] leading-normal">{r.mitigation}</p>
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
            And every phase above: <span className={HIGHLIGHT}>I&apos;ve done that work</span>.
          </h2>
          <div className={PHASE_SUB}>{"// brief -> receipts. each phase mapped to evidence in production code, shipped systems, or current work."}</div>
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            {RECEIPTS.map((r, i) => (
              <div key={i} className={`${ROW} px-5 py-[18px]`}>
                <div className="mb-1 font-mono text-[11px] uppercase tracking-[.08em] text-tr-text-faint">{r.phase}</div>
                <div className="mb-2 font-mono text-[12px] text-tr-accent-ink">{r.project}</div>
                <h3 className="mb-2 text-[20px] leading-[var(--tr-lh-h3)]">{r.title}</h3>
                <p className="mb-3 text-[15px] leading-[var(--tr-lh-body)] text-tr-text-mute">{r.desc}</p>
                {r.note && (
                  <div className="mb-3 border-l-[3px] border-tr-accent pl-2.5 font-mono text-[12px] text-tr-text-faint">
                    <span className="text-tr-accent-ink">note / </span>
                    {r.note}
                  </div>
                )}
                {r.links && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                    {r.links.map((l) => (
                      <a
                        key={l.href}
                        className="font-mono text-[12px] text-tr-text underline"
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

          <div className="mt-9 rounded-[var(--tr-r-xl)] border-[1.5px] border-tr-hairline bg-tr-butter px-7 py-6 text-[20px] font-semibold leading-[var(--tr-lh-h2)]">
            {source === 'live'
              ? 'You just experienced what a 30-minute scoping call with me feels like, on your real problem.'
              : 'That was a prepared example of a 30-minute scoping call with me. Bring your real problem and it gets the same treatment.'}
            <br />
            <span className="font-mono text-[14px] font-normal text-tr-text-mute">If that landed → </span>
            <a href={`mailto:${SITE_CONFIG.social.email}`} className="font-mono text-[14px] text-tr-text underline">
              {SITE_CONFIG.social.email}
            </a>
          </div>
        </div>
      );

    default:
      return null;
  }
}
