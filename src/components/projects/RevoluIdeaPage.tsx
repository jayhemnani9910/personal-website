"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Github, ExternalLink, Search, Shield, Scale, FileText, Edit3, Eye } from "lucide-react";
import type { Project } from "@/lib/definitions";
import { BackButton } from "@/components/BackButton";
import { ReactionBar } from "@/components/ReactionBar";
import { ViewCounter } from "@/components/ViewCounter";
import { SPRINGS, EASINGS } from "@/lib/motion";

// =============================================================================
// DATA (verified against actual codebase)
// =============================================================================

const AGENTS = [
    { name: "Causal Planner", desc: "Creates initial causal DAG from the research query — maps cause/effect relationships to investigate", icon: FileText, color: "#7c3aed" },
    { name: "Edge Selector", desc: "Picks the next causal edge to investigate based on uncertainty and importance", icon: Search, color: "#0ea5e9" },
    { name: "Adversarial Researcher", desc: "Red team — searches for evidence that contradicts the current hypothesis", icon: Shield, color: "#ef4444" },
    { name: "Supporter Researcher", desc: "Blue team — searches for evidence that supports the current hypothesis", icon: Search, color: "#22c55e" },
    { name: "Dialectical Judge", desc: "Resolves conflicts between adversary and supporter evidence, assigns confidence scores", icon: Scale, color: "#f59e0b" },
    { name: "Writer", desc: "Synthesizes all validated findings into a coherent research report with citations", icon: Edit3, color: "#8b5cf6" },
    { name: "Auditor", desc: "Safety checks — detects hallucination, prevents loops, validates citation integrity", icon: Eye, color: "#06b6d4" },
];

const FEATURES = [
    "Causal-Adversarial Graph methodology — models cause/effect relationships, not just information retrieval",
    "Red/Blue team parallel verification — adversary and supporter run concurrently, judge reconciles",
    "Iterative edge investigation — loops back when fact-checking reveals gaps (not linear pipeline)",
    "Hexagonal architecture — agents depend on ports (LLMPort, SearchPort), implementations injected",
    "Hybrid LLM routing — round-robin across 11+ Groq models, GitHub Models, Ollama local fallback",
    "Action hashing + visit counting — prevents infinite loops and duplicate investigations",
];

const LLM_PROVIDERS = [
    { name: "GitHub Models", detail: "GPT-4o, GPT-4o-mini (free with Copilot)" },
    { name: "Groq", detail: "Llama 3.3 70B, Qwen3 32B, Kimi K2 + 8 more" },
    { name: "Ollama", detail: "Local Llama 3, Mistral — ~70% cost reduction" },
];

const SEARCH_PROVIDERS = ["Tavily", "Exa", "DuckDuckGo", "Wikipedia"];

// =============================================================================
// CAUSAL GRAPH VISUALIZATION
// =============================================================================

function CausalGraphAnimation() {
    const [activeEdge, setActiveEdge] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => setActiveEdge((p) => (p + 1) % 4), 2000);
        return () => clearInterval(interval);
    }, []);

    const nodes = [
        { id: "Q", x: 50, y: 12, label: "Query" },
        { id: "A", x: 20, y: 40, label: "Cause A" },
        { id: "B", x: 50, y: 40, label: "Cause B" },
        { id: "C", x: 80, y: 40, label: "Cause C" },
        { id: "E1", x: 35, y: 68, label: "Effect 1" },
        { id: "E2", x: 65, y: 68, label: "Effect 2" },
        { id: "R", x: 50, y: 90, label: "Report" },
    ];

    const edges = [
        { from: "Q", to: "A" }, { from: "Q", to: "B" }, { from: "Q", to: "C" },
        { from: "A", to: "E1" }, { from: "B", to: "E1" }, { from: "B", to: "E2" },
        { from: "C", to: "E2" }, { from: "E1", to: "R" }, { from: "E2", to: "R" },
    ];

    const activeEdges = [
        [0, 3], // Q→A, A→E1
        [1, 4, 5], // Q→B, B→E1, B→E2
        [2, 6], // Q→C, C→E2
        [7, 8], // E1→R, E2→R
    ];

    const getNode = (id: string) => nodes.find(n => n.id === id)!;

    return (
        <div className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--bg-secondary)]">
            <div className="absolute top-4 left-4 text-xs text-[var(--text-muted)] font-mono">Causal-Adversarial Graph</div>
            <div className="absolute top-4 right-4 flex gap-2">
                {["Plan", "Investigate", "Investigate", "Synthesize"].map((label, i) => (
                    <span key={`${label}-${i}`} className={`px-2 py-0.5 rounded text-xs transition-all duration-300 ${activeEdge === i ? "bg-[var(--accent)] text-white" : "bg-[var(--bg-tertiary)] text-[var(--text-muted)]"}`}>
                        {label}
                    </span>
                ))}
            </div>

            <svg viewBox="0 0 100 100" className="w-full h-full">
                {edges.map((edge, i) => {
                    const from = getNode(edge.from), to = getNode(edge.to);
                    const isActive = activeEdges[activeEdge]?.includes(i);
                    return <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={isActive ? "var(--accent)" : "var(--border)"} strokeWidth={isActive ? 1.2 : 0.4} className="transition-all duration-500" />;
                })}
                {nodes.map((node) => {
                    const isSource = activeEdge < 3 && edges.some((e, i) => activeEdges[activeEdge]?.includes(i) && (e.from === node.id || e.to === node.id));
                    return (
                        <g key={node.id}>
                            <circle cx={node.x} cy={node.y} r={node.id === "Q" || node.id === "R" ? 6 : 5} fill={isSource ? "var(--accent)" : "var(--bg-tertiary)"} stroke={isSource ? "white" : "var(--border)"} strokeWidth={isSource ? 1.5 : 0.5} className="transition-all duration-500" />
                            <text x={node.x} y={node.y + 10} textAnchor="middle" fill="var(--text-muted)" fontSize="3" fontFamily="monospace">{node.label}</text>
                        </g>
                    );
                })}
            </svg>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
                <div className="text-xs text-[var(--text-muted)]">
                    {activeEdge === 0 && "Planning causal relationships..."}
                    {activeEdge === 1 && "Red/Blue team investigating edge B..."}
                    {activeEdge === 2 && "Adversarial verification on edge C..."}
                    {activeEdge === 3 && "Synthesizing validated findings into report"}
                </div>
            </div>
        </div>
    );
}

// =============================================================================
// MAIN
// =============================================================================

export function RevoluIdeaPage({ project }: { project: Project }) {
    return (
        <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>

            {/* HERO */}
            <header className="pt-28 pb-8 px-6">
                <div className="max-w-4xl mx-auto">
                    <BackButton />
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={SPRINGS.default} className="mt-4">
                        <p className="eyebrow mb-3">AI Research Automation</p>
                        <h1 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">CAG Deep Research</h1>
                        <p className="text-lg text-[var(--text-secondary)] mb-6 max-w-2xl leading-relaxed">
                            Causal-Adversarial Graph engine for autonomous research. 7 specialized LangGraph agents with Red/Blue team verification and dialectical judgment — inspired by Popperian falsification.
                        </p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRINGS.default, delay: 0.15 }} className="flex flex-wrap items-center gap-4">
                        <a href={project.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                            <Github className="w-4 h-4" /> Source
                        </a>
                        <div className="flex flex-wrap gap-2">
                            {['LangGraph', 'Multi-Agent', 'Pydantic', 'Ollama'].map(t => (
                                <span key={t} className="px-2 py-1 text-xs font-mono rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">{t}</span>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* CAUSAL GRAPH VISUALIZATION */}
            <section className="py-10 px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={SPRINGS.default}>
                        <CausalGraphAnimation />
                        <p className="text-xs text-center mt-3 italic text-[var(--text-muted)]">
                            Fig. 1 — Causal DAG with iterative edge investigation. Adversary and supporter agents run in parallel per edge.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* 7 AGENT NODES */}
            <section className="py-16 px-6" style={{ background: "var(--bg-secondary)" }}>
                <div className="max-w-5xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: EASINGS.apple }} className="mb-8">
                        <p className="eyebrow mb-2">LangGraph State Machine</p>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">7 Agent Nodes</h2>
                    </motion.div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {AGENTS.map((agent, i) => {
                            const Icon = agent.icon;
                            return (
                                <motion.div
                                    key={agent.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.06, duration: 0.4, ease: EASINGS.apple }}
                                    whileHover={{ y: -3, borderColor: agent.color, transition: { type: "spring", stiffness: 300, damping: 25 } }}
                                    className="p-5 rounded-xl border transition-colors duration-200"
                                    style={{ background: "var(--bg-primary)", borderColor: "var(--border)" }}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${agent.color}15` }}>
                                            <Icon className="w-4 h-4" style={{ color: agent.color }} />
                                        </div>
                                        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{agent.name}</h3>
                                    </div>
                                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{agent.desc}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* KEY FEATURES */}
            <section className="py-16 px-6">
                <div className="max-w-3xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: EASINGS.apple }} className="mb-8">
                        <p className="eyebrow mb-2">Methodology</p>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">What Makes It Different</h2>
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

            {/* LLM PROVIDERS */}
            <section className="py-16 px-6" style={{ background: "var(--bg-secondary)" }}>
                <div className="max-w-4xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: EASINGS.apple }} className="mb-8">
                        <p className="eyebrow mb-2">Infrastructure</p>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Hybrid LLM Strategy</h2>
                    </motion.div>
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                        {LLM_PROVIDERS.map((p, i) => (
                            <motion.div key={p.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.4, ease: EASINGS.apple }}
                                className="p-4 rounded-xl border transition-colors duration-200 hover:border-[var(--accent)]/40" style={{ background: "var(--bg-primary)", borderColor: "var(--border)" }}>
                                <div className="text-sm font-semibold text-[var(--text-primary)] mb-1">{p.name}</div>
                                <div className="text-xs text-[var(--text-muted)]">{p.detail}</div>
                            </motion.div>
                        ))}
                    </div>
                    <div>
                        <p className="text-xs font-mono uppercase tracking-wider mb-3" style={{ color: "var(--accent)" }}>Search Providers</p>
                        <div className="flex flex-wrap gap-2">
                            {SEARCH_PROVIDERS.map(s => (
                                <span key={s} className="px-3 py-1 text-xs font-mono rounded-full" style={{ color: "var(--text-secondary)", border: "1px solid var(--border)" }}>{s}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <div className="py-8 px-6 border-t" style={{ borderColor: "var(--border)" }}>
                <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
                    <a href={project.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors">
                        <Github className="w-4 h-4" /> jayhemnani9910/revolu-idea <ExternalLink className="w-3 h-3" />
                    </a>
                    <div className="flex gap-6 font-mono text-xs">
                        <span><span style={{ color: "var(--accent)" }}>7</span> <span className="text-[var(--text-muted)]">Agents</span></span>
                        <span><span style={{ color: "var(--accent)" }}>11+</span> <span className="text-[var(--text-muted)]">LLM Models</span></span>
                        <span><span style={{ color: "var(--accent)" }}>4</span> <span className="text-[var(--text-muted)]">Search APIs</span></span>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
                    <ReactionBar slug={project.id} />
                    <ViewCounter slug={project.id} />
                </div>
            </div>
        </div>
    );
}
