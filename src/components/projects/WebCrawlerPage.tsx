"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Github, Globe, Database, Search, Bell, CheckCircle, ChevronRight, RefreshCw } from "lucide-react";
import type { Project } from "@/lib/definitions";
import { StatCard } from "@/components/ui/StatCard";

// Animated network graph showing monitored sites
function SiteNetworkGraph() {
    const [activeNode, setActiveNode] = useState(0);

    const sites = [
        { x: 50, y: 30, label: "Gov" },
        { x: 25, y: 50, label: "News" },
        { x: 75, y: 50, label: "Tech" },
        { x: 35, y: 75, label: "Docs" },
        { x: 65, y: 75, label: "APIs" },
    ];

    useEffect(() => {
        const interval = setInterval(() => setActiveNode((prev) => (prev + 1) % sites.length), 1500);
        return () => clearInterval(interval);
    }, [sites.length]);

    return (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-[var(--text-primary)]">Sites Monitored</h3>
                <span className="text-xs text-[var(--accent)] flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" style={{ animationDuration: '3s' }} />
                    Every 2h
                </span>
            </div>

            <svg viewBox="0 0 100 100" className="w-full h-48">
                {/* Connection lines */}
                {sites.map((site, i) => (
                    <line
                        key={`line-${i}`}
                        x1={50}
                        y1={30}
                        x2={site.x}
                        y2={site.y}
                        stroke="var(--border)"
                        strokeWidth="0.5"
                        strokeDasharray={activeNode === i ? "0" : "2,2"}
                        className={activeNode === i ? "stroke-[var(--accent)]" : ""}
                        style={{ transition: "all 0.3s ease" }}
                    />
                ))}

                {/* Central hub */}
                <circle cx={50} cy={50} r={12} fill="var(--bg-primary)" stroke="var(--accent)" strokeWidth="2" />
                <text x={50} y={52} textAnchor="middle" fill="var(--accent)" fontSize="6" fontWeight="bold">HUB</text>

                {/* Site nodes */}
                {sites.map((site, i) => (
                    <g key={i}>
                        <circle
                            cx={site.x}
                            cy={site.y}
                            r={activeNode === i ? 10 : 8}
                            fill={activeNode === i ? "var(--accent)" : "var(--bg-secondary)"}
                            stroke={activeNode === i ? "var(--accent)" : "var(--border)"}
                            strokeWidth="1.5"
                            className="transition-all duration-300"
                        />
                        <text
                            x={site.x}
                            y={site.y + 1}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill={activeNode === i ? "white" : "var(--text-muted)"}
                            fontSize="4"
                            fontWeight="500"
                        >
                            {site.label}
                        </text>
                        {activeNode === i && (
                            <circle
                                cx={site.x}
                                cy={site.y}
                                r={12}
                                fill="none"
                                stroke="var(--accent)"
                                strokeWidth="0.5"
                                opacity="0.5"
                                className="animate-ping"
                                style={{ animationDuration: '1s' }}
                            />
                        )}
                    </g>
                ))}
            </svg>

            <div className="text-center text-xs text-[var(--text-muted)] mt-2">
                100+ sites • 1,200 daily snapshots
            </div>
        </div>
    );
}

// Snapshot timeline/feed
function SnapshotFeed() {
    const [snapshots, setSnapshots] = useState([
        { site: "regulations.gov", status: "changed", time: "2m ago" },
        { site: "docs.api.com", status: "unchanged", time: "5m ago" },
        { site: "news.site.io", status: "changed", time: "12m ago" },
        { site: "tech.blog.dev", status: "unchanged", time: "15m ago" },
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            setSnapshots((prev) => {
                const newSnapshot = {
                    site: ["data.gov", "wiki.org", "api.dev", "blog.io"][Math.floor(Math.random() * 4)],
                    status: Math.random() > 0.7 ? "changed" : "unchanged",
                    time: "just now"
                };
                return [newSnapshot, ...prev.slice(0, 3)];
            });
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-[var(--text-primary)]">Live Snapshots</h3>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>

            <div className="space-y-3">
                {snapshots.map((snap, i) => (
                    <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)]"
                        style={{ animation: i === 0 ? 'fadeSlideUp 0.3s ease-out' : 'none' }}
                    >
                        <div className="flex items-center gap-3">
                            <Globe className="w-4 h-4 text-[var(--text-muted)]" />
                            <span className="text-sm text-[var(--text-primary)]">{snap.site}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {snap.status === "changed" ? (
                                <Bell className="w-4 h-4 text-[var(--accent)]" />
                            ) : (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                            <span className="text-xs text-[var(--text-muted)]">{snap.time}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Pipeline stage component
function PipelineStage({
    icon: Icon, label, sublabel, delay, isActive
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string; sublabel: string; delay: number; isActive: boolean;
}) {
    return (
        <div className="flex flex-col items-center group" style={{ animation: `fadeSlideUp 0.5s ease-out ${delay}ms both` }}>
            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center border-2 transition-all duration-300
                ${isActive ? 'bg-[var(--accent)] border-[var(--accent)] text-white scale-110' : 'bg-[var(--bg-secondary)] border-[var(--border)] text-[var(--text-muted)] group-hover:border-[var(--accent)]'}`}>
                <Icon className="w-7 h-7 md:w-8 md:h-8" />
            </div>
            <span className="mt-3 text-sm font-medium text-[var(--text-primary)]">{label}</span>
            <span className="text-xs text-[var(--text-muted)]">{sublabel}</span>
        </div>
    );
}

function PipelineArrow({ delay }: { delay: number }) {
    return (
        <div className="flex-shrink-0 hidden md:flex items-center px-2" style={{ animation: `fadeIn 0.3s ease-out ${delay}ms both` }}>
            <div className="w-8 h-0.5 bg-[var(--border)] relative overflow-hidden">
                <div className="absolute inset-0 bg-[var(--accent)]" style={{ animation: `slideRight 1.5s ease-in-out infinite`, animationDelay: `${delay}ms` }} />
            </div>
            <ChevronRight className="w-4 h-4 text-[var(--text-muted)] -ml-1" />
        </div>
    );
}


// Tool cards
function ToolCard({ name, desc }: { name: string; desc: string }) {
    return (
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--accent)] transition-colors">
            <div className="text-sm font-medium text-[var(--text-primary)]">{name}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">{desc}</div>
        </div>
    );
}

export function WebCrawlerPage({ project }: { project: Project }) {
    const [activeStage, setActiveStage] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => setActiveStage((prev) => (prev + 1) % 4), 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            <style jsx global>{`
                @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideRight { 0%, 100% { transform: translateX(-100%); } 50% { transform: translateX(100%); } }
            `}</style>

            {/* Header */}
            <header className="pt-32 pb-12 px-6">
                <div className="max-w-5xl mx-auto">
                    <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors mb-8">
                        <ArrowLeft className="w-4 h-4" />Back to Projects
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4" style={{ animation: 'fadeSlideUp 0.5s ease-out' }}>Website Watcher</h1>
                    <p className="text-xl text-[var(--text-secondary)] mb-6 max-w-3xl" style={{ animation: 'fadeSlideUp 0.5s ease-out 100ms both' }}>
                        Production web archiver with change detection and full-text search.
                    </p>
                    <div className="flex flex-wrap items-center gap-4" style={{ animation: 'fadeSlideUp 0.5s ease-out 200ms both' }}>
                        <div className="flex flex-wrap gap-2">
                            {['ArchiveBox', 'SQLite FTS5', 'Prometheus', 'Docker'].map((tech) => (
                                <span key={tech} className="px-3 py-1 text-xs font-medium rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">{tech}</span>
                            ))}
                        </div>
                        {project.github && (
                            <a href={project.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)]">
                                <Github className="w-4 h-4" /> View Code
                            </a>
                        )}
                    </div>
                </div>
            </header>

            {/* Visualizations */}
            <section className="py-12 px-6">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Live Monitoring</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <SiteNetworkGraph />
                        <SnapshotFeed />
                    </div>
                </div>
            </section>

            {/* Pipeline Flow */}
            <section className="py-16 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-8 text-center">Archive Pipeline</h2>
                    <div className="flex flex-wrap md:flex-nowrap items-start justify-center gap-4 md:gap-0">
                        <PipelineStage icon={Globe} label="Discover" sublabel="Sitemap + Links" delay={0} isActive={activeStage === 0} />
                        <PipelineArrow delay={100} />
                        <PipelineStage icon={Database} label="Archive" sublabel="ArchiveBox" delay={150} isActive={activeStage === 1} />
                        <PipelineArrow delay={250} />
                        <PipelineStage icon={Bell} label="Detect" sublabel="SHA-256 Diff" delay={300} isActive={activeStage === 2} />
                        <PipelineArrow delay={400} />
                        <PipelineStage icon={Search} label="Search" sublabel="FTS5 Index" delay={450} isActive={activeStage === 3} />
                    </div>
                </div>
            </section>

            {/* Tool Cards */}
            <section className="py-12 px-6">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Tech Stack</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <ToolCard name="ArchiveBox" desc="Multi-format snapshots" />
                        <ToolCard name="SQLite FTS5" desc="Sub-second search" />
                        <ToolCard name="SHA-256" desc="Content hashing" />
                        <ToolCard name="APScheduler" desc="2-hour intervals" />
                        <ToolCard name="Prometheus" desc="Uptime metrics" />
                        <ToolCard name="Docker" desc="Zero-downtime deploy" />
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-[var(--border)]">
                        <StatCard value="100+" label="Sites Monitored" delay={0} />
                        <StatCard value="50K+" label="Snapshots" delay={100} />
                        <StatCard value="99.8%" label="Uptime" delay={200} />
                        <StatCard value="<1s" label="Search Latency" delay={300} />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-[var(--border)]">
                <div className="max-w-5xl mx-auto"><span className="text-[var(--text-muted)]">Production deployment with zero manual intervention</span></div>
            </footer>
        </div>
    );
}
