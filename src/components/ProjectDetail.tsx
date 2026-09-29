import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/lib/definitions";
import { SHOWCASE_PROJECTS } from "@/lib/showcase";
import { CodeBlock } from "./CodeBlock";
import { ComparisonSlider } from "./project/ComparisonSlider";
import { DataFlowStrip } from "./project/DataFlowStrip";

const MONO = "font-[family-name:var(--ff-mono)]";
const SHELL = "px-[clamp(1rem,4vw,2rem)]";
const WRAP = "mx-auto max-w-[1280px]";
const H2 = "text-[length:var(--tr-t-h2)] leading-[var(--tr-lh-h2)] tracking-[-.025em] font-medium text-tr-text";
const LABEL = `${MONO} text-[length:var(--tr-t-mono-sm)] tracking-[.1em] text-tr-text-faint`;

const pad = (n: number) => String(n).padStart(2, "0");

import type { ComponentObj, DataFlowStep } from "./project/DataFlowStrip";
type MetricObj = { value: string; label: string; context?: string };
type NeighborProject = { id: string; title: string; index: number };

// The only textual signal the data gives for "this line describes a gap, not
// a result" is the word itself, e.g. fifa-soccer-ds's "trained weights
// pending". Matching on that keeps the check/hollow-circle split honest
// instead of guessing at which impact lines still sound unfinished.
const isPending = (text: string) => /\bpending\b/i.test(text);


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
  const deepDive = project.deepDive;
  const links = project.links ?? {};
  const showcase = SHOWCASE_PROJECTS[project.id];
  const demo = showcase?.demo;
  // stock-data-platform and biotech-accelerator carry an arch diagram but no
  // `demo`, and biotech-accelerator's dataFlow is a prose string rather than
  // the structured form the stage strip below needs, so this can't just live
  // inside the Data flow section: it renders on its own, next to it.
  const archImage = showcase?.arch;

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
        <a href={project.github} target="_blank" rel="noreferrer" data-cursor="OPEN" className="hover:text-tr-accent">
          GitHub ↗
        </a>
      ),
    });
  }
  if (links.demo) {
    factCells.push({
      label: "DEMO",
      value: (
        <a href={links.demo} target="_blank" rel="noreferrer" data-cursor="OPEN" className="hover:text-tr-accent">
          Live ↗
        </a>
      ),
    });
  }

  return (
    <>
      {/* ── Breadcrumb ── */}
      <nav aria-label="Breadcrumb" className={`${SHELL} pt-[clamp(1.5rem,3vw,2rem)]`}>
        <div className={`${WRAP} ${MONO} text-[length:var(--tr-t-mono)] text-tr-text-faint`}>
          <Link href="/projects" data-cursor="OPEN" className="hover:text-tr-accent">
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
            {/* The grid lines are gap-px over a hairline background, so an odd
                number of cells leaves the last half-row showing that background
                as an empty bordered box. Projects with no demo link hit this.
                Letting the final cell span both columns fills the row instead. */}
            {factCells.map((c, i) => (
              <div
                key={c.label}
                className={`bg-tr-surface-1 p-[.8rem_1rem] ${
                  factCells.length % 2 === 1 && i === factCells.length - 1 ? "col-span-2" : ""
                }`}
              >
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
            <div className="max-w-[62ch] text-[length:var(--tr-t-body)] leading-[var(--tr-lh-prose)] text-tr-text-mute [&_a]:text-tr-accent [&_a]:underline [&_a]:decoration-tr-hairline [&_a]:underline-offset-4 [&_h2]:mt-8 [&_h2]:text-[length:var(--tr-t-h3)] [&_h2]:leading-[var(--tr-lh-h3)] [&_h2]:font-medium [&_h2]:text-tr-text [&_h3]:mt-6 [&_h3]:font-medium [&_h3]:text-tr-text [&_li]:mt-2 [&_p+p]:mt-4 [&_strong]:font-medium [&_strong]:text-tr-text [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5">
              {overview}
            </div>
          </div>
        </section>
      )}

      {/* ── Demo: whichever kind this project's showcase config carries ── */}
      {demo?.kind === "compare" && (
        <section className={`${SHELL} pb-[clamp(2rem,5vw,4rem)]`}>
          <div className={WRAP}>
            <ComparisonSlider projectTitle={project.title} pairs={demo.pairs} />
          </div>
        </section>
      )}

      {demo?.kind === "tools" && (
        <section className={`${SHELL} pb-[clamp(2rem,5vw,4rem)]`}>
          <div className={WRAP}>
            <h2 className={H2}>Tools this site registers.</h2>
            <p className="mt-3 max-w-[62ch] text-tr-text-mute [text-wrap:pretty]">{demo.note}</p>

            <div className="mt-8 hidden grid-cols-[minmax(0,1fr)_5rem_minmax(0,1.6fr)] gap-6 border-b border-tr-hairline pb-2 lg:grid">
              <span className={LABEL}>TOOL</span>
              <span className={LABEL}>KIND</span>
              <span className={LABEL}>DESCRIPTION</span>
            </div>

            {demo.tools.map((t, i) => (
              <div
                key={i}
                className="grid gap-2 border-b border-tr-hairline py-[1.1rem] lg:grid-cols-[minmax(0,1fr)_5rem_minmax(0,1.6fr)] lg:items-baseline lg:gap-6"
              >
                <code className={`${MONO} text-[length:var(--tr-t-small)] text-tr-accent`}>{t.name}</code>
                {/* read and write are distinguished by the word itself, not a
                    second saturated colour: the accent-only rule means status
                    tokens (ok/warn) are reserved for verified/gap semantics
                    elsewhere on this page, not for labelling a tool kind. */}
                <span
                  data-tool-kind={t.kind}
                  className={`${MONO} text-[length:var(--tr-t-mono-sm)] uppercase tracking-[.08em] text-tr-text-faint`}
                >
                  {t.kind}
                </span>
                <p className="text-tr-text-mute">{t.description}</p>
              </div>
            ))}

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div className="min-w-0 overflow-hidden rounded-[var(--tr-r-lg)] border border-tr-hairline bg-tr-bg">
                <p className={`${LABEL} border-b border-tr-hairline px-4 py-2`}>
                  AGENT CALLS <code className="text-tr-accent">{demo.sample.tool}</code>
                </p>
                <pre className="min-w-0 overflow-x-auto p-4 text-[length:var(--tr-t-mono-sm)] leading-[var(--tr-lh-body)] text-tr-text">
                  <code>{demo.sample.request}</code>
                </pre>
              </div>
              <div className="min-w-0 overflow-hidden rounded-[var(--tr-r-lg)] border border-tr-hairline bg-tr-bg">
                <p className={`${LABEL} border-b border-tr-hairline px-4 py-2`}>SITE RETURNS</p>
                <pre className="min-w-0 overflow-x-auto p-4 text-[length:var(--tr-t-mono-sm)] leading-[var(--tr-lh-body)] text-tr-text">
                  <code>{demo.sample.response}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>
      )}

      {demo?.kind === "report" && (
        <section className={`${SHELL} pb-[clamp(2rem,5vw,4rem)]`}>
          <div className={WRAP}>
            <h2 className={H2}>{demo.title}</h2>
            <p className="mt-3 max-w-[62ch] text-tr-text-mute [text-wrap:pretty]">{demo.note}</p>

            <ul className="mt-8 list-none">
              {demo.findings.map((f, i) => {
                const verdictClass =
                  f.verdict === "VERIFIED"
                    ? "text-tr-ok"
                    : f.verdict === "CONTESTED"
                      ? "text-tr-warn"
                      : "text-tr-text-faint";
                return (
                  <li
                    key={i}
                    className="grid gap-2 border-t border-tr-hairline py-[1.1rem] sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-6"
                  >
                    <span
                      data-verdict={f.verdict}
                      className={`${MONO} text-[length:var(--tr-t-mono-sm)] uppercase tracking-[.08em] ${verdictClass}`}
                    >
                      {f.verdict}
                    </span>
                    <p className="text-tr-text">{f.text}</p>
                  </li>
                );
              })}
            </ul>

            {demo.sourceUrl && (
              <a
                href={demo.sourceUrl}
                target="_blank"
                rel="noreferrer"
                data-cursor="OPEN"
                className={`${MONO} mt-6 inline-block text-[length:var(--tr-t-mono)] text-tr-text-mute hover:text-tr-accent`}
              >
                Run it yourself on GitHub ↗
              </a>
            )}
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
                  <span className={`${MONO} shrink-0 text-tr-accent`}>{pad(i + 1)}</span>
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

      {/* ── Architecture diagram ──
          Independent of the Data flow section below: biotech-accelerator has
          this image but its dataFlow is prose, not the structured stages that
          section needs, so gating this on flow.length would drop the image
          for that project. */}
      {archImage && (
        <section className={`${SHELL} border-t border-tr-hairline py-[clamp(2rem,5vw,4rem)]`}>
          <div className={WRAP}>
            <p className={`${LABEL} mb-3`}>ARCHITECTURE</p>
            <figure className="overflow-hidden rounded-[var(--tr-r-lg)] border border-tr-hairline bg-tr-surface-1">
              <Image
                src={archImage}
                alt={`${project.title}: system architecture diagram`}
                width={1386}
                height={1114}
                sizes="(max-width: 1280px) 100vw, 1120px"
                className="h-auto w-full"
              />
            </figure>
          </div>
        </section>
      )}

      {/* ── Data flow ── */}
      {flow.length > 0 && <DataFlowStrip flow={flow} components={structuredComponents} />}

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
                      // A dl group is <dt> then its <dd>s, in that order. The
                      // design shows the figure above its label, so the order is
                      // flipped visually rather than in the markup, and the
                      // context is a second <dd> rather than a <p> loose inside
                      // the group. Both were invalid list structure before.
                      <div key={i} className="flex flex-col bg-tr-bg p-4">
                        <dt className={`order-2 mt-1 ${MONO} text-[length:var(--tr-t-mono-sm)] uppercase tracking-[.08em] text-tr-text-mute`}>
                          {m.label}
                        </dt>
                        <dd className="order-1 text-[length:var(--tr-t-stat)] font-medium tabular-nums text-tr-text">{m.value}</dd>
                        {m.context && (
                          <dd className={`order-3 mt-1 ${MONO} text-[length:var(--tr-t-mono-sm)] text-tr-text-faint`}>{m.context}</dd>
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
                    const text = typeof l === "string" ? l : l.insight || l.learning || l.lesson || "";
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
            className={`${MONO} text-[length:var(--tr-t-mono)] text-tr-text-mute hover:text-tr-accent`}
          >
            ← all work
          </Link>

          <Link href={`/projects/${nextProject.id}`} data-cursor="OPEN" className="group text-right">
            <span className={`${MONO} block text-[length:var(--tr-t-mono-sm)] tracking-[.1em] text-tr-text-faint`}>
              NEXT · {pad(nextProject.index)}
            </span>
            <span className="mt-1 block text-[length:var(--tr-t-h3)] leading-[var(--tr-lh-h3)] font-medium text-tr-text group-hover:text-tr-accent">
              {nextProject.title} →
            </span>
          </Link>
        </div>
      </footer>
    </>
  );
}
