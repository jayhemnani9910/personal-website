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
        <main className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
            <Navbar />

            <section className="pt-40 pb-20">
                <div className="section-wide">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-12"
                    >
                        <p className="eyebrow mb-3">Archive</p>
                        <h1 className="title-xl mb-4">All Projects</h1>
                        <p className="body-base max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
                            A complete catalog of data engineering pipelines, AI systems, and web applications.
                        </p>
                    </motion.div>

                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="relative mb-12 max-w-md"
                    >
                        <div className="relative flex items-center">
                            <Search className="absolute left-4 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input pl-12 rounded-full"
                            />
                        </div>
                    </motion.div>

                    {/* Bento Grid - Repeating pattern: 2 large + 4 small */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {filteredProjects.map((project, index) => {
                            // Pattern repeats every 6: positions 0,1 are large, 2-5 are small
                            const positionInPattern = index % 6;
                            const isLarge = positionInPattern < 2;

                            return (
                                <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: (index % 12) * 0.05 }}
                                    className={isLarge ? "md:col-span-2" : ""}
                                >
                                    <BentoCard
                                        project={project}
                                        size={isLarge ? "large" : "standard"}
                                        className="h-full"
                                    />
                                </motion.div>
                            );
                        })}
                    </div>

                    {filteredProjects.length === 0 && (
                        <div className="text-center py-20">
                            <p className="body-base" style={{ color: 'var(--text-muted)' }}>No projects found matching your search.</p>
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </main>
    );
}
