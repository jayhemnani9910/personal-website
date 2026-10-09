"use client";

import { useId, useState } from "react";
import { CARD, H2, LABEL, MONO, SHELL, WRAP, pad } from "../desk";

export type DataFlowStep = { step: string; detail?: string; component?: string };
export type ComponentObj = { name: string; purpose?: string; details?: string };

// The one interactive part of a project page: pick a stage, read its detail.
// Everything else on the page renders on the server.
//
// A stage shows the component its `component` field names, by exact name. The
// two lists are authored separately and do not line up by index, and guessing
// a pairing from shared words used to show the wrong file for a stage.
export function DataFlowStrip({ flow, components }: { flow: DataFlowStep[]; components: ComponentObj[] }) {
  const [activeStage, setActiveStage] = useState(0);
  const panelId = useId();
  const selectedFlow = flow[activeStage];
  if (!selectedFlow) return null;
  const mapsComponents = flow.some((f) => f.component);
  const component = components.find((c) => c.name === selectedFlow.component);

  return (
    <section className={`${WRAP} ${SHELL}`}>
      <div className="border-t-[1.5px] border-tr-hairline py-[clamp(40px,5vw,60px)]">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className={H2}>Data flow</h2>
          <p className={LABEL}>click a stage</p>
        </div>

        {/* Stage cards joined by ink arrows. Each card and its arrow wrap
            together, so a row never starts on an arrow. */}
        <ol className="mt-6 flex list-none flex-wrap gap-x-2 gap-y-3">
          {flow.map((f, i) => {
            const selected = i === activeStage;
            return (
              <li key={i} className="flex min-w-[140px] flex-1 items-center gap-2">
                <button
                  type="button"
                  aria-pressed={selected}
                  aria-controls={panelId}
                  onClick={() => setActiveStage(i)}
                  className={`desk-press flex h-full min-h-24 w-full cursor-pointer flex-col gap-2 rounded-[var(--tr-r-lg)] border-[1.5px] border-tr-hairline p-3.5 text-left transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] ${
                    selected ? "bg-tr-butter shadow-[var(--tr-shadow-btn)]" : "bg-tr-surface-1 hover:bg-tr-surface-2"
                  }`}
                >
                  <span className={`${MONO} text-[11px] ${selected ? "text-tr-text-mute" : "text-tr-text-faint"}`}>{pad(i + 1)}</span>
                  <span className="text-[14px] font-semibold leading-[var(--tr-lh-tight)] text-tr-text">{f.step}</span>
                </button>
                {i < flow.length - 1 && (
                  <span aria-hidden="true" className="shrink-0 text-[18px] font-bold text-tr-text">
                    →
                  </span>
                )}
              </li>
            );
          })}
        </ol>

        {/* Polite live region: choosing a stage swaps this text, and a
            screen reader otherwise hears only "pressed". */}
        <div id={panelId} aria-live="polite" className={`mt-5 grid gap-8 p-6 ${CARD} ${mapsComponents ? "lg:grid-cols-2" : ""}`}>
          <div>
            {selectedFlow.detail ? (
              <p className="text-[16px] leading-[var(--tr-lh-body)] text-tr-text">{selectedFlow.detail}</p>
            ) : (
              <p className={`${MONO} text-[13px] text-tr-text-faint`}>No further detail recorded for this stage.</p>
            )}
          </div>

          {mapsComponents && (
            <div>
              <p className={LABEL}>COMPONENT</p>
              {component ? (
                <div className="mt-2">
                  <code className={`${MONO} text-[13px] font-semibold text-tr-text`}>{component.name}</code>
                  {component.purpose && (
                    <p className="mt-1.5 text-[14px] leading-normal text-tr-text-mute">{component.purpose}</p>
                  )}
                </div>
              ) : (
                <p className="mt-2 text-[14px] text-tr-text-faint">No component mapped to this stage.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
