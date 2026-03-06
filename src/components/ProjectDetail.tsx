"use client";

import type { Project } from "@/lib/definitions";
import type { ArchitectureData, ArchitectureNode, ProjectMedia, Metric } from "@/data/types";
import { motion } from "framer-motion";
import {
  Activity,
  Network,
  AlertTriangle,
  Smartphone,
  Lightbulb,
  GitBranch,
  Target,
  BookOpen,
  Code2,
  ChartNoAxesCombined
} from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { typeColors as architectureColors } from "./architectureColors";
import { TableOfContents } from "./TableOfContents";
import { ProofBlock } from "./ProofBlock";
import { ProjectHeader } from "./ProjectDetailHeader";
import { CodeBlock } from "./CodeBlock";

const ArchitectureVisualizer = dynamic(
  () => import("./ArchitectureVisualizer").then((mod) => mod.ArchitectureVisualizer),
  { ssr: false }
);

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
    <main className="min-h-screen pt-24 px-6 pb-16 relative z-10 bg-[var(--bg-primary)] backdrop-blur-xl">
      <div className="max-w-7xl mx-auto space-y-16">
        <ProjectHeader project={project} />

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
                <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-[var(--accent)]" />
                  Overview
                </h2>
                <p className="text-lg text-[var(--text-secondary)] leading-relaxed max-w-3xl">
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
                <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-[var(--accent)]" />
                  The Problem
                </h2>
                <p className="text-lg text-[var(--text-secondary)] leading-relaxed">
                  {project.challenge}
                </p>

                {/* Extended context for deeper understanding */}
                {deepDive?.context && (
                  <div className="mt-6 p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                    <p className="text-[var(--text-secondary)] leading-relaxed">
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
                <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
                  <Network className="w-6 h-6 text-[var(--neon-cyan)]" />
                  How It Works
                </h2>

                {/* Solution points */}
                <ul className="space-y-4">
                  {project.solution.map((item, idx) => (
                    <li key={idx} className="flex gap-4 text-[var(--text-secondary)]">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--neon-cyan)]/10 text-[var(--neon-cyan)] flex items-center justify-center text-sm font-medium">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>

                {/* Architecture description from deepDive */}
                {deepDive?.architecture && (
                  <div className="mt-8 space-y-4">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">Architecture</h3>
                    <p className="text-[var(--text-secondary)] leading-relaxed">
                      {deepDive.architecture}
                    </p>
                  </div>
                )}

                {/* Components list */}
                {deepDive?.components && (
                  typeof deepDive.components === 'string' ? (
                    <div className="mt-6 p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
                      <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">{deepDive.components}</p>
                    </div>
                  ) : deepDive.components.length > 0 && (
                    <div className="grid sm:grid-cols-2 gap-3 mt-6">
                      {deepDive.components.map((component, idx) => {
                        const isStructured = typeof component === 'object';
                        return (
                          <div
                            key={idx}
                            className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]"
                          >
                            {isStructured ? (
                              <div className="space-y-2">
                                <h4 className="font-semibold text-[var(--text-primary)] text-sm">
                                  {(component as { name: string }).name}
                                </h4>
                                {(component as { purpose?: string }).purpose && (
                                  <p className="text-sm text-[var(--text-secondary)]">
                                    {(component as { purpose?: string }).purpose}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-[var(--text-secondary)]">{component as string}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )
                )}

                {/* Data flow */}
                {deepDive?.dataFlow && (
                  <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-[var(--bg-secondary)] to-transparent border border-[var(--border)]">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                      <GitBranch className="w-5 h-5 text-[var(--neon-cyan)]" />
                      Data Flow
                    </h3>
                    {Array.isArray(deepDive.dataFlow) ? (
                      <ul className="space-y-3">
                        {deepDive.dataFlow.map((step, i) => {
                          const isStructured = typeof step === 'object';
                          return (
                            <li key={i} className="flex gap-3 text-[var(--text-secondary)]">
                              <span className="text-[var(--neon-cyan)] font-mono">{i + 1}.</span>
                              {isStructured ? (
                                <div>
                                  <span className="font-medium text-[var(--text-primary)]">
                                    {(step as { step: string }).step}
                                  </span>
                                  {(step as { detail?: string }).detail && (
                                    <p className="text-sm mt-1 text-[var(--text-muted)]">
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
                      <p className="text-[var(--text-secondary)] leading-relaxed">
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
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
                    <Code2 className="w-6 h-6 text-[var(--neon-purple)]" />
                    Technical Deep Dive
                  </h2>

                  {/* Key Decisions */}
                  {deepDive?.keyDecisions && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-[var(--text-primary)]">Key Decisions & Trade-offs</h3>
                      {typeof deepDive.keyDecisions === 'string' ? (
                        <div className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]">
                          <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">{deepDive.keyDecisions}</p>
                        </div>
                      ) : deepDive.keyDecisions.length > 0 && (
                        <div className="space-y-4">
                          {deepDive.keyDecisions.map((item, idx) => {
                            const explanation = item.reasoning || item.rationale;
                            const tradeoffText = item.alternatives || item.tradeoff;
                            return (
                              <div
                                key={idx}
                                className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)] space-y-3"
                              >
                                <h4 className="font-semibold text-[var(--text-primary)]">
                                  {item.decision}
                                </h4>
                                {explanation && (
                                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                                    {explanation}
                                  </p>
                                )}
                                {tradeoffText && (
                                  <p className="text-xs text-[var(--text-muted)] italic">
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
                      <h3 className="text-lg font-semibold text-[var(--text-primary)]">Code Highlights</h3>
                      {typeof deepDive.codeSnippets === 'string' ? (
                        <div className="p-4 rounded-lg bg-[#0d1117] border border-[var(--border)]">
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
                <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
                  <Activity className="w-6 h-6 text-[var(--neon-purple)]" />
                  Results & Impact
                </h2>

                {/* Impact cards */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {project.impact.map((item, idx) => (
                    <ProofBlock key={idx} className="h-full">
                      <div className="flex gap-3 h-full">
                        <Target className="w-5 h-5 text-[var(--neon-purple)] flex-shrink-0 mt-0.5" />
                        <span className="text-[var(--text-secondary)]">{item}</span>
                      </div>
                    </ProofBlock>
                  ))}
                </div>

                {/* Deep dive metrics with context */}
                {deepDive?.metrics && (
                  typeof deepDive.metrics === 'string' ? (
                    <div className="mt-8 p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
                      <p className="text-sm text-[var(--text-secondary)] whitespace-pre-wrap">{deepDive.metrics}</p>
                    </div>
                  ) : deepDive.metrics.length > 0 && (
                    // Check if first item is a string (array of strings) or object (structured metrics)
                    typeof deepDive.metrics[0] === 'string' ? (
                      <div className="mt-8 space-y-3">
                        {(deepDive.metrics as string[]).map((metric, i) => (
                          <div key={i} className="flex gap-3 items-start p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
                            <ChartNoAxesCombined className="w-4 h-4 text-[var(--neon-purple)] flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-[var(--text-secondary)]">{metric}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                        {(deepDive.metrics as { value: string; label: string; context?: string }[]).map((metric, i) => (
                          <div key={i} className="glass p-4 rounded-xl border border-[var(--border)] text-center">
                            <div className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-1">
                              {metric.value}
                            </div>
                            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
                              {metric.label}
                            </div>
                            {metric.context && (
                              <div className="text-xs text-[var(--text-muted)] mt-2 opacity-75">
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
                      <div key={i} className="glass p-4 rounded-xl border border-[var(--border)] text-center">
                        <div className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-1">
                          {metric.value}
                        </div>
                        <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
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
                  <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
                    <Lightbulb className="w-6 h-6 text-yellow-500" />
                    Key Learnings
                  </h2>
                  {typeof deepDive.learnings === 'string' ? (
                    <div className="p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]">
                      <p className="text-[var(--text-secondary)] whitespace-pre-wrap">{deepDive.learnings}</p>
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
                            className="flex gap-4 p-4 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)]"
                          >
                            <span className="text-yellow-500 text-lg flex-shrink-0">→</span>
                            {isStructured && title ? (
                              <div className="space-y-2">
                                <h4 className="font-semibold text-[var(--text-primary)]">
                                  {title}
                                </h4>
                                {desc && (
                                  <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
                                    {desc}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-[var(--text-secondary)] leading-relaxed">{learning as string}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Future work */}
                  {deepDive.futureWork && (
                    <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-[var(--bg-secondary)] to-transparent border border-[var(--border)] border-dashed">
                      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Future Improvements</h3>
                      {typeof deepDive.futureWork === 'string' ? (
                        <p className="text-sm text-[var(--text-muted)] whitespace-pre-wrap">{deepDive.futureWork}</p>
                      ) : deepDive.futureWork.length > 0 && (
                        <ul className="space-y-2">
                          {deepDive.futureWork.map((item, idx) => (
                            <li key={idx} className="flex gap-2 text-sm text-[var(--text-muted)]">
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
                <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-3">
                  <Smartphone className="w-6 h-6 text-[var(--accent)]" />
                  Screens & Demos
                </h2>
                <div className="space-y-8">
                  {mediaItems.map((media, idx) => (
                    <ProofBlock key={idx} title={media.caption}>
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-[var(--bg-tertiary)]">
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
