"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { scrollToTarget } from "@/lib/scroll";

interface TableOfContentsProps {
    sections: { id: string; label: string }[];
}

export function TableOfContents({ sections }: TableOfContentsProps) {
    const [activeSection, setActiveSection] = useState<string>("");
    const lenis = useLenis();

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { rootMargin: "-20% 0px -35% 0px" }
        );

        sections.forEach(({ id }) => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [sections]);

    return (
        <nav className="hidden lg:block sticky top-32 space-y-4">
            <h4 className="text-sm font-mono text-[var(--color-text-muted)] uppercase tracking-wider mb-4">
                Contents
            </h4>
            <ul className="space-y-2 border-l border-white/10">
                {sections.map(({ id, label }) => {
                    const isActive = activeSection === id;
                    return (
                        <li key={id} className="relative pl-4">
                            {isActive && (
                                <motion.div
                                    layoutId="active-toc"
                                    className="absolute left-0 top-0 bottom-0 w-[2px] bg-[var(--color-accent-primary)]"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <a
                                href={`#${id}`}
                                className={`block text-sm transition-colors duration-200 ${isActive
                                        ? "text-[var(--color-text-primary)] font-medium"
                                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                                    }`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    const el = document.getElementById(id);
                                    if (el) scrollToTarget(el, lenis, -120);
                                }}
                            >
                                {label}
                            </a>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
