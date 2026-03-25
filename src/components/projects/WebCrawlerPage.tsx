"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Github, ExternalLink, Globe, Search, Shield, Database, ArrowRight } from "lucide-react";
import type { Project } from "@/lib/definitions";
import { BackButton } from "@/components/BackButton";
import { ReactionBar } from "@/components/ReactionBar";
import { ViewCounter } from "@/components/ViewCounter";
import { SPRINGS, EASINGS } from "@/lib/motion";

// =============================================================================
// DATA (verified against actual codebase — 26 Python modules)
// =============================================================================

const PIPELINE = [
    { label: "Discover", detail: "Sitemap parsing + internal link extraction with robots.txt respect", icon: Globe },
    { label: "Archive", detail: "ArchiveBox integration with retry logic and conditional GET", icon: Database },
    { label: "Detect", detail: "SHA-256 content hashing for version comparison and diff tracking", icon: Shield },
    { label: "Search", detail: "SQLite FTS5 full-text search with faceting by site and date", icon: Search },
];

const FEATURES = [
    "Automatic sitemap + internal link discovery with configurable depth",
    "ArchiveBox page archiving with retry logic (up to 3 attempts)",
    "SHA-256 content hashing — change detection without false positives",
    "SQLite FTS5 full-text search with faceting and pagination",
    "Flask web UI for site management, browsing, and search",
    "APScheduler with configurable 2-hour crawl intervals",
    "HMAC-SHA256 cryptographic signing for page version integrity",
    "Prometheus metrics endpoint for monitoring",
];

const INFRA = [
    { name: "Docker Compose", detail: "Multi-service: crawler, Prometheus, Grafana, IPFS" },
    { name: "Prometheus", detail: "Metrics collection with search request counters" },
    { name: "Systemd", detail: "Timer units for production auto-restart" },
    { name: "Crypto", detail: "HMAC-SHA256 signing + Merkle tree scaffolding" },
];

const TECH = ["Python", "Flask", "SQLite", "FTS5", "ArchiveBox", "Docker", "Prometheus", "APScheduler"];

// =============================================================================
// STATUS ANIMATION
// =============================================================================

function CrawlStatus() {
    const [active, setActive] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => setActive((p) => (p + 1) % PIPELINE.length), 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-wrap items-center justify-center gap-2 p-5 rounded-xl border" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
            {PIPELINE.map((step, i) => {
                const Icon = step.icon;
                return (
                    <div key={step.label} className="flex items-center gap-2">
                        <motion.div
                            animate={{
                                background: i === active ? "var(--accent)" : "var(--bg-primary)",
                                borderColor: i === active ? "var(--accent)" : "var(--border)",
                            }}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-300"
                        >
                            <Icon className="w-3.5 h-3.5" style={{ color: i === active ? "#fff" : "var(--text-muted)" }} />
                            <span style={{ color: i === active ? "#fff" : "var(--text-muted)" }}>{step.label}</span>
                        </motion.div>
                        {i < PIPELINE.length - 1 && <ArrowRight className="w-3.5 h-3.5 hidden sm:block" style={{ color: i < active ? "var(--accent)" : "var(--border)" }} />}
                    </div>
                );
            })}
        </div>
    );
}

// =============================================================================
// MAIN
// =============================================================================

export function WebCrawlerPage({ project }: { project: Project }) {
    return (
        <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>

            {/* HERO */}
            <header className="pt-28 pb-8 px-6">
                <div className="max-w-5xl mx-auto">
                    <BackButton />
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={SPRINGS.default} className="mt-4">
                        <div className="flex items-center gap-3 mb-3">
                            <p className="eyebrow">Web Monitoring</p>
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}>
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                Active
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">Website Watcher</h1>
                        <p className="text-lg text-[var(--text-secondary)] mb-6 max-w-2xl leading-relaxed">
                            Production web archiver with automated crawling, SHA-256 change detection, full-text search, and cryptographic verification. 26 Python modules with Docker orchestration.
                        </p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRINGS.default, delay: 0.15 }} className="flex flex-wrap items-center gap-4">
                        <a href={project.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                            <Github className="w-4 h-4" /> Source Code
                        </a>
                        <div className="flex flex-wrap gap-2">
                            {TECH.slice(0, 6).map(t => (
                                <span key={t} className="px-2 py-1 text-xs font-mono rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">{t}</span>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* CRAWL PIPELINE */}
            <section className="py-12 px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
                        <p className="eyebrow mb-4 text-center">Pipeline</p>
                        <CrawlStatus />
                    </motion.div>
                </div>
            </section>

            {/* PIPELINE DETAIL CARDS */}
            <section className="py-16 px-6" style={{ background: "var(--bg-secondary)" }}>
                <div className="max-w-5xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: EASINGS.apple }} className="mb-8">
                        <p className="eyebrow mb-2">How It Works</p>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">4-Stage Pipeline</h2>
                    </motion.div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {PIPELINE.map((step, i) => {
                            const Icon = step.icon;
                            return (
                                <motion.div
                                    key={step.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.08, duration: 0.4, ease: EASINGS.apple }}
                                    whileHover={{ y: -3, borderColor: "var(--accent)", transition: { type: "spring", stiffness: 300, damping: 25 } }}
                                    className="p-5 rounded-xl border transition-colors duration-200"
                                    style={{ background: "var(--bg-primary)", borderColor: "var(--border)" }}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold" style={{ background: "rgba(var(--accent-rgb, 10, 132, 255), 0.1)", color: "var(--accent)" }}>{i + 1}</span>
                                        <Icon className="w-4 h-4" style={{ color: "var(--accent)" }} />
                                        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{step.label}</h3>
                                    </div>
                                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{step.detail}</p>
                                </motion.div>
                            );
                        })}
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
                            <motion.div key={i} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05, duration: 0.4, ease: EASINGS.apple }} className="flex gap-3 text-sm text-[var(--text-secondary)] leading-relaxed">
                                <span className="shrink-0 mt-1" style={{ color: "var(--accent)" }}>▸</span>
                                <span>{item}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* INFRASTRUCTURE */}
            <section className="py-16 px-6" style={{ background: "var(--bg-secondary)" }}>
                <div className="max-w-5xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: EASINGS.apple }} className="mb-8">
                        <p className="eyebrow mb-2">Infrastructure</p>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Production Stack</h2>
                    </motion.div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {INFRA.map((item, i) => (
                            <motion.div
                                key={item.name}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08, duration: 0.4, ease: EASINGS.apple }}
                                whileHover={{ y: -3, transition: { type: "spring", stiffness: 300, damping: 25 } }}
                                className="p-5 rounded-xl border transition-colors duration-200 hover:border-[var(--accent)]/40"
                                style={{ background: "var(--bg-primary)", borderColor: "var(--border)" }}
                            >
                                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">{item.name}</h3>
                                <p className="text-xs text-[var(--text-muted)]">{item.detail}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <div className="py-8 px-6 border-t" style={{ borderColor: "var(--border)" }}>
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <a href={project.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors">
                            <Github className="w-4 h-4" /> jayhemnani9910/webcrawler <ExternalLink className="w-3 h-3" />
                        </a>
                        <div className="flex gap-6 font-mono text-xs">
                            <span><span style={{ color: "var(--accent)" }}>26</span> <span className="text-[var(--text-muted)]">Modules</span></span>
                            <span><span style={{ color: "var(--accent)" }}>FTS5</span> <span className="text-[var(--text-muted)]">Search</span></span>
                            <span><span style={{ color: "var(--accent)" }}>SHA-256</span> <span className="text-[var(--text-muted)]">Hashing</span></span>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-6 mt-6 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
                        <ReactionBar slug={project.id} />
                        <ViewCounter slug={project.id} />
                    </div>
                </div>
            </div>
        </div>
    );
}
