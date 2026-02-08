"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Github } from "lucide-react";
import { VARIANTS, SPRINGS } from "@/lib/motion";

interface ProjectHeaderProps {
    title: string;
    description: string;
    techStack: string[];
    githubUrl?: string;
    badge?: {
        text: string;
        variant?: "purple" | "blue" | "green" | "amber";
    };
}

function getBadgeStyles(variant: string): string {
    switch (variant) {
        case "blue":
            return "bg-blue-500/10 text-blue-500 border-blue-500/20";
        case "green":
            return "bg-green-500/10 text-green-500 border-green-500/20";
        case "amber":
            return "bg-amber-500/10 text-amber-500 border-amber-500/20";
        case "purple":
        default:
            return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    }
}

export function ProjectHeader({
    title,
    description,
    techStack,
    githubUrl,
    badge,
}: ProjectHeaderProps) {
    return (
        <header className="pt-32 pb-8 px-6">
            <div className="max-w-6xl mx-auto">
                <Link
                    href="/projects"
                    className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Projects
                </Link>

                <div className="flex items-center gap-3 mb-4">
                    <motion.h1
                        className="text-4xl md:text-5xl font-bold text-[var(--text-primary)]"
                        variants={VARIANTS.fadeInUp}
                        initial="initial"
                        animate="animate"
                        transition={SPRINGS.default}
                    >
                        {title}
                    </motion.h1>
                    {badge && (
                        <span
                            className={`px-2 py-1 text-xs font-medium rounded border ${getBadgeStyles(
                                badge.variant || "purple"
                            )}`}
                        >
                            {badge.text}
                        </span>
                    )}
                </div>

                <motion.p
                    className="text-xl text-[var(--text-secondary)] mb-6 max-w-3xl"
                    variants={VARIANTS.fadeInUp}
                    initial="initial"
                    animate="animate"
                    transition={{ ...SPRINGS.default, delay: 0.1 }}
                >
                    {description}
                </motion.p>

                <motion.div
                    className="flex flex-wrap items-center gap-4"
                    variants={VARIANTS.fadeInUp}
                    initial="initial"
                    animate="animate"
                    transition={{ ...SPRINGS.default, delay: 0.2 }}
                >
                    <div className="flex flex-wrap gap-2">
                        {techStack.map((tech) => (
                            <span
                                key={tech}
                                className="px-3 py-1 text-xs font-medium rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20"
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                    {githubUrl && (
                        <a
                            href={githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)]"
                        >
                            <Github className="w-4 h-4" /> Code
                        </a>
                    )}
                </motion.div>
            </div>
        </header>
    );
}
