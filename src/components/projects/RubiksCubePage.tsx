"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Github, ExternalLink, Timer, BarChart3, Box, Maximize2, Minimize2,
    Shuffle, FolderOpen, Wifi, Download, Keyboard, ChevronDown,
} from "lucide-react";
import type { Project } from "@/lib/definitions";
import { BackButton } from "@/components/BackButton";
import { ReactionBar } from "@/components/ReactionBar";
import { ViewCounter } from "@/components/ViewCounter";
import { SPRINGS } from "@/lib/motion";

// =============================================================================
// NEON PALETTE (page-scoped)
// =============================================================================

const NEON = {
    green: "#39ff14",
    magenta: "#e040fb",
    cyan: "#00fff5",
    bg: "#0a0a0a",
    card: "#141414",
    border: "#222",
} as const;

const FEATURES = [
    { icon: Timer, title: "Precision Timer", desc: "Sub-millisecond accuracy", detail: "Built on performance.now() for microsecond precision. Supports WCA inspection time, +2 penalties, and DNF marking.", color: NEON.green },
    { icon: Box, title: "3D Visualization", desc: "Three.js at 60 FPS", detail: "Real-time 3D cube rendered with Three.js. Watch scrambles animate move-by-move. Rotate the view freely with mouse or arrow keys.", color: NEON.cyan },
    { icon: Shuffle, title: "WCA Scrambles", desc: "2x2 through 7x7", detail: "Competition-standard random-state scrambles for all WCA puzzle sizes. Copy notation, regenerate, or lock a scramble for practice.", color: NEON.magenta },
    { icon: BarChart3, title: "Statistics", desc: "Ao5, Ao12, Ao100", detail: "Rolling averages, best/worst tracking, PB progression, and trend charts powered by Chart.js.", color: NEON.green },
    { icon: FolderOpen, title: "Sessions", desc: "Organize your solves", detail: "Create named sessions per puzzle type. Switch between them instantly. All data persists in localStorage.", color: NEON.cyan },
    { icon: Wifi, title: "PWA Offline", desc: "Install & use anywhere", detail: "Full Progressive Web App with service worker caching. Install on any device, works completely offline.", color: NEON.magenta },
    { icon: Download, title: "Import / Export", desc: "Never lose your data", detail: "Export all solves as JSON or CSV. Import from backups. Transfer data across devices.", color: NEON.green },
    { icon: Keyboard, title: "Keyboard Controls", desc: "Spacebar, arrows, letters", detail: "Spacebar starts and stops the timer. Arrow keys rotate the 3D view. Letter keys (R, U, F...) execute face moves directly.", color: NEON.cyan },
];

const TECH = ["JavaScript", "Three.js", "Chart.js", "Vite", "PWA", "CSS3"];

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function NeonBadge({ label, color }: { label: string; color: string }) {
    return (
        <span
            className="px-3 py-1 text-xs font-mono rounded-full"
            style={{ border: `1px solid ${color}`, color, boxShadow: `0 0 8px ${color}40` }}
        >
            {label}
        </span>
    );
}

function FeatureCard({ feature, isExpanded, onToggle, index }: {
    feature: typeof FEATURES[0]; isExpanded: boolean; onToggle: () => void; index: number;
}) {
    const Icon = feature.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{
                borderColor: feature.color,
                boxShadow: `0 0 15px ${feature.color}30`,
                y: -2,
            }}
            onClick={onToggle}
            className="p-5 rounded-xl cursor-pointer transition-colors duration-200"
            style={{ background: NEON.card, border: `1px solid ${NEON.border}` }}
        >
            <div className="flex items-start justify-between mb-2">
                <Icon className="w-5 h-5" style={{ color: feature.color }} />
                <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-3.5 h-3.5" style={{ color: NEON.border }} />
                </motion.div>
            </div>
            <div className="text-sm font-semibold text-[var(--text-primary)]">{feature.title}</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{feature.desc}</div>
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="overflow-hidden"
                    >
                        <p className="text-xs leading-relaxed mt-3 pt-3" style={{ color: "var(--text-secondary)", borderTop: `1px solid ${NEON.border}` }}>
                            {feature.detail}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// =============================================================================
// MAIN
// =============================================================================

export function RubiksCubePage({ project }: { project: Project }) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [expandedCard, setExpandedCard] = useState<number | null>(null);
    const demoUrl = "https://jayhemnani9910.github.io/rubiks-cube/";

    const handleEscape = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape" && isFullscreen) setIsFullscreen(false);
    }, [isFullscreen]);

    useEffect(() => {
        if (isFullscreen) document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isFullscreen, handleEscape]);

    const scrollToEmbed = () => {
        document.getElementById("live-embed")?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div className="min-h-screen" style={{ background: NEON.bg }}>

            {/* ============================================================= */}
            {/* HERO                                                          */}
            {/* ============================================================= */}
            <header className="pt-28 pb-16 px-6">
                <div className="max-w-5xl mx-auto">
                    <BackButton />

                    <motion.h1
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={SPRINGS.default}
                        className="text-4xl md:text-6xl font-bold mt-6 mb-4"
                        style={{
                            color: "#fff",
                            textShadow: `0 0 10px ${NEON.green}, 0 0 40px ${NEON.green}40`,
                        }}
                    >
                        Rubik&apos;s Cube Timer
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...SPRINGS.default, delay: 0.1 }}
                        className="text-lg mb-8 max-w-2xl"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        Keyboard-first speedcubing timer with Three.js 3D visualization, WCA-compliant scrambles, and the Ember Glass aesthetic.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...SPRINGS.default, delay: 0.2 }}
                        className="flex flex-wrap items-center gap-4 mb-8"
                    >
                        <motion.button
                            onClick={scrollToEmbed}
                            whileHover={{ scale: 1.02, boxShadow: `0 0 20px ${NEON.green}50` }}
                            whileTap={{ scale: 0.98 }}
                            className="px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors"
                            style={{
                                color: NEON.green,
                                border: `1px solid ${NEON.green}`,
                                background: "transparent",
                                boxShadow: `0 0 10px ${NEON.green}20`,
                            }}
                        >
                            Play Now
                        </motion.button>
                        <a href="https://github.com/jayhemnani9910/rubiks-cube" target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm transition-colors hover:opacity-80"
                            style={{ color: NEON.cyan }}>
                            <Github className="w-4 h-4" /> Source
                        </a>
                        <a href={demoUrl} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm transition-colors hover:opacity-80"
                            style={{ color: NEON.cyan }}>
                            <ExternalLink className="w-4 h-4" /> Open in Tab
                        </a>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...SPRINGS.default, delay: 0.3 }}
                        className="flex flex-wrap gap-3"
                    >
                        <NeonBadge label="18 Modules" color={NEON.cyan} />
                        <NeonBadge label="PWA" color={NEON.magenta} />
                        <NeonBadge label="60 FPS" color={NEON.green} />
                    </motion.div>
                </div>
            </header>

            {/* ============================================================= */}
            {/* LIVE EMBED                                                    */}
            {/* ============================================================= */}
            <section id="live-embed" className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <p className="text-xs font-medium uppercase tracking-widest mb-4" style={{ color: NEON.cyan }}>Live Demo</p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={SPRINGS.default}
                        className={`relative rounded-xl overflow-hidden transition-all duration-300 ${isFullscreen ? "fixed inset-4 z-50" : ""}`}
                        style={{
                            border: `1px solid ${NEON.cyan}40`,
                            boxShadow: `0 0 20px ${NEON.cyan}15, 0 0 60px ${NEON.cyan}08`,
                            height: isFullscreen ? "auto" : undefined,
                        }}
                    >
                        <div className="flex items-center justify-between px-4 py-2" style={{ background: "#111" }}>
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                            </div>
                            <button
                                onClick={() => setIsFullscreen(!isFullscreen)}
                                className="flex items-center gap-1.5 text-xs transition-colors hover:opacity-80"
                                style={{ color: NEON.cyan }}
                            >
                                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                                {isFullscreen ? "Exit" : "Expand"}
                            </button>
                        </div>
                        <iframe
                            src={demoUrl}
                            className="w-full"
                            style={{
                                height: isFullscreen ? "calc(100vh - 4rem)" : "clamp(400px, 65vh, 650px)",
                                background: "#000",
                            }}
                            title="Rubik's Cube Timer"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                        />
                    </motion.div>

                    <p className="text-xs text-center mt-3" style={{ color: "var(--text-muted)" }}>
                        Press spacebar to start/stop timer &middot; Arrow keys to rotate &middot; Letter keys for face moves
                    </p>
                </div>
            </section>

            {/* ============================================================= */}
            {/* FEATURE CARDS                                                 */}
            {/* ============================================================= */}
            <section className="py-16 px-6">
                <div className="max-w-6xl mx-auto">
                    <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-xs font-medium uppercase tracking-widest mb-6"
                        style={{ color: NEON.magenta }}
                    >
                        Features
                    </motion.p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {FEATURES.map((f, i) => (
                            <FeatureCard
                                key={f.title}
                                feature={f}
                                index={i}
                                isExpanded={expandedCard === i}
                                onToggle={() => setExpandedCard(expandedCard === i ? null : i)}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================================= */}
            {/* TECH STACK                                                    */}
            {/* ============================================================= */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="flex flex-wrap justify-center gap-3"
                    >
                        {TECH.map((t) => (
                            <span
                                key={t}
                                className="px-3 py-1.5 text-xs rounded-full transition-colors duration-200"
                                style={{
                                    color: "var(--text-secondary)",
                                    border: `1px solid ${NEON.border}`,
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = NEON.cyan;
                                    e.currentTarget.style.color = NEON.cyan;
                                    e.currentTarget.style.boxShadow = `0 0 8px ${NEON.cyan}30`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = NEON.border;
                                    e.currentTarget.style.color = "var(--text-secondary)";
                                    e.currentTarget.style.boxShadow = "none";
                                }}
                            >
                                {t}
                            </span>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ============================================================= */}
            {/* FOOTER                                                        */}
            {/* ============================================================= */}
            <div className="py-10 px-6" style={{ borderTop: `1px solid ${NEON.border}` }}>
                <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-6">
                    <a href="https://github.com/jayhemnani9910/rubiks-cube" target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm transition-colors hover:opacity-80"
                        style={{ color: "var(--text-secondary)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = NEON.green; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; }}>
                        <Github className="w-4 h-4" /> Source Code
                    </a>
                    <a href={demoUrl} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm transition-colors hover:opacity-80"
                        style={{ color: "var(--text-secondary)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = NEON.cyan; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; }}>
                        <ExternalLink className="w-4 h-4" /> Open in New Tab
                    </a>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6 pt-6" style={{ borderTop: `1px solid ${NEON.border}` }}>
                    <ReactionBar slug={project.id} />
                    <ViewCounter slug={project.id} />
                </div>
            </div>
        </div>
    );
}
