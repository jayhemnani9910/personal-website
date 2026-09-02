"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import type { Project } from "@/lib/definitions";
import { SHOWCASE_PROJECTS } from "@/lib/showcase";
import { CodeBlock } from "./CodeBlock";
import { ComparisonSlider } from "./project/ComparisonSlider";

const MONO = "font-[family-name:var(--ff-mono)]";
const SHELL = "px-[clamp(1rem,4vw,2rem)]";
const WRAP = "mx-auto max-w-[1280px]";
const H2 = "text-[length:var(--tr-t-h2)] leading-[var(--tr-lh-h2)] tracking-[-.025em] font-medium text-tr-text";
const LABEL = `${MONO} text-[length:var(--tr-t-mono-sm)] tracking-[.1em] text-tr-text-faint`;

const pad = (n: number) => String(n).padStart(2, "0");

type DataFlowStep = { step: string; detail?: string };
type ComponentObj = { name: string; purpose?: string };
type MetricObj = { value: string; label: string; context?: string };
type NeighborProject = { id: string; title: string; index: number };

// The only textual signal the data gives for "this line describes a gap, not
// a result" is the word itself, e.g. fifa-soccer-ds's "trained weights
// pending". Matching on that keeps the check/hollow-circle split honest
// instead of guessing at which impact lines still sound unfinished.
const isPending = (text: string) => /\bpending\b/i.test(text);

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

export function ProjectDetail({
  project,
  overview,
  nextProject,
}: {
  project: Project;
  /** The rendered MDX body, built by the route because MDXRemote is server-only. */
  overview?: ReactNode;
  nextProject: NeighborProject;
}) {
  const [activeStage, setActiveStage] = useState(0);

  const deepDive = project.deepDive;
  const links = project.links ?? {};
  const compareDemo = SHOWCASE_PROJECTS[project.id]?.demo;
  const comparePairs = compareDemo?.kind === "compare" ? compareDemo.pairs : [];

  const flow: DataFlowStep[] =
    Array.isArray(deepDive?.dataFlow) && typeof deepDive.dataFlow[0] === "object"
      ? (deepDive.dataFlow as DataFlowStep[])
      : [];

  const structuredComponents: ComponentObj[] = Array.isArray(deepDive?.components)
    ? deepDive.components.filter((c): c is ComponentObj => typeof c === "object")
    : [];

  const decisions = Array.isArray(deepDive?.keyDecisions) ? deepDive.keyDecisions : [];

  const metrics: MetricObj[] =
    Array.isArray(deepDive?.metrics) && typeof deepDive.metrics[0] === "object"
      ? (deepDive.metrics as MetricObj[])
      : [];
  const snippets = Array.isArray(deepDive?.codeSnippets) ? deepDive.codeSnippets : [];

  const learnings = Array.isArray(deepDive?.learnings) ? deepDive.learnings : [];
  const futureWork = Array.isArray(deepDive?.futureWork) ? deepDive.futureWork : [];

  // Fact-grid cells. ROLE and STATUS always show; the rest only when the
  // project's frontmatter actually carries that field.
  const factCells: { label: string; value: ReactNode }[] = [{ label: "ROLE", value: project.role }];
  if (project.period) factCells.push({ label: "PERIOD", value: project.period });
  if (project.domain) factCells.push({ label: "DOMAIN", value: project.domain });
  factCells.push({
    label: "STATUS",
    value: (
      <span className="inline-flex items-center gap-2">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-tr-ok" />
        Published
      </span>
    ),
  });
  if (project.github) {
    factCells.push({
      label: "CODE",
      value: (
        <a href={project.github} target="_blank" rel="noreferrer" data-cursor="OPEN" className="hover:text-tr-ember">
          GitHub ↗
        </a>
      ),
    });
  }
  if (links.demo) {
    factCells.push({
      label: "DEMO",
      value: (
        <a href={links.demo} target="_blank" rel="noreferrer" data-cursor="OPEN" className="hover:text-tr-ember">
          Live ↗
        </a>
      ),
    });
  }

  const selectedFlow = flow[activeStage];
  const matchedComponent = selectedFlow ? matchComponent(selectedFlow.step, structuredComponents) : undefined;

  return (
    <>
      {/* ── Breadcrumb ── */}
      <nav aria-label="Breadcrumb" className={`${SHELL} pt-[clamp(1.5rem,3vw,2rem)]`}>
        <div className={`${WRAP} ${MONO} text-[length:var(--tr-t-mono)] text-tr-text-faint`}>
          <Link href="/projects" data-cursor="OPEN" className="hover:text-tr-ember">
            /work
          </Link>
          <span> / {project.id}</span>
        </div>
      </nav>

      {/* ── Hero ── */}
      <header className={`${SHELL} pb-[clamp(2rem,5vw,4rem)] pt-4`}>
        <div className={`${WRAP} grid items-end gap-[clamp(2rem,5vw,5rem)] lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]`}>
          <div>
            <h1 className="text-[length:var(--tr-t-display-sm)] leading-[var(--tr-lh-display)] tracking-[-.035em] font-medium">
              {project.title}
            </h1>
            <p className="mt-4 max-w-[52ch] text-[length:var(--tr-t-deck)] leading-[var(--tr-lh-prose)] text-tr-text-mute [text-wrap:pretty]">
              {project.summary}
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[var(--tr-r-md)] border border-tr-hairline bg-tr-hairline">
            {factCells.map((c) => (
              <div key={c.label} className="bg-tr-surface-1 p-[.8rem_1rem]">
                <dt className={LABEL}>{c.label}</dt>
                <dd className="mt-1 text-[length:var(--tr-t-body)] text-tr-text">{c.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      {/* ── Overview (MDX body) ──
          content.ts spent a while throwing this text away entirely (see its
          own comment); it is real, authored prose, so it still gets a home
          here even though the design screen (drawn from a project whose
          summary already carries most of the framing) didn't need to show
          it explicitly. */}
      {overview && (
        <section className={`${SHELL} pb-[clamp(2rem,5vw,4rem)]`}>
          <div className={WRAP}>
            <p className={`${LABEL} mb-3`}>OVERVIEW</p>
            <div className="max-w-[62ch] text-[length:var(--tr-t-body)] leading-[var(--tr-lh-prose)] text-tr-text-mute [&_a]:text-tr-ember [&_a]:underline [&_a]:decoration-tr-hairline [&_a]:underline-offset-4 [&_h2]:mt-8 [&_h2]:text-[length:var(--tr-t-h3)] [&_h2]:leading-[var(--tr-lh-h3)] [&_h2]:font-medium [&_h2]:text-tr-text [&_h3]:mt-6 [&_h3]:font-medium [&_h3]:text-tr-text [&_li]:mt-2 [&_p+p]:mt-4 [&_strong]:font-medium [&_strong]:text-tr-text [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5">
              {overview}
            </div>
          </div>
        </section>
      )}

      {/* ── Comparison slider ── */}
      {comparePairs.length > 0 && (
        <section className={`${SHELL} pb-[clamp(2rem,5vw,4rem)]`}>
          <div className={WRAP}>
            <ComparisonSlider projectTitle={project.title} pairs={comparePairs} />
          </div>
        </section>
      )}

      {/* ── Arrived as / What I built / What changed ── */}
      <section className={`${SHELL} border-t border-tr-hairline py-[clamp(2rem,5vw,4rem)]`}>
        <div className={`${WRAP} grid gap-[clamp(1.5rem,4vw,3rem)] sm:grid-cols-2 lg:grid-cols-3`}>
          <div>
            <h2 className={LABEL}>ARRIVED AS</h2>
            <p className="mt-3 text-tr-text leading-[var(--tr-lh-body)]">{project.challenge}</p>
            {deepDive?.context && (
              <p className="mt-3 text-tr-text-mute leading-[var(--tr-lh-body)]">{deepDive.context}</p>
            )}
          </div>

          <div>
            <h2 className={LABEL}>WHAT I BUILT</h2>
            <ol className="list-none">
              {project.solution.map((item, i) => (
                <li key={i} className="mt-3 flex gap-3">
                  <span className={`${MONO} shrink-0 text-tr-ember`}>{pad(i + 1)}</span>
                  <span className="text-tr-text">{item}</span>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h2 className={LABEL}>WHAT CHANGED</h2>
            <ul className="list-none">
              {project.impact.map((item, i) => {
                const pending = isPending(item);
                return (
                  <li key={i} className="mt-3 flex gap-3">
                    <span aria-hidden="true" className={`shrink-0 ${pending ? "text-tr-warn" : "text-tr-ok"}`}>
                      {pending ? "◔" : "✓"}
                    </span>
                    <span className="text-tr-text">{item}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Data flow ── */}
      {flow.length > 0 && selectedFlow && (
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
                      <span className={`${MONO} text-[length:var(--tr-t-mono-sm)] ${selected ? "text-tr-ember" : "text-tr-text-faint"}`}>
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
                      <code className={`${MONO} text-[length:var(--tr-t-mono-sm)] text-tr-ember`}>{matchedComponent.name}</code>
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
      )}

      {/* ── Decisions ── */}
      {decisions.length > 0 && (
        <section className={`${SHELL} border-t border-tr-hairline py-[clamp(2rem,5vw,4rem)]`}>
          <div className={WRAP}>
            <h2 className={H2}>Decisions, with the cost of each.</h2>
            <p className="mt-3 max-w-[62ch] text-tr-text-mute [text-wrap:pretty]">
              A decision without its trade-off is marketing. Each row says what was chosen, why, and what it gave up.
            </p>

            <div className="mt-8 hidden grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1fr)] gap-6 border-b border-tr-hairline pb-2 lg:grid">
              <span className={LABEL}>DECISION</span>
              <span className={LABEL}>BECAUSE</span>
              <span className={LABEL}>AT THE COST OF</span>
            </div>

            {decisions.map((d, i) => {
              const because = d.reasoning || d.rationale;
              const cost = d.alternatives || d.tradeoff;
              return (
                <div
                  key={i}
                  className="grid gap-2 border-b border-tr-hairline py-[1.1rem] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-6"
                >
                  <p className="font-medium text-tr-text">{d.decision}</p>
                  {because && <p className="text-tr-text-mute">{because}</p>}
                  {cost && <p className="text-tr-warn">{cost}</p>}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── The part that mattered ── */}
      {(metrics.length > 0 || snippets.length > 0) && (
        <section className="border-t border-tr-hairline bg-tr-surface-1 py-[clamp(2rem,5vw,4rem)]">
          <div className={`${SHELL} ${WRAP}`}>
            <div className="grid gap-[clamp(2rem,5vw,4rem)] lg:grid-cols-2">
              <div>
                <h2 className={H2}>The part that mattered.</h2>
                <p className="mt-3 max-w-[48ch] text-tr-text-mute [text-wrap:pretty]">
                  The numbers behind the work, and the code that produced them.
                </p>

                {metrics.length > 0 && (
                  <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-[var(--tr-r-md)] border border-tr-hairline bg-tr-hairline">
                    {metrics.map((m, i) => (
                      <div key={i} className="bg-tr-bg p-4">
                        <dd className="text-[length:var(--tr-t-stat)] font-medium tabular-nums text-tr-text">{m.value}</dd>
                        <dt className={`mt-1 ${MONO} text-[length:var(--tr-t-mono-sm)] uppercase tracking-[.08em] text-tr-text-mute`}>
                          {m.label}
                        </dt>
                        {m.context && (
                          <p className={`mt-1 ${MONO} text-[length:var(--tr-t-mono-sm)] text-tr-text-faint`}>{m.context}</p>
                        )}
                      </div>
                    ))}
                  </dl>
                )}
              </div>

              {snippets.length > 0 && (
                <div className="min-w-0">
                  {snippets.map((s, i) => (
                    <div key={i} className={`min-w-0 ${i > 0 ? "mt-6" : ""}`}>
                      <CodeBlock snippet={s} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Learned / Not done yet ── */}
      {(learnings.length > 0 || futureWork.length > 0) && (
        <section className={`${SHELL} border-t border-tr-hairline py-[clamp(2rem,5vw,4rem)]`}>
          <div className={`${WRAP} grid gap-[clamp(2rem,5vw,4rem)] sm:grid-cols-2`}>
            {learnings.length > 0 && (
              <div>
                <h2 className={`${MONO} text-[length:var(--tr-t-mono-sm)] tracking-[.1em] text-tr-ok`}>✓ LEARNED</h2>
                <ol className="list-none">
                  {learnings.map((l, i) => {
                    const text = typeof l === "string" ? l : l.insight || l.learning || l.lesson || l.title || "";
                    const desc = typeof l === "object" ? l.description || l.detail : undefined;
                    return (
                      <li key={i} className="border-t border-tr-hairline py-[.8rem]">
                        <p className="text-tr-text">{text}</p>
                        {desc && <p className="mt-1 text-tr-text-mute">{desc}</p>}
                      </li>
                    );
                  })}
                </ol>
              </div>
            )}

            {futureWork.length > 0 && (
              <div>
                <h2 className={`${MONO} text-[length:var(--tr-t-mono-sm)] tracking-[.1em] text-tr-warn`}>◔ NOT DONE YET</h2>
                <ol className="list-none">
                  {futureWork.map((item, i) => (
                    <li key={i} className="border-t border-tr-hairline py-[.8rem] text-tr-text">
                      {item}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Prev / next ── */}
      <footer className={`${SHELL} border-t border-tr-hairline bg-tr-surface-1`}>
        <div className={`${WRAP} flex items-center justify-between gap-4 py-8`}>
          <Link
            href="/projects"
            data-cursor="OPEN"
            className={`${MONO} text-[length:var(--tr-t-mono)] text-tr-text-mute hover:text-tr-ember`}
          >
            ← all work
          </Link>

          <Link href={`/projects/${nextProject.id}`} data-cursor="OPEN" className="group text-right">
            <span className={`${MONO} block text-[length:var(--tr-t-mono-sm)] tracking-[.1em] text-tr-text-faint`}>
              NEXT · {pad(nextProject.index)}
            </span>
            <span className="mt-1 block text-[length:var(--tr-t-h3)] leading-[var(--tr-lh-h3)] font-medium text-tr-text group-hover:text-tr-ember">
              {nextProject.title} →
            </span>
          </Link>
        </div>
      </footer>
    </>
  );
}
