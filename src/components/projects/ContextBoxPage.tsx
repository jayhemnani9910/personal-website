"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Github, Camera, FileText, Cpu, Search, ChevronRight, Sparkles } from "lucide-react";
import type { Project } from "@/lib/definitions";
import { StatCard } from "@/components/ui/StatCard";

// Screenshot to vector visualization
function ScreenshotToVector() {
    const [stage, setStage] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => setStage((prev) => (prev + 1) % 4), 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-[var(--text-primary)]">Processing Pipeline</h3>
                <span className="text-xs text-[var(--text-muted)]">Automated</span>
            </div>

            <svg viewBox="0 0 100 60" className="w-full h-40">
                {/* Stage 1: Screenshot */}
                <g className={stage >= 0 ? "opacity-100" : "opacity-30"} style={{ transition: "opacity 0.3s" }}>
                    <rect x="5" y="15" width="20" height="15" rx="2" fill="var(--bg-primary)" stroke={stage === 0 ? "var(--accent)" : "var(--border)"} strokeWidth={stage === 0 ? "1.5" : "1"} />
                    <rect x="7" y="17" width="16" height="2" rx="0.5" fill="var(--text-muted)" opacity="0.5" />
                    <rect x="7" y="20" width="12" height="2" rx="0.5" fill="var(--text-muted)" opacity="0.5" />
                    <rect x="7" y="23" width="14" height="2" rx="0.5" fill="var(--text-muted)" opacity="0.5" />
                    <rect x="7" y="26" width="10" height="2" rx="0.5" fill="var(--text-muted)" opacity="0.5" />
                    <text x="15" y="40" textAnchor="middle" fill="var(--text-muted)" fontSize="3.5">Screenshot</text>
                </g>

                {/* Arrow 1 */}
                <path d="M 28 22 L 35 22" stroke={stage >= 1 ? "var(--accent)" : "var(--border)"} strokeWidth="1" markerEnd="url(#arrowhead)" style={{ transition: "stroke 0.3s" }} />

                {/* Stage 2: OCR Text */}
                <g className={stage >= 1 ? "opacity-100" : "opacity-30"} style={{ transition: "opacity 0.3s" }}>
                    <rect x="38" y="15" width="20" height="15" rx="2" fill="var(--bg-primary)" stroke={stage === 1 ? "var(--accent)" : "var(--border)"} strokeWidth={stage === 1 ? "1.5" : "1"} />
                    <text x="40" y="21" fill="var(--text-primary)" fontSize="3" fontFamily="monospace">Hello</text>
                    <text x="40" y="25" fill="var(--text-primary)" fontSize="3" fontFamily="monospace">World</text>
                    <text x="48" y="40" textAnchor="middle" fill="var(--text-muted)" fontSize="3.5">OCR Text</text>
                </g>

                {/* Arrow 2 */}
                <path d="M 61 22 L 68 22" stroke={stage >= 2 ? "var(--accent)" : "var(--border)"} strokeWidth="1" style={{ transition: "stroke 0.3s" }} />

                {/* Stage 3: Vector */}
                <g className={stage >= 2 ? "opacity-100" : "opacity-30"} style={{ transition: "opacity 0.3s" }}>
                    <rect x="71" y="15" width="20" height="15" rx="2" fill="var(--bg-primary)" stroke={stage === 2 ? "var(--accent)" : "var(--border)"} strokeWidth={stage === 2 ? "1.5" : "1"} />
                    {/* Vector bars */}
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                        <rect
                            key={i}
                            x={74 + i * 2.5}
                            y={28 - (5 + Math.sin(i * 1.2) * 5)}
                            width="1.5"
                            height={5 + Math.sin(i * 1.2) * 5}
                            fill={stage === 2 ? "var(--accent)" : "var(--text-muted)"}
                            rx="0.5"
                            style={{ transition: "fill 0.3s" }}
                        />
                    ))}
                    <text x="81" y="40" textAnchor="middle" fill="var(--text-muted)" fontSize="3.5">Embedding</text>
                </g>

                {/* Arrow marker */}
                <defs>
                    <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                        <path d="M 0 0 L 6 3 L 0 6 Z" fill="var(--accent)" />
                    </marker>
                </defs>

                {/* Stage indicator */}
                <g className={stage === 3 ? "opacity-100" : "opacity-0"} style={{ transition: "opacity 0.3s" }}>
                    <text x="50" y="55" textAnchor="middle" fill="var(--accent)" fontSize="4" fontWeight="bold">
                        → Stored in pgvector
                    </text>
                </g>
            </svg>
        </div>
    );
}

// Vector similarity search visualization
function VectorSearchDemo() {
    const [query, setQuery] = useState("");
    const [searching, setSearching] = useState(false);
    const [results, setResults] = useState<{ text: string; similarity: number }[]>([]);

    const sampleQueries = ["authentication code", "React component", "API endpoint"];
    const sampleResults = [
        { text: "LoginForm.tsx - OAuth flow", similarity: 0.92 },
        { text: "AuthContext.tsx - session", similarity: 0.87 },
        { text: "api/auth.py - JWT tokens", similarity: 0.84 },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            const randomQuery = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];
            setQuery(randomQuery);
            setSearching(true);

            setTimeout(() => {
                setSearching(false);
                setResults(sampleResults.map(r => ({
                    ...r,
                    similarity: Math.random() * 0.15 + 0.82
                })));
            }, 800);
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-[var(--text-primary)]">Semantic Search</h3>
                <span className="text-xs text-[var(--accent)]">&lt;200ms</span>
            </div>

            {/* Search input */}
            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <div className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-[var(--text-primary)]">
                    {query || "Search by concept..."}
                    {searching && (
                        <span className="ml-2 inline-block w-4 h-4 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                    )}
                </div>
            </div>

            {/* Results */}
            <div className="space-y-2">
                {results.map((result, i) => (
                    <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)]"
                        style={{ animation: searching ? 'none' : `fadeSlideUp 0.3s ease-out ${i * 100}ms both` }}
                    >
                        <span className="text-sm text-[var(--text-primary)]">{result.text}</span>
                        <span className="text-xs font-medium text-[var(--accent)]">
                            {(result.similarity * 100).toFixed(0)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Knowledge graph visualization
function KnowledgeGraph() {
    const [activeNode, setActiveNode] = useState(0);

    const nodes = [
        { x: 50, y: 30, label: "Query", type: "query" },
        { x: 25, y: 55, label: "Doc A", type: "doc" },
        { x: 50, y: 70, label: "Doc B", type: "doc" },
        { x: 75, y: 55, label: "Doc C", type: "doc" },
    ];

    useEffect(() => {
        const interval = setInterval(() => setActiveNode((prev) => (prev + 1) % nodes.length), 1500);
        return () => clearInterval(interval);
    }, [nodes.length]);

    return (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-[var(--text-primary)]">Vector Space</h3>
                <span className="text-xs text-[var(--text-muted)]">100K+ chunks</span>
            </div>

            <svg viewBox="0 0 100 100" className="w-full h-48">
                {/* Connection lines */}
                {nodes.slice(1).map((node, i) => (
                    <line
                        key={i}
                        x1={nodes[0].x}
                        y1={nodes[0].y}
                        x2={node.x}
                        y2={node.y}
                        stroke={activeNode === i + 1 ? "var(--accent)" : "var(--border)"}
                        strokeWidth={activeNode === i + 1 ? "1.5" : "0.5"}
                        strokeDasharray={activeNode === i + 1 ? "0" : "3,3"}
                        style={{ transition: "all 0.3s ease" }}
                    />
                ))}

                {/* Nodes */}
                {nodes.map((node, i) => (
                    <g key={i}>
                        <circle
                            cx={node.x}
                            cy={node.y}
                            r={activeNode === i ? 10 : 8}
                            fill={node.type === "query" ? "var(--accent)" : "var(--bg-primary)"}
                            stroke={activeNode === i ? "var(--accent)" : "var(--border)"}
                            strokeWidth="1.5"
                            className="transition-all duration-300"
                        />
                        <text
                            x={node.x}
                            y={node.y + 1}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill={node.type === "query" ? "white" : "var(--text-primary)"}
                            fontSize="4"
                            fontWeight="500"
                        >
                            {node.label}
                        </text>
                        {activeNode === i && i > 0 && (
                            <text x={node.x} y={node.y + 15} textAnchor="middle" fill="var(--accent)" fontSize="3.5">
                                cosine: 0.{85 + i}
                            </text>
                        )}
                    </g>
                ))}

                {/* Decorative dots representing other vectors */}
                {Array.from({ length: 15 }).map((_, i) => (
                    <circle
                        key={`dot-${i}`}
                        cx={15 + Math.random() * 70}
                        cy={35 + Math.random() * 50}
                        r="1"
                        fill="var(--text-muted)"
                        opacity="0.3"
                    />
                ))}
            </svg>
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


export function ContextBoxPage({ project }: { project: Project }) {
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
                    <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4" style={{ animation: 'fadeSlideUp 0.5s ease-out' }}>ContextBox</h1>
                    <p className="text-xl text-[var(--text-secondary)] mb-6 max-w-3xl" style={{ animation: 'fadeSlideUp 0.5s ease-out 100ms both' }}>
                        Personal knowledge assistant with OCR and semantic search.
                    </p>
                    <div className="flex flex-wrap items-center gap-4" style={{ animation: 'fadeSlideUp 0.5s ease-out 200ms both' }}>
                        <div className="flex flex-wrap gap-2">
                            {['Tesseract', 'pgvector', 'LLM', 'FastAPI'].map((tech) => (
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

            {/* Main Visualizations */}
            <section className="py-12 px-6">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Knowledge Pipeline</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <ScreenshotToVector />
                        <VectorSearchDemo />
                    </div>
                </div>
            </section>

            {/* Vector Space */}
            <section className="py-12 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-5xl mx-auto">
                    <div className="max-w-md mx-auto">
                        <KnowledgeGraph />
                    </div>
                </div>
            </section>

            {/* Pipeline Flow */}
            <section className="py-16 px-6">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-8 text-center">Processing Flow</h2>
                    <div className="flex flex-wrap md:flex-nowrap items-start justify-center gap-4 md:gap-0">
                        <PipelineStage icon={Camera} label="Capture" sublabel="Screenshot" delay={0} isActive={activeStage === 0} />
                        <PipelineArrow delay={100} />
                        <PipelineStage icon={FileText} label="Extract" sublabel="Tesseract OCR" delay={150} isActive={activeStage === 1} />
                        <PipelineArrow delay={250} />
                        <PipelineStage icon={Cpu} label="Embed" sublabel="Transformers" delay={300} isActive={activeStage === 2} />
                        <PipelineArrow delay={400} />
                        <PipelineStage icon={Sparkles} label="Retrieve" sublabel="pgvector" delay={450} isActive={activeStage === 3} />
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-[var(--border)]">
                        <StatCard value="1K+" label="Screenshots" delay={0} />
                        <StatCard value="100K+" label="Chunks Embedded" delay={100} />
                        <StatCard value="<200ms" label="Search Latency" delay={200} />
                        <StatCard value="90%+" label="OCR Accuracy" delay={300} />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-[var(--border)]">
                <div className="max-w-5xl mx-auto"><span className="text-[var(--text-muted)]">Your personal searchable memory</span></div>
            </footer>
        </div>
    );
}
