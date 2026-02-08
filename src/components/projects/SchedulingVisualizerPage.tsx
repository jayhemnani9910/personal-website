"use client";

import { useState } from "react";
import { ExternalLink, Clock, Layers, BarChart3, Maximize2, Cpu } from "lucide-react";
import type { Project } from "@/lib/definitions";
import { ProjectHeader } from "./ProjectHeader";
import { StatCard } from "@/components/ui/StatCard";

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

export function SchedulingVisualizerPage({ project }: { project: Project }) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const demoUrl = "https://jayhemnani9910.github.io/cpu-scheduling-algorithms/";

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            <ProjectHeader
                title="CPU Scheduling Visualizer"
                description="Interactive visualization of FCFS, SJF, Priority, and Round Robin algorithms."
                techStack={['JavaScript', 'Canvas', 'Gantt Charts', 'OS Concepts']}
                githubUrl="https://github.com/jayhemnani9910/cpu-scheduling-algorithms"
            />

            {/* Full Screen Link */}
            <div className="max-w-6xl mx-auto px-6 -mt-4 mb-4">
                <a href={demoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)]">
                    <ExternalLink className="w-4 h-4" /> Full Screen
                </a>
            </div>

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
