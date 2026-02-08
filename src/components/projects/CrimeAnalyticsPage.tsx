"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Github, MapPin, Clock, TrendingUp, Layers, ChevronRight } from "lucide-react";
import type { Project } from "@/lib/definitions";
import { StatCard } from "@/components/ui/StatCard";

// Animated heatmap visualization (India map abstraction)
function CrimeHeatmap() {
    const [activeRegion, setActiveRegion] = useState<number | null>(null);

    // Grid-based heatmap representation
    const regions = [
        { x: 40, y: 25, intensity: 0.8, name: "North" },
        { x: 55, y: 30, intensity: 0.6, name: "Northeast" },
        { x: 35, y: 45, intensity: 0.9, name: "Central" },
        { x: 50, y: 50, intensity: 0.7, name: "East" },
        { x: 30, y: 60, intensity: 0.5, name: "West" },
        { x: 45, y: 70, intensity: 0.4, name: "South" },
    ];

    return (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-[var(--text-primary)]">Geographic Hotspots</h3>
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                    <span className="w-3 h-3 rounded-full bg-red-500/30" />Low
                    <span className="w-3 h-3 rounded-full bg-red-500" />High
                </div>
            </div>

            <svg viewBox="0 0 100 100" className="w-full h-56">
                {/* Background grid */}
                {Array.from({ length: 5 }).map((_, i) => (
                    <line key={`h-${i}`} x1="20" y1={20 + i * 15} x2="80" y2={20 + i * 15} stroke="var(--border)" strokeWidth="0.3" strokeDasharray="2,2" />
                ))}
                {Array.from({ length: 5 }).map((_, i) => (
                    <line key={`v-${i}`} x1={20 + i * 15} y1="20" x2={20 + i * 15} y2="80" stroke="var(--border)" strokeWidth="0.3" strokeDasharray="2,2" />
                ))}

                {/* Hotspot regions */}
                {regions.map((region, i) => (
                    <g
                        key={i}
                        onMouseEnter={() => setActiveRegion(i)}
                        onMouseLeave={() => setActiveRegion(null)}
                        className="cursor-pointer"
                    >
                        {/* Outer glow */}
                        <circle
                            cx={region.x}
                            cy={region.y}
                            r={activeRegion === i ? 14 : 10}
                            fill={`rgba(239, 68, 68, ${region.intensity * 0.3})`}
                            className="transition-all duration-300"
                        />
                        {/* Inner circle */}
                        <circle
                            cx={region.x}
                            cy={region.y}
                            r={activeRegion === i ? 8 : 6}
                            fill={`rgba(239, 68, 68, ${region.intensity})`}
                            className="transition-all duration-300"
                        />
                        {/* Label */}
                        {activeRegion === i && (
                            <text
                                x={region.x}
                                y={region.y - 12}
                                textAnchor="middle"
                                fill="var(--text-primary)"
                                fontSize="4"
                                fontWeight="500"
                            >
                                {region.name}
                            </text>
                        )}
                    </g>
                ))}

                {/* DBSCAN cluster label */}
                <text x={50} y={92} textAnchor="middle" fill="var(--text-muted)" fontSize="4">
                    DBSCAN Clustering
                </text>
            </svg>
        </div>
    );
}

// Time series chart with seasonality
function TimeSeriesChart() {
    const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

    // Seasonal pattern data
    const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
    const values = [45, 42, 48, 55, 62, 70, 68, 65, 58, 52, 48, 50]; // Seasonal pattern
    const trend = [46, 47, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66]; // Upward trend

    const maxVal = 75;
    const chartHeight = 60;
    const chartWidth = 80;
    const startX = 15;
    const startY = 70;

    const getY = (val: number) => startY - (val / maxVal) * chartHeight;
    const getX = (i: number) => startX + (i / (months.length - 1)) * chartWidth;

    const valuePath = values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(v)}`).join(' ');
    const trendPath = trend.map((v, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(v)}`).join(' ');

    return (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-[var(--text-primary)]">Temporal Patterns</h3>
                <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1">
                        <div className="w-3 h-0.5 bg-[var(--accent)]" />
                        Seasonal
                    </span>
                    <span className="flex items-center gap-1">
                        <div className="w-3 h-0.5 bg-green-500" style={{ opacity: 0.5 }} />
                        Trend
                    </span>
                </div>
            </div>

            <svg viewBox="0 0 100 80" className="w-full h-48">
                {/* Y-axis */}
                <line x1={startX} y1={startY - chartHeight} x2={startX} y2={startY} stroke="var(--border)" strokeWidth="0.5" />
                {/* X-axis */}
                <line x1={startX} y1={startY} x2={startX + chartWidth} y2={startY} stroke="var(--border)" strokeWidth="0.5" />

                {/* Grid lines */}
                {[0, 25, 50, 75].map((val) => (
                    <g key={val}>
                        <line
                            x1={startX}
                            y1={getY(val)}
                            x2={startX + chartWidth}
                            y2={getY(val)}
                            stroke="var(--border)"
                            strokeWidth="0.3"
                            strokeDasharray="2,2"
                        />
                        <text x={startX - 2} y={getY(val) + 1} textAnchor="end" fill="var(--text-muted)" fontSize="3">
                            {val}
                        </text>
                    </g>
                ))}

                {/* Trend line (behind) */}
                <path d={trendPath} fill="none" stroke="rgba(34, 197, 94, 0.5)" strokeWidth="1" strokeDasharray="3,2" />

                {/* Seasonal line */}
                <path d={valuePath} fill="none" stroke="var(--accent)" strokeWidth="1.5" />

                {/* Data points */}
                {values.map((v, i) => (
                    <g key={i} onMouseEnter={() => setHoveredPoint(i)} onMouseLeave={() => setHoveredPoint(null)}>
                        <circle
                            cx={getX(i)}
                            cy={getY(v)}
                            r={hoveredPoint === i ? 3 : 2}
                            fill="var(--accent)"
                            className="transition-all duration-200 cursor-pointer"
                        />
                        {hoveredPoint === i && (
                            <text x={getX(i)} y={getY(v) - 5} textAnchor="middle" fill="var(--text-primary)" fontSize="4" fontWeight="bold">
                                {v}
                            </text>
                        )}
                    </g>
                ))}

                {/* Month labels */}
                {months.map((m, i) => (
                    <text key={m + i} x={getX(i)} y={startY + 5} textAnchor="middle" fill="var(--text-muted)" fontSize="3">
                        {m}
                    </text>
                ))}

                {/* Peak annotation */}
                <text x={getX(5)} y={getY(70) - 8} textAnchor="middle" fill="var(--accent)" fontSize="3.5" fontWeight="500">
                    Summer Peak
                </text>
            </svg>
        </div>
    );
}

// Category correlation heatmap
function CorrelationMatrix() {
    const categories = ['Theft', 'Assault', 'Fraud', 'Vandal'];
    const correlations = [
        [1.0, 0.6, 0.3, 0.7],
        [0.6, 1.0, 0.2, 0.5],
        [0.3, 0.2, 1.0, 0.1],
        [0.7, 0.5, 0.1, 1.0],
    ];

    const getColor = (val: number) => {
        if (val >= 0.8) return 'var(--accent)';
        if (val >= 0.5) return 'rgba(var(--accent-rgb), 0.6)';
        if (val >= 0.3) return 'rgba(var(--accent-rgb), 0.3)';
        return 'rgba(var(--accent-rgb), 0.1)';
    };

    return (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
            <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">Category Correlations</h3>

            <div className="flex justify-center">
                <div className="inline-grid gap-1" style={{ gridTemplateColumns: `auto repeat(${categories.length}, 1fr)` }}>
                    {/* Header row */}
                    <div />
                    {categories.map((cat) => (
                        <div key={cat} className="text-xs text-[var(--text-muted)] text-center px-2">{cat}</div>
                    ))}

                    {/* Data rows */}
                    {categories.map((rowCat, i) => (
                        <>
                            <div key={`label-${rowCat}`} className="text-xs text-[var(--text-muted)] pr-2 flex items-center">{rowCat}</div>
                            {correlations[i].map((val, j) => (
                                <div
                                    key={`${i}-${j}`}
                                    className="w-10 h-10 rounded flex items-center justify-center text-xs font-medium transition-transform hover:scale-110"
                                    style={{ backgroundColor: getColor(val), color: val >= 0.5 ? 'white' : 'var(--text-muted)' }}
                                >
                                    {val.toFixed(1)}
                                </div>
                            ))}
                        </>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Pipeline stage
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


export function CrimeAnalyticsPage({ project }: { project: Project }) {
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
                    <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4" style={{ animation: 'fadeSlideUp 0.5s ease-out' }}>Crime Data Analytics</h1>
                    <p className="text-xl text-[var(--text-secondary)] mb-6 max-w-3xl" style={{ animation: 'fadeSlideUp 0.5s ease-out 100ms both' }}>
                        Spatial clustering and temporal pattern mining for incident forecasting.
                    </p>
                    <div className="flex flex-wrap items-center gap-4" style={{ animation: 'fadeSlideUp 0.5s ease-out 200ms both' }}>
                        <div className="flex flex-wrap gap-2">
                            {['DBSCAN', 'Prophet', 'Time Series', 'Clustering'].map((tech) => (
                                <span key={tech} className="px-3 py-1 text-xs font-medium rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">{tech}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            {/* Visualizations */}
            <section className="py-12 px-6">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Spatial & Temporal Analysis</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <CrimeHeatmap />
                        <TimeSeriesChart />
                    </div>
                </div>
            </section>

            {/* Correlation Matrix */}
            <section className="py-12 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-5xl mx-auto">
                    <CorrelationMatrix />
                </div>
            </section>

            {/* Pipeline Flow */}
            <section className="py-16 px-6">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-8 text-center">Analytics Pipeline</h2>
                    <div className="flex flex-wrap md:flex-nowrap items-start justify-center gap-4 md:gap-0">
                        <PipelineStage icon={Layers} label="Integrate" sublabel="Multi-source" delay={0} isActive={activeStage === 0} />
                        <PipelineArrow delay={100} />
                        <PipelineStage icon={MapPin} label="Cluster" sublabel="DBSCAN" delay={150} isActive={activeStage === 1} />
                        <PipelineArrow delay={250} />
                        <PipelineStage icon={Clock} label="Decompose" sublabel="Seasonality" delay={300} isActive={activeStage === 2} />
                        <PipelineArrow delay={400} />
                        <PipelineStage icon={TrendingUp} label="Forecast" sublabel="Prophet" delay={450} isActive={activeStage === 3} />
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-[var(--border)]">
                        <StatCard value="5+" label="Data Sources" delay={0} />
                        <StatCard value="365" label="Days Analyzed" delay={100} />
                        <StatCard value="6" label="Hotspot Clusters" delay={200} />
                        <StatCard value="3" label="Seasonality Patterns" delay={300} />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-[var(--border)]">
                <div className="max-w-5xl mx-auto"><span className="text-[var(--text-muted)]">Ongoing research project</span></div>
            </footer>
        </div>
    );
}
