"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Github, ExternalLink, Video, Scan, Layers, Route, MessageSquare, ChevronRight } from "lucide-react";
import type { Project } from "@/lib/definitions";
import { StatCard } from "@/components/ui/StatCard";

// Animated pipeline stage
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
            style={{
                animation: `fadeSlideUp 0.5s ease-out ${delay}ms both`,
            }}
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

// Animated arrow between stages
function PipelineArrow({ delay }: { delay: number }) {
    return (
        <div
            className="flex-shrink-0 hidden md:flex items-center px-2"
            style={{ animation: `fadeIn 0.3s ease-out ${delay}ms both` }}
        >
            <div className="w-8 h-0.5 bg-[var(--border)] relative overflow-hidden">
                <div
                    className="absolute inset-0 bg-[var(--accent)]"
                    style={{
                        animation: `slideRight 1.5s ease-in-out infinite`,
                        animationDelay: `${delay}ms`
                    }}
                />
            </div>
            <ChevronRight className="w-4 h-4 text-[var(--text-muted)] -ml-1" />
        </div>
    );
}

// Model card with hover animation
function ModelCard({
    name,
    purpose,
    stat,
    statLabel,
    delay,
    color
}: {
    name: string;
    purpose: string;
    stat: string;
    statLabel: string;
    delay: number;
    color: string;
}) {
    return (
        <div
            className="group relative p-6 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border)]
                       hover:border-[var(--accent)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            style={{
                animation: `fadeSlideUp 0.5s ease-out ${delay}ms both`,
            }}
        >
            {/* Gradient accent on hover */}
            <div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                    background: `linear-gradient(135deg, ${color}10 0%, transparent 50%)`,
                }}
            />

            <div className="relative">
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">{name}</h3>
                <p className="text-sm text-[var(--text-muted)] mb-4">{purpose}</p>

                <div className="flex items-baseline gap-2">
                    <span
                        className="text-2xl font-bold"
                        style={{ color }}
                    >
                        {stat}
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">{statLabel}</span>
                </div>
            </div>
        </div>
    );
}

// Before/After comparison visual
function BeforeAfterComparison() {
    const [sliderPos, setSliderPos] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMove = (clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderPos(percent);
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-video rounded-2xl overflow-hidden cursor-ew-resize select-none border border-[var(--border)]"
            onMouseMove={(e) => e.buttons === 1 && handleMove(e.clientX)}
            onTouchMove={(e) => handleMove(e.touches[0].clientX)}
            style={{ animation: 'fadeIn 0.8s ease-out' }}
        >
            {/* "Before" - Raw frame mockup */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-900/40 to-green-700/40">
                {/* Pitch lines */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3/4 h-3/4 border-2 border-white/20 rounded-lg relative">
                        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/20" />
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/20 rounded-full" />
                    </div>
                </div>

                {/* Player dots (raw) */}
                {[
                    { x: 20, y: 30 }, { x: 25, y: 50 }, { x: 22, y: 70 },
                    { x: 35, y: 25 }, { x: 40, y: 45 }, { x: 38, y: 65 }, { x: 35, y: 85 },
                    { x: 55, y: 35 }, { x: 50, y: 55 }, { x: 55, y: 75 },
                    { x: 70, y: 50 },
                ].map((pos, i) => (
                    <div
                        key={i}
                        className="absolute w-3 h-3 rounded-full bg-white/40"
                        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                    />
                ))}

                {/* Label */}
                <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/50 text-white text-xs font-medium">
                    Raw Input
                </div>
            </div>

            {/* "After" - Annotated frame mockup */}
            <div
                className="absolute inset-0 bg-gradient-to-br from-green-900/40 to-green-700/40"
                style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
            >
                {/* Pitch lines */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3/4 h-3/4 border-2 border-white/30 rounded-lg relative">
                        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/30" />
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-white/30 rounded-full" />
                    </div>
                </div>

                {/* Player boxes with tracking (annotated) */}
                {[
                    { x: 20, y: 30, team: 'red', id: 1 },
                    { x: 25, y: 50, team: 'red', id: 7 },
                    { x: 22, y: 70, team: 'red', id: 3 },
                    { x: 35, y: 25, team: 'red', id: 4 },
                    { x: 40, y: 45, team: 'red', id: 8 },
                    { x: 38, y: 65, team: 'red', id: 6 },
                    { x: 35, y: 85, team: 'red', id: 2 },
                    { x: 55, y: 35, team: 'blue', id: 10 },
                    { x: 50, y: 55, team: 'blue', id: 9 },
                    { x: 55, y: 75, team: 'blue', id: 11 },
                    { x: 70, y: 50, team: 'blue', id: 1 },
                ].map((player, i) => (
                    <div
                        key={i}
                        className="absolute"
                        style={{ left: `${player.x}%`, top: `${player.y}%`, transform: 'translate(-50%, -50%)' }}
                    >
                        {/* Bounding box */}
                        <div
                            className={`w-6 h-10 border-2 rounded-sm ${player.team === 'red' ? 'border-red-500' : 'border-blue-500'}`}
                        />
                        {/* Track ID */}
                        <span
                            className={`absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] font-bold px-1 rounded ${player.team === 'red' ? 'bg-red-500' : 'bg-blue-500'} text-white`}
                        >
                            #{player.id}
                        </span>
                        {/* Segmentation glow */}
                        <div
                            className={`absolute inset-0 ${player.team === 'red' ? 'bg-red-500/30' : 'bg-blue-500/30'} rounded-sm`}
                        />
                    </div>
                ))}

                {/* Ball */}
                <div className="absolute left-[45%] top-[48%]">
                    <div className="w-3 h-3 rounded-full bg-yellow-400 border-2 border-yellow-300 shadow-lg shadow-yellow-400/50" />
                </div>

                {/* Label */}
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[var(--accent)] text-white text-xs font-medium">
                    Pipeline Output
                </div>
            </div>

            {/* Slider handle */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
                style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
            >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
                    <div className="flex gap-0.5">
                        <div className="w-0.5 h-4 bg-gray-400 rounded-full" />
                        <div className="w-0.5 h-4 bg-gray-400 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    );
}


export function SoccerVisionResearchPage({ project }: { project: Project }) {
    const [activeStage, setActiveStage] = useState(0);

    // Animate through pipeline stages
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStage((prev) => (prev + 1) % 5);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            <style jsx global>{`
                @keyframes fadeSlideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes slideRight {
                    0%, 100% { transform: translateX(-100%); }
                    50% { transform: translateX(100%); }
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
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
                        Soccer Vision Research
                    </h1>

                    <p
                        className="text-xl text-[var(--text-secondary)] mb-6 max-w-3xl"
                        style={{ animation: 'fadeSlideUp 0.5s ease-out 100ms both' }}
                    >
                        4 SOTA models. 1 modular pipeline. Zero-shot player identification.
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
                            {['RF-DETR', 'SAM2', 'ByteTrack', 'SigLIP'].map((tech) => (
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

            {/* Before/After Hero */}
            <section className="py-12 px-6">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">
                        Drag to Compare
                    </h2>
                    <BeforeAfterComparison />
                </div>
            </section>

            {/* Animated Pipeline */}
            <section className="py-16 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-8 text-center">
                        Pipeline Flow
                    </h2>

                    <div className="flex flex-wrap md:flex-nowrap items-start justify-center gap-4 md:gap-0">
                        <PipelineStage icon={Video} label="Video" sublabel="Input" delay={0} isActive={activeStage === 0} />
                        <PipelineArrow delay={100} />
                        <PipelineStage icon={Scan} label="Detection" sublabel="RF-DETR" delay={150} isActive={activeStage === 1} />
                        <PipelineArrow delay={250} />
                        <PipelineStage icon={Layers} label="Segmentation" sublabel="SAM2" delay={300} isActive={activeStage === 2} />
                        <PipelineArrow delay={400} />
                        <PipelineStage icon={Route} label="Tracking" sublabel="ByteTrack" delay={450} isActive={activeStage === 3} />
                        <PipelineArrow delay={550} />
                        <PipelineStage icon={MessageSquare} label="Classification" sublabel="SigLIP" delay={600} isActive={activeStage === 4} />
                    </div>
                </div>
            </section>

            {/* Model Cards Grid */}
            <section className="py-16 px-6">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-8 text-center">
                        The Models
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4">
                        <ModelCard
                            name="RF-DETR"
                            purpose="Real-time detection transformer for player localization"
                            stat="97%+"
                            statLabel="precision"
                            delay={0}
                            color="#ef4444"
                        />
                        <ModelCard
                            name="SAM2"
                            purpose="Segment Anything Model for pixel-perfect player masks"
                            stat="30 FPS"
                            statLabel="real-time"
                            delay={100}
                            color="#3b82f6"
                        />
                        <ModelCard
                            name="ByteTrack"
                            purpose="Multi-object tracking with occlusion recovery"
                            stat="847+"
                            statLabel="frames tracked"
                            delay={200}
                            color="#22c55e"
                        />
                        <ModelCard
                            name="SigLIP"
                            purpose="Vision-language model for zero-shot team classification"
                            stat="0-shot"
                            statLabel="no training needed"
                            delay={300}
                            color="#a855f7"
                        />
                    </div>
                </div>
            </section>

            {/* Key Stats */}
            <section className="py-16 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-[var(--border)]">
                        <StatCard value="97%+" label="Detection Precision" delay={0} />
                        <StatCard value="30" label="FPS Processing" delay={100} />
                        <StatCard value="10+" label="Configs Tested" delay={200} />
                        <StatCard value="500+" label="Video Clips" delay={300} />
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
                        jayhemnani9910/soccer-vision-research
                        <ExternalLink className="w-4 h-4" />
                    </a>

                    <div className="flex gap-4 text-sm">
                        <Link href="/projects/fifa-soccer-ds" className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                            Related: FIFA Soccer DS
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
