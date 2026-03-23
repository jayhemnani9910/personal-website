"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Github, ExternalLink, FileText, Maximize2, Minimize2 } from "lucide-react";
import type { Project } from "@/lib/definitions";
import { BackButton } from "@/components/BackButton";
import { ReactionBar } from "@/components/ReactionBar";
import { ViewCounter } from "@/components/ViewCounter";
import { SPRINGS, EASINGS } from "@/lib/motion";

// =============================================================================
// DATA (verified against script.js — 9 algorithms)
// =============================================================================

const ALGORITHMS = [
    { name: "FCFS", full: "First Come First Serve", type: "Non-Preemptive" },
    { name: "SJF", full: "Shortest Job First", type: "Non-Preemptive" },
    { name: "SRTF", full: "Shortest Remaining Time First", type: "Preemptive" },
    { name: "LJF", full: "Longest Job First", type: "Non-Preemptive" },
    { name: "LRTF", full: "Longest Remaining Time First", type: "Preemptive" },
    { name: "PNP", full: "Priority (Non-Preemptive)", type: "Non-Preemptive" },
    { name: "PP", full: "Priority (Preemptive)", type: "Preemptive" },
    { name: "RR", full: "Round Robin", type: "Preemptive" },
    { name: "HRRN", full: "Highest Response Ratio Next", type: "Non-Preemptive" },
];

const FEATURES = [
    "Gantt chart visualization with color-coded process timelines",
    "Comparative analysis across all 9 algorithms on the same input",
    "Configurable context switch time and time quantum (Round Robin)",
    "I/O burst time support for realistic scheduling scenarios",
    "Metrics: waiting time, turnaround time, response time, CPU utilization, throughput",
    "Published as IEEE paper — applied to vaccine scheduling at AIMV 2021",
];

const demoUrl = "https://jayhemnani9910.github.io/cpu-scheduling-algorithms/";

// =============================================================================
// MAIN
// =============================================================================

export function SchedulingVisualizerPage({ project }: { project: Project }) {
    const [isFullscreen, setIsFullscreen] = useState(false);

    const handleEscape = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape" && isFullscreen) setIsFullscreen(false);
    }, [isFullscreen]);

    useEffect(() => {
        if (isFullscreen) document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isFullscreen, handleEscape]);

    return (
        <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>

            {/* HERO */}
            <header className="pt-28 pb-8 px-6">
                <div className="max-w-5xl mx-auto">
                    <BackButton />
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={SPRINGS.default} className="mt-4">
                        <div className="flex items-center gap-3 mb-3">
                            <p className="eyebrow">Operating Systems</p>
                            <a href="https://ieeexplore.ieee.org/document/9670986" target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors hover:opacity-80"
                                style={{ background: "rgba(var(--accent-rgb, 10, 132, 255), 0.1)", color: "var(--accent)", border: "1px solid rgba(var(--accent-rgb, 10, 132, 255), 0.2)" }}>
                                <FileText className="w-3 h-3" /> IEEE Xplore
                            </a>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">CPU Scheduling Visualizer</h1>
                        <p className="text-lg text-[var(--text-secondary)] mb-6 max-w-2xl leading-relaxed">
                            Interactive visualization of 9 CPU scheduling algorithms with Gantt charts, comparative analysis, and configurable parameters. Applied to vaccine distribution scheduling in a published IEEE paper.
                        </p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRINGS.default, delay: 0.15 }} className="flex flex-wrap items-center gap-4">
                        <a href={project.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                            <Github className="w-4 h-4" /> Source Code
                        </a>
                        <a href="https://ieeexplore.ieee.org/document/9670986" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium text-[var(--text-secondary)] hover:border-[var(--accent)] transition-colors" style={{ borderColor: "var(--border)" }}>
                            <FileText className="w-4 h-4" /> Read Paper
                        </a>
                        <div className="flex flex-wrap gap-2">
                            {['JavaScript', 'Google Charts', 'Chart.js'].map(t => (
                                <span key={t} className="px-2 py-1 text-xs font-mono rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">{t}</span>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* LIVE DEMO */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <p className="eyebrow mb-4">Live Demo</p>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={SPRINGS.default}
                        className={`relative rounded-xl overflow-hidden border transition-all duration-300 ${isFullscreen ? "fixed inset-4 z-50" : ""}`}
                        style={{ borderColor: "var(--border)" }}
                    >
                        <div className="flex items-center justify-between px-4 py-2" style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                            </div>
                            <div className="flex items-center gap-3">
                                <a href={demoUrl} target="_blank" rel="noopener noreferrer" className="text-xs hover:opacity-80" style={{ color: "var(--accent)" }}>
                                    Open in Tab <ExternalLink className="w-3 h-3 inline" />
                                </a>
                                <button onClick={() => setIsFullscreen(!isFullscreen)} className="text-xs hover:opacity-80" style={{ color: "var(--accent)" }}>
                                    {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                                </button>
                            </div>
                        </div>
                        <iframe
                            src={demoUrl}
                            className="w-full"
                            style={{ height: isFullscreen ? "calc(100vh - 4rem)" : "clamp(400px, 65vh, 650px)", background: "#fff" }}
                            title="CPU Scheduling Visualizer"
                        />
                    </motion.div>
                    <p className="text-xs text-center mt-3 text-[var(--text-muted)]">Add processes, select an algorithm, and click Calculate to see the Gantt chart</p>
                </div>
            </section>

            {/* 9 ALGORITHMS */}
            <section className="py-16 px-6" style={{ background: "var(--bg-secondary)" }}>
                <div className="max-w-5xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: EASINGS.apple }} className="mb-8">
                        <p className="eyebrow mb-2">Algorithms</p>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">9 Scheduling Algorithms</h2>
                        <p className="text-sm text-[var(--text-muted)] mt-1">5 non-preemptive + 4 preemptive</p>
                    </motion.div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {ALGORITHMS.map((alg, i) => (
                            <motion.div
                                key={alg.name}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.04, duration: 0.4, ease: EASINGS.apple }}
                                whileHover={{ y: -3, borderColor: "var(--accent)", transition: { type: "spring", stiffness: 300, damping: 25 } }}
                                className="p-4 rounded-xl border transition-colors duration-200"
                                style={{ background: "var(--bg-primary)", borderColor: "var(--border)" }}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-bold font-mono" style={{ color: "var(--accent)" }}>{alg.name}</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full" style={{
                                        color: alg.type === "Preemptive" ? "#f59e0b" : "var(--text-muted)",
                                        background: alg.type === "Preemptive" ? "rgba(245,158,11,0.1)" : "var(--bg-secondary)",
                                    }}>{alg.type}</span>
                                </div>
                                <p className="text-xs text-[var(--text-muted)]">{alg.full}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section className="py-16 px-6">
                <div className="max-w-3xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: EASINGS.apple }} className="mb-8">
                        <p className="eyebrow mb-2">Capabilities</p>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">What It Does</h2>
                    </motion.div>
                    <div className="space-y-3">
                        {FEATURES.map((item, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.4, ease: EASINGS.apple }} className="flex gap-3 text-sm text-[var(--text-secondary)] leading-relaxed">
                                <span className="shrink-0 mt-1" style={{ color: "var(--accent)" }}>▸</span>
                                <span>{item}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PUBLICATION */}
            <section className="py-16 px-6" style={{ background: "var(--bg-secondary)" }}>
                <div className="max-w-4xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: EASINGS.apple }}>
                        <p className="eyebrow mb-4">Publication</p>
                        <div className="p-6 rounded-xl border transition-colors duration-200 hover:border-[var(--accent)]/40" style={{ background: "var(--bg-primary)", borderColor: "var(--border)" }}>
                            <h3 className="text-base font-bold text-[var(--text-primary)] mb-2">
                                &quot;Efficient Vaccine Scheduler Based on CPU Scheduling Algorithms&quot;
                            </h3>
                            <p className="text-sm text-[var(--text-secondary)] mb-3">
                                V. Gondaliya, S. Patel, J. Hemnani, S. Patel
                            </p>
                            <div className="flex flex-wrap gap-3 text-xs text-[var(--text-muted)]">
                                <span>AIMV 2021</span>
                                <span>·</span>
                                <span>IEEE Xplore</span>
                                <span>·</span>
                                <span>DOI: 10.1109/AIMV53313.2021.9670986</span>
                            </div>
                            <a href="https://ieeexplore.ieee.org/document/9670986" target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 mt-4 text-sm font-medium transition-colors hover:opacity-80" style={{ color: "var(--accent)" }}>
                                <FileText className="w-4 h-4" /> Read on IEEE Xplore <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* FOOTER */}
            <div className="py-8 px-6 border-t" style={{ borderColor: "var(--border)" }}>
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <a href={project.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors">
                            <Github className="w-4 h-4" /> Source Code <ExternalLink className="w-3 h-3" />
                        </a>
                        <div className="flex gap-6 font-mono text-xs">
                            <span><span style={{ color: "var(--accent)" }}>9</span> <span className="text-[var(--text-muted)]">Algorithms</span></span>
                            <span><span style={{ color: "var(--accent)" }}>1,105</span> <span className="text-[var(--text-muted)]">LOC</span></span>
                            <span><span style={{ color: "var(--accent)" }}>IEEE</span> <span className="text-[var(--text-muted)]">Published</span></span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between gap-4 mt-6 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
                        <ReactionBar slug={project.id} />
                        <ViewCounter slug={project.id} />
                    </div>
                </div>
            </div>
        </div>
    );
}
