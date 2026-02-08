"use client";

import type { Project, DeepDive, CodeSnippet, Learning, Component, KeyDecision } from "@/lib/definitions";
import type { ArchitectureData, ArchitectureNode, ProjectMedia, Metric } from "@/data/types";
import { UI_COPY } from "@/data/profile";
import { motion } from "framer-motion";
import {
  ExternalLink,
  Code2,
  ArrowLeft,
  Activity,
  Network,
  AlertTriangle,
  Smartphone,
  Lightbulb,
  GitBranch,
  Target,
  BookOpen,
  ChartNoAxesCombined
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { typeColors as architectureColors } from "./ArchitectureVisualizer";
import { TableOfContents } from "./TableOfContents";
import { ProofBlock } from "./ProofBlock";

const ArchitectureVisualizer = dynamic(
  () => import("./ArchitectureVisualizer").then((mod) => mod.ArchitectureVisualizer),
  { ssr: false }
);

// Code block component for technical deep dives
function CodeBlock({ snippet }: { snippet: CodeSnippet }) {
  const title = snippet.title || snippet.label || 'Code';
  const language = snippet.language || snippet.lang || '';
  const explanation = snippet.explanation || snippet.description;

  return (
    <div className="rounded-lg overflow-hidden border border-[var(--color-border)] bg-[#0d1117]">
      <div className="px-4 py-2 bg-[var(--color-bg-tertiary)] border-b border-[var(--color-border)] flex items-center justify-between">
        <span className="text-xs text-[var(--color-text-muted)] font-mono">{title}</span>
        {language && <span className="text-xs text-[var(--color-text-muted)] font-mono opacity-60">{language}</span>}
      </div>
      <pre className="p-4 overflow-x-auto text-sm">
        <code className="text-[#e6edf3] font-mono whitespace-pre">{snippet.code}</code>
      </pre>
      {explanation && (
        <div className="px-4 py-3 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)]">
          <p className="text-sm text-[var(--color-text-secondary)]">{explanation}</p>
        </div>
      )}
    </div>
  );
}

export function ProjectDetail({ project }: { project: Project }) {
  type ProjectWithExtras = Project & {
    architecture?: ArchitectureData & {
      description?: string;
      legend?: { label: string; type: ArchitectureNode["type"] }[];
    };
    headline?: string;
    media?: ProjectMedia[];
    metrics?: Metric[];
  };

  const richProject = project as ProjectWithExtras;
  const deepDive = project.deepDive;

  // Build dynamic table of contents based on available content
  const mediaItems = richProject.media;
  const architecture = richProject.architecture;
  const legendItems = architecture?.legend;
  const metrics = richProject.metrics;

  const tocSections = [
    { id: "intro", label: "Overview" },
    { id: "problem", label: "The Problem" },
    { id: "solution", label: "How It Works" },
    // Technical sections (shown if deepDive content exists)
    ...(deepDive?.keyDecisions?.length || deepDive?.codeSnippets?.length
      ? [{ id: "technical", label: "Technical Deep Dive" }]
      : []),
    { id: "impact", label: "Results & Impact" },
    ...(deepDive?.learnings?.length ? [{ id: "learnings", label: "Key Learnings" }] : []),
    ...(mediaItems && mediaItems.length > 0 ? [{ id: "media", label: "Screens & Demos" }] : []),
  ];

  return (
    <main className="min-h-screen pt-24 px-6 pb-16 relative z-10 bg-[#050505]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto space-y-16">
        <Header project={project} />

        <div className="grid lg:grid-cols-[1fr,3fr] gap-12 items-start">
          <aside className="hidden lg:block sticky top-32">
            <TableOfContents sections={tocSections} />
          </aside>

          <div className="space-y-20">
            {/* Section 1: Overview (Intro - Everyone reads this) */}
            <section id="intro" className="scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-[var(--color-accent-primary)]" />
                  Overview
                </h2>
                <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed max-w-3xl">
                  {project.summary}
                </p>
              </motion.div>
            </section>

            {/* Section 2: The Problem (Context - Most people read this) */}
            <section id="problem" className="scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-[var(--color-accent-primary)]" />
                  The Problem
                </h2>
                <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed">
                  {project.challenge}
                </p>

                {/* Extended context for deeper understanding */}
                {deepDive?.context && (
                  <div className="mt-6 p-6 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                    <p className="text-[var(--color-text-secondary)] leading-relaxed">
                      {deepDive.context}
                    </p>
                  </div>
                )}
              </motion.div>
            </section>

            {/* Section 3: How It Works (Architecture - Technical folks continue) */}
            <section id="solution" className="scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="space-y-8"
              >
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-3">
                  <Network className="w-6 h-6 text-[var(--neon-cyan)]" />
                  How It Works
                </h2>

                {/* Solution points */}
                <ul className="space-y-4">
                  {project.solution.map((item, idx) => (
                    <li key={idx} className="flex gap-4 text-[var(--color-text-secondary)]">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-accent-cyan)]/10 text-[var(--color-accent-cyan)] flex items-center justify-center text-sm font-medium">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>

                {/* Architecture description from deepDive */}
                {deepDive?.architecture && (
                  <div className="mt-8 space-y-4">
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Architecture</h3>
                    <p className="text-[var(--color-text-secondary)] leading-relaxed">
                      {deepDive.architecture}
                    </p>
                  </div>
                )}

                {/* Components list */}
                {deepDive?.components && (
                  typeof deepDive.components === 'string' ? (
                    <div className="mt-6 p-4 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                      <p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-wrap">{deepDive.components}</p>
                    </div>
                  ) : deepDive.components.length > 0 && (
                    <div className="grid sm:grid-cols-2 gap-3 mt-6">
                      {deepDive.components.map((component, idx) => {
                        const isStructured = typeof component === 'object';
                        return (
                          <div
                            key={idx}
                            className="p-4 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]"
                          >
                            {isStructured ? (
                              <div className="space-y-2">
                                <h4 className="font-semibold text-[var(--color-text-primary)] text-sm">
                                  {(component as { name: string }).name}
                                </h4>
                                {(component as { purpose?: string }).purpose && (
                                  <p className="text-sm text-[var(--color-text-secondary)]">
                                    {(component as { purpose?: string }).purpose}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-[var(--color-text-secondary)]">{component as string}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )
                )}

                {/* Data flow */}
                {deepDive?.dataFlow && (
                  <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-[var(--color-bg-secondary)] to-transparent border border-[var(--color-border)]">
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3 flex items-center gap-2">
                      <GitBranch className="w-5 h-5 text-[var(--color-accent-cyan)]" />
                      Data Flow
                    </h3>
                    {Array.isArray(deepDive.dataFlow) ? (
                      <ul className="space-y-3">
                        {deepDive.dataFlow.map((step, i) => {
                          const isStructured = typeof step === 'object';
                          return (
                            <li key={i} className="flex gap-3 text-[var(--color-text-secondary)]">
                              <span className="text-[var(--color-accent-cyan)] font-mono">{i + 1}.</span>
                              {isStructured ? (
                                <div>
                                  <span className="font-medium text-[var(--color-text-primary)]">
                                    {(step as { step: string }).step}
                                  </span>
                                  {(step as { detail?: string }).detail && (
                                    <p className="text-sm mt-1 text-[var(--color-text-muted)]">
                                      {(step as { detail?: string }).detail}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span>{step as string}</span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <p className="text-[var(--color-text-secondary)] leading-relaxed">
                        {deepDive.dataFlow}
                      </p>
                    )}
                  </div>
                )}

                {/* Visual architecture diagram */}
                {architecture?.nodes?.length ? (
                  <ProofBlock title="System Architecture">
                    {architecture.description && (
                      <p className="text-sm text-[var(--text-secondary)] mb-4">
                        {architecture.description}
                      </p>
                    )}
                    <ArchitectureVisualizer data={architecture} />
                    {legendItems && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {legendItems.map((item: { label: string; type: ArchitectureNode["type"] }) => (
                          <span key={item.label} className="chip">
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: architectureColors[item.type as keyof typeof architectureColors] ?? "var(--neon-cyan)" }}
                            />
                            {item.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </ProofBlock>
                ) : null}
              </motion.div>
            </section>

            {/* Section 4: Technical Deep Dive (Engineers dig in) */}
            {(deepDive?.keyDecisions?.length || deepDive?.codeSnippets?.length) && (
              <section id="technical" className="scroll-mt-32">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className="space-y-10"
                >
                  <h2 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-3">
                    <Code2 className="w-6 h-6 text-[var(--color-accent-purple)]" />
                    Technical Deep Dive
                  </h2>

                  {/* Key Decisions */}
                  {deepDive?.keyDecisions && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Key Decisions & Trade-offs</h3>
                      {typeof deepDive.keyDecisions === 'string' ? (
                        <div className="p-5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                          <p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-wrap">{deepDive.keyDecisions}</p>
                        </div>
                      ) : deepDive.keyDecisions.length > 0 && (
                        <div className="space-y-4">
                          {deepDive.keyDecisions.map((item, idx) => {
                            const explanation = item.reasoning || item.rationale;
                            const tradeoffText = item.alternatives || item.tradeoff;
                            return (
                              <div
                                key={idx}
                                className="p-5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] space-y-3"
                              >
                                <h4 className="font-semibold text-[var(--color-text-primary)]">
                                  {item.decision}
                                </h4>
                                {explanation && (
                                  <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                                    {explanation}
                                  </p>
                                )}
                                {tradeoffText && (
                                  <p className="text-xs text-[var(--color-text-muted)] italic">
                                    Trade-off: {tradeoffText}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Code Snippets */}
                  {deepDive?.codeSnippets && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Code Highlights</h3>
                      {typeof deepDive.codeSnippets === 'string' ? (
                        <div className="p-4 rounded-lg bg-[#0d1117] border border-[var(--color-border)]">
                          <pre className="text-sm text-[#e6edf3] whitespace-pre-wrap">{deepDive.codeSnippets}</pre>
                        </div>
                      ) : deepDive.codeSnippets.length > 0 && (
                        <div className="space-y-6">
                          {deepDive.codeSnippets.map((snippet, idx) => (
                            <CodeBlock key={idx} snippet={snippet} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </section>
            )}

            {/* Section 5: Results & Impact */}
            <section id="impact" className="scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="space-y-8"
              >
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-3">
                  <Activity className="w-6 h-6 text-[var(--color-accent-purple)]" />
                  Results & Impact
                </h2>

                {/* Impact cards */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {project.impact.map((item, idx) => (
                    <ProofBlock key={idx} className="h-full">
                      <div className="flex gap-3 h-full">
                        <Target className="w-5 h-5 text-[var(--color-accent-purple)] flex-shrink-0 mt-0.5" />
                        <span className="text-[var(--color-text-secondary)]">{item}</span>
                      </div>
                    </ProofBlock>
                  ))}
                </div>

                {/* Deep dive metrics with context */}
                {deepDive?.metrics && (
                  typeof deepDive.metrics === 'string' ? (
                    <div className="mt-8 p-4 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                      <p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-wrap">{deepDive.metrics}</p>
                    </div>
                  ) : deepDive.metrics.length > 0 && (
                    // Check if first item is a string (array of strings) or object (structured metrics)
                    typeof deepDive.metrics[0] === 'string' ? (
                      <div className="mt-8 space-y-3">
                        {(deepDive.metrics as string[]).map((metric, i) => (
                          <div key={i} className="flex gap-3 items-start p-3 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                            <ChartNoAxesCombined className="w-4 h-4 text-[var(--color-accent-purple)] flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-[var(--color-text-secondary)]">{metric}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                        {(deepDive.metrics as { value: string; label: string; context?: string }[]).map((metric, i) => (
                          <div key={i} className="glass p-4 rounded-xl border border-[var(--color-border)] text-center">
                            <div className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] mb-1">
                              {metric.value}
                            </div>
                            <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
                              {metric.label}
                            </div>
                            {metric.context && (
                              <div className="text-xs text-[var(--color-text-muted)] mt-2 opacity-75">
                                {metric.context}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )
                  )
                )}

                {/* Fallback to old metrics format */}
                {!deepDive?.metrics && metrics && metrics.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {metrics.map((metric, i) => (
                      <div key={i} className="glass p-4 rounded-xl border border-[var(--color-border)] text-center">
                        <div className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] mb-1">
                          {metric.value}
                        </div>
                        <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
                          {metric.label}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </section>

            {/* Section 6: Key Learnings */}
            {deepDive?.learnings && (
              <section id="learnings" className="scroll-mt-32">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-3">
                    <Lightbulb className="w-6 h-6 text-yellow-500" />
                    Key Learnings
                  </h2>
                  {typeof deepDive.learnings === 'string' ? (
                    <div className="p-4 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                      <p className="text-[var(--color-text-secondary)] whitespace-pre-wrap">{deepDive.learnings}</p>
                    </div>
                  ) : deepDive.learnings.length > 0 && (
                    <div className="space-y-4">
                      {deepDive.learnings.map((learning, idx) => {
                        const isStructured = typeof learning === 'object';
                        type LearningObj = { insight?: string; learning?: string; lesson?: string; title?: string; description?: string; detail?: string };
                        const title = isStructured
                          ? ((learning as LearningObj).insight ||
                             (learning as LearningObj).learning ||
                             (learning as LearningObj).lesson ||
                             (learning as LearningObj).title)
                          : null;
                        const desc = isStructured
                          ? ((learning as LearningObj).description || (learning as LearningObj).detail)
                          : null;
                        return (
                          <div
                            key={idx}
                            className="flex gap-4 p-4 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]"
                          >
                            <span className="text-yellow-500 text-lg flex-shrink-0">→</span>
                            {isStructured && title ? (
                              <div className="space-y-2">
                                <h4 className="font-semibold text-[var(--color-text-primary)]">
                                  {title}
                                </h4>
                                {desc && (
                                  <p className="text-[var(--color-text-secondary)] leading-relaxed text-sm">
                                    {desc}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-[var(--color-text-secondary)] leading-relaxed">{learning as string}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Future work */}
                  {deepDive.futureWork && (
                    <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-[var(--color-bg-secondary)] to-transparent border border-[var(--color-border)] border-dashed">
                      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Future Improvements</h3>
                      {typeof deepDive.futureWork === 'string' ? (
                        <p className="text-sm text-[var(--color-text-muted)] whitespace-pre-wrap">{deepDive.futureWork}</p>
                      ) : deepDive.futureWork.length > 0 && (
                        <ul className="space-y-2">
                          {deepDive.futureWork.map((item, idx) => (
                            <li key={idx} className="flex gap-2 text-sm text-[var(--color-text-muted)]">
                              <span>○</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </motion.div>
              </section>
            )}

            {/* Media */}
            {mediaItems && mediaItems.length > 0 && (
              <section id="media" className="scroll-mt-32 space-y-8">
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-3">
                  <Smartphone className="w-6 h-6 text-[var(--color-accent-primary)]" />
                  Screens & Demos
                </h2>
                <div className="space-y-8">
                  {mediaItems.map((media, idx) => (
                    <ProofBlock key={idx} title={media.caption}>
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-[var(--color-bg-tertiary)]">
                        {media.kind === "image" && (
                          <Image
                            src={media.src}
                            alt={media.alt || project.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 70vw, 900px"
                            className="object-cover"
                          />
                        )}
                        {media.kind === "video" && (
                          <video
                            src={media.src}
                            poster={media.poster}
                            controls
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    </ProofBlock>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function Header({ project }: { project: Project }) {
  const description = (project as Project & { headline?: string }).headline ?? project.summary;

  return (
    <motion.header
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 border-b border-white/10 pb-12"
    >
      <div className="space-y-4">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)] transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {UI_COPY.project.back}
        </Link>

        <div className="flex flex-wrap items-center gap-3 text-sm font-mono text-[var(--color-text-muted)]">
          <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[var(--color-accent-primary)]">
            {project.role}
          </span>
          {project.period && (
            <>
              <span>•</span>
              <span>{project.period}</span>
            </>
          )}
          {project.domain && (
            <>
              <span>•</span>
              <span>{project.domain}</span>
            </>
          )}
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-[var(--color-text-primary)] tracking-tight">
          {project.title}
        </h1>
        <p className="text-xl md:text-2xl text-[var(--color-text-secondary)] max-w-3xl leading-relaxed font-light">
          {description}
        </p>
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {project.tech.map((tech) => (
            <span
              key={tech}
              className="px-3 py-1 text-xs font-mono rounded-full bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] border border-[var(--color-border)]"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="flex gap-3">
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] text-[var(--color-text-primary)] transition-colors"
            >
              <Code2 className="w-4 h-4" />
              {UI_COPY.project.code}
            </a>
          )}
          {project.links?.demo && (
            <a
              href={project.links.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--color-accent-primary)] text-[var(--color-bg-primary)] font-semibold hover:bg-[var(--color-accent-secondary)] transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              {UI_COPY.project.demo}
            </a>
          )}
          {project.links?.code && !project.github && (
            <a
              href={project.links.code}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] text-[var(--color-text-primary)] transition-colors"
            >
              <Code2 className="w-4 h-4" />
              {UI_COPY.project.code}
            </a>
          )}
          {project.links?.paper && (
            <a
              href={project.links.paper}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] text-[var(--color-text-primary)] transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              {UI_COPY.project.paper}
            </a>
          )}
        </div>
      </div>
    </motion.header>
  );
}
