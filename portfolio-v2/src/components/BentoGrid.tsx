"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useMousePosition } from "@/hooks/useMousePosition";
import { BentoCard } from "./BentoCard";
import { FEATURED_PROJECTS, PROJECTS } from "@/data/projects";

/**
 * BentoGrid Component
 * 
 * Replacement for ProjectGallery with:
 * - CSS Grid layout with varying card sizes
 * - Mouse-tracking spotlight effect
 * - Featured project selection (first 6 projects)
 * - Responsive mobile layout (single column)
 */
export function BentoGrid() {
    const gridRef = useRef<HTMLDivElement>(null);
    const mousePos = useMousePosition(gridRef);
    const prefersReducedMotion = useReducedMotion();

    const featuredProjects = FEATURED_PROJECTS;
    const otherProjects = PROJECTS.filter((p) => !p.featured);

    return (
        <section id="projects" className="relative section-block section-shell">
            {/* Section Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="mb-16 text-center"
            >
                <div className="eyebrow mb-3">Selected Works</div>
                <p className="title-xl text-balance">
                    Data platforms, streaming analytics, and research builds.
                </p>
                <p className="body-base max-w-2xl mx-auto mt-4">
                    One data model → shared cards and case studies. Each card pulls straight from the same project definitions that feed the detail pages.
                </p>
            </motion.div>

            {/* Bento Grid with Mouse Tracking */}
            <div
                ref={gridRef}
                className="grid grid-cols-1 md:grid-cols-3 auto-rows-[280px] gap-4 relative"
                style={
                    !prefersReducedMotion ? {
                        "--mouse-x": `${mousePos.x}px`,
                        "--mouse-y": `${mousePos.y}px`,
                    } as React.CSSProperties : {}
                }
            >
                {featuredProjects.map((project, index) => (
                    <BentoCard
                        key={project.id}
                        project={project}
                        className={getBentoLayout(index)}
                    />
                ))}
            </div>

            {/* View All Projects Link */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-12 text-center"
            >
                <a
                    href="#project-catalog"
                    className="inline-flex items-center gap-2 text-[var(--neon-cyan)] hover:text-[var(--neon-purple)] transition-colors font-mono text-sm group"
                >
                    <span>View All {PROJECTS.length} Projects</span>
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        className="group-hover:translate-x-1 transition-transform"
                    >
                        <path
                            d="M3 8h10m0 0L9 4m4 4l-4 4"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </a>
            </motion.div>

            {otherProjects.length > 0 && (
                <div id="project-catalog" className="mt-14 space-y-6">
                    <div className="flex items-center gap-3">
                        <span className="w-8 h-[1px] bg-[var(--glass-border)]" />
                        <p className="text-sm uppercase tracking-[0.2em] text-[var(--text-muted)] font-mono">
                            More Projects
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {otherProjects.map((project) => (
                            <a
                                key={project.id}
                                href={`/projects/${project.id}`}
                                className="glass-card glass-card-hover rounded-xl p-4 flex items-start justify-between"
                            >
                                <div>
                                    <p className="text-xs font-mono text-[var(--text-muted)] mb-1">{project.role}</p>
                                    <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                                    <p className="text-sm text-[var(--text-secondary)] line-clamp-2">{project.summary}</p>
                                </div>
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    className="text-[var(--glass-border)]"
                                >
                                    <path
                                        d="M3 8h10m0 0L9 4m4 4-4 4"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}

/**
 * Get Bento Grid layout class for a given index.
 * Creates an interesting masonry-style layout with varying card sizes.
 * 
 * @param index - Card index in the grid
 * @returns Tailwind classes for grid positioning
 */
function getBentoLayout(index: number): string {
    const layouts = [
        "md:col-span-2 md:row-span-1", // Wide (first project - hero)
        "md:col-span-1 md:row-span-2", // Tall
        "md:col-span-1 md:row-span-1", // Normal
        "md:col-span-2 md:row-span-1", // Wide
        "md:col-span-1 md:row-span-1", // Normal
        "md:col-span-1 md:row-span-1", // Normal
    ];
    return layouts[index] || "md:col-span-1 md:row-span-1";
}
