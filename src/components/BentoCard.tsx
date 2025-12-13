"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { Project } from "@/lib/definitions";
import { ProjectSummary } from "@/lib/content";
import { getProjectGradientByType } from "@/lib/generativeArt";
import { hoverScale, hoverGlow, springStiff } from "@/lib/animation";

interface BentoCardProps {
    project: Project | ProjectSummary;
    className?: string;
}

/**
 * BentoCard Component
 * 
 * Individual project card for the Bento Grid with:
 * - Generative art background (seeded by project ID)
 * - Spotlight hover effect (via CSS)
 * - Glass panel styling
 * - Tech stack badges
 * - Smooth scale animation on hover
 */
export function BentoCard({ project, className = "" }: BentoCardProps) {
    const gradient = getProjectGradientByType(project.id, project.tech);
    const description = (project as Project & { headline?: string }).headline ?? project.summary;

    return (
        <Link href={`/projects/${project.id}`} className={className}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ ...hoverScale, ...hoverGlow }}
                transition={springStiff}
                className="spotlight-card glass-panel glass-panel-hover crystal-card rounded-2xl p-6 min-h-[280px] relative overflow-hidden group cursor-pointer h-full"
            >
                {/* Generative Art Background */}
                <div
                    className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500"
                    style={{ background: gradient }}
                />

                {/* Content Layer */}
                <div className="relative z-10 h-full flex flex-col justify-between">
                    {/* Header */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="w-2 h-2 rounded-full bg-[var(--neon-cyan)] shadow-[0_0_10px_var(--neon-cyan)]" />
                            <span className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider">
                                {project.role}
                            </span>
                        </div>

                        <h3 className="text-2xl font-bold mb-3 tracking-tight group-hover:text-[var(--neon-cyan)] transition-colors duration-300">
                            {project.title}
                        </h3>

                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                            {description}
                        </p>
                    </div>

                    {/* Tech Stack Pills */}
                    <div className="flex flex-wrap gap-2 mt-4">
                        {project.tech.slice(0, 3).map((tech) => (
                            <span
                                key={tech}
                                className="px-2 py-1 text-xs font-mono rounded bg-[var(--bg-abyss)] border border-[var(--glass-border)] text-[var(--text-secondary)] hover:border-[var(--neon-cyan)] hover:text-[var(--neon-cyan)] transition-colors"
                            >
                                {tech}
                            </span>
                        ))}
                        {project.tech.length > 3 && (
                            <span className="px-2 py-1 text-xs font-mono text-[var(--text-muted)]">
                                +{project.tech.length - 3} more
                            </span>
                        )}
                    </div>
                </div>

                {/* Hover Indicator */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        className="text-[var(--neon-cyan)]"
                    >
                        <path
                            d="M4 10h12m0 0l-4-4m4 4l-4 4"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            </motion.div>
        </Link>
    );
}
