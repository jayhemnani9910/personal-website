"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plane, Hotel, Car, Database, Server, Zap, MessageSquare, Users, Github, ArrowRight } from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import type { Project } from "@/lib/definitions";

// Animated service card
function ServiceCard({ name, icon: Icon, color, delay }: { name: string; icon: typeof Server; color: string; delay: number }) {
    return (
        <div
            className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--accent)] transition-all duration-300 hover:-translate-y-1"
            style={{ animation: `fadeSlideUp 0.5s ease-out ${delay}ms both` }}
        >
            <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: `${color}20` }}
            >
                <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <span className="text-sm font-medium text-[var(--text-primary)]">{name}</span>
        </div>
    );
}

// 3-tier architecture visualization
function ArchitectureDiagram() {
    const [activeLayer, setActiveLayer] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveLayer((prev) => (prev + 1) % 3);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const tiers = [
        { name: "Tier 1: Frontend", desc: "React Web App", color: "#3b82f6" },
        { name: "Tier 2: Middleware", desc: "API Gateway + Services", color: "#10b981" },
        { name: "Tier 3: Database", desc: "MySQL + MongoDB + Redis", color: "#8b5cf6" },
    ];

    return (
        <div className="space-y-4">
            {tiers.map((tier, i) => (
                <div
                    key={tier.name}
                    className={`p-4 rounded-xl border transition-all duration-500 ${
                        i === activeLayer
                            ? "border-[var(--accent)] bg-[var(--accent)]/5 scale-[1.02]"
                            : "border-[var(--border)] bg-[var(--bg-secondary)]"
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-[var(--text-primary)]">{tier.name}</div>
                            <div className="text-xs text-[var(--text-muted)]">{tier.desc}</div>
                        </div>
                        <div
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                i === activeLayer ? "scale-125" : ""
                            }`}
                            style={{ backgroundColor: tier.color }}
                        />
                    </div>
                </div>
            ))}
            <div className="flex justify-center gap-2 pt-2">
                {tiers.map((_, i) => (
                    <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all ${
                            i === activeLayer ? "bg-[var(--accent)]" : "bg-[var(--border)]"
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}

// Event flow animation
function EventFlowViz() {
    const [step, setStep] = useState(0);
    const steps = ["User Action", "Kafka Event", "Service Process", "DB Update", "Response"];

    useEffect(() => {
        const interval = setInterval(() => {
            setStep((prev) => (prev + 1) % steps.length);
        }, 1200);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center justify-between gap-2 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
            {steps.map((s, i) => (
                <div key={s} className="flex items-center">
                    <div
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
                            i <= step
                                ? "bg-[var(--accent)] text-white"
                                : "bg-[var(--bg-primary)] text-[var(--text-muted)] border border-[var(--border)]"
                        }`}
                    >
                        {s}
                    </div>
                    {i < steps.length - 1 && (
                        <ArrowRight
                            className={`w-4 h-4 mx-1 transition-colors ${
                                i < step ? "text-[var(--accent)]" : "text-[var(--border)]"
                            }`}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}


export function KayakDistributedPage({ project }: { project: Project }) {
    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            <style jsx global>{`
                @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>

            {/* Header */}
            <header className="pt-32 pb-8 px-6">
                <div className="max-w-6xl mx-auto">
                    <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors mb-8">
                        <ArrowLeft className="w-4 h-4" />Back to Projects
                    </Link>
                    <div className="flex items-center gap-3 mb-4">
                        <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)]" style={{ animation: 'fadeSlideUp 0.5s ease-out' }}>
                            Kayak Travel Platform
                        </h1>
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20">
                            Team Project
                        </span>
                    </div>
                    <p className="text-xl text-[var(--text-secondary)] mb-6 max-w-3xl" style={{ animation: 'fadeSlideUp 0.5s ease-out 100ms both' }}>
                        3-tier distributed system simulating travel metasearch with microservices and event-driven architecture.
                    </p>
                    <div className="flex flex-wrap items-center gap-4" style={{ animation: 'fadeSlideUp 0.5s ease-out 200ms both' }}>
                        <div className="flex flex-wrap gap-2">
                            {['Node.js', 'MySQL', 'MongoDB', 'Redis', 'Kafka', 'Docker'].map((tech) => (
                                <span key={tech} className="px-3 py-1 text-xs font-medium rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">{tech}</span>
                            ))}
                        </div>
                        <a href="https://github.com/zohebwaghu/Kayak---DATA-236-Final-Project" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)]">
                            <Github className="w-4 h-4" /> View Code
                        </a>
                    </div>
                </div>
            </header>

            {/* Services Grid */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Microservices</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        <ServiceCard name="Flights" icon={Plane} color="#3b82f6" delay={0} />
                        <ServiceCard name="Hotels" icon={Hotel} color="#10b981" delay={100} />
                        <ServiceCard name="Cars" icon={Car} color="#f59e0b" delay={200} />
                        <ServiceCard name="Users" icon={Users} color="#8b5cf6" delay={300} />
                        <ServiceCard name="Booking" icon={Database} color="#ec4899" delay={400} />
                        <ServiceCard name="AI Recs" icon={MessageSquare} color="#06b6d4" delay={500} />
                    </div>
                </div>
            </section>

            {/* Architecture */}
            <section className="py-12 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">3-Tier Architecture</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <ArchitectureDiagram />
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                                <div className="flex items-center gap-2 mb-2">
                                    <Zap className="w-4 h-4 text-amber-500" />
                                    <span className="text-sm font-medium text-[var(--text-primary)]">API Gateway</span>
                                </div>
                                <p className="text-xs text-[var(--text-muted)]">JWT authentication, rate limiting, request routing to downstream services</p>
                            </div>
                            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                                <div className="flex items-center gap-2 mb-2">
                                    <Server className="w-4 h-4 text-green-500" />
                                    <span className="text-sm font-medium text-[var(--text-primary)]">Service Layer</span>
                                </div>
                                <p className="text-xs text-[var(--text-muted)]">Independent microservices for search, booking, and user management</p>
                            </div>
                            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                                <div className="flex items-center gap-2 mb-2">
                                    <Database className="w-4 h-4 text-purple-500" />
                                    <span className="text-sm font-medium text-[var(--text-primary)]">Data Layer</span>
                                </div>
                                <p className="text-xs text-[var(--text-muted)]">MySQL for OLTP, MongoDB for analytics, Redis for caching</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Event Flow */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Kafka Event Flow</h2>
                    <EventFlowViz />
                    <p className="text-xs text-[var(--text-muted)] text-center mt-4">
                        Real-time event streaming for booking confirmations, inventory updates, and user actions
                    </p>
                </div>
            </section>

            {/* Key Features */}
            <section className="py-12 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Key Features</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            { title: "Transactional Bookings", desc: "ACID-compliant booking flow with inventory control and rollback support" },
                            { title: "Redis Search Cache", desc: "Sub-100ms search responses with intelligent cache invalidation" },
                            { title: "AI Recommendations", desc: "LangChain-powered agent suggesting flights, hotels based on preferences" },
                            { title: "Event Sourcing", desc: "Kafka topics for audit trail and cross-service synchronization" },
                        ].map((item) => (
                            <div key={item.title} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                                <div className="text-sm font-medium text-[var(--text-primary)] mb-2">{item.title}</div>
                                <div className="text-xs text-[var(--text-muted)]">{item.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-[var(--border)]">
                        <StatCard value="6" label="Microservices" />
                        <StatCard value="3" label="Databases" />
                        <StatCard value="<100ms" label="Cached Search" />
                        <StatCard value="Kafka" label="Event Bus" />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-[var(--border)]">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">Personal Project</span>
                    <a
                        href="https://github.com/zohebwaghu/Kayak---DATA-236-Final-Project"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-[var(--accent)] hover:underline"
                    >
                        <Github className="w-4 h-4" /> Team Repository
                    </a>
                </div>
            </footer>
        </div>
    );
}
