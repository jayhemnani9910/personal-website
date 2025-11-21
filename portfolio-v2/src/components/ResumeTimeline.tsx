"use client";

import { useState, useRef } from "react";
import { RESUME } from "@/data/resume";
import { UI_COPY } from "@/data/profile";
import { motion, useScroll, useTransform } from "framer-motion";
import { Printer, ExternalLink } from "lucide-react";
import MagneticButton from "./MagneticButton";
import { PrintableView } from "./PrintableView";

export function ResumeTimeline() {
    const [view, setView] = useState<"timeline" | "printable">("timeline");
    const sectionRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"],
    });

    const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

    return (
        <section id="experience" className="relative section-block section-shell overflow-hidden" ref={sectionRef}>
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
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 md:mb-16 gap-4 print:hidden">
                    <h2 className="text-4xl md:text-5xl font-bold flex items-center gap-4">
                        <span className="text-[var(--color-accent-primary)] font-mono text-2xl opacity-50">03.</span>
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

                <div className={view === "timeline" ? "block print:hidden" : "hidden print:hidden"}>
                    <div className="relative">
                        {/* Glowing Line */}
                        <div className="absolute left-[19px] md:left-[23px] top-2 bottom-0 w-[2px] bg-[rgba(255,255,255,0.05)]">
                            <motion.div
                                style={{ height: lineHeight, scaleY: scrollYProgress, transformOrigin: "top" }}
                                className="w-full bg-gradient-to-b from-[var(--color-accent-primary)] via-[var(--color-accent-cyan)] to-[var(--color-accent-purple)] shadow-[0_0_20px_rgba(88,166,255,0.5)]"
                            />
                        </div>

                        <div className="space-y-12">
                            {RESUME.experience.map((company, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                    className="relative pl-8 border-l border-[rgba(255,255,255,0.1)]"
                                >
                                    <div className="absolute -left-[5px] top-0 w-[9px] h-[9px] rounded-full bg-[var(--color-accent-cyan)] shadow-[0_0_10px_var(--color-accent-cyan)]" />

                                    <div className="mb-2">
                                        <h3 className="text-xl font-bold text-[var(--color-text-primary)]">{company.name}</h3>
                                    </div>

                                    <div className="space-y-8">
                                        {company.roles.map((role, j) => (
                                            <div key={j} className="relative">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-1">
                                                    <h4 className="text-lg font-medium text-[var(--color-text-secondary)]">
                                                        {role.title}
                                                    </h4>
                                                    {role.period?.label && (
                                                        <span className="text-sm font-mono text-[var(--color-text-muted)] bg-[rgba(255,255,255,0.05)] px-2 py-1 rounded">
                                                            {role.period.label}
                                                        </span>
                                                    )}
                                                </div>
                                                {role.summary && (
                                                    <div className="text-sm text-[var(--color-accent-primary)] mb-3 font-medium">
                                                        {role.summary}
                                                    </div>
                                                )}
                                                <ul className="space-y-2">
                                                    {role.bullets.map((bullet, k) => (
                                                        <li key={k} className="text-[var(--color-text-secondary)] leading-relaxed flex items-start gap-2 text-sm">
                                                            <span className="mt-1.5 w-1 h-1 rounded-full bg-[rgba(255,255,255,0.3)] shrink-0" />
                                                            <span>{bullet.text}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
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
                className="relative z-10 mt-32"
            >
                <h2 className="text-3xl font-bold mb-12 flex items-center gap-4 tracking-tight leading-[1.05]">
                    <span className="w-8 h-[1px] bg-[var(--color-accent-cyan)]" />
                    {UI_COPY.resume.education}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {RESUME.education.map((edu, i) => (
                        <div key={i} className="glass-card p-8 rounded-2xl">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-1">{edu.institution}</h3>
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
                                    <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
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
                            href="#"
                            className="glass-card p-6 rounded-2xl group hover:bg-[rgba(255,255,255,0.05)] transition-colors block"
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
