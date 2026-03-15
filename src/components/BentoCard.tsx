"use client";

import Link from "next/link";
import { Github } from "lucide-react";
import { motion, useTransform } from "framer-motion";
import type { Project } from "@/lib/definitions";
import { use3DTilt } from "@/hooks/use3DTilt";
import { ProjectSummary } from "@/lib/content";

interface BentoCardProps {
    project: Project | ProjectSummary;
    size?: "large" | "standard";
    className?: string;
}

export function BentoCard({ project, size = "standard", className = "" }: BentoCardProps) {
    const description = project.summary;
    const isLarge = size === "large";
    const maxTechTags = isLarge ? 5 : 3;
    const { cardRef, rotateX, rotateY, glowX, glowY, handleMouseMove, handleMouseLeave } = use3DTilt(6);

    return (
        <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformPerspective: 800,
                transformStyle: "preserve-3d",
            }}
            whileHover={{
                y: -8,
                transition: { type: "spring", stiffness: 300, damping: 25 },
            }}
            className={`block group/card ${className}`}
        >
            <div
                className={`relative card h-full flex flex-col overflow-hidden transition-[border-color,box-shadow] duration-300 hover:border-[var(--accent)]/40 hover:shadow-[0_20px_60px_-15px_rgba(var(--accent-rgb,10,132,255),0.15)] ${
                    isLarge ? "p-8" : "p-6"
                }`}
            >
                {/* Glow spot that follows cursor */}
                <motion.div
                    className="absolute inset-0 opacity-0 group-hover/card:opacity-100 pointer-events-none transition-opacity duration-300"
                    style={{
                        background: useTransform(
                            [glowX, glowY],
                            ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, rgba(var(--accent-rgb, 10, 132, 255), 0.08) 0%, transparent 60%)`
                        ),
                    }}
                />

                {/* Role */}
                <span className="eyebrow mb-3 relative z-10">{project.role}</span>

                {/* Title */}
                <Link href={`/projects/${project.id}`} className="group relative z-10">
                    <h3
                        className={`font-semibold mb-2 text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors ${
                            isLarge ? "text-2xl lg:text-3xl" : "text-xl"
                        }`}
                    >
                        {project.title}
                    </h3>
                </Link>

                {/* Description */}
                <p
                    className={`body-sm mb-4 flex-1 relative z-10 ${
                        isLarge ? "line-clamp-3" : "line-clamp-2"
                    }`}
                >
                    {description}
                </p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-[var(--border)] relative z-10">
                    {project.tech.slice(0, maxTechTags).map((tech) => (
                        <span key={tech} className="chip transition-transform duration-200 hover:scale-105">
                            {tech}
                        </span>
                    ))}
                    {project.tech.length > maxTechTags && (
                        <span className="chip">
                            +{project.tech.length - maxTechTags}
                        </span>
                    )}
                </div>

                {/* GitHub Link */}
                {project.github && (
                    <div className="mt-4 pt-4 border-t border-[var(--border)] relative z-10">
                        <a
                            href={project.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                        >
                            <Github className="w-4 h-4" />
                            <span>Source Code</span>
                        </a>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
