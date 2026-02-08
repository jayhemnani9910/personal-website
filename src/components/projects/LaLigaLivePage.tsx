"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Github, Radio, Activity, MapPin, BarChart3, ChevronRight } from "lucide-react";
import type { Project } from "@/lib/definitions";
import { StatCard } from "@/components/ui/StatCard";

// Live xG curve animation
function XGCurve() {
    const [homeXG, setHomeXG] = useState<{ minute: number; xg: number }[]>([]);
    const [awayXG, setAwayXG] = useState<{ minute: number; xg: number }[]>([]);
    const [currentMinute, setCurrentMinute] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMinute((m) => {
                if (m >= 90) return 0;
                const newMin = m + 1;

                // Simulate shots
                if (Math.random() < 0.15) {
                    const xg = 0.05 + Math.random() * 0.3;
                    if (Math.random() < 0.5) {
                        setHomeXG((prev) => [...prev, { minute: newMin, xg: (prev[prev.length - 1]?.xg || 0) + xg }]);
                    } else {
                        setAwayXG((prev) => [...prev, { minute: newMin, xg: (prev[prev.length - 1]?.xg || 0) + xg }]);
                    }
                }
                return newMin;
            });
        }, 200);

        return () => clearInterval(interval);
    }, []);

    // Reset when reaching 90
    useEffect(() => {
        if (currentMinute === 0) {
            setHomeXG([]);
            setAwayXG([]);
        }
    }, [currentMinute]);

    const maxXG = Math.max(2, ...[...homeXG, ...awayXG].map((d) => d.xg));

    return (
        <div className="rounded-xl border border-[var(--border)] bg-[#0a0a0a] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-medium text-[var(--text-muted)]">LIVE xG</span>
                </div>
                <span className="text-sm font-mono text-[var(--text-primary)]">{currentMinute}&apos;</span>
            </div>

            <div className="p-4">
                <div className="flex justify-between mb-2 text-sm">
                    <span className="text-red-500">Barcelona {(homeXG[homeXG.length - 1]?.xg || 0).toFixed(2)}</span>
                    <span className="text-blue-500">{(awayXG[awayXG.length - 1]?.xg || 0).toFixed(2)} Real Madrid</span>
                </div>

                <svg viewBox="0 0 100 40" className="w-full h-32">
                    {/* Grid */}
                    {[0, 15, 30, 45, 60, 75, 90].map((min) => (
                        <g key={min}>
                            <line x1={(min / 90) * 100} y1="0" x2={(min / 90) * 100} y2="35" stroke="var(--border)" strokeWidth="0.3" strokeDasharray="2,2" />
                            <text x={(min / 90) * 100} y="39" textAnchor="middle" fill="var(--text-muted)" fontSize="3">{min}</text>
                        </g>
                    ))}

                    {/* Home xG line */}
                    {homeXG.length > 0 && (
                        <polyline
                            points={homeXG.map((d) => `${(d.minute / 90) * 100},${35 - (d.xg / maxXG) * 30}`).join(' ')}
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="1.5"
                        />
                    )}

                    {/* Away xG line */}
                    {awayXG.length > 0 && (
                        <polyline
                            points={awayXG.map((d) => `${(d.minute / 90) * 100},${35 - (d.xg / maxXG) * 30}`).join(' ')}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="1.5"
                        />
                    )}

                    {/* Current time marker */}
                    <line x1={(currentMinute / 90) * 100} y1="0" x2={(currentMinute / 90) * 100} y2="35" stroke="var(--accent)" strokeWidth="0.5" />
                </svg>
            </div>
        </div>
    );
}

// Shot map visualization
function ShotMap() {
    const [shots, setShots] = useState<{ x: number; y: number; xg: number; goal: boolean; team: 'home' | 'away' }[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() < 0.3) {
                setShots((prev) => {
                    if (prev.length > 15) return prev.slice(1);
                    return [...prev, {
                        x: 70 + Math.random() * 25,
                        y: 20 + Math.random() * 60,
                        xg: 0.05 + Math.random() * 0.4,
                        goal: Math.random() < 0.15,
                        team: Math.random() < 0.5 ? 'home' : 'away'
                    }];
                });
            }
        }, 800);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden">
            <div className="px-4 py-2 border-b border-[var(--border)]">
                <span className="text-sm font-medium text-[var(--text-primary)]">Shot Map</span>
            </div>

            <svg viewBox="0 0 100 68" className="w-full h-48 bg-green-900/20">
                {/* Pitch markings */}
                <rect x="0" y="0" width="100" height="68" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3" />
                <line x1="50" y1="0" x2="50" y2="68" stroke="white" strokeWidth="0.5" opacity="0.3" />
                <circle cx="50" cy="34" r="9" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3" />

                {/* Penalty areas */}
                <rect x="0" y="13" width="16" height="42" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3" />
                <rect x="84" y="13" width="16" height="42" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3" />

                {/* Goal boxes */}
                <rect x="0" y="24" width="5" height="20" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3" />
                <rect x="95" y="24" width="5" height="20" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3" />

                {/* Shots */}
                {shots.map((shot, i) => (
                    <g key={i}>
                        <circle
                            cx={shot.x}
                            cy={shot.y}
                            r={2 + shot.xg * 5}
                            fill={shot.goal ? '#fbbf24' : shot.team === 'home' ? '#ef4444' : '#3b82f6'}
                            opacity={0.7}
                            stroke={shot.goal ? '#fbbf24' : 'none'}
                            strokeWidth={shot.goal ? 1 : 0}
                        />
                        {shot.goal && (
                            <text x={shot.x} y={shot.y + 1} textAnchor="middle" dominantBaseline="middle" fill="black" fontSize="3" fontWeight="bold">G</text>
                        )}
                    </g>
                ))}
            </svg>

            <div className="flex justify-center gap-4 p-2 text-xs">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500" /> Home</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500" /> Away</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-400" /> Goal</span>
            </div>
        </div>
    );
}

// Heat map
function HeatMap() {
    return (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden">
            <div className="px-4 py-2 border-b border-[var(--border)]">
                <span className="text-sm font-medium text-[var(--text-primary)]">Pressure Zones</span>
            </div>

            <svg viewBox="0 0 100 68" className="w-full h-48 bg-green-900/20">
                {/* Pitch outline */}
                <rect x="0" y="0" width="100" height="68" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3" />
                <line x1="50" y1="0" x2="50" y2="68" stroke="white" strokeWidth="0.5" opacity="0.3" />

                {/* Heat zones */}
                <defs>
                    <radialGradient id="heat1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="heat2">
                        <stop offset="0%" stopColor="#f97316" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="heat3">
                        <stop offset="0%" stopColor="#eab308" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
                    </radialGradient>
                </defs>

                {/* High pressure zones */}
                <ellipse cx="75" cy="34" rx="15" ry="20" fill="url(#heat1)" />
                <ellipse cx="60" cy="20" rx="12" ry="15" fill="url(#heat2)" />
                <ellipse cx="60" cy="48" rx="12" ry="15" fill="url(#heat2)" />
                <ellipse cx="40" cy="34" rx="10" ry="12" fill="url(#heat3)" />
            </svg>

            <div className="flex justify-center gap-4 p-2 text-xs text-[var(--text-muted)]">
                High Press Active • 68% Possession
            </div>
        </div>
    );
}

// Pipeline stage
function PipelineStage({ icon: Icon, label, sublabel, delay, isActive }: {
    icon: React.ComponentType<{ className?: string }>; label: string; sublabel: string; delay: number; isActive: boolean;
}) {
    return (
        <div className="flex flex-col items-center group" style={{ animation: `fadeSlideUp 0.5s ease-out ${delay}ms both` }}>
            <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center border-2 transition-all duration-300
                ${isActive ? 'bg-[var(--accent)] border-[var(--accent)] text-white scale-110' : 'bg-[var(--bg-secondary)] border-[var(--border)] text-[var(--text-muted)]'}`}>
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


export function LaLigaLivePage({ project }: { project: Project }) {
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
                    <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4" style={{ animation: 'fadeSlideUp 0.5s ease-out' }}>La Liga Live</h1>
                    <p className="text-xl text-[var(--text-secondary)] mb-6 max-w-3xl" style={{ animation: 'fadeSlideUp 0.5s ease-out 100ms both' }}>
                        Real-time match analytics. xG curves, shot maps, and tactical heatmaps.
                    </p>
                    <div className="flex flex-wrap gap-2" style={{ animation: 'fadeSlideUp 0.5s ease-out 200ms both' }}>
                        {['Streamlit', 'Plotly', 'Real-time'].map((tech) => (
                            <span key={tech} className="px-3 py-1 text-xs font-medium rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">{tech}</span>
                        ))}
                    </div>
                </div>
            </header>

            {/* Live visualizations */}
            <section className="py-12 px-6">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Live Match Analytics</h2>
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <XGCurve />
                        <ShotMap />
                    </div>
                    <HeatMap />
                </div>
            </section>

            {/* Pipeline */}
            <section className="py-16 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-8 text-center">Data Flow</h2>
                    <div className="flex flex-wrap md:flex-nowrap items-start justify-center gap-4 md:gap-0">
                        <PipelineStage icon={Radio} label="Event Feed" sublabel="Live API" delay={0} isActive={activeStage === 0} />
                        <PipelineArrow delay={100} />
                        <PipelineStage icon={Activity} label="Processing" sublabel="xG/Metrics" delay={150} isActive={activeStage === 1} />
                        <PipelineArrow delay={250} />
                        <PipelineStage icon={MapPin} label="State" sublabel="Streamlit" delay={300} isActive={activeStage === 2} />
                        <PipelineArrow delay={400} />
                        <PipelineStage icon={BarChart3} label="Visualize" sublabel="Plotly" delay={450} isActive={activeStage === 3} />
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-[var(--border)]">
                        <StatCard value="<50ms" label="Update Latency" delay={0} />
                        <StatCard value="1000+" label="Events/Match" delay={100} />
                        <StatCard value="Real-time" label="xG Calculation" delay={200} />
                        <StatCard value="10x" label="Faster Insights" delay={300} />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-[var(--border)]">
                <div className="max-w-5xl mx-auto"><span className="text-[var(--text-muted)]">Personal Project</span></div>
            </footer>
        </div>
    );
}
