"use client";

import { useId, useState } from "react";

const MONO = "font-[family-name:var(--ff-mono)]";
const SHELL = "px-[clamp(1rem,4vw,2rem)]";
const WRAP = "mx-auto max-w-[1280px]";
const H2 = "text-[length:var(--tr-t-h2)] leading-[var(--tr-lh-h2)] tracking-[-.025em] font-medium text-tr-text";
const LABEL = `${MONO} text-[length:var(--tr-t-mono-sm)] tracking-[.1em] text-tr-text-faint`;

const pad = (n: number) => String(n).padStart(2, "0");

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
    <section className="border-t border-tr-hairline bg-tr-surface-1 py-[clamp(2rem,5vw,4rem)]">
      <div className={`${SHELL} ${WRAP}`}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className={H2}>Data flow</h2>
          <p className={LABEL}>click a stage</p>
        </div>

        <ol className="mt-6 grid list-none grid-cols-2 gap-px overflow-hidden rounded-[var(--tr-r-lg)] border border-tr-hairline bg-tr-hairline sm:grid-cols-3 lg:grid-cols-6">
          {flow.map((f, i) => {
            const selected = i === activeStage;
            // The grid lines are gap-px over a hairline background, so a
            // short last row shows that background as an empty cell. Five
            // stages (most strips) leave exactly one at 2, 3 and 6 columns;
            // spanning the last stage over two fills it at all three.
            const fill = flow.length === 5 && i === 4 ? "col-span-2" : "";
            return (
              <li key={i} className={fill}>
                <button
                  type="button"
                  aria-pressed={selected}
                  aria-controls={panelId}
                  onClick={() => setActiveStage(i)}
                  className={`flex h-full min-h-24 w-full flex-col gap-2 p-4 text-left focus-visible:-outline-offset-2 transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] ${
                    selected ? "bg-tr-bg" : "bg-tr-surface-1 hover:bg-tr-surface-2"
                  }`}
                >
                  <span className={`${MONO} text-[length:var(--tr-t-mono-sm)] ${selected ? "text-tr-accent-ink" : "text-tr-text-faint"}`}>
                    {pad(i + 1)}
                  </span>
                  <span className="text-[length:var(--tr-t-small)] font-medium text-tr-text">{f.step}</span>
                </button>
              </li>
            );
          })}
        </ol>

        {/* Polite live region: choosing a stage swaps this text, and a
            screen reader otherwise hears only "pressed". */}
        <div
          id={panelId}
          aria-live="polite"
          className={`grid gap-8 rounded-b-[var(--tr-r-lg)] border border-t-0 border-tr-hairline bg-tr-bg p-6 ${
            mapsComponents ? "lg:grid-cols-2" : ""
          }`}
        >
          <div>
            {selectedFlow.detail ? (
              <p className="text-tr-text leading-[var(--tr-lh-body)]">{selectedFlow.detail}</p>
            ) : (
              <p className={`${MONO} text-tr-text-faint`}>No further detail recorded for this stage.</p>
            )}
          </div>

          {mapsComponents && (
            <div>
              <p className={LABEL}>COMPONENT</p>
              {component ? (
                <div className="mt-2">
                  <code className={`${MONO} text-[length:var(--tr-t-mono-sm)] text-tr-accent-ink`}>{component.name}</code>
                  {component.purpose && (
                    <p className="mt-2 text-[length:var(--tr-t-small)] text-tr-text-mute">{component.purpose}</p>
                  )}
                </div>
              ) : (
                <p className="mt-2 text-[length:var(--tr-t-small)] text-tr-text-faint">No component mapped to this stage.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
