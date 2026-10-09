import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/lib/definitions";
import { SHOWCASE_PROJECTS } from "@/lib/showcase";
import { CodeBlock } from "./CodeBlock";
import { ComparisonSlider } from "./project/ComparisonSlider";
import { DataFlowStrip } from "./project/DataFlowStrip";
import { BTN, CARD, H1, H2, HAND, LABEL, LEDE, MONO, SHELL, WRAP, pad } from "./desk";

// Markdown prose from a deep-dive string (lists, bold, the odd fenced block).
// Inline code is a paper chip; a fenced block is an ink panel, like CodeBlock.
const PROSE =
  "max-w-[62ch] text-[16px] leading-[var(--tr-lh-prose)] text-tr-text-mute [&>*+*]:mt-4 [&_a]:text-tr-text [&_a]:underline [&_code]:font-mono [&_code]:text-[12.5px] [&_:not(pre)>code]:rounded-[var(--tr-r-sm)] [&_:not(pre)>code]:bg-tr-surface-2 [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-[2px] [&_:not(pre)>code]:text-tr-text [&_li]:mt-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_pre]:overflow-x-auto [&_pre]:rounded-[var(--tr-r-lg)] [&_pre]:border-[1.5px] [&_pre]:border-tr-on-ink-line [&_pre]:bg-tr-text [&_pre]:p-4 [&_pre]:text-tr-on-ink [&_strong]:font-semibold [&_strong]:text-tr-text [&_ul]:list-disc [&_ul]:pl-5";

// A figure's frame, matching ComparisonSlider's: ink, radius 14, a small hard shadow.
const FIGURE = "overflow-hidden rounded-[var(--tr-r-lg)] border-[1.5px] border-tr-hairline bg-tr-surface-1 shadow-[4px_4px_0_var(--tr-text)]";
// Text on an ink panel: the tools demo's request and response. They are JSON,
// so they wrap rather than scroll off the edge of a phone.
const INK_PRE = "min-w-0 whitespace-pre-wrap p-4 font-mono text-[12.5px] leading-[var(--tr-lh-body)] text-tr-on-ink [overflow-wrap:anywhere]";

import type { ComponentObj, DataFlowStep } from "./project/DataFlowStrip";

/** The longest brief still set in Caveat; past this it is a paragraph, not an aside. */
const HAND_MAX = 160;

type MetricObj = { value: string; label: string; context?: string };
type NeighborProject = { id: string; title: string; index: number };

/**
 * The deep-dive sections that are authored as one markdown string rather than
 * structured items, rendered by the route (MDXRemote is an async server
 * component). Each renders where its structured form would.
 */
export type DeepDiveProse = Partial<
  Record<"context" | "architecture" | "components" | "dataFlow" | "keyDecisions" | "codeSnippets" | "learnings", ReactNode>
>;

// The only textual signal the data gives for "this line describes a gap, not
// a result" is the word itself, e.g. fifa-soccer-ds's "trained weights
// pending". Matching on that keeps the check/hollow-circle split honest
// instead of guessing at which impact lines still sound unfinished.
const isPending = (text: string) => /\bpending\b/i.test(text);


const RULE = "border-t-[1.5px] border-tr-hairline";

// A section in the page column under an ink rule. The rule sits on the inner
// box so it spans the text column, not the column's side padding.
function Ruled({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <section className={`${WRAP} ${SHELL}`}>
      <div className={`${RULE} py-[clamp(40px,5vw,60px)] ${className}`}>{children}</div>
    </section>
  );
}

export function ProjectDetail({
  project,
  overview,
  prose = {},
  nextProject,
}: {
  project: Project;
  /** The rendered MDX body, built by the route because MDXRemote is server-only. */
  overview?: ReactNode;
  prose?: DeepDiveProse;
  nextProject: NeighborProject;
}) {
  const deepDive = project.deepDive;
  const links = project.links ?? {};
  const showcase = SHOWCASE_PROJECTS[project.id];
  const demo = showcase?.demo;
  // stock-data-platform and biotech-accelerator carry an arch diagram; it sits
  // with the architecture prose, apart from the Data flow section.
  const archImage = showcase?.arch;

  const flow: DataFlowStep[] =
    Array.isArray(deepDive?.dataFlow) && typeof deepDive.dataFlow[0] === "object"
      ? (deepDive.dataFlow as DataFlowStep[])
      : [];

  const components: ComponentObj[] = Array.isArray(deepDive?.components)
    ? deepDive.components.map((c) => (typeof c === "string" ? { name: c } : c))
    : [];
  // Every component a data-flow stage names shows in the strip; the rest are
  // listed on their own so none is hidden.
  const unnamedComponents = components.filter((c) => !flow.some((f) => f.component === c.name));

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
        <span aria-hidden="true" className="size-2.5 rounded-full border-[1.5px] border-tr-hairline bg-tr-mint" />
        Published
      </span>
    ),
  });
  const linkCell = (label: string, href: string | undefined, text: string) => {
    if (!href) return;
    factCells.push({
      label,
      value: (
        <a href={href} target="_blank" rel="noreferrer" className="underline">
          {text}
        </a>
      ),
    });
  };
  // links.code stands in when there is no top-level github (basic-banking).
  linkCell("CODE", project.github ?? links.code, "GitHub ↗");
  linkCell("DEMO", links.demo, "Demo ↗");
  linkCell("SITE", links.site, "Site ↗");
  linkCell("PAPER", links.paper, "IEEE ↗");

  return (
    <>
      {/* ── Breadcrumb ── */}
      <nav aria-label="Breadcrumb" className={`${WRAP} ${SHELL} pt-[clamp(32px,5vw,56px)] ${MONO} text-[13px] text-tr-text-faint`}>
        <Link href="/projects" className="text-tr-text-faint underline">
          /work
        </Link>
        <span> / {project.id}</span>
      </nav>

      {/* ── Hero ── */}
      <header
        className={`${WRAP} ${SHELL} grid items-end gap-[clamp(32px,5vw,80px)] pb-[clamp(40px,5vw,60px)] pt-4 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]`}
      >
        <div>
          <h1 className={H1}>{project.title}</h1>
          <p className={`mt-5 max-w-[52ch] ${LEDE}`}>{project.summary}</p>
        </div>

        <div className={`${CARD} overflow-hidden shadow-[var(--tr-shadow-card)]`}>
          <dl className="grid grid-cols-2 gap-px bg-tr-hairline">
            {/* The grid lines are gap-px over a hairline background, so an odd
                number of cells leaves the last half-row showing that background
                as an empty bordered box. Projects with no demo link hit this.
                Letting the final cell span both columns fills the row instead. */}
            {factCells.map((c, i) => (
              <div
                key={c.label}
                className={`bg-tr-surface-1 px-4 py-3 ${
                  factCells.length % 2 === 1 && i === factCells.length - 1 ? "col-span-2" : ""
                }`}
              >
                <dt className={LABEL}>{c.label}</dt>
                <dd className="mt-1 text-[15px] font-semibold text-tr-text">{c.value}</dd>
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
        <section className={`${WRAP} ${SHELL} pb-[clamp(40px,5vw,60px)]`}>
          <p className={`${LABEL} mb-3`}>OVERVIEW</p>
          <div
            className={`${PROSE} [&_h2]:mt-8 [&_h2]:text-[22px] [&_h2]:leading-[var(--tr-lh-h2)] [&_h2]:text-tr-text [&_h3]:mt-6 [&_h3]:text-[18px] [&_h3]:text-tr-text`}
          >
            {overview}
          </div>
        </section>
      )}

      {/* ── Demo: whichever kind this project's showcase config carries ── */}
      {demo?.kind === "compare" && (
        <section className={`${WRAP} ${SHELL} pb-[clamp(40px,5vw,60px)]`}>
          <ComparisonSlider projectTitle={project.title} pairs={demo.pairs} />
        </section>
      )}

      {demo?.kind === "tools" && (
        <Ruled>
          <h2 className={H2}>Tools this site registers.</h2>
          <p className={`mt-3 max-w-[62ch] ${LEDE}`}>{demo.note}</p>

          <div className="mt-8">
            <div className="hidden grid-cols-[minmax(0,1fr)_5rem_minmax(0,1.6fr)] gap-6 pb-2.5 lg:grid">
              <span className={LABEL}>TOOL</span>
              <span className={LABEL}>KIND</span>
              <span className={LABEL}>DESCRIPTION</span>
            </div>

            {demo.tools.map((t, i) => (
              <div
                key={i}
                className={`grid gap-2 py-4 ${RULE} lg:grid-cols-[minmax(0,1fr)_5rem_minmax(0,1.6fr)] lg:items-baseline lg:gap-6`}
              >
                <code className={`${MONO} text-[13px] font-semibold text-tr-text`}>{t.name}</code>
                {/* read and write are distinguished by the word itself, not a
                    second saturated colour: the accent-only rule means status
                    tokens (ok/warn) are reserved for verified/gap semantics
                    elsewhere on this page, not for labelling a tool kind. */}
                <span data-tool-kind={t.kind} className={LABEL}>
                  {t.kind}
                </span>
                <p className="text-[15px] leading-normal text-tr-text-mute">{t.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid items-start gap-6 sm:grid-cols-2">
            <div className="ink-panel min-w-0 overflow-hidden rounded-[var(--tr-r-lg)] border-[1.5px] border-tr-on-ink-line bg-tr-text">
              <p className="border-b border-tr-on-ink-line px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.08em] text-tr-on-ink-mute">
                AGENT CALLS <code className="normal-case text-tr-butter">{demo.sample.tool}</code>
              </p>
              <pre className={INK_PRE}>
                <code>{demo.sample.request}</code>
              </pre>
            </div>
            <div className="ink-panel min-w-0 overflow-hidden rounded-[var(--tr-r-lg)] border-[1.5px] border-tr-on-ink-line bg-tr-text">
              <p className="border-b border-tr-on-ink-line px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.08em] text-tr-on-ink-mute">
                SITE RETURNS
              </p>
              <pre className={INK_PRE}>
                <code>{demo.sample.response}</code>
              </pre>
            </div>
          </div>
        </Ruled>
      )}

      {demo?.kind === "report" && (
        <Ruled>
          <h2 className={H2}>{demo.title}</h2>
          <p className={`mt-3 max-w-[62ch] ${LEDE}`}>{demo.note}</p>

          <ul className="mt-8 list-none">
            {demo.findings.map((f, i) => {
              const verdictClass =
                f.verdict === "VERIFIED"
                  ? "text-tr-ok"
                  : f.verdict === "FALSIFIED"
                    ? "text-tr-warn"
                    : "text-tr-text-faint";
              return (
                <li key={i} className={`grid gap-2 py-4 ${RULE} sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-6`}>
                  <span
                    data-verdict={f.verdict}
                    className={`${MONO} pt-0.5 text-[12px] font-semibold uppercase tracking-[0.08em] ${verdictClass}`}
                  >
                    {f.verdict}
                  </span>
                  <p className="text-[15px] leading-normal text-tr-text">{f.text}</p>
                </li>
              );
            })}
          </ul>

          {demo.sourceUrl && (
            <a
              href={demo.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className={`${MONO} mt-6 inline-block text-[13px] text-tr-text underline`}
            >
              Run it yourself on GitHub ↗
            </a>
          )}
        </Ruled>
      )}

      {/* ── Arrived as / What I built / What changed ──
          A short brief is set in the hand the home page's project cards use, so
          a card on / and its page say the same thing the same way. A long one
          stays in print: a paragraph of handwriting is hard to read. */}
      <Ruled className="grid gap-[clamp(24px,4vw,48px)] sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <h2 className={LABEL}>ARRIVED AS</h2>
          <p className={`mt-3 ${project.challenge.length <= HAND_MAX ? HAND : LEDE}`}>&ldquo;{project.challenge}&rdquo;</p>
          {prose.context && <div className={`mt-4 ${PROSE}`}>{prose.context}</div>}
        </div>

        <div>
          <h2 className={LABEL}>WHAT I BUILT</h2>
          <ol className="list-none">
            {project.solution.map((item, i) => (
              <li key={i} className="mt-3 flex gap-3 text-[15px] leading-normal">
                <span className={`${MONO} shrink-0 pt-px text-[12px] text-tr-accent-ink`}>{pad(i + 1)}</span>
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
                <li key={i} className="mt-3 flex gap-3 text-[15px] leading-normal">
                  <span aria-hidden="true" className={`shrink-0 font-bold ${pending ? "text-tr-warn" : "text-tr-ok"}`}>
                    {pending ? "◔" : "✓"}
                  </span>
                  <span className="text-tr-text">{item}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </Ruled>

      {/* ── Architecture: the prose, and the diagram where there is one ── */}
      {(prose.architecture || archImage) && (
        <Ruled>
          <h2 className={`${LABEL} mb-3`}>ARCHITECTURE</h2>
          {prose.architecture && <div className={PROSE}>{prose.architecture}</div>}
          {archImage && (
            <figure className={`${prose.architecture ? "mt-8 " : ""}${FIGURE}`}>
              <Image
                src={archImage}
                alt={`${project.title}: system architecture diagram`}
                width={1672}
                height={941}
                sizes="(max-width: 1200px) 100vw, 1104px"
                className="h-auto w-full"
              />
            </figure>
          )}
        </Ruled>
      )}

      {/* ── Data flow: the stage strip, or the prose when that is how it was written ── */}
      {flow.length > 0 && <DataFlowStrip flow={flow} components={components} />}
      {flow.length === 0 && prose.dataFlow && (
        <Ruled>
          <h2 className={H2}>Data flow</h2>
          <div className={`mt-6 ${PROSE}`}>{prose.dataFlow}</div>
        </Ruled>
      )}

      {/* ── Components no stage names (all of them when there is no strip) ── */}
      {(unnamedComponents.length > 0 || prose.components) && (
        <Ruled>
          <h2 className={`${LABEL} mb-3`}>{unnamedComponents.length < components.length ? "ALSO IN THE BUILD" : "COMPONENTS"}</h2>
          {prose.components && <div className={PROSE}>{prose.components}</div>}
          {unnamedComponents.length > 0 && (
            <ul className="grid list-none gap-x-[clamp(24px,4vw,48px)] sm:grid-cols-2 lg:grid-cols-3">
              {unnamedComponents.map((c) => (
                <li key={c.name} className="border-t border-tr-hairline py-3.5">
                  <code className={`${MONO} text-[13px] font-semibold text-tr-text`}>{c.name}</code>
                  {c.purpose && <p className="mt-1.5 text-[14px] leading-normal text-tr-text-mute">{c.purpose}</p>}
                  {c.details && <p className="mt-1.5 text-[13px] leading-normal text-tr-text-faint">{c.details}</p>}
                </li>
              ))}
            </ul>
          )}
        </Ruled>
      )}

      {/* ── Decisions ── */}
      {(decisions.length > 0 || prose.keyDecisions) && (
        <Ruled>
          <h2 className={H2}>Decisions, with the cost of each.</h2>
          <p className={`mt-3 max-w-[62ch] ${LEDE}`}>
            A decision without its trade-off is marketing. Each row says what was chosen, why, and what it gave up.
          </p>

          {prose.keyDecisions && <div className={`mt-8 ${PROSE}`}>{prose.keyDecisions}</div>}

          {decisions.length > 0 && (
            <div className="mt-8">
              <div className="hidden grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1fr)] gap-6 pb-2.5 lg:grid">
                <span className={LABEL}>DECISION</span>
                <span className={LABEL}>BECAUSE</span>
              </div>

              {decisions.map((d, i) => {
                const because = d.reasoning || d.rationale;
                // Each kind carries its own label: the options turned down
                // (alternatives) are not the cost of the one chosen (tradeoff).
                return (
                  <div
                    key={i}
                    className={`grid gap-2 py-5 text-[15px] leading-normal ${RULE} lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-6`}
                  >
                    <p className="text-[17px] font-bold leading-[var(--tr-lh-tight)] tracking-[-0.01em] text-tr-text">{d.decision}</p>
                    {because && <p className="text-tr-text-mute">{because}</p>}
                    {(d.alternatives || d.tradeoff) && (
                      <div className="grid gap-3">
                        {d.alternatives && (
                          <div>
                            <p className={LABEL}>INSTEAD OF</p>
                            <p className="mt-1 text-tr-text-mute">{d.alternatives}</p>
                          </div>
                        )}
                        {d.tradeoff && (
                          <div>
                            <p className={LABEL}>AT THE COST OF</p>
                            <p className="mt-1 text-tr-warn">{d.tradeoff}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Ruled>
      )}

      {/* ── The part that mattered ── */}
      {(metrics.length > 0 || snippets.length > 0 || prose.codeSnippets) && (
        <Ruled className="grid gap-[clamp(32px,5vw,64px)] lg:grid-cols-2">
          <div>
            <h2 className={H2}>The part that mattered.</h2>
            <p className={`mt-3 max-w-[48ch] ${LEDE}`}>The numbers behind the work, and the code that produced them.</p>

            {metrics.length > 0 && (
              <div className={`mt-8 overflow-hidden ${CARD}`}>
                <dl className="grid grid-cols-2 gap-px bg-tr-hairline">
                  {metrics.map((m, i) => (
                    // A dl group is <dt> then its <dd>s, in that order. The
                    // design shows the figure above its label, so the order is
                    // flipped visually rather than in the markup, and the
                    // context is a second <dd> rather than a <p> loose inside
                    // the group. Both were invalid list structure before.
                    // An odd last metric spans both columns, as in the fact grid.
                    <div
                      key={i}
                      className={`flex flex-col bg-tr-surface-1 p-5 ${
                        metrics.length % 2 === 1 && i === metrics.length - 1 ? "col-span-2" : ""
                      }`}
                    >
                      <dt className={`order-2 mt-2 text-[14px] leading-[var(--tr-lh-card)] text-tr-text-mute`}>{m.label}</dt>
                      <dd
                        className={`order-1 ${/^\d/.test(m.value) ? "text-[length:clamp(36px,4vw,52px)]" : "text-[length:clamp(24px,2.6vw,32px)]"} font-extrabold leading-none tracking-[-0.04em] tabular-nums text-tr-text`}
                      >
                        {m.value}
                      </dd>
                      {m.context && <dd className={`order-3 mt-1.5 ${MONO} text-[11px] text-tr-text-faint`}>{m.context}</dd>}
                    </div>
                  ))}
                </dl>
              </div>
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
          {prose.codeSnippets && <div className={`min-w-0 ${PROSE}`}>{prose.codeSnippets}</div>}
        </Ruled>
      )}

      {/* ── Learned / Not done yet ── */}
      {(learnings.length > 0 || futureWork.length > 0 || prose.learnings) && (
        <Ruled className="grid gap-[clamp(32px,5vw,64px)] sm:grid-cols-2">
          {(learnings.length > 0 || prose.learnings) && (
            <div className="min-w-0">
              <h2 className={`${MONO} mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-tr-ok`}>✓ LEARNED</h2>
              {prose.learnings && <div className={`mt-3 ${PROSE}`}>{prose.learnings}</div>}
              {learnings.length > 0 && (
                <ol className="list-none">
                  {learnings.map((l, i) => {
                    const text = typeof l === "string" ? l : l.insight || l.learning || l.lesson || "";
                    const desc = typeof l === "object" ? l.description || l.detail : undefined;
                    return (
                      <li key={i} className="border-t border-tr-hairline py-3.5 text-[15px] leading-normal">
                        <p className="text-tr-text">{text}</p>
                        {desc && <p className="mt-1 text-tr-text-mute">{desc}</p>}
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          )}

          {futureWork.length > 0 && (
            <div>
              <h2 className={`${MONO} mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-tr-warn`}>◔ NOT DONE YET</h2>
              <ol className="list-none">
                {futureWork.map((item, i) => (
                  <li key={i} className="border-t border-tr-hairline py-3.5 text-[15px] leading-normal text-tr-text">
                    {item}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </Ruled>
      )}

      {/* ── Prev / next ── */}
      <footer className={`${WRAP} ${SHELL}`}>
        <div className={`${RULE} flex flex-wrap items-center justify-between gap-4 py-8`}>
          <Link href="/projects" className={BTN}>
            ← all work
          </Link>

          <Link href={`/projects/${nextProject.id}`} className={`${BTN} min-w-0`}>
            <span className={`${MONO} shrink-0 text-[11px] font-normal tracking-[0.08em] text-tr-text-faint`}>
              NEXT · {pad(nextProject.index)}
            </span>
            <span className="min-w-0 truncate">{nextProject.title} →</span>
          </Link>
        </div>
      </footer>
    </>
  );
}
