"use client";

import Link from "next/link";

import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useMousePosition } from "@/hooks/useMousePosition";
import { BentoCard } from "./BentoCard";
import { ProjectSummary } from "@/lib/content";

interface BentoGridProps {
    projects: ProjectSummary[];
}

export function BentoGrid({ projects }: BentoGridProps) {
    const gridRef = useRef<HTMLDivElement>(null);
    const mousePos = useMousePosition(gridRef);
    const prefersReducedMotion = useReducedMotion();

    const featuredProjects = projects.filter(p => p.featured);

    return (
        <section id="projects" className="relative section-block section-shell scroll-mt-28 md:scroll-mt-32">
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
                {featuredProjects.slice(0, 6).map((project, index) => (
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
                <Link
                    href="/projects"
                    className="inline-flex items-center gap-2 text-[var(--neon-cyan)] hover:text-[var(--neon-purple)] transition-colors font-mono text-sm group"
                >
                    <span>View All Projects</span>
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
                </Link>
            </motion.div>
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
        "md:col-span-2 md:row-span-1", // Wide (Hero)
        "md:col-span-1 md:row-span-1", // Square
        "md:col-span-1 md:row-span-2", // Tall
        "md:col-span-2 md:row-span-1", // Wide
        "md:col-span-1 md:row-span-1", // Square
        "md:col-span-2 md:row-span-1", // Wide
    ];
    return layouts[index] || "md:col-span-1 md:row-span-1";
}
