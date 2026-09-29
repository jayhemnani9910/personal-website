"use client";

import { useState } from "react";

const MONO = "font-[family-name:var(--ff-mono)]";
const SHELL = "px-[clamp(1rem,4vw,2rem)]";
const WRAP = "mx-auto max-w-[1280px]";
const H2 = "text-[length:var(--tr-t-h2)] leading-[var(--tr-lh-h2)] tracking-[-.025em] font-medium text-tr-text";
const LABEL = `${MONO} text-[length:var(--tr-t-mono-sm)] tracking-[.1em] text-tr-text-faint`;

const pad = (n: number) => String(n).padStart(2, "0");

export type DataFlowStep = { step: string; detail?: string };
export type ComponentObj = { name: string; purpose?: string };

// dataFlow and components are two separately-authored lists; they are not
// guaranteed to line up by index (fifa-soccer-ds's "Ingest" stage has no
// matching component at all). Pairing them by a shared word stem only shows
// a component when the text itself supports the connection, rather than
// asserting a positional match that would misattribute the wrong file to a
// stage.
function matchComponent(step: string, components: ComponentObj[]): ComponentObj | undefined {
  const stems = step
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length >= 4)
    .map((w) => w.slice(0, Math.min(4, w.length)));
  return components.find((c) => {
    const name = c.name.toLowerCase();
    return stems.some((stem) => name.includes(stem));
  });
}

// The one interactive part of a project page: pick a stage, read its detail.
// Everything else on the page renders on the server.
export function DataFlowStrip({ flow, components: structuredComponents }: { flow: DataFlowStep[]; components: ComponentObj[] }) {
  const [activeStage, setActiveStage] = useState(0);
  const selectedFlow = flow[activeStage];
  if (!selectedFlow) return null;
  const matchedComponent = matchComponent(selectedFlow.step, structuredComponents);

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
              <li key={i}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setActiveStage(i)}
                  className={`flex min-h-24 w-full flex-col gap-2 p-4 text-left transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] ${
                    selected ? "bg-tr-bg" : "bg-tr-surface-1 hover:bg-tr-surface-2"
                  }`}
                >
                  <span className={`${MONO} text-[length:var(--tr-t-mono-sm)] ${selected ? "text-tr-accent" : "text-tr-text-faint"}`}>
                    {pad(i + 1)}
                  </span>
                  <span className="text-[length:var(--tr-t-small)] font-medium text-tr-text">{f.step}</span>
                </button>
              </li>
            );
          })}
        </ol>

        <div
          className={`grid gap-8 rounded-b-[var(--tr-r-lg)] border border-t-0 border-tr-hairline bg-tr-bg p-6 ${
            structuredComponents.length > 0 ? "lg:grid-cols-2" : ""
          }`}
        >
          <div>
            {selectedFlow.detail ? (
              <p className="text-tr-text leading-[var(--tr-lh-body)]">{selectedFlow.detail}</p>
            ) : (
              <p className={`${MONO} text-tr-text-faint`}>No further detail recorded for this stage.</p>
            )}
          </div>

          {structuredComponents.length > 0 && (
            <div>
              <p className={LABEL}>COMPONENT</p>
              {matchedComponent ? (
                <div className="mt-2">
                  <code className={`${MONO} text-[length:var(--tr-t-mono-sm)] text-tr-accent`}>{matchedComponent.name}</code>
                  {matchedComponent.purpose && (
                    <p className="mt-2 text-[length:var(--tr-t-small)] text-tr-text-mute">{matchedComponent.purpose}</p>
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
