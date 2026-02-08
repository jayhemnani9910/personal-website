"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Github, ExternalLink, FileText, Network, Cpu, Target, ChevronRight } from "lucide-react";
import type { Project } from "@/lib/definitions";
import { StatCard } from "@/components/ui/StatCard";

// Molecule to Graph transformation visual
function MoleculeToGraphAnimation() {
    const [phase, setPhase] = useState(0); // 0: molecule, 1: transition, 2: graph

    useEffect(() => {
        const interval = setInterval(() => {
            setPhase((p) => (p + 1) % 3);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    // Ethanol molecule: C-C-O (simplified 2D representation)
    const atoms = [
        { id: 'C1', x: 25, y: 50, element: 'C', color: '#4a4a4a' },
        { id: 'C2', x: 50, y: 50, element: 'C', color: '#4a4a4a' },
        { id: 'O', x: 75, y: 50, element: 'O', color: '#ef4444' },
    ];

    const bonds = [
        { from: 'C1', to: 'C2' },
        { from: 'C2', to: 'O' },
    ];

    const getAtomPos = (id: string) => atoms.find(a => a.id === id)!;

    return (
        <div className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--bg-secondary)]">
            {/* Phase labels */}
            <div className="absolute top-4 left-4 flex gap-2">
                {['Molecule', 'Transform', 'Graph'].map((label, i) => (
                    <span
                        key={label}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                            phase === i
                                ? 'bg-[var(--accent)] text-white'
                                : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
                        }`}
                    >
                        {label}
                    </span>
                ))}
            </div>

            {/* SMILES notation */}
            <div className="absolute top-4 right-4 px-3 py-1 rounded-lg bg-[var(--bg-tertiary)] font-mono text-sm text-[var(--text-muted)]">
                CCO (Ethanol)
            </div>

            {/* SVG visualization */}
            <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Bonds / Edges */}
                {bonds.map((bond, i) => {
                    const from = getAtomPos(bond.from);
                    const to = getAtomPos(bond.to);
                    return (
                        <line
                            key={i}
                            x1={from.x}
                            y1={from.y}
                            x2={to.x}
                            y2={to.y}
                            stroke={phase === 2 ? 'var(--accent)' : '#666'}
                            strokeWidth={phase === 2 ? 0.8 : 1.5}
                            strokeDasharray={phase === 1 ? '2,2' : 'none'}
                            className="transition-all duration-500"
                            style={{
                                opacity: phase === 1 ? 0.5 : 1,
                            }}
                        />
                    );
                })}

                {/* Atoms / Nodes */}
                {atoms.map((atom) => (
                    <g key={atom.id} className="transition-all duration-500">
                        {/* Node circle (grows in graph phase) */}
                        <circle
                            cx={atom.x}
                            cy={atom.y}
                            r={phase === 2 ? 6 : 4}
                            fill={phase === 2 ? 'var(--accent)' : atom.color}
                            className="transition-all duration-500"
                        />
                        {/* Element label (molecule phase) */}
                        {phase !== 2 && (
                            <text
                                x={atom.x}
                                y={atom.y + 1}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="white"
                                fontSize="4"
                                fontWeight="bold"
                            >
                                {atom.element}
                            </text>
                        )}
                        {/* Feature vector hint (graph phase) */}
                        {phase === 2 && (
                            <text
                                x={atom.x}
                                y={atom.y + 12}
                                textAnchor="middle"
                                fill="var(--text-muted)"
                                fontSize="3"
                                fontFamily="monospace"
                            >
                                [6, 4, 0...]
                            </text>
                        )}
                    </g>
                ))}
            </svg>

            {/* Bottom label */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
                <div className="text-sm font-medium text-[var(--text-primary)]">
                    {phase === 0 && 'Molecular Structure'}
                    {phase === 1 && 'Extracting Features...'}
                    {phase === 2 && 'Graph Representation'}
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-1">
                    {phase === 0 && 'Atoms and bonds'}
                    {phase === 1 && 'Atomic number, charge, hybridization'}
                    {phase === 2 && 'Nodes with feature vectors, edges with bond types'}
                </div>
            </div>
        </div>
    );
}

// GNN Message Passing Animation
function MessagePassingAnimation() {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setStep((s) => (s + 1) % 4);
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    // Simple graph: 5 nodes in a connected pattern
    const nodes = [
        { id: 0, x: 50, y: 20 },
        { id: 1, x: 25, y: 45 },
        { id: 2, x: 75, y: 45 },
        { id: 3, x: 35, y: 75 },
        { id: 4, x: 65, y: 75 },
    ];

    const edges = [
        [0, 1], [0, 2], [1, 3], [2, 4], [1, 2], [3, 4]
    ];

    // Which node is "active" (receiving messages)
    const activeNode = step < 4 ? step : null;

    // Get neighbors of active node
    const getNeighbors = (nodeId: number) => {
        return edges
            .filter(e => e.includes(nodeId))
            .map(e => e[0] === nodeId ? e[1] : e[0]);
    };

    const neighbors = activeNode !== null ? getNeighbors(activeNode) : [];

    return (
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--bg-secondary)]">
            {/* Layer indicator */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="text-xs text-[var(--text-muted)]">Layer</span>
                {[1, 2, 3].map((l) => (
                    <span
                        key={l}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                            l === 1 ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
                        }`}
                    >
                        {l}
                    </span>
                ))}
            </div>

            <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Edges */}
                {edges.map(([from, to], i) => {
                    const fromNode = nodes[from];
                    const toNode = nodes[to];
                    const isActive = neighbors.includes(from) && activeNode === to ||
                                    neighbors.includes(to) && activeNode === from;
                    return (
                        <line
                            key={i}
                            x1={fromNode.x}
                            y1={fromNode.y}
                            x2={toNode.x}
                            y2={toNode.y}
                            stroke={isActive ? 'var(--accent)' : 'var(--border)'}
                            strokeWidth={isActive ? 1.5 : 0.5}
                            className="transition-all duration-300"
                        />
                    );
                })}

                {/* Message passing arrows */}
                {activeNode !== null && neighbors.map((nId) => {
                    const from = nodes[nId];
                    const to = nodes[activeNode];
                    const dx = to.x - from.x;
                    const dy = to.y - from.y;
                    const len = Math.sqrt(dx * dx + dy * dy);
                    const midX = from.x + dx * 0.6;
                    const midY = from.y + dy * 0.6;

                    return (
                        <g key={`msg-${nId}`}>
                            {/* Animated message dot */}
                            <circle
                                r="2"
                                fill="var(--accent)"
                                className="animate-pulse"
                            >
                                <animateMotion
                                    dur="1s"
                                    repeatCount="indefinite"
                                    path={`M${from.x},${from.y} L${to.x},${to.y}`}
                                />
                            </circle>
                        </g>
                    );
                })}

                {/* Nodes */}
                {nodes.map((node) => {
                    const isActive = node.id === activeNode;
                    const isSending = neighbors.includes(node.id);
                    return (
                        <g key={node.id}>
                            <circle
                                cx={node.x}
                                cy={node.y}
                                r={isActive ? 8 : 6}
                                fill={isActive ? 'var(--accent)' : isSending ? '#3b82f6' : 'var(--bg-tertiary)'}
                                stroke={isActive ? 'white' : 'var(--border)'}
                                strokeWidth={isActive ? 2 : 1}
                                className="transition-all duration-300"
                            />
                            <text
                                x={node.x}
                                y={node.y + 1}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill={isActive || isSending ? 'white' : 'var(--text-muted)'}
                                fontSize="4"
                                fontWeight="bold"
                            >
                                {node.id}
                            </text>
                        </g>
                    );
                })}
            </svg>

            {/* Explanation */}
            <div className="absolute bottom-4 left-4 right-4 text-center">
                <div className="text-sm font-medium text-[var(--text-primary)]">
                    {activeNode !== null ? `Node ${activeNode} aggregating from neighbors` : 'Message Passing Complete'}
                </div>
                <div className="text-xs text-[var(--text-muted)] mt-1">
                    h<sub>i</sub> = σ(Σ<sub>j∈N(i)</sub> W·h<sub>j</sub>)
                </div>
            </div>
        </div>
    );
}

// Pipeline flow stage
function PipelineStage({
    icon: Icon,
    label,
    sublabel,
    delay,
    isActive
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    sublabel: string;
    delay: number;
    isActive: boolean;
}) {
    return (
        <div
            className="flex flex-col items-center group"
            style={{ animation: `fadeSlideUp 0.5s ease-out ${delay}ms both` }}
        >
            <div
                className={`
                    w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center
                    border-2 transition-all duration-300
                    ${isActive
                        ? 'bg-[var(--accent)] border-[var(--accent)] text-white scale-110'
                        : 'bg-[var(--bg-secondary)] border-[var(--border)] text-[var(--text-muted)] group-hover:border-[var(--accent)] group-hover:text-[var(--accent)]'
                    }
                `}
            >
                <Icon className="w-7 h-7 md:w-8 md:h-8" />
            </div>
            <span className="mt-3 text-sm font-medium text-[var(--text-primary)]">{label}</span>
            <span className="text-xs text-[var(--text-muted)]">{sublabel}</span>
        </div>
    );
}

// Arrow between pipeline stages
function PipelineArrow({ delay }: { delay: number }) {
    return (
        <div
            className="flex-shrink-0 hidden md:flex items-center px-2"
            style={{ animation: `fadeIn 0.3s ease-out ${delay}ms both` }}
        >
            <div className="w-8 h-0.5 bg-[var(--border)] relative overflow-hidden">
                <div
                    className="absolute inset-0 bg-[var(--accent)]"
                    style={{ animation: `slideRight 1.5s ease-in-out infinite`, animationDelay: `${delay}ms` }}
                />
            </div>
            <ChevronRight className="w-4 h-4 text-[var(--text-muted)] -ml-1" />
        </div>
    );
}

// Model/Tool card
function ToolCard({
    name,
    purpose,
    color,
    delay
}: {
    name: string;
    purpose: string;
    color: string;
    delay: number;
}) {
    return (
        <div
            className="group relative p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                       hover:border-[var(--accent)] transition-all duration-300 hover:-translate-y-1"
            style={{ animation: `fadeSlideUp 0.5s ease-out ${delay}ms both` }}
        >
            <div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(135deg, ${color}15 0%, transparent 50%)` }}
            />
            <div className="relative">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    <h3 className="text-base font-bold text-[var(--text-primary)]">{name}</h3>
                </div>
                <p className="text-sm text-[var(--text-muted)]">{purpose}</p>
            </div>
        </div>
    );
}


export function NobelDataIntelligencePage({ project }: { project: Project }) {
    const [activeStage, setActiveStage] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStage((prev) => (prev + 1) % 4);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            <style jsx global>{`
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideRight {
                    0%, 100% { transform: translateX(-100%); }
                    50% { transform: translateX(100%); }
                }
            `}</style>

            {/* Header */}
            <header className="pt-32 pb-12 px-6">
                <div className="max-w-5xl mx-auto">
                    <Link
                        href="/projects"
                        className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Projects
                    </Link>

                    <h1
                        className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4"
                        style={{ animation: 'fadeSlideUp 0.5s ease-out' }}
                    >
                        Nobel Data Intelligence
                    </h1>

                    <p
                        className="text-xl text-[var(--text-secondary)] mb-6 max-w-3xl"
                        style={{ animation: 'fadeSlideUp 0.5s ease-out 100ms both' }}
                    >
                        Graph Neural Networks for molecular property prediction. 10K+ compounds. 85%+ accuracy.
                    </p>

                    <div
                        className="flex flex-wrap items-center gap-4"
                        style={{ animation: 'fadeSlideUp 0.5s ease-out 200ms both' }}
                    >
                        <a
                            href={project.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors text-sm"
                        >
                            <Github className="w-4 h-4" />
                            View on GitHub
                        </a>

                        <div className="flex flex-wrap gap-2">
                            {['PyTorch Geometric', 'RDKit', 'GNN'].map((tech) => (
                                <span
                                    key={tech}
                                    className="px-3 py-1 text-xs font-medium rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20"
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            {/* Molecule → Graph Animation */}
            <section className="py-12 px-6">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">
                        From Molecules to Graphs
                    </h2>
                    <MoleculeToGraphAnimation />
                </div>
            </section>

            {/* Pipeline Flow */}
            <section className="py-16 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-8 text-center">
                        Pipeline Flow
                    </h2>

                    <div className="flex flex-wrap md:flex-nowrap items-start justify-center gap-4 md:gap-0">
                        <PipelineStage icon={FileText} label="SMILES" sublabel="Input" delay={0} isActive={activeStage === 0} />
                        <PipelineArrow delay={100} />
                        <PipelineStage icon={Network} label="Graph" sublabel="RDKit" delay={150} isActive={activeStage === 1} />
                        <PipelineArrow delay={250} />
                        <PipelineStage icon={Cpu} label="GNN" sublabel="PyTorch Geometric" delay={300} isActive={activeStage === 2} />
                        <PipelineArrow delay={400} />
                        <PipelineStage icon={Target} label="Prediction" sublabel="Properties" delay={450} isActive={activeStage === 3} />
                    </div>
                </div>
            </section>

            {/* Message Passing Animation */}
            <section className="py-16 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-4">
                                How GNNs Learn
                            </h2>
                            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                                Message Passing
                            </h3>
                            <p className="text-[var(--text-secondary)] mb-4">
                                Each node aggregates information from its neighbors. After several layers,
                                atoms &quot;know&quot; about their molecular environment — capturing the chemical
                                context that determines properties.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {['GCN', 'GAT', 'GraphSAGE'].map((arch) => (
                                    <span
                                        key={arch}
                                        className="px-3 py-1 text-xs font-medium rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-muted)]"
                                    >
                                        {arch}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <MessagePassingAnimation />
                    </div>
                </div>
            </section>

            {/* Tools Grid */}
            <section className="py-16 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-8 text-center">
                        The Stack
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <ToolCard name="PyTorch Geometric" purpose="GNN layers, batching, GPU acceleration" color="#ee4c2c" delay={0} />
                        <ToolCard name="RDKit" purpose="Molecular parsing, feature extraction" color="#3b82f6" delay={100} />
                        <ToolCard name="ProDy" purpose="Protein structure analysis" color="#22c55e" delay={200} />
                        <ToolCard name="BioPython" purpose="Sequence handling, alignments" color="#a855f7" delay={300} />
                    </div>
                </div>
            </section>

            {/* Key Stats */}
            <section className="py-16 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-[var(--border)]">
                        <StatCard value="10K+" label="Compounds Processed" delay={0} />
                        <StatCard value="85%+" label="Prediction Accuracy" delay={100} />
                        <StatCard value="<2hr" label="Batch Inference" delay={200} />
                        <StatCard value="3" label="GNN Architectures" delay={300} />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-[var(--border)]">
                <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
                    <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
                    >
                        <Github className="w-5 h-5" />
                        jayhemnani9910/nobel-dataintelligence
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
            </footer>
        </div>
    );
}
