"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plane, Hotel, Car, Database, Server, MessageSquare, Users, Github, ExternalLink, Shield, ArrowRight } from "lucide-react";
import type { Project } from "@/lib/definitions";
import { BackButton } from "@/components/BackButton";
import { ReactionBar } from "@/components/ReactionBar";
import { ViewCounter } from "@/components/ViewCounter";
import { SPRINGS, EASINGS } from "@/lib/motion";

// =============================================================================
// DATA (all verified against actual codebase)
// =============================================================================

const SERVICES = [
    { name: "API Gateway", desc: "JWT auth, rate limiting, request routing", icon: Shield, color: "#f59e0b" },
    { name: "Search Service", desc: "Flight/hotel/car search with Redis caching", icon: Plane, color: "#3b82f6" },
    { name: "User Service", desc: "Registration, login, profile management", icon: Users, color: "#8b5cf6" },
    { name: "Booking Service", desc: "Booking workflow with inventory control", icon: Hotel, color: "#10b981" },
    { name: "Billing Service", desc: "Payment and billing operations", icon: Car, color: "#ec4899" },
    { name: "Admin Service", desc: "Analytics and admin management", icon: Server, color: "#6366f1" },
    { name: "AI Concierge", desc: "LangChain agent with 6 MRKL tools (Python/FastAPI)", icon: MessageSquare, color: "#06b6d4" },
];

const DATABASES = [
    { name: "MySQL 8.0", purpose: "OLTP", desc: "Bookings, users, transactions — ACID-compliant with referential integrity", color: "#3b82f6" },
    { name: "MongoDB 7.0", purpose: "Analytics", desc: "Search logs, user behavior, recommendation data — flexible schema", color: "#10b981" },
    { name: "Redis 7", purpose: "Cache", desc: "Search result caching — sub-100ms responses with intelligent invalidation", color: "#ef4444" },
];

const FEATURES = [
    "Kafka event-driven sync — listing, user, and deal events across all services",
    "JWT authentication with bcrypt password hashing and role-based authorization",
    "AI concierge with 6 tools: search bundles, price analyzer, watch creator, quote generator, policy lookup, booking confirmer",
    "Docker Compose orchestration — 9+ containers including Kafka, Zookeeper, and Kafka UI",
    "Multi-database strategy — MySQL for OLTP, MongoDB for analytics, Redis for caching",
    "API Gateway with CORS, Helmet security headers, rate limiting, and request timeouts",
];

const TIERS = [
    { label: "Frontend", detail: "React Web App", color: "#3b82f6" },
    { label: "Middleware", detail: "API Gateway + 6 Node.js Services + 1 Python AI", color: "#10b981" },
    { label: "Data Layer", detail: "MySQL + MongoDB + Redis + Kafka", color: "#8b5cf6" },
];

// =============================================================================
// EVENT FLOW ANIMATION
// =============================================================================

const EVENT_STEPS = ["User Action", "API Gateway", "Kafka Event", "Service", "DB Update"];

function EventFlow() {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => setStep((p) => (p + 1) % EVENT_STEPS.length), 1200);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-wrap items-center justify-center gap-2 p-4 rounded-xl border" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
            {EVENT_STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                    <motion.div
                        animate={{ background: i <= step ? "var(--accent)" : "var(--bg-primary)", color: i <= step ? "#fff" : "var(--text-muted)" }}
                        className="px-3 py-2 rounded-lg text-xs font-medium border transition-all duration-300"
                        style={{ borderColor: i <= step ? "var(--accent)" : "var(--border)" }}
                    >
                        {s}
                    </motion.div>
                    {i < EVENT_STEPS.length - 1 && <ArrowRight className="w-3.5 h-3.5 hidden sm:block" style={{ color: i < step ? "var(--accent)" : "var(--border)" }} />}
                </div>
            ))}
        </div>
    );
}

// =============================================================================
// MAIN
// =============================================================================

export function KayakDistributedPage({ project }: { project: Project }) {
    return (
        <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>

            {/* HERO */}
            <header className="pt-28 pb-8 px-6">
                <div className="max-w-5xl mx-auto">
                    <BackButton />
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={SPRINGS.default} className="mt-4">
                        <div className="flex items-center justify-between mb-3">
                            <p className="eyebrow">Distributed Systems</p>
                            <ViewCounter slug={project.id} />
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">Kayak Travel Platform</h1>
                        <p className="text-lg text-[var(--text-secondary)] mb-6 max-w-2xl leading-relaxed">
                            3-tier distributed travel metasearch with 7 microservices, Kafka event streaming, multi-database strategy, and an AI concierge powered by LangChain.
                        </p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRINGS.default, delay: 0.15 }} className="flex flex-wrap items-center gap-4">
                        <a href={project.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                            <Github className="w-4 h-4" /> Source Code
                        </a>
                        <div className="flex flex-wrap gap-2">
                            {['Node.js', 'Kafka', 'MySQL', 'MongoDB', 'Redis', 'Docker', 'LangChain'].map(t => (
                                <span key={t} className="px-2 py-1 text-xs font-mono rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">{t}</span>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* 3-TIER ARCHITECTURE */}
            <section className="py-16 px-6" style={{ background: "var(--bg-secondary)" }}>
                <div className="max-w-5xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: EASINGS.apple }} className="mb-8">
                        <p className="eyebrow mb-2">Architecture</p>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">3-Tier Distributed System</h2>
                    </motion.div>
                    <div className="grid md:grid-cols-3 gap-4">
                        {TIERS.map((tier, i) => (
                            <motion.div
                                key={tier.label}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.5, ease: EASINGS.apple }}
                                whileHover={{ y: -3, transition: { type: "spring", stiffness: 300, damping: 25 } }}
                                className="p-5 rounded-xl border transition-colors duration-200 hover:border-[var(--accent)]/40"
                                style={{ background: "var(--bg-primary)", borderColor: "var(--border)" }}
                            >
                                <div className="w-3 h-3 rounded-full mb-3" style={{ background: tier.color }} />
                                <h3 className="text-base font-bold text-[var(--text-primary)] mb-1">Tier {i + 1}: {tier.label}</h3>
                                <p className="text-sm text-[var(--text-secondary)]">{tier.detail}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* MICROSERVICES */}
            <section className="py-16 px-6">
                <div className="max-w-5xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: EASINGS.apple }} className="mb-8">
                        <p className="eyebrow mb-2">Services</p>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">7 Microservices</h2>
                        <p className="text-sm text-[var(--text-muted)] mt-1">6 Node.js/Express + 1 Python/FastAPI</p>
                    </motion.div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {SERVICES.map((svc, i) => {
                            const Icon = svc.icon;
                            return (
                                <motion.div
                                    key={svc.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.05, duration: 0.4, ease: EASINGS.apple }}
                                    whileHover={{ y: -3, borderColor: svc.color, transition: { type: "spring", stiffness: 300, damping: 25 } }}
                                    className="p-4 rounded-xl border transition-colors duration-200"
                                    style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${svc.color}15` }}>
                                            <Icon className="w-4 h-4" style={{ color: svc.color }} />
                                        </div>
                                        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{svc.name}</h3>
                                    </div>
                                    <p className="text-xs text-[var(--text-muted)]">{svc.desc}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* DATA LAYER */}
            <section className="py-16 px-6" style={{ background: "var(--bg-secondary)" }}>
                <div className="max-w-5xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: EASINGS.apple }} className="mb-8">
                        <p className="eyebrow mb-2">Data Layer</p>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Multi-Database Strategy</h2>
                    </motion.div>
                    <div className="grid md:grid-cols-3 gap-4">
                        {DATABASES.map((db, i) => (
                            <motion.div
                                key={db.name}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1, duration: 0.4, ease: EASINGS.apple }}
                                whileHover={{ y: -3, transition: { type: "spring", stiffness: 300, damping: 25 } }}
                                className="p-5 rounded-xl border transition-colors duration-200 hover:border-[var(--accent)]/40"
                                style={{ background: "var(--bg-primary)", borderColor: "var(--border)" }}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Database className="w-4 h-4" style={{ color: db.color }} />
                                    <h3 className="text-sm font-bold text-[var(--text-primary)]">{db.name}</h3>
                                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${db.color}15`, color: db.color }}>{db.purpose}</span>
                                </div>
                                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{db.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* EVENT FLOW */}
            <section className="py-16 px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: EASINGS.apple }} className="mb-6">
                        <p className="eyebrow mb-2">Kafka</p>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Event-Driven Flow</h2>
                    </motion.div>
                    <EventFlow />
                    <p className="text-xs text-center mt-3 text-[var(--text-muted)]">Real-time event streaming for booking confirmations, inventory updates, and user actions</p>
                </div>
            </section>

            {/* KEY FEATURES */}
            <section className="py-16 px-6" style={{ background: "var(--bg-secondary)" }}>
                <div className="max-w-3xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: EASINGS.apple }} className="mb-8">
                        <p className="eyebrow mb-2">Features</p>
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

            {/* FOOTER */}
            <div className="py-8 px-6 border-t" style={{ borderColor: "var(--border)" }}>
                <div className="max-w-5xl mx-auto">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <a href={project.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors">
                            <Github className="w-4 h-4" /> Source Code <ExternalLink className="w-3 h-3" />
                        </a>
                        <ReactionBar slug={project.id} />
                        <div className="flex gap-6 font-mono text-xs">
                            <span><span style={{ color: "var(--accent)" }}>7</span> <span className="text-[var(--text-muted)]">Services</span></span>
                            <span><span style={{ color: "var(--accent)" }}>3</span> <span className="text-[var(--text-muted)]">Databases</span></span>
                            <span><span style={{ color: "var(--accent)" }}>9+</span> <span className="text-[var(--text-muted)]">Containers</span></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
