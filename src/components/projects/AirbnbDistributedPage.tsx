"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Home, Users, Building2, Calendar, MessageSquare, Github, ExternalLink, ArrowRight } from "lucide-react";
import type { Project } from "@/lib/definitions";
import { BackButton } from "@/components/BackButton";
import { ReactionBar } from "@/components/ReactionBar";
import { ViewCounter } from "@/components/ViewCounter";
import { SPRINGS, EASINGS } from "@/lib/motion";

// =============================================================================
// DATA (all verified against actual codebase)
// =============================================================================

const SERVICES = [
    { name: "Traveler Service", desc: "User auth, profiles, favorites management", icon: Users, port: 7001, runtime: "Node.js" },
    { name: "Owner Service", desc: "Property management, availability control", icon: Building2, port: 7002, runtime: "Node.js" },
    { name: "Property Service", desc: "Listings CRUD, search, filtering", icon: Home, port: 7003, runtime: "Node.js" },
    { name: "Booking Service", desc: "Reservations and payment handling", icon: Calendar, port: 7004, runtime: "Node.js" },
    { name: "AI Agent", desc: "LangChain travel planner with Ollama LLM", icon: MessageSquare, port: 7000, runtime: "Python" },
];

const KAFKA_EVENTS = ["booking.created", "booking.confirmed", "review.submitted"];

const INFRA = [
    { name: "Docker Compose", detail: "10 interconnected services in airbnb_network" },
    { name: "Kubernetes", detail: "K8s manifests for all services, MongoDB, Kafka" },
    { name: "MongoDB 7.0", detail: "Shared persistence across all microservices" },
    { name: "Kafka + Zookeeper", detail: "Event-driven async communication" },
];

const TECH_LAYERS = [
    { label: "Frontend", items: ["React 18", "Redux Toolkit", "Vite", "Tailwind"] },
    { label: "Backend", items: ["Node.js/Express ×4", "Python/FastAPI ×1"] },
    { label: "Messaging", items: ["Apache Kafka", "Zookeeper"] },
    { label: "Data", items: ["MongoDB 7.0"] },
    { label: "Infra", items: ["Docker Compose", "Kubernetes", "Nginx", "Ollama"] },
];

const FEATURES = [
    "5 microservices — 4 Node.js/Express + 1 Python/FastAPI AI agent",
    "Kafka event streaming — booking.created, booking.confirmed, review.submitted topics",
    "LangChain AI travel planner with local Ollama LLM integration",
    "Kubernetes manifests with deploy script, secrets, and configmaps",
    "Redux Toolkit state management with React Router DOM",
    "Playwright E2E testing framework",
];

// =============================================================================
// KAFKA FLOW ANIMATION
// =============================================================================

function KafkaFlow() {
    const [active, setActive] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => setActive((p) => (p + 1) % KAFKA_EVENTS.length), 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-wrap items-center justify-center gap-3 p-5 rounded-xl border" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
            <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>Producer</span>
            <ArrowRight className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
            <div className="flex gap-2">
                {KAFKA_EVENTS.map((evt, i) => (
                    <motion.span
                        key={evt}
                        animate={{ background: i === active ? "var(--accent)" : "var(--bg-primary)", color: i === active ? "#fff" : "var(--text-muted)" }}
                        className="px-3 py-1.5 rounded-lg text-xs font-mono border"
                        style={{ borderColor: i === active ? "var(--accent)" : "var(--border)" }}
                    >
                        {evt}
                    </motion.span>
                ))}
            </div>
            <ArrowRight className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
            <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>Consumer</span>
        </div>
    );
}

// =============================================================================
// MAIN
// =============================================================================

export function AirbnbDistributedPage({ project }: { project: Project }) {
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
                        <h1 className="text-3xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">Airbnb Distributed Booking</h1>
                        <p className="text-lg text-[var(--text-secondary)] mb-6 max-w-2xl leading-relaxed">
                            Cloud-native Airbnb clone with 5 microservices, Kafka event streaming, Kubernetes orchestration, and an AI travel planner powered by LangChain + Ollama.
                        </p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRINGS.default, delay: 0.15 }} className="flex flex-wrap items-center gap-4">
                        <a href={project.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors" style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}>
                            <Github className="w-4 h-4" /> Source Code
                        </a>
                        <div className="flex flex-wrap gap-2">
                            {['React', 'Node.js', 'Kafka', 'MongoDB', 'Docker', 'K8s', 'LangChain'].map(t => (
                                <span key={t} className="px-2 py-1 text-xs font-mono rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">{t}</span>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </header>

            {/* MICROSERVICES */}
            <section className="py-16 px-6" style={{ background: "var(--bg-secondary)" }}>
                <div className="max-w-5xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: EASINGS.apple }} className="mb-8">
                        <p className="eyebrow mb-2">Services</p>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">5 Microservices</h2>
                        <p className="text-sm text-[var(--text-muted)] mt-1">4 Node.js/Express + 1 Python/FastAPI</p>
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
                                    transition={{ delay: i * 0.06, duration: 0.4, ease: EASINGS.apple }}
                                    whileHover={{ y: -3, borderColor: "var(--accent)", transition: { type: "spring", stiffness: 300, damping: 25 } }}
                                    className="p-4 rounded-xl border transition-colors duration-200"
                                    style={{ background: "var(--bg-primary)", borderColor: "var(--border)" }}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <Icon className="w-5 h-5" style={{ color: "var(--accent)" }} />
                                            <h3 className="text-sm font-semibold text-[var(--text-primary)]">{svc.name}</h3>
                                        </div>
                                        <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ color: "var(--text-muted)", background: "var(--bg-secondary)" }}>{svc.runtime}</span>
                                    </div>
                                    <p className="text-xs text-[var(--text-muted)]">{svc.desc}</p>
                                    <p className="text-xs font-mono mt-2" style={{ color: "var(--accent)" }}>:{svc.port}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* KAFKA EVENT FLOW */}
            <section className="py-16 px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: EASINGS.apple }} className="mb-6">
                        <p className="eyebrow mb-2">Messaging</p>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Kafka Event Streaming</h2>
                    </motion.div>
                    <KafkaFlow />
                    <p className="text-xs text-center mt-3 text-[var(--text-muted)]">Async communication between services via event topics</p>
                </div>
            </section>

            {/* TECH STACK LAYERS */}
            <section className="py-16 px-6" style={{ background: "var(--bg-secondary)" }}>
                <div className="max-w-4xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: EASINGS.apple }} className="mb-8">
                        <p className="eyebrow mb-2">Architecture</p>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Tech Stack</h2>
                    </motion.div>
                    <div className="space-y-3">
                        {TECH_LAYERS.map((layer, i) => (
                            <motion.div
                                key={layer.label}
                                initial={{ opacity: 0, x: -16 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08, duration: 0.4, ease: EASINGS.apple }}
                                className="flex items-center gap-4 p-3 rounded-lg border transition-colors duration-200 hover:border-[var(--accent)]/40"
                                style={{ background: "var(--bg-primary)", borderColor: "var(--border)" }}
                            >
                                <span className="shrink-0 w-20 text-xs font-semibold" style={{ color: "var(--accent)" }}>{layer.label}</span>
                                <div className="flex flex-wrap gap-2">
                                    {layer.items.map(item => (
                                        <span key={item} className="px-2 py-1 text-xs font-mono rounded" style={{ color: "var(--text-secondary)", background: "var(--bg-secondary)" }}>{item}</span>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* INFRASTRUCTURE */}
            <section className="py-16 px-6">
                <div className="max-w-5xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: EASINGS.apple }} className="mb-8">
                        <p className="eyebrow mb-2">Infrastructure</p>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Container Orchestration</h2>
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
                                style={{ background: "var(--bg-secondary)", borderColor: "var(--border)" }}
                            >
                                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">{item.name}</h3>
                                <p className="text-xs text-[var(--text-muted)]">{item.detail}</p>
                            </motion.div>
                        ))}
                    </div>
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
                            <span><span style={{ color: "var(--accent)" }}>5</span> <span className="text-[var(--text-muted)]">Services</span></span>
                            <span><span style={{ color: "var(--accent)" }}>10</span> <span className="text-[var(--text-muted)]">Containers</span></span>
                            <span><span style={{ color: "var(--accent)" }}>K8s</span> <span className="text-[var(--text-muted)]">Ready</span></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
