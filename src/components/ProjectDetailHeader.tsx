"use client";

import type { Project } from "@/lib/definitions";
import { UI_COPY } from "@/data/profile";
import { motion } from "framer-motion";
import { ExternalLink, Code2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function ProjectHeader({ project }: { project: Project }) {
  const description = project.summary;

  return (
    <motion.header
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 border-b border-[var(--border)] pb-12"
    >
      <div className="space-y-4">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {UI_COPY.project.back}
        </Link>

        <div className="flex flex-wrap items-center gap-3 text-sm font-mono text-[var(--text-muted)]">
          <span className="px-2 py-1 rounded bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--accent)]">
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

        <h1 className="text-4xl md:text-6xl font-bold text-[var(--text-primary)] tracking-tight">
          {project.title}
        </h1>
        <p className="text-xl md:text-2xl text-[var(--text-secondary)] max-w-3xl leading-relaxed font-light">
          {description}
        </p>
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {project.tech.map((tech) => (
            <span
              key={tech}
              className="px-3 py-1 text-xs font-mono rounded-full bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border border-[var(--border)]"
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text-primary)] transition-colors"
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--accent)] text-[var(--bg-primary)] font-semibold hover:bg-[var(--accent-hover)] transition-colors"
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text-primary)] transition-colors"
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text-primary)] transition-colors"
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
