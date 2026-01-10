"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Github, Layers, GitMerge, BarChart3, ChevronRight, CheckCircle } from "lucide-react";
import type { Project } from "@/lib/definitions";
import { StatCard } from "@/components/ui/StatCard";

// Stacking ensemble visualization
function StackingEnsemble() {
    const [activeModel, setActiveModel] = useState<number | null>(null);
    const [metaActive, setMetaActive] = useState(false);

    const baseModels = [
        { name: "Logistic", accuracy: 78, color: "#3b82f6" },
        { name: "Random Forest", accuracy: 80, color: "#22c55e" },
        { name: "Gradient Boost", accuracy: 79, color: "#f97316" },
        { name: "SVM", accuracy: 77, color: "#8b5cf6" },
    ];

    useEffect(() => {
        const sequence = () => {
            // Animate through base models
            for (let i = 0; i < baseModels.length; i++) {
                setTimeout(() => setActiveModel(i), i * 500);
            }
            // Then activate meta-learner
            setTimeout(() => {
                setActiveModel(null);
                setMetaActive(true);
            }, baseModels.length * 500);
            // Reset
            setTimeout(() => {
                setMetaActive(false);
            }, baseModels.length * 500 + 1000);
        };

        sequence();
        const interval = setInterval(sequence, 4000);
        return () => clearInterval(interval);
    }, [baseModels.length]);

    return (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-[var(--text-primary)]">Stacking Architecture</h3>
                <span className="text-xs text-[var(--text-muted)]">2-Layer Ensemble</span>
            </div>

            <svg viewBox="0 0 100 80" className="w-full h-56">
                {/* Base models (Layer 1) */}
                {baseModels.map((model, i) => {
                    const x = 15 + i * 22;
                    const isActive = activeModel === i;

                    return (
                        <g key={i}>
                            {/* Connection to meta */}
                            <line
                                x1={x}
                                y1={35}
                                x2={50}
                                y2={55}
                                stroke={isActive || metaActive ? model.color : "var(--border)"}
                                strokeWidth={isActive || metaActive ? "1.5" : "0.5"}
                                strokeDasharray={isActive || metaActive ? "0" : "2,2"}
                                style={{ transition: "all 0.3s ease" }}
                            />

                            {/* Model box */}
                            <rect
                                x={x - 10}
                                y={15}
                                width={20}
                                height={20}
                                rx={3}
                                fill={isActive ? model.color : "var(--bg-primary)"}
                                stroke={model.color}
                                strokeWidth={isActive ? "2" : "1"}
                                style={{ transition: "all 0.3s ease" }}
                            />

                            {/* Model name */}
                            <text
                                x={x}
                                y={26}
                                textAnchor="middle"
                                fill={isActive ? "white" : model.color}
                                fontSize="3.5"
                                fontWeight="500"
                            >
                                {model.name.split(' ')[0]}
                            </text>

                            {/* Accuracy */}
                            <text
                                x={x}
                                y={42}
                                textAnchor="middle"
                                fill="var(--text-muted)"
                                fontSize="3"
                            >
                                {model.accuracy}%
                            </text>
                        </g>
                    );
                })}

                {/* Meta-learner (Layer 2) */}
                <g>
                    <rect
                        x={35}
                        y={50}
                        width={30}
                        height={18}
                        rx={4}
                        fill={metaActive ? "var(--accent)" : "var(--bg-primary)"}
                        stroke="var(--accent)"
                        strokeWidth={metaActive ? "2" : "1.5"}
                        style={{ transition: "all 0.3s ease" }}
                    />
                    <text
                        x={50}
                        y={60}
                        textAnchor="middle"
                        fill={metaActive ? "white" : "var(--accent)"}
                        fontSize="4"
                        fontWeight="bold"
                    >
                        Meta-Learner
                    </text>

                    {/* Final accuracy */}
                    {metaActive && (
                        <text x={50} y={75} textAnchor="middle" fill="var(--accent)" fontSize="5" fontWeight="bold">
                            82.68%
                        </text>
                    )}
                </g>

                {/* Layer labels */}
                <text x={5} y={25} fill="var(--text-muted)" fontSize="3" fontWeight="500">Layer 1</text>
                <text x={5} y={59} fill="var(--text-muted)" fontSize="3" fontWeight="500">Layer 2</text>
            </svg>
        </div>
    );
}

// Model comparison chart
function ModelComparisonChart() {
    const models = [
        { name: "Logistic", accuracy: 78, color: "#3b82f6" },
        { name: "RF", accuracy: 80, color: "#22c55e" },
        { name: "GBoost", accuracy: 79, color: "#f97316" },
        { name: "SVM", accuracy: 77, color: "#8b5cf6" },
        { name: "Stack", accuracy: 82.68, color: "var(--accent)" },
    ];

    const maxAccuracy = 85;
    const chartHeight = 50;
    const barWidth = 12;
    const startY = 60;

    return (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-[var(--text-primary)]">Accuracy Comparison</h3>
                <span className="text-xs text-[var(--accent)]">+2.68% improvement</span>
            </div>

            <svg viewBox="0 0 100 70" className="w-full h-44">
                {/* Horizontal grid lines */}
                {[75, 80, 85].map((val) => {
                    const y = startY - ((val - 70) / (maxAccuracy - 70)) * chartHeight;
                    return (
                        <g key={val}>
                            <line x1="15" y1={y} x2="95" y2={y} stroke="var(--border)" strokeWidth="0.3" strokeDasharray="2,2" />
                            <text x="12" y={y + 1} textAnchor="end" fill="var(--text-muted)" fontSize="3">{val}%</text>
                        </g>
                    );
                })}

                {/* Bars */}
                {models.map((model, i) => {
                    const x = 22 + i * 16;
                    const height = ((model.accuracy - 70) / (maxAccuracy - 70)) * chartHeight;
                    const y = startY - height;
                    const isStacking = model.name === "Stack";

                    return (
                        <g key={i}>
                            <rect
                                x={x - barWidth / 2}
                                y={y}
                                width={barWidth}
                                height={height}
                                rx={2}
                                fill={model.color}
                                opacity={isStacking ? 1 : 0.7}
                                className="transition-all duration-300 hover:opacity-100"
                            />
                            {/* Value label */}
                            <text
                                x={x}
                                y={y - 3}
                                textAnchor="middle"
                                fill={model.color}
                                fontSize="3.5"
                                fontWeight={isStacking ? "bold" : "normal"}
                            >
                                {model.accuracy}%
                            </text>
                            {/* Model name */}
                            <text
                                x={x}
                                y={startY + 5}
                                textAnchor="middle"
                                fill="var(--text-muted)"
                                fontSize="3"
                            >
                                {model.name}
                            </text>
                            {/* Highlight winner */}
                            {isStacking && (
                                <CheckCircle
                                    x={x - 3}
                                    y={startY + 8}
                                    width={6}
                                    height={6}
                                    color="var(--accent)"
                                />
                            )}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

// Feature importance visualization
function FeatureImportance() {
    const features = [
        { name: "Glucose", importance: 0.26 },
        { name: "BMI", importance: 0.18 },
        { name: "Age", importance: 0.15 },
        { name: "Pregnancies", importance: 0.12 },
        { name: "Blood Pressure", importance: 0.10 },
        { name: "Insulin", importance: 0.08 },
        { name: "Skin Thickness", importance: 0.06 },
        { name: "Pedigree", importance: 0.05 },
    ];

    return (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6">
            <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">Feature Importance</h3>

            <div className="space-y-3">
                {features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <span className="text-xs text-[var(--text-muted)] w-24 truncate">{feature.name}</span>
                        <div className="flex-1 h-2 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full bg-[var(--accent)]"
                                style={{
                                    width: `${feature.importance * 100 * 3}%`,
                                    animation: `slideIn 0.5s ease-out ${i * 50}ms both`
                                }}
                            />
                        </div>
                        <span className="text-xs font-medium text-[var(--text-primary)] w-10">
                            {(feature.importance * 100).toFixed(0)}%
                        </span>
                    </div>
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


export function DiabetesStackingPage({ project }: { project: Project }) {
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
                @keyframes slideIn { from { width: 0; } }
            `}</style>

            {/* Header */}
            <header className="pt-32 pb-12 px-6">
                <div className="max-w-5xl mx-auto">
                    <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors mb-8">
                        <ArrowLeft className="w-4 h-4" />Back to Projects
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4" style={{ animation: 'fadeSlideUp 0.5s ease-out' }}>Diabetes Prediction</h1>
                    <p className="text-xl text-[var(--text-secondary)] mb-6 max-w-3xl" style={{ animation: 'fadeSlideUp 0.5s ease-out 100ms both' }}>
                        Stacking ensemble combining 4 base learners with a meta-model.
                    </p>
                    <div className="flex flex-wrap items-center gap-4" style={{ animation: 'fadeSlideUp 0.5s ease-out 200ms both' }}>
                        <div className="flex flex-wrap gap-2">
                            {['Stacking', 'scikit-learn', 'Cross-Validation', 'IEEE'].map((tech) => (
                                <span key={tech} className="px-3 py-1 text-xs font-medium rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">{tech}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Visualizations */}
            <section className="py-12 px-6">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Ensemble Architecture</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <StackingEnsemble />
                        <ModelComparisonChart />
                    </div>
                </div>
            </section>

            {/* Feature Importance */}
            <section className="py-12 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-5xl mx-auto">
                    <div className="max-w-xl mx-auto">
                        <FeatureImportance />
                    </div>
                </div>
            </section>

            {/* Pipeline Flow */}
            <section className="py-16 px-6">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-8 text-center">Training Pipeline</h2>
                    <div className="flex flex-wrap md:flex-nowrap items-start justify-center gap-4 md:gap-0">
                        <PipelineStage icon={BarChart3} label="Preprocess" sublabel="Scale + Impute" delay={0} isActive={activeStage === 0} />
                        <PipelineArrow delay={100} />
                        <PipelineStage icon={Layers} label="Base Models" sublabel="4 Classifiers" delay={150} isActive={activeStage === 1} />
                        <PipelineArrow delay={250} />
                        <PipelineStage icon={GitMerge} label="Meta-Learner" sublabel="Logistic Reg" delay={300} isActive={activeStage === 2} />
                        <PipelineArrow delay={400} />
                        <PipelineStage icon={CheckCircle} label="Evaluate" sublabel="5-Fold CV" delay={450} isActive={activeStage === 3} />
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-[var(--border)]">
                        <StatCard value="82.68%" label="Accuracy" delay={0} />
                        <StatCard value="4" label="Base Models" delay={100} />
                        <StatCard value="5-Fold" label="Cross-Validation" delay={200} />
                        <StatCard value="8" label="Features" delay={300} />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-[var(--border)]">
                <div className="max-w-5xl mx-auto"><span className="text-[var(--text-muted)]">Published in IEEE AIMV-21</span></div>
            </footer>
        </div>
    );
}
