"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Wifi, WifiOff, RefreshCw, Database, Cloud, Smartphone, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import type { Project } from "@/lib/definitions";
import { StatCard } from "@/components/ui/StatCard";

// Connection status indicator
function ConnectionStatus() {
    const [status, setStatus] = useState<"online" | "offline" | "syncing">("online");
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        const states: Array<"online" | "offline" | "syncing"> = ["online", "offline", "syncing", "online"];
        let index = 0;
        const interval = setInterval(() => {
            index = (index + 1) % states.length;
            setStatus(states[index]);
            if (states[index] === "syncing") {
                setRetryCount(prev => prev + 1);
            }
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const statusConfig = {
        online: { icon: Wifi, color: "text-green-500", bg: "bg-green-500/10", label: "Connected" },
        offline: { icon: WifiOff, color: "text-red-500", bg: "bg-red-500/10", label: "Offline" },
        syncing: { icon: RefreshCw, color: "text-amber-500", bg: "bg-amber-500/10", label: "Syncing..." },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg}`}>
            <Icon className={`w-4 h-4 ${config.color} ${status === "syncing" ? "animate-spin" : ""}`} />
            <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
            {retryCount > 0 && status === "syncing" && (
                <span className="text-xs text-[var(--text-muted)]">(retry {retryCount})</span>
            )}
        </div>
    );
}

// Backoff visualization
function BackoffViz() {
    const [attempt, setAttempt] = useState(1);
    const delays = [1, 2, 4, 8, 16, 32];

    useEffect(() => {
        const interval = setInterval(() => {
            setAttempt(prev => (prev % 6) + 1);
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-3">
            <div className="flex items-end gap-1 h-20">
                {delays.map((delay, i) => (
                    <div
                        key={i}
                        className={`flex-1 rounded-t transition-all duration-300 ${
                            i < attempt ? "bg-[var(--accent)]" : "bg-[var(--border)]"
                        }`}
                        style={{ height: `${(delay / 32) * 100}%` }}
                    />
                ))}
            </div>
            <div className="flex justify-between text-xs text-[var(--text-muted)]">
                <span>1s</span>
                <span>2s</span>
                <span>4s</span>
                <span>8s</span>
                <span>16s</span>
                <span>32s</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] text-center">
                Exponential backoff with ±30% jitter prevents thundering herd
            </p>
        </div>
    );
}

// Operation queue
function OperationQueue() {
    const operations = [
        { type: "POST", endpoint: "/transactions", status: "pending", priority: 1 },
        { type: "PUT", endpoint: "/profile", status: "pending", priority: 2 },
        { type: "GET", endpoint: "/balance", status: "synced", priority: 3 },
    ];

    return (
        <div className="space-y-2">
            {operations.map((op, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)]">
                    <div className={`w-2 h-2 rounded-full ${
                        op.status === "synced" ? "bg-green-500" : "bg-amber-500 animate-pulse"
                    }`} />
                    <code className="text-xs px-1.5 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)]">{op.type}</code>
                    <span className="text-sm text-[var(--text-secondary)] flex-1">{op.endpoint}</span>
                    <span className="text-xs text-[var(--text-muted)]">P{op.priority}</span>
                </div>
            ))}
        </div>
    );
}

// Architecture layer
function ArchLayer({ name, items, icon: Icon }: { name: string; items: string[]; icon: React.ComponentType<{ className?: string }> }) {
    return (
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
            <div className="flex items-center gap-2 mb-3">
                <Icon className="w-5 h-5 text-[var(--accent)]" />
                <span className="text-sm font-medium text-[var(--text-primary)]">{name}</span>
            </div>
            <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                    <span key={item} className="px-2 py-1 text-xs rounded bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-secondary)]">
                        {item}
                    </span>
                ))}
            </div>
        </div>
    );
}


export function MobileConnectPage({ project }: { project: Project }) {
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
                    <div className="flex items-center gap-4 mb-4">
                        <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)]" style={{ animation: 'fadeSlideUp 0.5s ease-out' }}>
                            Mobile Connectivity Suite
                        </h1>
                        <ConnectionStatus />
                    </div>
                    <p className="text-xl text-[var(--text-secondary)] mb-6 max-w-3xl" style={{ animation: 'fadeSlideUp 0.5s ease-out 100ms both' }}>
                        Android connectivity manager with offline-first architecture and intelligent retry.
                    </p>
                    <div className="flex flex-wrap gap-2" style={{ animation: 'fadeSlideUp 0.5s ease-out 200ms both' }}>
                        {['Kotlin', 'Android', 'WorkManager', 'SQLite', 'Retrofit'].map((tech) => (
                            <span key={tech} className="px-3 py-1 text-xs font-medium rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">{tech}</span>
                        ))}
                    </div>
                </div>
            </header>

            {/* Offline-First Demo */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Offline Queue</h2>
                            <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
                                <div className="flex items-center gap-2 mb-4">
                                    <Database className="w-5 h-5 text-[var(--accent)]" />
                                    <span className="text-sm font-medium text-[var(--text-primary)]">Pending Operations</span>
                                </div>
                                <OperationQueue />
                                <p className="text-xs text-[var(--text-muted)] mt-4">
                                    User actions queued locally while offline, synced in priority order when connection restored.
                                </p>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Exponential Backoff</h2>
                            <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
                                <BackoffViz />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Clean Architecture */}
            <section className="py-12 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Clean Architecture</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        <ArchLayer
                            name="Presentation"
                            items={['Activity', 'Fragment', 'ViewModel', 'LiveData']}
                            icon={Smartphone}
                        />
                        <ArchLayer
                            name="Domain"
                            items={['ConnectionWatcher', 'RetryPolicy', 'SyncEngine']}
                            icon={RefreshCw}
                        />
                        <ArchLayer
                            name="Data"
                            items={['Retrofit', 'OkHttp', 'SQLite', 'WorkManager']}
                            icon={Database}
                        />
                    </div>
                </div>
            </section>

            {/* Key Components */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Core Components</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            { icon: Wifi, name: "ConnectionWatcher", desc: "Monitors network state via NetworkCallback API, publishes changes to subscribers, triggers sync on reconnect." },
                            { icon: RefreshCw, name: "RetryPolicy", desc: "Exponential backoff (2^n) with jitter. Distinguishes retriable (5xx) from permanent (4xx) failures." },
                            { icon: Database, name: "OfflineCache", desc: "SQLite-backed storage with TTL invalidation. Maintains operation queue for offline actions." },
                            { icon: Cloud, name: "SyncEngine", desc: "Coordinates background sync via WorkManager. Priority queue ensures critical operations first." },
                        ].map((comp) => (
                            <div key={comp.name} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center">
                                        <comp.icon className="w-4 h-4 text-[var(--accent)]" />
                                    </div>
                                    <span className="text-sm font-medium text-[var(--text-primary)]">{comp.name}</span>
                                </div>
                                <p className="text-xs text-[var(--text-muted)]">{comp.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Design Decisions */}
            <section className="py-12 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Design Decisions</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                            <div className="text-sm font-medium text-[var(--text-primary)] mb-2">Offline-First Architecture</div>
                            <div className="text-xs text-[var(--text-muted)]">Cache-first access provides instant responses. Network requests happen asynchronously in background.</div>
                        </div>
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                            <div className="text-sm font-medium text-[var(--text-primary)] mb-2">WorkManager over JobScheduler</div>
                            <div className="text-xs text-[var(--text-muted)]">Backward compatibility to API 14, guaranteed execution, constraint-based scheduling.</div>
                        </div>
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                            <div className="text-sm font-medium text-[var(--text-primary)] mb-2">Kotlin + Java Hybrid</div>
                            <div className="text-xs text-[var(--text-muted)]">Core networking in Java for stability, UI and business logic in Kotlin for null safety and coroutines.</div>
                        </div>
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                            <div className="text-sm font-medium text-[var(--text-primary)] mb-2">Gradle Build Flavors</div>
                            <div className="text-xs text-[var(--text-muted)]">Dev/staging/prod with different API endpoints, retry configs, and logging levels.</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-[var(--border)]">
                        <StatCard value="5" label="Max Retry Attempts" />
                        <StatCard value="32s" label="Max Backoff Delay" />
                        <StatCard value="±30%" label="Jitter Range" />
                        <StatCard value="3" label="Build Flavors" />
                    </div>
                </div>
            </section>

            {/* Key Insight */}
            <section className="py-12 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-4xl mx-auto text-center">
                    <Smartphone className="w-8 h-8 text-[var(--accent)] mx-auto mb-4" />
                    <blockquote className="text-lg text-[var(--text-secondary)] italic">
                        "Users don't care about network reliability if the app feels responsive. Show users what they want to see immediately, sync in the background."
                    </blockquote>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-[var(--border)]">
                <div className="max-w-6xl mx-auto">
                    <span className="text-[var(--text-muted)]">Smoother UX and fewer failed operations on mobile</span>
                </div>
            </footer>
        </div>
    );
}
