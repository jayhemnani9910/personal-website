"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Project } from "@/lib/definitions";
import { CodeBlock } from "./CodeBlock";
import { BeforeAfter } from "./BeforeAfter";
import { SHOWCASE_PROJECTS, type ShowcaseDemo } from "@/lib/showcase";

type TabKey = "overview" | "architecture" | "code" | "demo";

type DataFlowStep = { step: string; detail?: string };
type ComponentObj = { name: string; purpose?: string };
type MetricObj = { value: string; label: string; context?: string };

export function ProjectShowcase({ project }: { project: Project }) {
  const cfg = SHOWCASE_PROJECTS[project.id] ?? { hero: "" };
  const deep = project.deepDive ?? {};
  const links = project.links ?? {};
  const demo: ShowcaseDemo | undefined =
    cfg.demo ?? (links.demo ? { kind: "iframe", url: links.demo } : undefined);

  const metrics = Array.isArray(deep.metrics) && typeof deep.metrics[0] === "object"
    ? (deep.metrics as MetricObj[])
    : [];
  const flow = Array.isArray(deep.dataFlow) && typeof deep.dataFlow[0] === "object"
    ? (deep.dataFlow as DataFlowStep[])
    : [];
  const components = Array.isArray(deep.components) && typeof deep.components[0] === "object"
    ? (deep.components as ComponentObj[])
    : [];
  const snippets = Array.isArray(deep.codeSnippets) ? deep.codeSnippets : [];
  const decisions = Array.isArray(deep.keyDecisions) ? deep.keyDecisions : [];

  const tabs: { key: TabKey; label: string }[] = [
    { key: "overview", label: "Overview" },
    ...(cfg.arch || deep.architecture || flow.length ? [{ key: "architecture" as const, label: "Architecture" }] : []),
    ...(snippets.length ? [{ key: "code" as const, label: "Code" }] : []),
    ...(demo ? [{ key: "demo" as const, label: "Demo" }] : []),
  ];
  const [active, setActive] = useState<TabKey>("overview");

  return (
    <article className="showcase">
      <Link href="/projects" className="ds-back">
        <ArrowLeft className="w-3 h-3" />
        Back to the work
      </Link>

      {/* ── Hero ── */}
      <header className="sw-hero">
        <div className="sw-hero-text">
          <div className="eyebrow">
            <span className="dot" />
            <span>{[project.domain, project.role].filter(Boolean).join(" · ")}</span>
          </div>
          <h1 className="sw-title">{project.title}.</h1>
          <p className="deck sw-deck">{project.summary}</p>

          <dl className="sw-glance">
            <div><dt>Role</dt><dd>{project.role}</dd></div>
            {project.period && <div><dt>When</dt><dd>{project.period}</dd></div>}
            <div><dt>Stack</dt><dd>{project.tech.slice(0, 4).join(", ")}</dd></div>
            {metrics[0] && <div><dt>Scale</dt><dd>{metrics[0].value} {metrics[0].label}</dd></div>}
          </dl>

          <div className="sw-cta">
            {(() => {
              const liveUrl = demo?.kind === "iframe" ? demo.url : demo?.kind === "compare" ? demo.liveUrl : undefined;
              return liveUrl ? (
                <a className="sw-btn primary" href={liveUrl} target="_blank" rel="noreferrer">
                  View live demo ↗
                </a>
              ) : null;
            })()}
            {project.github && (
              <a className="sw-btn" href={project.github} target="_blank" rel="noreferrer">
                GitHub ↗
              </a>
            )}
          </div>
        </div>

        {cfg.hero && (
          <div className="sw-hero-media">
            <Image src={cfg.hero} alt={`${project.title} preview`} fill sizes="(max-width: 980px) 100vw, 52vw" style={{ objectFit: "cover" }} priority />
            {cfg.heroTag && <span className="ph-tag accent">{cfg.heroTag}</span>}
          </div>
        )}
      </header>

      {metrics.length > 0 && (
        <div className="sw-metrics">
          {metrics.map((m, i) => (
            <div className="sw-metric" key={i}>
              <b className="tabular">{m.value}</b>
              <span>{m.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Tabs ── */}
      <nav className="sw-tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`sw-tab${active === t.key ? " active" : ""}`}
            onClick={() => setActive(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="sw-panel">
        {active === "overview" && (
          <div className="sw-overview">
            <div className="ds-prose">
              <h3 className="ds-h3">The problem</h3>
              <p>{project.challenge}</p>
            </div>
            <div>
              <h3 className="ds-h3">What it does</h3>
              <ol className="ds-numlist">
                {project.solution.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
            </div>
            <div>
              <h3 className="ds-h3">Impact</h3>
              <ul className="ds-impact">
                {project.impact.map((s, i) => <li key={i}><span>{s}</span></li>)}
              </ul>
            </div>
          </div>
        )}

        {active === "architecture" && (
          <div className="sw-arch">
            {cfg.arch && (
              <figure className="sw-arch-fig">
                <Image src={cfg.arch} alt={`${project.title} architecture`} width={1386} height={1114} sizes="(max-width: 980px) 100vw, 820px" style={{ width: "100%", height: "auto" }} />
              </figure>
            )}
            {deep.architecture && typeof deep.architecture === "string" && (
              <div className="ds-prose"><p>{deep.architecture}</p></div>
            )}
            {flow.length > 0 && (
              <>
                <h3 className="ds-h3">Data flow</h3>
                <ol className="sw-flow">
                  {flow.map((f, i) => (
                    <li key={i}>
                      <span className="sw-flow-step">{f.step}</span>
                      {f.detail && <span className="sw-flow-detail">{f.detail}</span>}
                    </li>
                  ))}
                </ol>
              </>
            )}
            {components.length > 0 && (
              <>
                <h3 className="ds-h3">Containers</h3>
                <div className="sw-services">
                  {components.map((c, i) => (
                    <div className="sw-service" key={i}>
                      <code>{c.name}</code>
                      {c.purpose && <p>{c.purpose}</p>}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {active === "code" && (
          <div className="sw-code">
            {decisions.length > 0 && (
              <div className="sw-decisions">
                {decisions.map((d, i) => {
                  const why = d.reasoning || d.rationale;
                  const trade = d.alternatives || d.tradeoff;
                  return (
                    <div className="ds-decision" key={i}>
                      <h4>{d.decision}</h4>
                      {why && <p>{why}</p>}
                      {trade && <p className="ds-tradeoff">Trade-off: {trade}</p>}
                    </div>
                  );
                })}
              </div>
            )}
            <div className="sw-snippets">
              {snippets.map((s, i) => <CodeBlock key={i} snippet={s} />)}
            </div>
          </div>
        )}

        {active === "demo" && demo?.kind === "iframe" && (
          <div className="sw-demo">
            <div className="sw-demo-frame">
              <iframe src={demo.url} title={`${project.title} live demo`} loading="lazy" />
            </div>
            <a className="sw-btn primary" href={demo.url} target="_blank" rel="noreferrer">
              Open the live demo ↗
            </a>
            <p className="sw-demo-note mono xs muted">
              Embedded from the deployed project. If it does not load here, open it in a new tab.
            </p>
          </div>
        )}

        {active === "demo" && demo?.kind === "report" && (
          <div className="sw-demo">
            <p className="sw-report-note mono xs upper muted">{demo.note}</p>
            <div className="sw-report">
              <h3 className="ds-h3" style={{ marginTop: 0 }}>{demo.title}</h3>
              <ul className="sw-findings">
                {demo.findings.map((f, i) => (
                  <li key={i} className={`sw-finding v-${f.verdict.toLowerCase()}`}>
                    <span className="sw-verdict">{f.verdict}</span>
                    <span className="sw-finding-text">{f.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            {demo.sourceUrl && (
              <a className="sw-btn" href={demo.sourceUrl} target="_blank" rel="noreferrer">
                Run it yourself on GitHub ↗
              </a>
            )}
          </div>
        )}

        {active === "demo" && demo?.kind === "compare" && (
          <div className="sw-demo">
            <p className="ds-prose" style={{ maxWidth: "62ch" }}>
              Drag the slider to compare a raw broadcast frame against the same frame after YOLOv8 detection and ByteTrack ID assignment. Real La Liga footage, run through the pipeline.
            </p>
            <div className="sw-compare-grid">
              {demo.pairs.map((p, i) => (
                <BeforeAfter key={i} before={p.before} after={p.after} label={p.label} beforeLabel="Raw frame" afterLabel="Detected + tracked" />
              ))}
            </div>
            {demo.liveUrl && (
              <a className="sw-btn primary" href={demo.liveUrl} target="_blank" rel="noreferrer">
                Open the live demo ↗
              </a>
            )}
          </div>
        )}
      </div>

      <footer className="ds-foot">
        <Link href="/projects" className="ds-back">
          <ArrowLeft className="w-3 h-3" />
          More work
        </Link>
      </footer>
    </article>
  );
}
