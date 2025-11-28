"use client";

import { motion } from "framer-motion";
import { ProjectSummary } from "@/lib/content";
import { ArrowRight, Activity, Code2, Trophy } from "lucide-react";
import Link from "next/link";

interface ProjectDNAStripProps {
    projects: ProjectSummary[];
}

export function ProjectDNAStrip({ projects }: ProjectDNAStripProps) {
    // Calculate some "DNA" metrics
    const totalProjects = projects.length;
    const totalTech = new Set(projects.flatMap(p => p.tech)).size;
    const totalDomains = new Set(projects.map(p => p.domain)).size;

    // Get top 3 featured projects
    const featuredProjects = projects
        .filter(p => p.featured)
        .sort((a, b) => (a.priority || 99) - (b.priority || 99))
        .slice(0, 3);

    return (
        <section className="w-full py-12 border-y border-white/5 bg-white/[0.02] overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row gap-12 items-center">

                    {/* Metrics Column */}
                    <div className="flex-shrink-0 w-full md:w-auto flex md:flex-col gap-6 md:gap-8 justify-center">
                        <MetricItem
                            icon={<Code2 className="w-5 h-5 text-emerald-400" />}
                            value={totalProjects}
                            label="Projects Shipped"
                            delay={0}
                        />
                        <MetricItem
                            icon={<Activity className="w-5 h-5 text-blue-400" />}
                            value={totalTech}
                            label="Technologies"
                            delay={0.1}
                        />
                        <MetricItem
                            icon={<Trophy className="w-5 h-5 text-purple-400" />}
                            value={totalDomains}
                            label="Domains Mastered"
                            delay={0.2}
                        />
                    </div>

                    {/* DNA Strip */}
                    <div className="flex-grow w-full overflow-x-auto pb-4 md:pb-0 hide-scrollbar">
                        <div className="flex gap-4 min-w-max">
                            {featuredProjects.map((project, index) => (
                                <ProjectDNACard key={project.id} project={project} index={index} />
                            ))}

                            <Link
                                href="/#projects"
                                className="group flex flex-col justify-center items-center w-32 h-40 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
                            >
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                    <ArrowRight className="w-5 h-5 text-white/50 group-hover:text-white" />
                                </div>
                                <span className="text-xs text-white/40 font-mono">View All</span>
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

function MetricItem({ icon, value, label, delay }: { icon: React.ReactNode, value: number, label: string, delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }}
            className="flex items-center gap-4"
        >
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                {icon}
            </div>
            <div>
                <div className="text-2xl font-bold font-mono text-white">{value}</div>
                <div className="text-xs text-white/40 uppercase tracking-wider">{label}</div>
            </div>
        </motion.div>
    );
}

function ProjectDNACard({ project, index }: { project: ProjectSummary, index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + (index * 0.1), duration: 0.5 }}
            className="relative w-72 h-40 rounded-xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent p-5 flex flex-col justify-between group hover:border-white/20 transition-colors"
        >
            <div>
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono text-emerald-400/80 px-2 py-0.5 rounded-full bg-emerald-400/10 border border-emerald-400/20">
                        {project.domain}
                    </span>
                    <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60 -rotate-45 transition-colors" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                    {project.title}
                </h3>
                <p className="text-xs text-white/50 line-clamp-2 mt-1">
                    {project.summary}
                </p>
            </div>

            <div className="flex gap-2 mt-3">
                {project.tech.slice(0, 3).map(t => (
                    <span key={t} className="w-1.5 h-1.5 rounded-full bg-white/20" title={t} />
                ))}
                {project.tech.length > 3 && (
                    <span className="text-[10px] text-white/20 leading-none self-center">+{project.tech.length - 3}</span>
                )}
            </div>

            <Link href={`/projects/${project.id}`} className="absolute inset-0" aria-label={`View ${project.title}`} />
        </motion.div>
    );
}
