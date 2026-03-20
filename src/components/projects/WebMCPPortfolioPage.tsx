"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, ChevronDown } from "lucide-react";
import type { Project } from "@/lib/definitions";
import { BackButton } from "@/components/BackButton";
import { isWebMCPAvailable } from "@/lib/webmcp";
import { SPRINGS, EASINGS } from "@/lib/motion";

// =============================================================================
// DATA
// =============================================================================

const TOOLS = [
    { name: "search_projects", desc: "Search by query, tech, tags, or domain", example: '> search_projects({ query: "vision", tech: "Python" })', response: '{ count: 4, projects: [{ id: "fifa-soccer-ds", title: "FIFA Soccer DS", tech: ["Python","YOLOv8"] }, ...] }' },
    { name: "get_project", desc: "Fetch full project details by slug", example: '> get_project({ id: "rubiks-timer" })', response: '{ title: "Rubik\'s Cube Timer", tech: ["JavaScript","Three.js"], challenge: "...", solution: [...] }' },
    { name: "get_resume", desc: "Get experience, education, skills", example: '> get_resume({ section: "experience" })', response: '{ experience: [{ company: "Elite Hotel Group", role: "Data Analyst", period: "Summer 2025" }, ...] }' },
    { name: "search_skills", desc: "Search skills by category or keyword", example: '> search_skills({ category: "ML/AI" })', response: '{ skills: ["PyTorch", "TensorFlow", "Scikit-learn", "YOLO", "Transformers", ...] }' },
    { name: "get_contact", desc: "Get contact info and social links", example: '> get_contact()', response: '{ name: "Jay Hemnani", email: "...", github: "...", website: "jayhemnani.me" }' },
    { name: "list_experiments", desc: "List lab experiments and current work", example: '> list_experiments({ search: "webmcp" })', response: '{ experiments: [{ title: "WebMCP Integration", status: "building", progress: 70 }] }' },
    { name: "toggle_theme", desc: "Toggle or set light/dark theme", example: '> toggle_theme({ theme: "dark" })', response: '{ theme: "dark", changed: true }' },
    { name: "switch_mode", desc: "Switch site presentation mode", example: '> switch_mode({ mode: "brand" })', response: '{ mode: "brand", description: "Personal brand emphasis" }' },
];

const ARCH_STEPS = [
    { label: "Build", detail: "Next.js loads MDX projects, resume, lab data via fs" },
    { label: "Server", detail: "WebMCPLoader serializes SiteData to client" },
    { label: "Client", detail: "WebMCPProvider detects navigator.modelContext" },
    { label: "Register", detail: "8 tools + 1 context registered with JSON Schema" },
    { label: "Query", detail: "AI agents call tools, get structured JSON responses" },
];

// =============================================================================
// COMPONENTS
// =============================================================================

function StatusBadge() {
    const [available] = useState<boolean | null>(() => {
        if (typeof window === "undefined") return null;
        return isWebMCPAvailable();
    });

    if (available === null) return null;

    return (
        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono ${
            available
                ? "text-green-400 border border-green-500/30"
                : "text-[var(--text-muted)] border border-[var(--border)]"
        }`} style={{ background: available ? "rgba(34,197,94,0.05)" : "transparent" }}>
            <span className={`w-1.5 h-1.5 rounded-full ${available ? "bg-green-400 animate-pulse" : "bg-[var(--text-muted)]"}`} />
            {available ? "ACTIVE" : "UNAVAILABLE"}
        </span>
    );
}

function ToolDemo({ tool, index }: { tool: typeof TOOLS[0]; index: number }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.04, duration: 0.4, ease: EASINGS.apple }}
        >
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full text-left p-3 rounded-lg border transition-colors duration-200 hover:border-[var(--accent)]/40"
                style={{ background: "var(--bg-secondary)", borderColor: expanded ? "var(--accent)" : "var(--border)" }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                        <code className="text-sm font-mono shrink-0" style={{ color: "var(--accent)" }}>{tool.name}</code>
                        <span className="text-xs text-[var(--text-muted)] truncate hidden sm:inline">{tool.desc}</span>
                    </div>
                    <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                    </motion.div>
                </div>
            </button>
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: EASINGS.apple }}
                        className="overflow-hidden"
                    >
                        <div className="mt-1 rounded-lg font-mono text-xs overflow-x-auto" style={{ background: "#0d1117" }}>
                            <div className="p-4 space-y-2">
                                <div style={{ color: "var(--accent)" }}>{tool.example}</div>
                                <div className="text-green-400/80">{tool.response}</div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// =============================================================================
// MAIN
// =============================================================================

export function WebMCPPortfolioPage({ project }: { project: Project }) {
    return (
        <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>

            {/* ============================================================= */}
            {/* HERO                                                          */}
            {/* ============================================================= */}
            <header className="pt-28 pb-12 px-6">
                <div className="max-w-4xl mx-auto">
                    <BackButton />

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={SPRINGS.default}
                        className="mt-4"
                    >
                        <div className="flex items-center gap-3 flex-wrap mb-4">
                            <h1 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)]">
                                WebMCP
                            </h1>
                            <StatusBadge />
                        </div>

                        <p className="text-lg text-[var(--text-secondary)] mb-6 max-w-2xl leading-relaxed">
                            Making this portfolio AI-agent queryable via the W3C WebMCP standard. 8 structured tools registered on <code className="text-[var(--accent)] text-base">navigator.modelContext</code> — no DOM scraping needed.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...SPRINGS.default, delay: 0.15 }}
                        className="flex flex-wrap items-center gap-4 mb-10"
                    >
                        <div className="flex flex-wrap gap-2">
                            {project.tech.map((t) => (
                                <span key={t} className="px-2 py-1 text-xs font-mono rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">{t}</span>
                            ))}
                        </div>
                    </motion.div>

                    {/* Architecture flow */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...SPRINGS.default, delay: 0.25 }}
                        className="flex flex-wrap items-center gap-2 font-mono text-xs"
                    >
                        {ARCH_STEPS.map((step, i) => (
                            <div key={step.label} className="flex items-center gap-2">
                                <div className="px-3 py-1.5 rounded-lg border" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                                    <span style={{ color: "var(--accent)" }}>{step.label}</span>
                                </div>
                                {i < ARCH_STEPS.length - 1 && (
                                    <span className="text-[var(--text-muted)]">→</span>
                                )}
                            </div>
                        ))}
                    </motion.div>
                </div>
            </header>

            {/* ============================================================= */}
            {/* BEFORE / AFTER                                                */}
            {/* ============================================================= */}
            <section className="py-12 px-6" style={{ background: "var(--bg-secondary)" }}>
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <p className="eyebrow mb-6">Why WebMCP</p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="rounded-xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
                                <div className="flex items-center gap-2 px-4 py-2" style={{ background: "#161b22" }}>
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                                    </div>
                                    <span className="text-xs text-red-400/80 font-mono ml-2">before.js</span>
                                </div>
                                <pre className="p-4 text-xs font-mono leading-relaxed overflow-x-auto" style={{ background: "#0d1117", color: "var(--text-muted)" }}>
{`// DOM scraping — brittle, slow
agent.click("#search-btn");
agent.waitFor(".results");
agent.scrape(".result-card");
// ❌ Breaks on redesign
// ❌ Requires screenshots
// ❌ Layout-dependent`}
                                </pre>
                            </div>
                            <div className="rounded-xl overflow-hidden border" style={{ borderColor: "rgba(var(--accent-rgb, 10, 132, 255), 0.3)" }}>
                                <div className="flex items-center gap-2 px-4 py-2" style={{ background: "#161b22" }}>
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                                    </div>
                                    <span className="text-xs font-mono ml-2" style={{ color: "var(--accent)" }}>after.js — WebMCP</span>
                                </div>
                                <pre className="p-4 text-xs font-mono leading-relaxed overflow-x-auto" style={{ background: "#0d1117", color: "var(--text-secondary)" }}>
{`// Structured tools — fast, stable
const results = await agent.call(
  "search_projects",
  { tech: "Python" }
);
// ✅ Layout-agnostic
// ✅ JSON in, JSON out
// ✅ 89% fewer tokens`}
                                </pre>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ============================================================= */}
            {/* TOOLS — Terminal Demo                                         */}
            {/* ============================================================= */}
            <section className="py-16 px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, ease: EASINGS.apple }}
                        className="mb-6"
                    >
                        <p className="eyebrow mb-2">API</p>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                            8 Registered Tools
                        </h2>
                        <p className="text-sm text-[var(--text-muted)] mt-1">Click any tool to see its call signature and example response.</p>
                    </motion.div>

                    <div className="space-y-2">
                        {TOOLS.map((tool, i) => (
                            <ToolDemo key={tool.name} tool={tool} index={i} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================================= */}
            {/* HOW IT WORKS                                                  */}
            {/* ============================================================= */}
            <section className="py-16 px-6" style={{ background: "var(--bg-secondary)" }}>
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, ease: EASINGS.apple }}
                        className="mb-8"
                    >
                        <p className="eyebrow mb-2">Architecture</p>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">How It Works</h2>
                    </motion.div>

                    <div className="space-y-3">
                        {ARCH_STEPS.map((step, i) => (
                            <motion.div
                                key={step.label}
                                initial={{ opacity: 0, x: -16 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08, duration: 0.4, ease: EASINGS.apple }}
                                className="flex items-start gap-4 p-4 rounded-lg border transition-colors duration-200 hover:border-[var(--accent)]/40"
                                style={{ background: "var(--bg-primary)", borderColor: "var(--border)" }}
                            >
                                <span className="shrink-0 w-7 h-7 rounded flex items-center justify-center text-xs font-bold font-mono" style={{ background: "rgba(var(--accent-rgb, 10, 132, 255), 0.1)", color: "var(--accent)" }}>{i + 1}</span>
                                <div>
                                    <span className="text-sm font-semibold text-[var(--text-primary)]">{step.label}</span>
                                    <p className="text-sm text-[var(--text-secondary)] mt-0.5">{step.detail}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================================= */}
            {/* TRY IT                                                        */}
            {/* ============================================================= */}
            <section className="py-16 px-6">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, ease: EASINGS.apple }}
                    >
                        <p className="eyebrow mb-2">Try It</p>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Test in Your Browser</h2>

                        <div className="rounded-xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
                            <div className="flex items-center gap-2 px-4 py-2" style={{ background: "#161b22" }}>
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                                </div>
                                <span className="text-xs text-[var(--text-muted)] font-mono ml-2">Chrome DevTools Console</span>
                            </div>
                            <pre className="p-4 text-xs font-mono leading-loose overflow-x-auto" style={{ background: "#0d1117" }}>
                                <span className="text-[var(--text-muted)]">{"// 1. Chrome 146 Canary + enable 'Experimental Web Platform Features' flag\n"}</span>
                                <span className="text-[var(--text-muted)]">{"// 2. Visit jayhemnani.me\n"}</span>
                                <span className="text-[var(--text-muted)]">{"// 3. Open DevTools Console and run:\n\n"}</span>
                                <span style={{ color: "var(--accent)" }}>{"navigator.modelContext\n"}</span>
                                <span className="text-green-400/80">{"// → ModelContext { registerTool, unregisterTool, ... }\n\n"}</span>
                                <span className="text-[var(--text-muted)]">{"// Tools are registered automatically on page load.\n"}</span>
                                <span className="text-[var(--text-muted)]">{"// AI agents can now query your portfolio as structured data."}</span>
                            </pre>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ============================================================= */}
            {/* STATS + FOOTER                                                */}
            {/* ============================================================= */}
            <div className="py-8 px-6 border-t" style={{ borderColor: "var(--border)" }}>
                <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-6">
                    <div className="flex flex-wrap gap-6 text-center">
                        {[
                            { v: "8", l: "Tools" },
                            { v: "25+", l: "Projects" },
                            { v: "~280", l: "LOC" },
                        ].map((s) => (
                            <div key={s.l}>
                                <div className="text-lg font-bold font-mono" style={{ color: "var(--accent)" }}>{s.v}</div>
                                <div className="text-xs text-[var(--text-muted)]">{s.l}</div>
                            </div>
                        ))}
                    </div>
                    <a href="https://webmcp.dev" target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                        W3C WebMCP Spec <ExternalLink className="w-3 h-3" />
                    </a>
                </div>
            </div>
        </div>
    );
}
