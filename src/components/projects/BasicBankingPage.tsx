"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Github, ExternalLink, CreditCard, ArrowLeftRight, History, Shield, ArrowRight } from "lucide-react";
import type { Project } from "@/lib/definitions";
import { BackButton } from "@/components/BackButton";
import { ReactionBar } from "@/components/ReactionBar";
import { ViewCounter } from "@/components/ViewCounter";
import { SPRINGS, EASINGS } from "@/lib/motion";

// =============================================================================
// DATA (verified against actual repo — 7 PHP files)
// =============================================================================

const TX_STEPS = ["Select Sender", "Choose Recipient", "Enter Amount", "Confirm Transfer", "Updated Balances"];

const FEATURES = [
    { name: "User Authentication", desc: "Session-based login with PHP sessions", icon: Shield },
    { name: "Money Transfers", desc: "Account-to-account transfers with validation", icon: ArrowLeftRight },
    { name: "Balance View", desc: "Real-time account balance display", icon: CreditCard },
    { name: "Transaction History", desc: "Full ledger with timestamps and details", icon: History },
];

const HIGHLIGHTS = [
    "PHP + MySQL backend with procedural architecture",
    "Session-based authentication and authorization",
    "Account-to-account transfers with balance validation",
    "Transaction history ledger with full audit trail",
    "Input validation to prevent overdrafts and invalid transfers",
    "Built during internship — first full-stack web application",
];

// =============================================================================
// TRANSACTION FLOW ANIMATION
// =============================================================================

function TransactionFlow() {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => setStep((p) => (p + 1) % TX_STEPS.length), 1500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-wrap items-center justify-center gap-2 p-5 rounded-xl border" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
            {TX_STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                    <motion.div
                        animate={{ background: i <= step ? "var(--accent)" : "var(--bg-primary)", color: i <= step ? "#fff" : "var(--text-muted)" }}
                        className="px-3 py-2 rounded-lg text-xs font-medium border"
                        style={{ borderColor: i <= step ? "var(--accent)" : "var(--border)" }}
                    >
                        {s}
                    </motion.div>
                    {i < TX_STEPS.length - 1 && <ArrowRight className="w-3.5 h-3.5 hidden sm:block" style={{ color: i < step ? "var(--accent)" : "var(--border)" }} />}
                </div>
            ))}
        </div>
    );
}

// =============================================================================
// MAIN
// =============================================================================

export function BasicBankingPage({ project }: { project: Project }) {
    return (
        <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>

            {/* HERO */}
            <header className="pt-28 pb-8 px-6">
                <div className="max-w-4xl mx-auto">
                    <BackButton />
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={SPRINGS.default} className="mt-4">
                        <p className="eyebrow mb-3">Full Stack</p>
                        <h1 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">Basic Banking System</h1>
                        <p className="text-lg text-[var(--text-secondary)] mb-6 max-w-2xl leading-relaxed">
                            PHP + MySQL banking application with user authentication, money transfers, and transaction history. Built during internship as a first full-stack web project.
                        </p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRINGS.default, delay: 0.15 }} className="flex flex-wrap items-center gap-4">
                        <a href="https://github.com/jeyhemnani99/Basic-banking-system" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                            <Github className="w-4 h-4" /> Source Code
                        </a>
                        <div className="flex flex-wrap gap-2">
                            {['PHP', 'MySQL', 'HTML/CSS'].map(t => (
                                <span key={t} className="px-2 py-1 text-xs font-mono rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">{t}</span>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* TRANSACTION FLOW */}
            <section className="py-12 px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                        <p className="eyebrow mb-4 text-center">Transaction Flow</p>
                        <TransactionFlow />
                    </motion.div>
                </div>
            </section>

            {/* FEATURES */}
            <section className="py-16 px-6" style={{ background: "var(--bg-secondary)" }}>
                <div className="max-w-5xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: EASINGS.apple }} className="mb-8">
                        <p className="eyebrow mb-2">Features</p>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Core Functionality</h2>
                    </motion.div>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {FEATURES.map((feat, i) => {
                            const Icon = feat.icon;
                            return (
                                <motion.div
                                    key={feat.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.08, duration: 0.4, ease: EASINGS.apple }}
                                    whileHover={{ y: -3, borderColor: "var(--accent)", transition: { type: "spring", stiffness: 300, damping: 25 } }}
                                    className="p-5 rounded-xl border transition-colors duration-200"
                                    style={{ background: "var(--bg-primary)", borderColor: "var(--border)" }}
                                >
                                    <Icon className="w-5 h-5 mb-3" style={{ color: "var(--accent)" }} />
                                    <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">{feat.name}</h3>
                                    <p className="text-xs text-[var(--text-muted)]">{feat.desc}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* HIGHLIGHTS */}
            <section className="py-16 px-6">
                <div className="max-w-3xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: EASINGS.apple }} className="mb-8">
                        <p className="eyebrow mb-2">Details</p>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Implementation</h2>
                    </motion.div>
                    <div className="space-y-3">
                        {HIGHLIGHTS.map((item, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06, duration: 0.4, ease: EASINGS.apple }} className="flex gap-3 text-sm text-[var(--text-secondary)] leading-relaxed">
                                <span className="shrink-0 mt-1" style={{ color: "var(--accent)" }}>▸</span>
                                <span>{item}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <div className="py-8 px-6 border-t" style={{ borderColor: "var(--border)" }}>
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <a href="https://github.com/jeyhemnani99/Basic-banking-system" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors">
                            <Github className="w-4 h-4" /> Source Code <ExternalLink className="w-3 h-3" />
                        </a>
                        <div className="flex gap-6 font-mono text-xs">
                            <span><span style={{ color: "var(--accent)" }}>PHP</span> <span className="text-[var(--text-muted)]">Backend</span></span>
                            <span><span style={{ color: "var(--accent)" }}>MySQL</span> <span className="text-[var(--text-muted)]">Database</span></span>
                            <span><span style={{ color: "var(--accent)" }}>2021</span> <span className="text-[var(--text-muted)]">Internship</span></span>
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
