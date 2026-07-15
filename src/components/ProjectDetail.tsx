"use client";

import type { Project } from "@/lib/definitions";
import type { ArchitectureData, ArchitectureNode, ProjectMedia, Metric } from "@/data/types";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft } from "lucide-react";
import { typeColors as architectureColors } from "./architectureColors";
import { CodeBlock } from "./CodeBlock";

const ArchitectureVisualizer = dynamic(
  () => import("./ArchitectureVisualizer").then((mod) => mod.ArchitectureVisualizer),
  { ssr: false }
);

const pad = (n: number) => String(n).padStart(2, "0");

export function ProjectDetail({ project }: { project: Project }) {
  type ProjectWithExtras = Project & {
    architecture?: ArchitectureData & {
      description?: string;
      legend?: { label: string; type: ArchitectureNode["type"] }[];
    };
    media?: ProjectMedia[];
    metrics?: Metric[];
  };

  const richProject = project as ProjectWithExtras;
  const deepDive = project.deepDive;
  const architecture = richProject.architecture;
  const legendItems = architecture?.legend;
  const mediaItems = richProject.media;
  const metrics = richProject.metrics;

  const links = project.links ?? {};

  // Collect present sections so numbering stays sequential.
  const sections: { title: string; meta?: string; node: React.ReactNode }[] = [];

  // The Problem
  sections.push({
    title: "The problem.",
    node: (
      <div className="ds-prose">
        <p>{project.challenge}</p>
        {deepDive?.context && (
          <div className="ds-card"><p>{deepDive.context}</p></div>
        )}
      </div>
    ),
  });

  // How It Works
  sections.push({
    title: "How it works.",
    node: (
      <>
        <ol className="ds-numlist">
          {project.solution.map((item, idx) => <li key={idx}>{item}</li>)}
        </ol>

        {deepDive?.architecture && (
          <>
            <h3 className="ds-h3">Architecture</h3>
            <div className="ds-prose"><p>{deepDive.architecture}</p></div>
          </>
        )}

        {deepDive?.components && (
          typeof deepDive.components === "string" ? (
            <div className="ds-card"><p>{deepDive.components}</p></div>
          ) : deepDive.components.length > 0 && (
            <div className="ds-components">
              {deepDive.components.map((component, idx) => {
                const structured = typeof component === "object";
                return (
                  <div className="ds-component" key={idx}>
                    {structured ? (
                      <>
                        <h4>{(component as { name: string }).name}</h4>
                        {(component as { purpose?: string }).purpose && (
                          <p>{(component as { purpose?: string }).purpose}</p>
                        )}
                      </>
                    ) : (
                      <p>{component as string}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}

        {deepDive?.dataFlow && (
          <>
            <h3 className="ds-h3">Data flow</h3>
            {Array.isArray(deepDive.dataFlow) ? (
              <ol className="ds-numlist">
                {deepDive.dataFlow.map((step, i) => {
                  const structured = typeof step === "object";
                  return (
                    <li key={i}>
                      {structured ? (
                        <span>
                          <b>{(step as { step: string }).step}</b>
                          {(step as { detail?: string }).detail && <> {(step as { detail?: string }).detail}</>}
                        </span>
                      ) : (step as string)}
                    </li>
                  );
                })}
              </ol>
            ) : (
              <div className="ds-prose"><p>{deepDive.dataFlow}</p></div>
            )}
          </>
        )}

        {architecture?.nodes?.length ? (
          <>
            <h3 className="ds-h3">System architecture</h3>
            {architecture.description && (
              <div className="ds-prose"><p>{architecture.description}</p></div>
            )}
            <div className="ds-arch">
              <ArchitectureVisualizer data={architecture} />
            </div>
            {legendItems && (
              <div className="specs" style={{ marginTop: 14 }}>
                {legendItems.map((item) => (
                  <span key={item.label}>
                    <span
                      style={{
                        display: "inline-block", width: 8, height: 8, borderRadius: 999, marginRight: 6,
                        background: architectureColors[item.type as keyof typeof architectureColors] ?? "var(--accent)",
                      }}
                    />
                    {item.label}
                  </span>
                ))}
              </div>
            )}
          </>
        ) : null}
      </>
    ),
  });

  // Technical deep dive
  if (deepDive?.keyDecisions?.length || deepDive?.codeSnippets?.length) {
    sections.push({
      title: "Technical deep dive.",
      node: (
        <>
          {deepDive?.keyDecisions && (
            <>
              <h3 className="ds-h3">Key decisions and trade-offs</h3>
              {typeof deepDive.keyDecisions === "string" ? (
                <div className="ds-card"><p>{deepDive.keyDecisions}</p></div>
              ) : deepDive.keyDecisions.length > 0 && (
                <div>
                  {deepDive.keyDecisions.map((item, idx) => {
                    const explanation = item.reasoning || item.rationale;
                    const tradeoff = item.alternatives || item.tradeoff;
                    return (
                      <div className="ds-decision" key={idx}>
                        <h4>{item.decision}</h4>
                        {explanation && <p>{explanation}</p>}
                        {tradeoff && <p className="ds-tradeoff">Trade-off: {tradeoff}</p>}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {deepDive?.codeSnippets && (
            <>
              <h3 className="ds-h3">Code highlights</h3>
              {typeof deepDive.codeSnippets === "string" ? (
                <CodeBlock snippet={{ code: deepDive.codeSnippets, language: "text" }} />
              ) : deepDive.codeSnippets.length > 0 && (
                <div style={{ display: "grid", gap: 24 }}>
                  {deepDive.codeSnippets.map((snippet, idx) => (
                    <CodeBlock key={idx} snippet={snippet} />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      ),
    });
  }

  // Results & Impact
  sections.push({
    title: "Results and impact.",
    node: (
      <>
        <ul className="ds-impact">
          {project.impact.map((item, idx) => <li key={idx}><span>{item}</span></li>)}
        </ul>

        {deepDive?.metrics && (
          typeof deepDive.metrics === "string" ? (
            <div className="ds-card"><p>{deepDive.metrics}</p></div>
          ) : deepDive.metrics.length > 0 && (
            typeof deepDive.metrics[0] === "string" ? (
              <ul className="ds-impact">
                {(deepDive.metrics as string[]).map((m, i) => <li key={i}><span>{m}</span></li>)}
              </ul>
            ) : (
              <div className="ds-metrics">
                {(deepDive.metrics as { value: string; label: string; context?: string }[]).map((m, i) => (
                  <div className="ds-metric" key={i}>
                    <b>{m.value}</b>
                    <span>{m.label}</span>
                    {m.context && <small>{m.context}</small>}
                  </div>
                ))}
              </div>
            )
          )
        )}

        {!deepDive?.metrics && metrics && metrics.length > 0 && (
          <div className="ds-metrics">
            {metrics.map((m, i) => (
              <div className="ds-metric" key={i}><b>{m.value}</b><span>{m.label}</span></div>
            ))}
          </div>
        )}
      </>
    ),
  });

  // Key learnings
  if (deepDive?.learnings) {
    sections.push({
      title: "Key learnings.",
      node: (
        <>
          {typeof deepDive.learnings === "string" ? (
            <div className="ds-card"><p>{deepDive.learnings}</p></div>
          ) : deepDive.learnings.length > 0 && (
            <ul className="ds-learnings">
              {deepDive.learnings.map((learning, idx) => {
                const structured = typeof learning === "object";
                type LearningObj = { insight?: string; learning?: string; lesson?: string; title?: string; description?: string; detail?: string };
                const title = structured
                  ? ((learning as LearningObj).insight || (learning as LearningObj).learning || (learning as LearningObj).lesson || (learning as LearningObj).title)
                  : null;
                const desc = structured
                  ? ((learning as LearningObj).description || (learning as LearningObj).detail)
                  : null;
                return (
                  <li key={idx}>
                    {structured && title ? (
                      <div>
                        <h4>{title}</h4>
                        {desc && <p>{desc}</p>}
                      </div>
                    ) : (
                      <span className="ds-learn-text">{learning as string}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          {deepDive.futureWork && (
            <>
              <h3 className="ds-h3">Future improvements</h3>
              {typeof deepDive.futureWork === "string" ? (
                <div className="ds-prose"><p>{deepDive.futureWork}</p></div>
              ) : deepDive.futureWork.length > 0 && (
                <ul className="ds-impact">
                  {deepDive.futureWork.map((item, idx) => <li key={idx}><span>{item}</span></li>)}
                </ul>
              )}
            </>
          )}
        </>
      ),
    });
  }

  // Media
  if (mediaItems && mediaItems.length > 0) {
    sections.push({
      title: "Screens and demos.",
      node: (
        <div className="ds-media">
          {mediaItems.map((media, idx) => (
            <figure className="ds-figure" key={idx} style={{ margin: 0 }}>
              <div style={{ position: "relative", aspectRatio: "16 / 9" }}>
                {media.kind === "image" && (
                  <Image src={media.src} alt={media.alt || project.title} fill sizes="(max-width: 860px) 100vw, 860px" style={{ objectFit: "cover" }} />
                )}
                {media.kind === "video" && (
                  <video src={media.src} poster={media.poster} controls style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                )}
              </div>
            </figure>
          ))}
        </div>
      ),
    });
  }

  return (
    <article className="dossier">
      <Link href="/projects" className="ds-back">
        <ArrowLeft className="w-3 h-3" />
        Back to the work
      </Link>

      <header className="ds-head">
        <div className="eyebrow">
          <span className="dot" />
          <span>{[project.domain, project.role].filter(Boolean).join(" · ")}</span>
        </div>
        <h1 className="ds-title">{project.title}.</h1>
        <p className="ds-deck">{project.summary}</p>

        {project.tech?.length > 0 && (
          <div className="specs">
            {project.tech.map((t) => <span key={t}>{t}</span>)}
          </div>
        )}

        <div className="ds-meta">
          {project.role && <span>Role <b>{project.role}</b></span>}
          {project.period && <span>Period <b>{project.period}</b></span>}
          {project.domain && <span>Domain <b>{project.domain}</b></span>}
        </div>

        {(project.github || links.code || links.demo || links.paper) && (
          <div className="ds-links">
            {project.github && <a href={project.github} target="_blank" rel="noreferrer">GitHub ↗</a>}
            {links.code && <a href={links.code} target="_blank" rel="noreferrer">Code ↗</a>}
            {links.demo && <a href={links.demo} target="_blank" rel="noreferrer">Demo ↗</a>}
            {links.paper && <a href={links.paper} target="_blank" rel="noreferrer">Paper ↗</a>}
          </div>
        )}
      </header>

      {sections.map((s, i) => (
        <section className="ds-section" key={s.title}>
          <div className="section-head">
            <span className="num">§ {pad(i + 1)}</span>
            <h2 className="title">{s.title}</h2>
            {s.meta && <span className="meta">{s.meta}</span>}
          </div>
          {s.node}
        </section>
      ))}

      <footer className="ds-foot">
        <Link href="/projects" className="ds-back">
          <ArrowLeft className="w-3 h-3" />
          More work
        </Link>
      </footer>
    </article>
  );
}
