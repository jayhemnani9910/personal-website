"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Github, ExternalLink, Scan, Layers, Eye } from "lucide-react";
import type { Project } from "@/lib/definitions";
import { BackButton } from "@/components/BackButton";
import { ReactionBar } from "@/components/ReactionBar";
import { ViewCounter } from "@/components/ViewCounter";
import { SPRINGS, EASINGS } from "@/lib/motion";

// =============================================================================
// DATA (verified against actual codebase)
// =============================================================================

const MODELS = [
    {
        name: "RF-DETR",
        purpose: "Object Detection",
        description: "ResNet50 backbone + Transformer decoder for real-time player, ball, and referee detection. 577 lines of PyTorch implementation with configurable confidence thresholds.",
        icon: Scan,
    },
    {
        name: "SAM2",
        purpose: "Video Segmentation",
        description: "Frame-by-frame video segmentation with temporal consistency and occlusion handling. Custom SAM2Tracker for persistent identity tracking across frames.",
        icon: Layers,
    },
    {
        name: "SigLIP",
        purpose: "Zero-Shot Identification",
        description: "Vision-language model for player identification without pre-training on team rosters. VisionTransformer + TextTransformer with semantic matching capabilities.",
        icon: Eye,
    },
];

const HIGHLIGHTS = [
    "Modular pipeline — swap models via YAML config presets (balanced, real-time, high-accuracy)",
    "ResultFuser — intelligent multi-model output combination with adaptive fusion strategies",
    "5 demo applications — complete system, single model, real-time, benchmark, and GUI",
    "19 Python modules with comprehensive documentation and test suite",
];

// =============================================================================
// BEFORE/AFTER COMPARISON (kept from v1 — strongest visual)
// =============================================================================

function BeforeAfterComparison() {
    const [sliderPos, setSliderPos] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMove = (clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderPos(percent);
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-video rounded-2xl overflow-hidden cursor-ew-resize select-none border border-[var(--border)]"
            onMouseMove={(e) => e.buttons === 1 && handleMove(e.clientX)}
            onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        >
            {/* "Before" — Raw frame */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 to-green-700/40">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3/4 h-3/4 border-2 border-white/20 rounded-lg relative">
                        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/20" />
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/20 rounded-full" />
                    </div>
                </div>
                {[
                    { x: 20, y: 30 }, { x: 25, y: 50 }, { x: 22, y: 70 },
                    { x: 35, y: 25 }, { x: 40, y: 45 }, { x: 38, y: 65 }, { x: 35, y: 85 },
                    { x: 55, y: 35 }, { x: 50, y: 55 }, { x: 55, y: 75 },
                    { x: 70, y: 50 },
                ].map((pos, i) => (
                    <div key={i} className="absolute w-3 h-3 rounded-full bg-white/40" style={{ left: `${pos.x}%`, top: `${pos.y}%` }} />
                ))}
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/50 text-white text-xs font-medium">Raw Input</div>
            </div>

            {/* "After" — Pipeline output */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 to-green-700/40" style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3/4 h-3/4 border-2 border-white/30 rounded-lg relative">
                        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/30" />
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/30 rounded-full" />
                    </div>
                </div>
                {[
                    { x: 20, y: 30, team: 'red', id: 1 }, { x: 25, y: 50, team: 'red', id: 7 },
                    { x: 22, y: 70, team: 'red', id: 3 }, { x: 35, y: 25, team: 'red', id: 4 },
                    { x: 40, y: 45, team: 'red', id: 8 }, { x: 38, y: 65, team: 'red', id: 6 },
                    { x: 35, y: 85, team: 'red', id: 2 }, { x: 55, y: 35, team: 'blue', id: 10 },
                    { x: 50, y: 55, team: 'blue', id: 9 }, { x: 55, y: 75, team: 'blue', id: 11 },
                    { x: 70, y: 50, team: 'blue', id: 1 },
                ].map((player, i) => (
                    <div key={i} className="absolute" style={{ left: `${player.x}%`, top: `${player.y}%`, transform: 'translate(-50%, -50%)' }}>
                        <div className={`w-6 h-10 border-2 rounded-sm ${player.team === 'red' ? 'border-red-500' : 'border-blue-500'}`} />
                        <span className={`absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] font-bold px-1 rounded ${player.team === 'red' ? 'bg-red-500' : 'bg-blue-500'} text-white`}>
                            #{player.id}
                        </span>
                        <div className={`absolute inset-0 ${player.team === 'red' ? 'bg-red-500/30' : 'bg-blue-500/30'} rounded-sm`} />
                    </div>
                ))}
                <div className="absolute left-[45%] top-[48%]">
                    <div className="w-3 h-3 rounded-full bg-yellow-400 border-2 border-yellow-300 shadow-lg shadow-yellow-400/50" />
                </div>
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[var(--accent)] text-white text-xs font-medium">Pipeline Output</div>
            </div>

            {/* Slider */}
            <div className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize" style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
                    <div className="flex gap-0.5">
                        <div className="w-0.5 h-4 bg-gray-400 rounded-full" />
                        <div className="w-0.5 h-4 bg-gray-400 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// =============================================================================
// MAIN
// =============================================================================

export function SoccerVisionResearchPage({ project }: { project: Project }) {
    return (
        <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>

            {/* ============================================================= */}
            {/* HERO + TITLE                                                  */}
            {/* ============================================================= */}
            <header className="pt-28 pb-8 px-6">
                <div className="max-w-4xl mx-auto">
                    <BackButton />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={SPRINGS.default}
                        className="mt-4"
                    >
                        <p className="eyebrow mb-3">Research</p>
                        <h1 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
                            Soccer Vision Research
                        </h1>
                        <p className="text-lg text-[var(--text-secondary)] mb-6 max-w-2xl leading-relaxed">
                            A modular research framework for multi-model soccer video analysis. Combines RF-DETR detection, SAM2 segmentation, and SigLIP zero-shot identification into a configurable pipeline.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...SPRINGS.default, delay: 0.15 }}
                        className="flex flex-wrap items-center gap-4"
                    >
                        <a href={project.github} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors"
                            style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                            <Github className="w-4 h-4" /> View on GitHub
                        </a>
                        <div className="flex flex-wrap gap-2">
                            {['RF-DETR', 'SAM2', 'SigLIP', 'PyTorch'].map((tech) => (
                                <span key={tech} className="px-2 py-1 text-xs font-mono rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* ============================================================= */}
            {/* FIGURE 1 — Before/After Comparison                            */}
            {/* ============================================================= */}
            <section className="py-10 px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={SPRINGS.default}
                    >
                        <BeforeAfterComparison />
                        <p className="text-xs text-center mt-3 italic" style={{ color: "var(--text-muted)" }}>
                            Fig. 1 — Drag to compare raw video input (left) with pipeline output showing detection, segmentation, and identification (right).
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ============================================================= */}
            {/* PIPELINE — 3 Models                                           */}
            {/* ============================================================= */}
            <section className="py-16 px-6" style={{ background: "var(--bg-secondary)" }}>
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, ease: EASINGS.apple }}
                        className="mb-10"
                    >
                        <p className="eyebrow mb-2">Architecture</p>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Three-Model Pipeline</h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {MODELS.map((model, i) => {
                            const Icon = model.icon;
                            return (
                                <motion.div
                                    key={model.name}
                                    initial={{ opacity: 0, y: 24 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1, duration: 0.5, ease: EASINGS.apple }}
                                    whileHover={{ y: -4, borderColor: "var(--accent)", transition: { type: "spring", stiffness: 300, damping: 25 } }}
                                    className="p-6 rounded-xl border transition-colors duration-300"
                                    style={{ background: "var(--bg-primary)", borderColor: "var(--border)" }}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(var(--accent-rgb, 10, 132, 255), 0.1)" }}>
                                            <Icon className="w-5 h-5" style={{ color: "var(--accent)" }} />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-[var(--text-primary)]">{model.name}</h3>
                                            <p className="text-xs" style={{ color: "var(--accent)" }}>{model.purpose}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{model.description}</p>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Flow indicator */}
                    <div className="hidden md:flex items-center justify-center gap-2 mt-8">
                        <span className="text-xs font-mono text-[var(--text-muted)]">Video Input</span>
                        <span className="text-[var(--accent)]">→</span>
                        <span className="text-xs font-mono" style={{ color: "var(--accent)" }}>RF-DETR</span>
                        <span className="text-[var(--accent)]">→</span>
                        <span className="text-xs font-mono" style={{ color: "var(--accent)" }}>SAM2</span>
                        <span className="text-[var(--accent)]">→</span>
                        <span className="text-xs font-mono" style={{ color: "var(--accent)" }}>SigLIP</span>
                        <span className="text-[var(--accent)]">→</span>
                        <span className="text-xs font-mono text-[var(--text-muted)]">Annotated Output</span>
                    </div>
                </div>
            </section>

            {/* ============================================================= */}
            {/* FRAMEWORK HIGHLIGHTS                                          */}
            {/* ============================================================= */}
            <section className="py-16 px-6">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, ease: EASINGS.apple }}
                        className="mb-8"
                    >
                        <p className="eyebrow mb-2">Framework</p>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">What Makes It Unique</h2>
                    </motion.div>

                    <div className="space-y-3">
                        {HIGHLIGHTS.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -16 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08, duration: 0.4, ease: EASINGS.apple }}
                                className="flex gap-3 text-sm text-[var(--text-secondary)] leading-relaxed"
                            >
                                <span className="shrink-0 mt-1" style={{ color: "var(--accent)" }}>▸</span>
                                <span>{item}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================================= */}
            {/* FOOTER                                                        */}
            {/* ============================================================= */}
            <div className="py-8 px-6 border-t" style={{ borderColor: "var(--border)" }}>
                <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
                    <a href={project.github} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors">
                        <Github className="w-4 h-4" /> jayhemnani9910/soccer-vision-research <ExternalLink className="w-3 h-3" />
                    </a>
                    <Link href="/projects/fifa-soccer-ds" className="text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                        Related: FIFA Soccer DS →
                    </Link>
                </div>
                <div className="flex items-center justify-center gap-6 mt-6 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
                    <ReactionBar slug={project.id} />
                    <ViewCounter slug={project.id} />
                </div>
            </div>
        </div>
    );
}
