"use client";

import { useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { ProjectCard } from "./ProjectCard";
import { PROJECTS } from "@/data/projects";
import MagneticButton from "./MagneticButton";
import { useRef } from "react";

const CardWrapper = ({ children, index }: { children: React.ReactNode; index: number }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: cardRef,
        offset: ["start end", "start start"],
    });

    const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

    return (
        <motion.div
            ref={cardRef}
            style={{
                scale,
                opacity,
                top: `calc(10vh + ${index * 20}px)`,
            }}
            className="sticky z-0"
        >
            {children}
        </motion.div>
    );
};

export function ProjectGallery() {
    const [activeFilter, setActiveFilter] = useState<string>("All");

    // Extract unique tags
    const allTags = Array.from(
        new Set(PROJECTS.flatMap((p) => p.tech))
    ).sort();
    const filters = ["All", ...allTags.slice(0, 6)]; // Limit to top 6 tags for cleaner UI

    const filteredProjects =
        activeFilter === "All"
            ? PROJECTS
            : PROJECTS.filter((p) => p.tech.includes(activeFilter));

    return (
        <section id="projects" className="relative py-32 container mx-auto px-4 overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_70%)] blur-[80px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative z-10 mb-16 text-center"
            >
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance tracking-tight leading-[1.05]">
                    Selected Works
                </h2>
                <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-10">
                    A collection of data engineering pipelines, analytics platforms, and
                    intelligent systems.
                </p>

                <div className="flex flex-wrap justify-center gap-2">
                    {filters.map((filter) => (
                        <MagneticButton key={filter}>
                            <button
                                onClick={() => setActiveFilter(filter)}
                                className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${activeFilter === filter
                                    ? "border-transparent text-[var(--color-bg-primary)]"
                                    : "border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[rgba(255,255,255,0.1)] shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]"
                                    }`}
                            >
                                {activeFilter === filter && (
                                    <motion.span
                                        layoutId="activeFilter"
                                        className="absolute inset-0 bg-[var(--color-text-primary)] rounded-full -z-10"
                                        transition={{ type: "spring", stiffness: 320, damping: 28 }}
                                    />
                                )}
                                <span>{filter}</span>
                            </button>
                        </MagneticButton>
                    ))}
                </div>
            </motion.div>

            <div className="relative z-10 flex flex-col gap-20">
                <AnimatePresence mode="popLayout">
                    {filteredProjects.map((project, index) => (
                        <CardWrapper key={project.id} index={index}>
                            <ProjectCard
                                project={project}
                                className="w-full"
                            />
                        </CardWrapper>
                    ))}
                </AnimatePresence>
            </div>
        </section>
    );
}
