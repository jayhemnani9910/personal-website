"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Github, Home, User, Calendar, Database, Server, ArrowRight, Brain } from "lucide-react";
import type { Project } from "@/lib/definitions";
import { StatCard } from "@/components/ui/StatCard";

// Service card with animated icon
function MicroserviceCard({ name, icon: Icon, color, description, delay }: {
    name: string;
    icon: typeof Server;
    color: string;
    description: string;
    delay: number;
}) {
    return (
        <div
            className="p-5 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--accent)] transition-all duration-300 hover:-translate-y-1"
            style={{ animation: `fadeSlideUp 0.5s ease-out ${delay}ms both` }}
        >
            <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: `${color}15` }}
            >
                <Icon className="w-6 h-6" style={{ color }} />
            </div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">{name}</h3>
            <p className="text-xs text-[var(--text-muted)]">{description}</p>
        </div>
    );
}

// Kafka message flow visualization
function KafkaFlowViz() {
    const [activeMessage, setActiveMessage] = useState(0);
    const messages = [
        { from: "Booking", to: "Owner", event: "booking.created" },
        { from: "Owner", to: "Traveler", event: "booking.confirmed" },
        { from: "Traveler", to: "Property", event: "review.submitted" },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveMessage((prev) => (prev + 1) % messages.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    const current = messages[activeMessage];

    return (
        <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
            <div className="flex items-center justify-center gap-4 mb-4">
                <div className={`px-4 py-2 rounded-lg transition-all duration-500 ${
                    activeMessage >= 0 ? "bg-blue-500/20 text-blue-500 border border-blue-500/30" : "bg-[var(--bg-primary)] text-[var(--text-muted)]"
                }`}>
                    {current.from}
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-0.5 w-8 bg-[var(--accent)]" />
                    <div className="px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-mono">
                        {current.event}
                    </div>
                    <ArrowRight className="w-4 h-4 text-[var(--accent)]" />
                </div>
                <div className={`px-4 py-2 rounded-lg transition-all duration-500 ${
                    activeMessage >= 0 ? "bg-green-500/20 text-green-500 border border-green-500/30" : "bg-[var(--bg-primary)] text-[var(--text-muted)]"
                }`}>
                    {current.to}
                </div>
            </div>
            <div className="flex justify-center gap-2">
                {messages.map((_, i) => (
                    <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all ${
                            i === activeMessage ? "bg-[var(--accent)] scale-125" : "bg-[var(--border)]"
                        }`}
                    />
                ))}
            </div>
        </div>
    );
}

// Tech stack visualization
function TechStackViz() {
    const stacks = [
        { layer: "Frontend", techs: ["React", "Redux", "TailwindCSS"], color: "#3b82f6" },
        { layer: "Backend", techs: ["Node.js", "Express", "FastAPI"], color: "#10b981" },
        { layer: "Message", techs: ["Apache Kafka", "Zookeeper"], color: "#f59e0b" },
        { layer: "Database", techs: ["MongoDB 7.0"], color: "#8b5cf6" },
        { layer: "Infra", techs: ["Docker", "Kubernetes"], color: "#ec4899" },
    ];

    return (
        <div className="space-y-3">
            {stacks.map((stack, i) => (
                <div
                    key={stack.layer}
                    className="flex items-center gap-4"
                    style={{ animation: `fadeSlideUp 0.4s ease-out ${i * 100}ms both` }}
                >
                    <div
                        className="w-20 text-xs font-medium text-right"
                        style={{ color: stack.color }}
                    >
                        {stack.layer}
                    </div>
                    <div className="flex-1 flex gap-2">
                        {stack.techs.map((tech) => (
                            <span
                                key={tech}
                                className="px-3 py-1.5 text-xs rounded-lg"
                                style={{
                                    backgroundColor: `${stack.color}10`,
                                    color: stack.color,
                                    border: `1px solid ${stack.color}30`,
                                }}
                            >
                                {tech}
                            </span>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}


export function AirbnbDistributedPage({ project }: { project: Project }) {
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
                            Airbnb Distributed System
                        </h1>
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20">
                            Team Project
                        </span>
                    </div>
                    <p className="text-xl text-[var(--text-secondary)] mb-6 max-w-3xl" style={{ animation: 'fadeSlideUp 0.5s ease-out 100ms both' }}>
                        Cloud-native booking platform with microservices, Kafka messaging, and AI-powered travel planning.
                    </p>
                    <div className="flex flex-wrap items-center gap-4" style={{ animation: 'fadeSlideUp 0.5s ease-out 200ms both' }}>
                        <div className="flex flex-wrap gap-2">
                            {['React', 'Redux', 'Node.js', 'MongoDB', 'Kafka', 'LangChain', 'Docker', 'K8s'].map((tech) => (
                                <span key={tech} className="px-3 py-1 text-xs font-medium rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">{tech}</span>
                            ))}
                        </div>
                        <a href="https://github.com/vrushabh05/Lab1_distributed_system" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)]">
                            <Github className="w-4 h-4" /> View Code
                        </a>
                    </div>
                </div>
            </header>

            {/* Microservices Grid */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Microservices Architecture</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <MicroserviceCard name="Traveler Service" icon={User} color="#3b82f6" description="User auth, profiles, favorites" delay={0} />
                        <MicroserviceCard name="Owner Service" icon={Home} color="#10b981" description="Property management, availability" delay={100} />
                        <MicroserviceCard name="Property Service" icon={Database} color="#8b5cf6" description="Listings, search, filters" delay={200} />
                        <MicroserviceCard name="Booking Service" icon={Calendar} color="#f59e0b" description="Reservations, payments" delay={300} />
                        <MicroserviceCard name="AI Agent" icon={Brain} color="#ec4899" description="LangChain travel planner" delay={400} />
                    </div>
                </div>
            </section>

            {/* Kafka Flow */}
            <section className="py-12 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Kafka Event Streaming</h2>
                    <KafkaFlowViz />
                    <p className="text-xs text-[var(--text-muted)] text-center mt-4">
                        Asynchronous messaging enables eventual consistency and service decoupling
                    </p>
                </div>
            </section>

            {/* Tech Stack */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Tech Stack Layers</h2>
                    <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
                        <TechStackViz />
                    </div>
                </div>
            </section>

            {/* Key Features */}
            <section className="py-12 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Key Features</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            { title: "Event-Driven Architecture", desc: "Kafka-based async communication for booking status sync across services" },
                            { title: "AI Travel Planner", desc: "LangChain agent suggesting properties based on user preferences and history" },
                            { title: "Container Orchestration", desc: "Docker Compose for dev, Kubernetes manifests for production deployment" },
                            { title: "State Management", desc: "Redux Toolkit for centralized frontend state with async thunks" },
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
                        <StatCard value="5" label="Microservices" />
                        <StatCard value="Kafka" label="Message Broker" />
                        <StatCard value="K8s" label="Orchestration" />
                        <StatCard value="AI" label="Recommendations" />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-[var(--border)]">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <span className="text-[var(--text-muted)]">Personal Project</span>
                    <a
                        href="https://github.com/vrushabh05/Lab1_distributed_system"
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
