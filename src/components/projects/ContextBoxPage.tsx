"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Github, ExternalLink, Search, Camera, FileText, MessageSquare, Database, Download } from "lucide-react";
import type { Project } from "@/lib/definitions";
import { BackButton } from "@/components/BackButton";
import { SPRINGS, EASINGS } from "@/lib/motion";

// =============================================================================
// DATA (verified against actual codebase)
// =============================================================================

const CLI_COMMANDS = [
    { cmd: "contextbox capture", desc: "Screenshot + OCR + store to SQLite", icon: Camera },
    { cmd: "contextbox search <query>", desc: "Semantic similarity search over stored contexts", icon: Search },
    { cmd: "contextbox ask <question>", desc: "AI Q&A powered by GitHub Models (GPT-4o)", icon: MessageSquare },
    { cmd: "contextbox summarize", desc: "AI-generated summaries of captured contexts", icon: FileText },
    { cmd: "contextbox list", desc: "List all stored contexts with metadata", icon: Database },
    { cmd: "contextbox export --format json", desc: "Export contexts as JSON or CSV", icon: Download },
];

const TECH = ["Python", "Click", "Rich", "SQLite", "Sentence-Transformers", "Tesseract", "GitHub Models"];

const FEATURES = [
    "Cross-platform screenshot capture — Wayland (grim), X11 (scrot, maim), macOS, with graceful fallback",
    "Tesseract OCR for text extraction from screenshots and images",
    "Semantic search via sentence-transformers embeddings (all-MiniLM-L6-v2, 384-dim) stored as SQLite BLOBs",
    "LLM-powered Q&A and summarization via GitHub Models (GPT-4o, Llama, Mistral — free tier)",
    "Content extractors for URLs, YouTube transcripts, Wikipedia articles, and code files",
    "Rich terminal UI with formatted tables, progress bars, and colored output",
];

const EXTRACTORS = ["URLs", "YouTube transcripts", "Wikipedia", "Code files", "OCR text", "Clipboard"];

// =============================================================================
// VECTOR SEARCH DEMO (adapted from v1)
// =============================================================================

const SAMPLE_QUERIES = ["authentication code", "React component", "API endpoint"];
const SAMPLE_RESULTS = [
    { text: "LoginForm.tsx — OAuth flow", similarity: 0.92 },
    { text: "AuthContext.tsx — session mgmt", similarity: 0.87 },
    { text: "api/auth.py — JWT tokens", similarity: 0.84 },
];

function VectorSearchDemo() {
    const [query, setQuery] = useState("");
    const [searching, setSearching] = useState(false);
    const [results, setResults] = useState<{ text: string; similarity: number }[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            const q = SAMPLE_QUERIES[Math.floor(Math.random() * SAMPLE_QUERIES.length)];
            setQuery(q);
            setSearching(true);
            setTimeout(() => {
                setSearching(false);
                setResults(SAMPLE_RESULTS.map(r => ({ ...r, similarity: Math.random() * 0.12 + 0.82 })));
            }, 800);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="rounded-xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2 px-4 py-2" style={{ background: "#161b22" }}>
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                </div>
                <span className="text-xs font-mono ml-2" style={{ color: "var(--accent)" }}>contextbox search</span>
            </div>
            <div className="p-4" style={{ background: "#0d1117" }}>
                <div className="flex items-center gap-2 mb-4">
                    <Search className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                    <span className="text-sm font-mono" style={{ color: "var(--text-primary)" }}>
                        {query || "Search by concept..."}
                    </span>
                    {searching && <span className="w-3 h-3 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />}
                </div>
                <div className="space-y-2">
                    {results.map((r, i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-2 rounded font-mono text-sm" style={{ background: "#161b22", opacity: searching ? 0.3 : 1, transition: "opacity 0.3s" }}>
                            <span style={{ color: "var(--text-secondary)" }}>{r.text}</span>
                            <span style={{ color: "var(--accent)" }}>{(r.similarity * 100).toFixed(0)}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// =============================================================================
// MAIN
// =============================================================================

export function ContextBoxPage({ project }: { project: Project }) {
    return (
        <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>

            {/* HERO */}
            <header className="pt-28 pb-8 px-6">
                <div className="max-w-4xl mx-auto">
                    <BackButton />
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={SPRINGS.default} className="mt-4">
                        <p className="eyebrow mb-3">Knowledge Management</p>
                        <h1 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">ContextBox</h1>
                        <p className="text-lg text-[var(--text-secondary)] mb-6 max-w-2xl leading-relaxed">
                            CLI-first personal knowledge assistant. Captures screenshots, extracts text via OCR, embeds with sentence-transformers, and enables semantic search + AI Q&A — all from the terminal.
                        </p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRINGS.default, delay: 0.15 }} className="flex flex-wrap items-center gap-4">
                        <a href={project.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                            <Github className="w-4 h-4" /> Source
                        </a>
                        <a href="https://jayhemnani9910.github.io/contextbox/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium text-[var(--text-secondary)] hover:border-[var(--accent)] transition-colors" style={{ borderColor: "var(--border)" }}>
                            <ExternalLink className="w-4 h-4" /> Docs
                        </a>
                        <div className="flex flex-wrap gap-2">
                            {['Click', 'SQLite', 'Sentence-Transformers', 'Tesseract'].map(t => (
                                <span key={t} className="px-2 py-1 text-xs font-mono rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">{t}</span>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* VECTOR SEARCH DEMO */}
            <section className="py-10 px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={SPRINGS.default}>
                        <VectorSearchDemo />
                        <p className="text-xs text-center mt-3 italic text-[var(--text-muted)]">
                            Fig. 1 — Semantic search demo. Queries matched against embedded contexts using cosine similarity.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* CLI COMMANDS */}
            <section className="py-16 px-6" style={{ background: "var(--bg-secondary)" }}>
                <div className="max-w-4xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: EASINGS.apple }} className="mb-6">
                        <p className="eyebrow mb-2">CLI</p>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Commands</h2>
                    </motion.div>
                    <div className="space-y-2">
                        {CLI_COMMANDS.map((cmd, i) => {
                            const Icon = cmd.icon;
                            return (
                                <motion.div
                                    key={cmd.cmd}
                                    initial={{ opacity: 0, x: -16 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05, duration: 0.4, ease: EASINGS.apple }}
                                    className="flex items-center gap-4 p-3 rounded-lg border transition-colors duration-200 hover:border-[var(--accent)]/40"
                                    style={{ background: "var(--bg-primary)", borderColor: "var(--border)" }}
                                >
                                    <Icon className="w-4 h-4 shrink-0" style={{ color: "var(--accent)" }} />
                                    <code className="text-sm font-mono shrink-0" style={{ color: "var(--accent)" }}>{cmd.cmd}</code>
                                    <span className="text-xs text-[var(--text-muted)] hidden sm:inline">— {cmd.desc}</span>
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
                            <motion.div key={i} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.4, ease: EASINGS.apple }} className="flex gap-3 text-sm text-[var(--text-secondary)] leading-relaxed">
                                <span className="shrink-0 mt-1" style={{ color: "var(--accent)" }}>▸</span>
                                <span>{item}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* EXTRACTORS + TECH */}
            <section className="py-16 px-6" style={{ background: "var(--bg-secondary)" }}>
                <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10">
                    <div>
                        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-xs font-mono uppercase tracking-wider mb-3" style={{ color: "var(--accent)" }}>Content Sources</motion.p>
                        <div className="flex flex-wrap gap-2">
                            {EXTRACTORS.map(e => (
                                <span key={e} className="px-3 py-1.5 text-xs font-mono rounded-lg transition-colors duration-200 hover:border-[var(--accent)]/40" style={{ color: "var(--text-secondary)", border: "1px solid var(--border)", background: "var(--bg-primary)" }}>{e}</span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-xs font-mono uppercase tracking-wider mb-3" style={{ color: "var(--accent)" }}>Tech Stack</motion.p>
                        <div className="flex flex-wrap gap-2">
                            {TECH.map(t => (
                                <span key={t} className="px-3 py-1.5 text-xs font-mono rounded-lg transition-colors duration-200 hover:border-[var(--accent)]/40" style={{ color: "var(--text-secondary)", border: "1px solid var(--border)", background: "var(--bg-primary)" }}>{t}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <div className="py-8 px-6 border-t" style={{ borderColor: "var(--border)" }}>
                <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4">
                    <a href={project.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors">
                        <Github className="w-4 h-4" /> jayhemnani9910/contextbox <ExternalLink className="w-3 h-3" />
                    </a>
                    <div className="flex gap-6 font-mono text-xs">
                        <span><span style={{ color: "var(--accent)" }}>27</span> <span className="text-[var(--text-muted)]">Modules</span></span>
                        <span><span style={{ color: "var(--accent)" }}>6</span> <span className="text-[var(--text-muted)]">Extractors</span></span>
                        <span><span style={{ color: "var(--accent)" }}>MIT</span> <span className="text-[var(--text-muted)]">License</span></span>
                    </div>
                </div>
            </div>
        </div>
    );
}
