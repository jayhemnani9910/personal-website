"use client";

import Link from "next/link";
import { Github } from "lucide-react";
import type { Project } from "@/lib/definitions";
import { ProjectSummary } from "@/lib/content";

interface BentoCardProps {
    project: Project | ProjectSummary;
    size?: "large" | "standard";
    className?: string;
}

export function BentoCard({ project, size = "standard", className = "" }: BentoCardProps) {
    const description = (project as Project & { headline?: string }).headline ?? project.summary;
    const isLarge = size === "large";
    const maxTechTags = isLarge ? 5 : 3;

    return (
        <div className={`block ${className}`}>
            <div
                className={`card card-interactive h-full flex flex-col ${
                    isLarge ? "p-8" : "p-6"
                }`}
            >
                {/* Role */}
                <span className="eyebrow mb-3">{project.role}</span>

                {/* Title - wrapped in Link */}
                <Link href={`/projects/${project.id}`} className="group">
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
                    className={`body-sm mb-4 flex-1 ${
                        isLarge ? "line-clamp-3" : "line-clamp-2"
                    }`}
                >
                    {description}
                </p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-2 pt-4 border-t border-[var(--border)]">
                    {project.tech.slice(0, maxTechTags).map((tech) => (
                        <span key={tech} className="chip">
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
                    <div className="mt-4 pt-4 border-t border-[var(--border)]">
                        <a
                            href={project.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Github className="w-4 h-4" />
                            <span>Source Code</span>
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
