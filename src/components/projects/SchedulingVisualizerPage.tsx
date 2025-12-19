"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Github, ExternalLink, Clock, Layers, BarChart3, Maximize2, Cpu } from "lucide-react";
import type { Project } from "@/lib/definitions";

// Algorithm cards
function AlgorithmCard({ name, desc, pros, cons }: { name: string; desc: string; pros: string; cons: string }) {
    return (
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--accent)] transition-colors">
            <div className="text-sm font-medium text-[var(--text-primary)] mb-2">{name}</div>
            <div className="text-xs text-[var(--text-muted)] mb-3">{desc}</div>
            <div className="flex gap-4 text-xs">
                <span className="text-green-500">+ {pros}</span>
                <span className="text-red-400">- {cons}</span>
            </div>
        </div>
    );
}

function StatCard({ value, label }: { value: string; label: string }) {
    return (
        <div className="text-center p-4">
            <div className="text-3xl md:text-4xl font-bold text-[var(--accent)]">{value}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">{label}</div>
        </div>
    );
}

export function SchedulingVisualizerPage({ project }: { project: Project }) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const demoUrl = "https://jayhemnani9910.github.io/cpu-scheduling-algorithms/";

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
                    <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4" style={{ animation: 'fadeSlideUp 0.5s ease-out' }}>
                        CPU Scheduling Visualizer
                    </h1>
                    <p className="text-xl text-[var(--text-secondary)] mb-6 max-w-3xl" style={{ animation: 'fadeSlideUp 0.5s ease-out 100ms both' }}>
                        Interactive visualization of FCFS, SJF, Priority, and Round Robin algorithms.
                    </p>
                    <div className="flex flex-wrap items-center gap-4" style={{ animation: 'fadeSlideUp 0.5s ease-out 200ms both' }}>
                        <div className="flex flex-wrap gap-2">
                            {['JavaScript', 'Canvas', 'Gantt Charts', 'OS Concepts'].map((tech) => (
                                <span key={tech} className="px-3 py-1 text-xs font-medium rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">{tech}</span>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <a href="https://github.com/jayhemnani9910/cpu-scheduling-algorithms" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)]">
                                <Github className="w-4 h-4" /> Code
                            </a>
                            <a href={demoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)]">
                                <ExternalLink className="w-4 h-4" /> Full Screen
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            {/* Live Demo Embed */}
            <section className="py-8 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider">Live Demo</h2>
                        <button
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="flex items-center gap-2 text-xs text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
                        >
                            <Maximize2 className="w-4 h-4" />
                            {isFullscreen ? 'Exit Fullscreen' : 'Expand'}
                        </button>
                    </div>
                    <div
                        className={`relative rounded-xl border border-[var(--border)] overflow-hidden bg-white transition-all duration-300 ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}
                        style={{ height: isFullscreen ? 'auto' : '600px' }}
                    >
                        <iframe
                            src={demoUrl}
                            className="w-full h-full"
                            style={{ minHeight: isFullscreen ? 'calc(100vh - 2rem)' : '600px' }}
                            title="CPU Scheduling Visualizer Demo"
                        />
                        {isFullscreen && (
                            <button
                                onClick={() => setIsFullscreen(false)}
                                className="absolute top-4 right-4 px-3 py-1 bg-black/80 text-white text-sm rounded-lg hover:bg-black"
                            >
                                Close
                            </button>
                        )}
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-2 text-center">
                        Add processes • Select algorithm • View Gantt chart and metrics
                    </p>
                </div>
            </section>

            {/* Algorithms */}
            <section className="py-12 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Scheduling Algorithms</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <AlgorithmCard
                            name="FCFS (First-Come, First-Served)"
                            desc="Processes executed in arrival order"
                            pros="Simple, no starvation"
                            cons="Convoy effect"
                        />
                        <AlgorithmCard
                            name="SJF (Shortest Job First)"
                            desc="Shortest burst time gets priority"
                            pros="Optimal avg wait time"
                            cons="Starvation possible"
                        />
                        <AlgorithmCard
                            name="Priority Scheduling"
                            desc="Execute by priority level"
                            pros="Important tasks first"
                            cons="Low priority starvation"
                        />
                        <AlgorithmCard
                            name="Round Robin"
                            desc="Time quantum rotation"
                            pros="Fair, good response"
                            cons="Context switch overhead"
                        />
                    </div>
                </div>
            </section>

            {/* Metrics Explained */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Key Metrics</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
                            <Clock className="w-5 h-5 text-[var(--accent)] mb-2" />
                            <div className="text-sm font-medium text-[var(--text-primary)]">Waiting Time</div>
                            <div className="text-xs text-[var(--text-muted)]">Time in ready queue</div>
                        </div>
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
                            <Layers className="w-5 h-5 text-[var(--accent)] mb-2" />
                            <div className="text-sm font-medium text-[var(--text-primary)]">Turnaround</div>
                            <div className="text-xs text-[var(--text-muted)]">Completion - Arrival</div>
                        </div>
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
                            <Cpu className="w-5 h-5 text-[var(--accent)] mb-2" />
                            <div className="text-sm font-medium text-[var(--text-primary)]">CPU Utilization</div>
                            <div className="text-xs text-[var(--text-muted)]">Busy time percentage</div>
                        </div>
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
                            <BarChart3 className="w-5 h-5 text-[var(--accent)] mb-2" />
                            <div className="text-sm font-medium text-[var(--text-primary)]">Throughput</div>
                            <div className="text-xs text-[var(--text-muted)]">Processes / time unit</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-12 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-[var(--border)]">
                        <StatCard value="4" label="Algorithms" />
                        <StatCard value="5" label="Metrics Tracked" />
                        <StatCard value="60" label="FPS Animation" />
                        <StatCard value="∞" label="Process Support" />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-[var(--border)]">
                <div className="max-w-6xl mx-auto">
                    <span className="text-[var(--text-muted)]">Educational tool for OS scheduling concepts</span>
                </div>
            </footer>
        </div>
    );
}
