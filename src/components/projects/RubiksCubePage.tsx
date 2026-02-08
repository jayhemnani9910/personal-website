"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Github, ExternalLink, Timer, BarChart3, Box, Maximize2 } from "lucide-react";
import type { Project } from "@/lib/definitions";
import { StatCard } from "@/components/ui/StatCard";

// Feature cards
function FeatureCard({ icon: Icon, title, desc }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) {
    return (
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--accent)] transition-colors">
            <Icon className="w-6 h-6 text-[var(--accent)] mb-2" />
            <div className="text-sm font-medium text-[var(--text-primary)]">{title}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">{desc}</div>
        </div>
    );
}


export function RubiksCubePage({ project }: { project: Project }) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const demoUrl = "https://jayhemnani9910.github.io/rubiks-cube/";

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
                        Rubik's Cube Timer
                    </h1>
                    <p className="text-xl text-[var(--text-secondary)] mb-6 max-w-3xl" style={{ animation: 'fadeSlideUp 0.5s ease-out 100ms both' }}>
                        Precision timer with 3D cube visualization and WCA-compliant scrambles.
                    </p>
                    <div className="flex flex-wrap items-center gap-4" style={{ animation: 'fadeSlideUp 0.5s ease-out 200ms both' }}>
                        <div className="flex flex-wrap gap-2">
                            {['JavaScript', 'WebGL', 'Canvas', 'WCA Standard'].map((tech) => (
                                <span key={tech} className="px-3 py-1 text-xs font-medium rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">{tech}</span>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <a href="https://github.com/jayhemnani9910/rubiks-cube" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)]">
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
                        className={`relative rounded-xl border border-[var(--border)] overflow-hidden bg-black transition-all duration-300 ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}
                        style={{ height: isFullscreen ? 'auto' : '600px' }}
                    >
                        <iframe
                            src={demoUrl}
                            className="w-full h-full"
                            style={{ minHeight: isFullscreen ? 'calc(100vh - 2rem)' : '600px' }}
                            title="Rubik's Cube Timer Demo"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
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
                        Press spacebar to start/stop timer • Use mouse to rotate cube view
                    </p>
                </div>
            </section>

            {/* Features */}
            <section className="py-12 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Features</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <FeatureCard icon={Timer} title="Precision Timer" desc="performance.now() for microsecond accuracy" />
                        <FeatureCard icon={Box} title="3D Visualization" desc="WebGL cube with scramble preview" />
                        <FeatureCard icon={BarChart3} title="Statistics" desc="Ao5, Ao12, Ao100 rolling averages" />
                        <FeatureCard icon={ExternalLink} title="WCA Scrambles" desc="Competition-standard notation" />
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-[var(--border)]">
                        <StatCard value="<1ms" label="Timer Precision" />
                        <StatCard value="60" label="FPS Rendering" />
                        <StatCard value="8KB" label="WebGL Bundle" />
                        <StatCard value="WCA" label="Compliant" />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-[var(--border)]">
                <div className="max-w-6xl mx-auto">
                    <span className="text-[var(--text-muted)]">Built for PDEU Course Project</span>
                </div>
            </footer>
        </div>
    );
}
