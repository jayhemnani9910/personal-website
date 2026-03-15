"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BentoCard } from "./BentoCard";
import { ProjectSummary } from "@/lib/content";

interface BentoGridProps {
    projects: ProjectSummary[];
}

export function BentoGrid({ projects }: BentoGridProps) {
    const featuredProjects = projects
        .filter((p) => p.featured)
        .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));

    return (
        <section id="projects" className="section-block">
            {/* Animated Divider — line draws from center outward */}
            <div className="section-wide mb-12">
                <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="h-px bg-[var(--border)] origin-center"
                />
            </div>

            <div className="section-wide">
                {/* Header — slide in from left */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="mb-12"
                >
                    <span className="eyebrow mb-3 block">Selected Works</span>
                    <h2 className="title-xl">Projects</h2>
                </motion.div>

                {/* Bento Grid — staggered scale-in */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {featuredProjects.slice(0, 6).map((project, index) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 40, scale: 0.95 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{
                                duration: 0.5,
                                delay: index * 0.08,
                                ease: [0.25, 0.46, 0.45, 0.94],
                            }}
                            className={index < 2 ? "md:col-span-2" : ""}
                        >
                            <BentoCard
                                project={project}
                                size={index < 2 ? "large" : "standard"}
                            />
                        </motion.div>
                    ))}
                </div>

                {/* View All */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-12 text-center"
                >
                    <Link href="/projects" className="btn btn-secondary">
                        View All Projects
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
