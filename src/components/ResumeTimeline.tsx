"use client";

import { useState, useRef } from "react";
import { RESUME } from "@/data/resume";
import { UI_COPY } from "@/data/profile";
import { motion } from "framer-motion";
import { Printer, ExternalLink } from "lucide-react";
import MagneticButton from "./MagneticButton";
import { PrintableView } from "./PrintableView";
import dynamic from "next/dynamic";

const SkillsRadar = dynamic(() => import("./SkillsRadar").then((m) => m.SkillsRadar), {
    ssr: false,
});

export function ResumeTimeline() {
    const [view, setView] = useState<"timeline" | "printable">("timeline");
    const sectionRef = useRef<HTMLDivElement>(null);

    const radarData = RESUME.skills.map((cat) => ({
        subject: cat.category,
        A: Math.min(cat.items.length * 20, 100),
        fullMark: 100,
    }));


    return (
        <section id="experience" className="relative section-block section-shell overflow-hidden scroll-mt-28 md:scroll-mt-32" ref={sectionRef}>
            {/* Background Gradient */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)] blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative z-10"
            >
                <div className="flex flex-col md:flex-row md:items-start justify-between mb-10 md:mb-16 gap-6 print:hidden">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <h2 className="text-4xl md:text-5xl font-bold flex items-center gap-4">
                            {UI_COPY.resume.experience}
                        </h2>

                        <MagneticButton>
                            <button
                                onClick={() => setView(view === "timeline" ? "printable" : "timeline")}
                                className="flex items-center gap-2 px-6 py-3 rounded-full border border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.05)] transition-colors text-sm font-medium print:hidden"
                            >
                                <Printer className="w-4 h-4" />
                                {view === "timeline" ? "View Printable" : "View Timeline"}
                            </button>
                        </MagneticButton>
                    </div>

                    <div className="w-full md:w-72 h-48 glass-card rounded-2xl border border-[rgba(255,255,255,0.08)] p-3">
                        <SkillsRadar data={radarData} />
                    </div>
                </div>

                <div className={view === "timeline" ? "block print:hidden" : "hidden print:hidden"}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        {RESUME.experience.flatMap((company, i) =>
                            company.roles.map((role, j) => (
                                <motion.div
                                    key={`${i}-${j}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: (i + j) * 0.1 }}
                                    className="group relative p-6 rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300"
                                >
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                                                    {company.name}
                                                </h3>
                                                <p className="text-sm text-white/60 font-mono mt-1">
                                                    {role.title}
                                                </p>
                                            </div>
                                            {role.period && (
                                                <span className="text-xs text-white/40 font-mono border border-white/10 px-2 py-1 rounded-full">
                                                    {role.period.label}
                                                </span>
                                            )}
                                        </div>

                                        <ul className="space-y-2">
                                            {role.bullets.slice(0, 3).map((bullet, k) => (
                                                <li key={k} className="text-sm text-white/70 flex gap-2">
                                                    <span className="text-emerald-500/50 mt-1.5">›</span>
                                                    <span>{bullet.text}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Math Decoration */}
                                    <div className="absolute bottom-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <svg width="40" height="20" viewBox="0 0 40 20" className="text-emerald-500">
                                            <path d={`M0,10 Q10,${5 + ((i + j) * 7 % 15)} 20,10 T40,10`} fill="none" stroke="currentColor" strokeWidth="2" />
                                        </svg>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                <div className={view === "printable" ? "block" : "hidden print:block"}>
                    <PrintableView />
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative z-10 mt-32 scroll-mt-28 md:scroll-mt-32"
                id="timeline"
            >
                <h2 className="text-3xl font-bold mb-12 flex items-center gap-4 tracking-tight leading-[1.05]">
                    <span className="w-8 h-[1px] bg-[var(--color-accent-cyan)]" />
                    {UI_COPY.resume.education}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {RESUME.education.map((edu, i) => (
                        <div key={i} className="glass-card glass-card-hover glass-distortion-hover p-8 rounded-2xl group hover:border-[var(--neon-cyan)] transition-colors duration-500">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-1 group-hover:text-[var(--neon-cyan)] transition-colors">{edu.institution}</h3>
                                    <p className="text-[var(--color-accent-cyan)] font-medium">{edu.degree}</p>
                                </div>
                                <span className="text-sm text-[var(--color-text-muted)]">{edu.location}</span>
                            </div>
                            {edu.gpa && (
                                <div className="mb-4 inline-block px-3 py-1 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.05)] text-xs font-mono text-[var(--color-text-secondary)]">
                                    {UI_COPY.resume.gpa} {edu.gpa}
                                </div>
                            )}
                            {edu.courses && (
                                <div>
                                    <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">{UI_COPY.resume.coursework}</p>
                                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed group-hover:text-white transition-colors">
                                        {edu.courses.join(", ")}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="relative z-10 mt-32"
            >
                <h2 className="text-3xl font-bold mb-12 flex items-center gap-4 tracking-tight leading-[1.05]">
                    <span className="w-8 h-[1px] bg-[var(--color-accent-cyan)]" />
                    {UI_COPY.resume.publications}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {RESUME.publications.map((pub, i) => (
                        <a
                            key={i}
                            href={pub.link || "#"}
                            target={pub.link ? "_blank" : undefined}
                            rel={pub.link ? "noopener noreferrer" : undefined}
                            className="glass-card glass-card-hover glass-distortion-hover p-6 rounded-2xl group hover:bg-[rgba(255,255,255,0.05)] transition-colors block"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-accent-primary)] transition-colors">
                                    {pub.title}
                                </h3>
                                <ExternalLink className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)] transition-colors" />
                            </div>
                            <p className="text-sm text-[var(--color-text-secondary)]">
                                {pub.description}
                            </p>
                        </a>
                    ))}
                </div>
            </motion.div>
        </section>
    );
}
