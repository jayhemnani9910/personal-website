"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Github, ExternalLink, Database, Cpu, Search, BarChart3, ChevronRight } from "lucide-react";
import type { Project } from "@/lib/definitions";
import { StatCard } from "@/components/ui/StatCard";

// Radar chart for player comparison
function PlayerRadarChart() {
    const attributes = ['Passing', 'Dribbling', 'Shooting', 'Defending', 'Pace', 'Vision'];
    const player1 = [85, 88, 72, 45, 78, 92]; // Pedri-like
    const player2 = [82, 85, 68, 48, 75, 88]; // Similar player

    const angleStep = (2 * Math.PI) / attributes.length;
    const center = 50;
    const maxRadius = 35;

    const getPoint = (value: number, index: number) => {
        const angle = index * angleStep - Math.PI / 2;
        const radius = (value / 100) * maxRadius;
        return {
            x: center + radius * Math.cos(angle),
            y: center + radius * Math.sin(angle)
        };
    };

    const createPath = (values: number[]) => {
        return values.map((v, i) => {
            const point = getPoint(v, i);
            return `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
        }).join(' ') + ' Z';
    };

    return (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-[var(--text-primary)]">Player Comparison</h3>
                <div className="flex gap-4 text-xs">
                    <span className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-[var(--accent)]" />
                        Pedri
                    </span>
                    <span className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-blue-400" />
                        Similar (87%)
                    </span>
                </div>
            </div>

            <svg viewBox="0 0 100 100" className="w-full h-48">
                {/* Grid circles */}
                {[20, 40, 60, 80, 100].map((pct) => (
                    <circle
                        key={pct}
                        cx={center}
                        cy={center}
                        r={(pct / 100) * maxRadius}
                        fill="none"
                        stroke="var(--border)"
                        strokeWidth="0.3"
                        strokeDasharray="2,2"
                    />
                ))}

                {/* Axis lines */}
                {attributes.map((_, i) => {
                    const point = getPoint(100, i);
                    return (
                        <line
                            key={i}
                            x1={center}
                            y1={center}
                            x2={point.x}
                            y2={point.y}
                            stroke="var(--border)"
                            strokeWidth="0.3"
                        />
                    );
                })}

                {/* Player 2 area (behind) */}
                <path
                    d={createPath(player2)}
                    fill="rgba(96, 165, 250, 0.2)"
                    stroke="#60a5fa"
                    strokeWidth="1"
                />

                {/* Player 1 area (front) */}
                <path
                    d={createPath(player1)}
                    fill="rgba(var(--accent-rgb), 0.2)"
                    stroke="var(--accent)"
                    strokeWidth="1.5"
                />

                {/* Attribute labels */}
                {attributes.map((attr, i) => {
                    const point = getPoint(115, i);
                    return (
                        <text
                            key={attr}
                            x={point.x}
                            y={point.y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="var(--text-muted)"
                            fontSize="4"
                        >
                            {attr}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
}

// UMAP-style cluster visualization
function ClusterVisualization() {
    const [hoveredCluster, setHoveredCluster] = useState<string | null>(null);

    // Cluster data
    const clusters = [
        { name: 'Playmakers', color: '#8b5cf6', x: 25, y: 30, players: ['Pedri', 'Verratti', 'De Bruyne'] },
        { name: 'Box-to-Box', color: '#22c55e', x: 60, y: 45, players: ['Bellingham', 'Goretzka', 'Barella'] },
        { name: 'Ball Winners', color: '#f97316', x: 75, y: 70, players: ['Casemiro', 'Rodri', 'Kante'] },
        { name: 'Deep Playmakers', color: '#3b82f6', x: 35, y: 65, players: ['Busquets', 'Jorginho', 'Kroos'] },
    ];

    // Generate player dots for each cluster
    const generateDots = (cluster: typeof clusters[0], count: number) => {
        return Array.from({ length: count }, (_, i) => ({
            x: cluster.x + (Math.random() - 0.5) * 15,
            y: cluster.y + (Math.random() - 0.5) * 12,
            name: cluster.players[i] || `Player ${i + 1}`
        }));
    };

    return (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-[var(--text-primary)]">Tactical Clusters (UMAP)</h3>
                <span className="text-xs text-[var(--text-muted)]">5,000+ players</span>
            </div>

            <svg viewBox="0 0 100 100" className="w-full h-48">
                {/* Cluster regions */}
                {clusters.map((cluster) => (
                    <g
                        key={cluster.name}
                        onMouseEnter={() => setHoveredCluster(cluster.name)}
                        onMouseLeave={() => setHoveredCluster(null)}
                        className="cursor-pointer"
                    >
                        {/* Cluster background */}
                        <ellipse
                            cx={cluster.x}
                            cy={cluster.y}
                            rx={12}
                            ry={10}
                            fill={cluster.color}
                            opacity={hoveredCluster === cluster.name ? 0.3 : 0.15}
                            className="transition-opacity duration-200"
                        />

                        {/* Player dots */}
                        {generateDots(cluster, 8).map((dot, i) => (
                            <circle
                                key={i}
                                cx={dot.x}
                                cy={dot.y}
                                r={hoveredCluster === cluster.name ? 2 : 1.5}
                                fill={cluster.color}
                                className="transition-all duration-200"
                            />
                        ))}

                        {/* Label */}
                        <text
                            x={cluster.x}
                            y={cluster.y + 15}
                            textAnchor="middle"
                            fill={cluster.color}
                            fontSize="3.5"
                            fontWeight="500"
                            opacity={hoveredCluster === cluster.name ? 1 : 0.7}
                        >
                            {cluster.name}
                        </text>
                    </g>
                ))}

                {/* Highlighted player */}
                <circle cx={25} cy={30} r={3} fill="var(--accent)" stroke="white" strokeWidth="1" />
                <text x={25} y={23} textAnchor="middle" fill="var(--accent)" fontSize="3.5" fontWeight="bold">
                    Query: Pedri
                </text>
            </svg>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
                {clusters.map((cluster) => (
                    <span
                        key={cluster.name}
                        className="flex items-center gap-1 text-xs"
                        style={{ color: cluster.color }}
                    >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cluster.color }} />
                        {cluster.name}
                    </span>
                ))}
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


export function BarcaBrainPage({ project }: { project: Project }) {
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
                    <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4" style={{ animation: 'fadeSlideUp 0.5s ease-out' }}>BarçaBrain</h1>
                    <p className="text-xl text-[var(--text-secondary)] mb-6 max-w-3xl" style={{ animation: 'fadeSlideUp 0.5s ease-out 100ms both' }}>
                        Vector search for player similarity. Find players like Pedri in milliseconds.
                    </p>
                    <div className="flex flex-wrap items-center gap-4" style={{ animation: 'fadeSlideUp 0.5s ease-out 200ms both' }}>
                        <div className="flex flex-wrap gap-2">
                            {['FAISS', 'PCA', 'Vector Search', 'Streamlit'].map((tech) => (
                                <span key={tech} className="px-3 py-1 text-xs font-medium rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">{tech}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            {/* Visualizations */}
            <section className="py-12 px-6">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Player Intelligence</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <PlayerRadarChart />
                        <ClusterVisualization />
                    </div>
                </div>
            </section>

            {/* Pipeline Flow */}
            <section className="py-16 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-8 text-center">Embedding Pipeline</h2>
                    <div className="flex flex-wrap md:flex-nowrap items-start justify-center gap-4 md:gap-0">
                        <PipelineStage icon={Database} label="Match Events" sublabel="Opta/StatsBomb" delay={0} isActive={activeStage === 0} />
                        <PipelineArrow delay={100} />
                        <PipelineStage icon={BarChart3} label="Features" sublabel="80 metrics" delay={150} isActive={activeStage === 1} />
                        <PipelineArrow delay={250} />
                        <PipelineStage icon={Cpu} label="Embeddings" sublabel="PCA → 24D" delay={300} isActive={activeStage === 2} />
                        <PipelineArrow delay={400} />
                        <PipelineStage icon={Search} label="k-NN Search" sublabel="FAISS" delay={450} isActive={activeStage === 3} />
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-[var(--border)]">
                        <StatCard value="5K+" label="Players Indexed" delay={0} />
                        <StatCard value="<100ms" label="Query Latency" delay={100} />
                        <StatCard value="24D" label="Embedding Dims" delay={200} />
                        <StatCard value="95%" label="Variance Retained" delay={300} />
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
