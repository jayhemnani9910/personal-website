"use client";

import type { Project } from "@/data/types";
import { UI_COPY } from "@/data/profile";
import { motion } from "framer-motion";
import { ExternalLink, Code2, ArrowLeft, Sparkles, ClipboardList, Activity, Network } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { ArchitectureVisualizer, typeColors as architectureColors } from "./ArchitectureVisualizer";

export function ProjectDetail({ project }: { project: Project }) {
  return (
    <main className="min-h-screen pt-24 px-6 pb-16">
      <div className="max-w-6xl mx-auto space-y-10">
        <Header project={project} />
        <Content project={project} />
      </div>
    </main>
  );
}

function Header({ project }: { project: Project }) {
  const description = project.summary || project.headline;

  return (
    <motion.header
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-text-muted)]">
        <Link
          href="/#projects"
          className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)]"
        >
          <ArrowLeft className="w-4 h-4" />
          {UI_COPY.project.back}
        </Link>
        <span>•</span>
        <span className="mono">{project.role}</span>
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

      <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-text-primary)]">
        {project.title}
      </h1>
      <p className="text-xl text-[var(--color-text-secondary)] max-w-4xl">
        {description}
      </p>

      <div className="flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="chip"
          >
            {tag}
          </span>
        ))}
      </div>

      {project.links && (project.links.code || project.links.demo || project.links.paper) && (
        <div className="flex gap-3">
          {project.links.code && (
            <a
              href={project.links.code}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] text-[var(--color-text-primary)]"
            >
              <Code2 className="w-4 h-4" />
              {UI_COPY.project.code}
            </a>
          )}
          {project.links.demo && (
            <a
              href={project.links.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-accent-primary)] text-[var(--color-bg-primary)] font-semibold hover:bg-[var(--color-accent-secondary)]"
            >
              <ExternalLink className="w-4 h-4" />
              {UI_COPY.project.demo}
            </a>
          )}
          {project.links.paper && (
            <a
              href={project.links.paper}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] hover:border-[var(--color-accent-primary)] text-[var(--color-text-primary)]"
            >
              <ExternalLink className="w-4 h-4" />
              {UI_COPY.project.paper}
            </a>
          )}
        </div>
      )}
    </motion.header>
  );
}

function Content({ project }: { project: Project }) {
  return (
    <div className="grid lg:grid-cols-[2fr,1fr] gap-8 items-start">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <Block
          icon={<ClipboardList className="w-5 h-5 text-[var(--color-accent-primary)]" />}
          title={UI_COPY.project.challenge}
        >
          <p className="text-[var(--color-text-secondary)] leading-relaxed">{project.challenge}</p>
        </Block>

        <Block
          icon={<Sparkles className="w-5 h-5 text-[var(--color-accent-primary)]" />}
          title={UI_COPY.project.solution}
        >
          <ul className="space-y-2">
            {project.solution.map((item, idx) => (
              <li key={idx} className="flex gap-3 text-[var(--color-text-secondary)]">
                <span className="text-[var(--color-accent-cyan)] mt-1.5">▸</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Block>

        <Block
          icon={<Activity className="w-5 h-5 text-[var(--color-accent-primary)]" />}
          title={UI_COPY.project.impact}
        >
          <ul className="space-y-2">
            {project.impact.map((item, idx) => (
              <li key={idx} className="flex gap-3 text-[var(--color-text-secondary)]">
                <span className="text-[var(--color-accent-purple)] mt-1.5">◦</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Block>

        {project.media && project.media.length > 0 && (
          <div className="space-y-6">
            {project.media.map((media, idx) => (
              <div key={idx} className="space-y-2">
                <div className="relative aspect-video rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-tertiary)]">
                  {media.kind === "image" && (
                    <Image
                      src={media.src}
                      alt={media.alt || project.title}
                      fill
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
                {media.caption && (
                  <p className="text-sm text-[var(--color-text-muted)] text-center italic">
                    {media.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {project.architecture?.nodes?.length ? (
          <Block
            title="System Architecture"
            icon={<Network className="w-5 h-5 text-[var(--neon-cyan)]" />}
          >
            {project.architecture.description && (
              <p className="text-sm text-[var(--text-secondary)] mb-4">
                {project.architecture.description}
              </p>
            )}
            <ArchitectureVisualizer data={project.architecture} />
            {project.architecture.legend && (
              <div className="flex flex-wrap gap-2 mt-4">
                {project.architecture.legend.map((item) => (
                  <span key={item.label} className="chip">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: architectureColors[item.type] ?? "var(--neon-cyan)" }}
                    />
                    {item.label}
                  </span>
                ))}
              </div>
            )}
          </Block>
        ) : null}
      </motion.section>

      <motion.aside
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <SideCard title={UI_COPY.project.techStack}>
          <div className="flex flex-wrap gap-2">
            {project.tech.map((tech) => (
              <span
                key={tech}
                className="px-2 py-1 text-xs mono rounded bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] border border-[var(--color-border)]"
              >
                {tech}
              </span>
            ))}
          </div>
        </SideCard>

        {project.metrics && project.metrics.length > 0 && (
          <SideCard title={UI_COPY.project.metrics}>
            <ul className="space-y-2">
              {project.metrics.map((metric, i) => (
                <li key={i} className="text-[var(--color-text-secondary)]">
                  <span className="font-semibold text-[var(--color-text-primary)]">{metric.value}</span>{" "}
                  {metric.label}
                  {metric.context ? ` — ${metric.context}` : ""}
                </li>
              ))}
            </ul>
          </SideCard>
        )}

        {project.links && (project.links.demo || project.links.code || project.links.paper) && (
          <SideCard title={UI_COPY.project.links}>
            <div className="flex flex-col gap-2">
              {project.links.code && (
                <a
                  href={project.links.code}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[var(--color-accent-primary)] hover:text-[var(--color-accent-secondary)]"
                >
                  <Code2 className="w-4 h-4" />
                  {UI_COPY.project.code}
                </a>
              )}
              {project.links.demo && (
                <a
                  href={project.links.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[var(--color-accent-primary)] hover:text-[var(--color-accent-secondary)]"
                >
                  <ExternalLink className="w-4 h-4" />
                  {UI_COPY.project.demo}
                </a>
              )}
              {project.links.paper && (
                <a
                  href={project.links.paper}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[var(--color-accent-primary)] hover:text-[var(--color-accent-secondary)]"
                >
                  <ExternalLink className="w-4 h-4" />
                  {UI_COPY.project.paper}
                </a>
              )}
            </div>
          </SideCard>
        )}
      </motion.aside>
    </div>
  );
}

function Block({
  title,
  icon,
  children
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="glass rounded-xl p-6 border border-[var(--color-border)] space-y-3">
      <div className="flex items-center gap-3">
        {icon}
        <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function SideCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="glass rounded-xl p-5 border border-[var(--color-border)] space-y-3">
      <h4 className="text-lg font-semibold text-[var(--color-text-primary)]">{title}</h4>
      {children}
    </div>
  );
}
