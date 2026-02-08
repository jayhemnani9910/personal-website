"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Github, Search, FileText, CheckCircle, Edit3, Sparkles, ArrowRight, Cpu, Cloud, Zap } from "lucide-react";
import type { Project } from "@/lib/definitions";
import { StatCard } from "@/components/ui/StatCard";

// Animated pipeline node
function PipelineNode({ icon: Icon, label, delay, isActive }: { icon: React.ComponentType<{ className?: string }>; label: string; delay: number; isActive: boolean }) {
    return (
        <div
            className={`flex flex-col items-center gap-2 transition-all duration-500 ${isActive ? 'opacity-100 scale-100' : 'opacity-40 scale-90'}`}
            style={{ animation: `fadeSlideUp 0.5s ease-out ${delay}ms both` }}
        >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors duration-300 ${isActive ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border)]'}`}>
                <Icon className="w-6 h-6" />
            </div>
            <span className="text-xs text-[var(--text-muted)] text-center max-w-16">{label}</span>
        </div>
    );
}

function PipelineArrow({ delay, isActive }: { delay: number; isActive: boolean }) {
    return (
        <div
            className="flex items-center"
            style={{ animation: `fadeSlideUp 0.5s ease-out ${delay}ms both` }}
        >
            <div className={`w-8 md:w-12 h-0.5 transition-colors duration-300 ${isActive ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`} />
            <ArrowRight className={`w-4 h-4 -ml-1 transition-colors duration-300 ${isActive ? 'text-[var(--accent)]' : 'text-[var(--border)]'}`} />
        </div>
    );
}

function AgentCard({ icon: Icon, name, desc, color }: { icon: React.ComponentType<{ className?: string }>; name: string; desc: string; color: string }) {
    return (
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--accent)] transition-all duration-300 hover:-translate-y-1">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-sm font-medium text-[var(--text-primary)] mb-1">{name}</div>
            <div className="text-xs text-[var(--text-muted)]">{desc}</div>
        </div>
    );
}


function ArchitectureLayer({ name, items, color }: { name: string; items: string[]; color: string }) {
    return (
        <div className="relative">
            <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-full ${color}`} />
            <div className="pl-4">
                <div className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">{name}</div>
                <div className="flex flex-wrap gap-2">
                    {items.map((item) => (
                        <span key={item} className="px-2 py-1 text-xs rounded bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)]">
                            {item}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function RevoluIdeaPage({ project }: { project: Project }) {
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % 6);
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    const pipelineSteps = [
        { icon: Sparkles, label: "Query" },
        { icon: Search, label: "Search" },
        { icon: FileText, label: "Analyze" },
        { icon: CheckCircle, label: "Verify" },
        { icon: Edit3, label: "Synthesize" },
        { icon: FileText, label: "Report" }
    ];

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            <style jsx global>{`
                @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
            `}</style>

            {/* Header */}
            <header className="pt-32 pb-8 px-6">
                <div className="max-w-6xl mx-auto">
                    <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors mb-8">
                        <ArrowLeft className="w-4 h-4" />Back to Projects
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4" style={{ animation: 'fadeSlideUp 0.5s ease-out' }}>
                        CAG Deep Research
                    </h1>
                    <p className="text-xl text-[var(--text-secondary)] mb-6 max-w-3xl" style={{ animation: 'fadeSlideUp 0.5s ease-out 100ms both' }}>
                        Multi-agent research automation with LangGraph orchestration.
                    </p>
                    <div className="flex flex-wrap items-center gap-4" style={{ animation: 'fadeSlideUp 0.5s ease-out 200ms both' }}>
                        <div className="flex flex-wrap gap-2">
                            {['LangGraph', 'Multi-Agent', 'RAG', 'Ollama'].map((tech) => (
                                <span key={tech} className="px-3 py-1 text-xs font-medium rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">{tech}</span>
                            ))}
                        </div>
                        <a href="https://github.com/jayhemnani9910/revolu-idea" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)]">
                            <Github className="w-4 h-4" /> Code
                        </a>
                    </div>
                </div>
            </header>

            {/* Animated Pipeline */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-8 text-center">Agent Pipeline</h2>
                    <div className="flex items-center justify-center flex-wrap gap-2 md:gap-0">
                        {pipelineSteps.map((step, i) => (
                            <div key={step.label} className="flex items-center">
                                <PipelineNode
                                    icon={step.icon}
                                    label={step.label}
                                    delay={i * 100}
                                    isActive={i <= activeStep}
                                />
                                {i < pipelineSteps.length - 1 && (
                                    <PipelineArrow delay={i * 100 + 50} isActive={i < activeStep} />
                                )}
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-6 text-center">
                        Query → 5+ specialized agents → Comprehensive research report
                    </p>
                </div>
            </section>

            {/* Agent Cards */}
            <section className="py-12 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Specialized Agents</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <AgentCard icon={Sparkles} name="Orchestrator" desc="Decomposes queries" color="bg-purple-500" />
                        <AgentCard icon={Search} name="Web Searcher" desc="Finds sources" color="bg-blue-500" />
                        <AgentCard icon={FileText} name="Analyzer" desc="Extracts info" color="bg-green-500" />
                        <AgentCard icon={CheckCircle} name="Fact Checker" desc="Validates claims" color="bg-amber-500" />
                        <AgentCard icon={Edit3} name="Synthesizer" desc="Combines findings" color="bg-rose-500" />
                        <AgentCard icon={FileText} name="Editor" desc="Refines output" color="bg-cyan-500" />
                    </div>
                </div>
            </section>

            {/* Architecture */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Hexagonal Architecture</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <ArchitectureLayer
                            name="Domain (Core)"
                            items={['Research Workflow', 'Agent Coordination', 'State Machine']}
                            color="bg-[var(--accent)]"
                        />
                        <ArchitectureLayer
                            name="Ports (Interfaces)"
                            items={['LLMPort', 'SearchPort', 'StoragePort']}
                            color="bg-purple-500"
                        />
                        <ArchitectureLayer
                            name="Adapters (Impl)"
                            items={['Ollama', 'OpenAI', 'Tavily', 'PostgreSQL']}
                            color="bg-blue-500"
                        />
                    </div>
                </div>
            </section>

            {/* LLM Strategy */}
            <section className="py-12 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Hybrid LLM Strategy</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                    <Cpu className="w-5 h-5 text-green-500" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-[var(--text-primary)]">Local (Ollama)</div>
                                    <div className="text-xs text-[var(--text-muted)]">Llama 3, Mistral</div>
                                </div>
                            </div>
                            <p className="text-sm text-[var(--text-secondary)]">Content analysis, summarization, extraction — commodity tasks at 1/10th cost</p>
                        </div>
                        <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                    <Cloud className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-[var(--text-primary)]">Cloud (Fallback)</div>
                                    <div className="text-xs text-[var(--text-muted)]">GPT-4, Claude</div>
                                </div>
                            </div>
                            <p className="text-sm text-[var(--text-secondary)]">Fact-checking, synthesis, complex reasoning — premium tasks requiring quality</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-[var(--border)]">
                        <StatCard value="5+" label="Specialized Agents" />
                        <StatCard value="50+" label="Sources per Query" />
                        <StatCard value="~70%" label="Cost Reduction" />
                        <StatCard value="<15m" label="Full Research Cycle" />
                    </div>
                </div>
            </section>

            {/* Key Insight */}
            <section className="py-12 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-4xl mx-auto text-center">
                    <Zap className="w-8 h-8 text-[var(--accent)] mx-auto mb-4" />
                    <blockquote className="text-lg text-[var(--text-secondary)] italic">
                        "Multi-agent systems excel when tasks have natural decomposition boundaries. Research has clear phases—search, analyze, verify, synthesize—that map perfectly to specialized agents."
                    </blockquote>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-[var(--border)]">
                <div className="max-w-6xl mx-auto">
                    <span className="text-[var(--text-muted)]">Built in 10 days with hexagonal architecture</span>
                </div>
            </footer>
        </div>
    );
}
