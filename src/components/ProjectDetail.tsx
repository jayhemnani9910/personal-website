"use client";

import type { Project } from "@/lib/definitions";
import type { ArchitectureData, ArchitectureNode, ProjectMedia, Metric } from "@/data/types";
import { UI_COPY } from "@/data/profile";
import { motion } from "framer-motion";
import { ExternalLink, Code2, ArrowLeft, Activity, Network, AlertTriangle, Smartphone } from "lucide-react";
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

  // Sections derived from the project content existence to be more robust
  const mediaItems = richProject.media;
  const architecture = richProject.architecture;
  const legendItems = architecture?.legend;
  const metrics = richProject.metrics;
  const tocSections = [
    { id: "problem", label: "The Problem" },
    { id: "solution", label: "Solution & Architecture" },
    { id: "impact", label: "Impact & Results" },
    ...(mediaItems && mediaItems.length > 0 ? [{ id: "media", label: "Screens & Demos" }] : []),
  ];

  return (
    <main className="min-h-screen pt-24 px-6 pb-16 relative z-10 bg-[#050505]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto space-y-16">
        <Header project={project} />

        <div className="grid lg:grid-cols-[1fr,3fr] gap-12 items-start">
          <aside className="hidden lg:block">
            <TableOfContents sections={tocSections} />
          </aside>

          <div className="space-y-16">
            {/* Problem & Challenge */}
            <section id="problem" className="scroll-mt-32 space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-[var(--color-accent-primary)]" />
                  The Problem
                </h2>
                <p className="text-lg text-[var(--color-text-secondary)] leading-relaxed">
                  {project.challenge}
                </p>
              </div>
            </section>

            {/* Solution & Architecture */}
            <section id="solution" className="scroll-mt-32 space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-3">
                  <Network className="w-6 h-6 text-[var(--neon-cyan)]" />
                  Solution & Architecture
                </h2>
                <ul className="space-y-3">
                  {project.solution.map((item, idx) => (
                    <li key={idx} className="flex gap-3 text-[var(--color-text-secondary)]">
                      <span className="text-[var(--color-accent-cyan)] mt-1.5">▸</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

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
            </section>

            {/* Impact */}
            <section id="impact" className="scroll-mt-32 space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-3">
                  <Activity className="w-6 h-6 text-[var(--color-accent-purple)]" />
                  Impact & Results
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {project.impact.map((item, idx) => (
                    <ProofBlock key={idx} className="h-full">
                      <div className="flex gap-3 h-full">
                        <span className="text-[var(--color-accent-purple)] mt-1">◦</span>
                        <span className="text-[var(--color-text-secondary)]">{item}</span>
                      </div>
                    </ProofBlock>
                  ))}
                </div>
              </div>

              {metrics && metrics.length > 0 && (
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
            </section>

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
          href="/#projects"
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

        {project.links && (project.links.code || project.links.demo || project.links.paper) && (
          <div className="flex gap-3">
            {project.links.demo && (
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
            {project.links.code && (
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
            {project.links.paper && (
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
        )}
      </div>
    </motion.header>
  );
}
