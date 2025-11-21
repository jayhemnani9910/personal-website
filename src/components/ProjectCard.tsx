"use client";

import { motion, useMotionTemplate, useMotionValue, useTransform } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { Project } from "@/data/types";
import { MouseEvent } from "react";
import Link from "next/link";

export function ProjectCard({ project, className = "" }: { project: Project; className?: string }) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const description = project.summary || project.headline;
    const rotateX = useTransform(mouseY, [0, 400], [5, -5]);
    const rotateY = useTransform(mouseX, [0, 400], [-5, 5]);

    function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <Link href={`/projects/${project.id}`} className="block h-full">
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.02, rotateX: 2, rotateY: 2 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                onMouseMove={handleMouseMove}
                style={{ perspective: 1000, rotateX, rotateY }}
                className={`group relative flex flex-col h-full glass-card glass-card-hover overflow-hidden rounded-3xl ${className}`}
            >
                {/* Spotlight Effect */}
                <motion.div
                    className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
                    style={{
                        background: useMotionTemplate`
            radial-gradient(
              400px circle at ${mouseX}px ${mouseY}px,
              rgba(255,255,255,0.06),
              transparent 80%
            )
          `,
                    }}
                />

                <div className="relative flex flex-col h-full p-8 md:p-10 z-10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1 group-hover:text-[var(--color-accent-primary)] transition-colors">
                                {project.title}
                            </h3>
                            <p className="text-xs font-mono text-[var(--color-accent-cyan)] mb-2">
                                {project.role}
                            </p>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                            <ExternalLink className="w-4 h-4 text-[var(--color-text-muted)]" />
                        </div>
                    </div>

                    <p className="text-[var(--color-text-secondary)] mb-6 leading-relaxed flex-grow">
                        {description}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-auto">
                        {project.tech.slice(0, 4).map((tech) => (
                            <span
                                key={tech}
                                className="px-3 py-1 text-xs font-medium rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.05)] text-[var(--color-text-muted)] group-hover:border-[rgba(255,255,255,0.1)] group-hover:text-[var(--color-text-secondary)] transition-colors"
                            >
                                {tech}
                            </span>
                        ))}
                        {project.tech.length > 4 && (
                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-[rgba(255,255,255,0.05)] text-[var(--color-text-muted)]">
                                +{project.tech.length - 4}
                            </span>
                        )}
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}
