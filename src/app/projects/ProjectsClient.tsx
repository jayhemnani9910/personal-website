"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ProjectSummary } from "@/lib/content";
import { BentoCard } from "@/components/BentoCard";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Search } from "lucide-react";

interface ProjectsClientProps {
    projects: ProjectSummary[];
}

export function ProjectsClient({ projects }: ProjectsClientProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredProjects = projects.filter((project) => {
        const query = searchQuery.toLowerCase();
        return (
            project.title.toLowerCase().includes(query) ||
            project.summary.toLowerCase().includes(query) ||
            project.tech.some((t) => t.toLowerCase().includes(query))
        );
    });

    return (
        <main className="min-h-screen bg-[var(--bg-void)]">
            <Navbar />

            <section className="pt-32 pb-20 section-shell">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-12 text-center"
                    >
                        <h1 className="title-xl mb-4">Project Archive</h1>
                        <p className="body-base text-[var(--text-secondary)]">
                            A complete catalog of data engineering pipelines, AI systems, and web applications.
                        </p>
                    </motion.div>

                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="relative mb-16 max-w-xl mx-auto"
                    >
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] rounded-full opacity-20 group-hover:opacity-30 blur transition-opacity" />
                            <div className="relative flex items-center bg-[var(--bg-surface)] border border-[var(--glass-border)] rounded-full px-6 py-4 focus-within:border-[var(--neon-cyan)] transition-colors">
                                <Search className="w-5 h-5 text-[var(--text-muted)] mr-3" />
                                <input
                                    type="text"
                                    placeholder="Search by technology, title, or keyword..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-transparent border-none outline-none text-[var(--text-primary)] placeholder-[var(--text-muted)]"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Projects Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredProjects.map((project, index) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.05 }}
                            >
                                <BentoCard project={project} className="h-full" />
                            </motion.div>
                        ))}
                    </div>

                    {filteredProjects.length === 0 && (
                        <div className="text-center py-20">
                            <p className="text-[var(--text-muted)]">No projects found matching your search.</p>
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </main>
    );
}
