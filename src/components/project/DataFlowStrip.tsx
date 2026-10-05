"use client";

import { useId, useState } from "react";
import { H2, LABEL, MONO, SHELL, WRAP, pad } from "./styles";

// The strip's column counts (grid-cols-2 sm:grid-cols-3 lg:grid-cols-6), each
// with its col-span classes written out in full so Tailwind finds them.
const COLUMNS = [
  { cols: 2, span: ["", "col-span-1", "col-span-2"] },
  { cols: 3, span: ["", "sm:col-span-1", "sm:col-span-2", "sm:col-span-3"] },
  { cols: 6, span: ["", "lg:col-span-1", "lg:col-span-2", "lg:col-span-3", "lg:col-span-4", "lg:col-span-5", "lg:col-span-6"] },
];

// The grid lines are gap-px over a hairline background, so a short last row
// shows that background as empty cells. Spanning the last stage over the rest
// of its row fills them. A breakpoint only gets a class when its span differs
// from the one it inherits from the breakpoint below.
function lastStageSpan(stages: number) {
  let inherited = 1;
  return COLUMNS.flatMap(({ cols, span }) => {
    const rest = stages % cols;
    const s = rest === 0 ? 1 : cols - rest + 1;
    if (s === inherited) return [];
    inherited = s;
    return [span[s]];
  }).join(" ");
}

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
  const lastSpan = lastStageSpan(flow.length);

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
            return (
              <li key={i} className={i === flow.length - 1 ? lastSpan : ""}>
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
