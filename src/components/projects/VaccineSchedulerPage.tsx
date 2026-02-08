"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Github, Users, Clock, Shield, Activity, Syringe, CheckCircle, AlertTriangle, TrendingUp } from "lucide-react";
import type { Project } from "@/lib/definitions";
import { StatCard } from "@/components/ui/StatCard";

// Priority factor component
function PriorityFactor({ icon: Icon, name, weight, color, delay }: { icon: React.ComponentType<{ className?: string }>; name: string; weight: string; color: string; delay: number }) {
    const [barWidth, setBarWidth] = useState(0);
    const numericWeight = parseFloat(weight) * 100;

    useEffect(() => {
        const timer = setTimeout(() => {
            setBarWidth(numericWeight);
        }, delay + 300);
        return () => clearTimeout(timer);
    }, [numericWeight, delay]);

    return (
        <div
            className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]"
            style={{ animation: `fadeSlideUp 0.5s ease-out ${delay}ms both` }}
        >
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                        <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-[var(--text-primary)]">{name}</span>
                </div>
                <span className="text-sm font-bold text-[var(--accent)]">{weight}</span>
            </div>
            <div className="h-2 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`}
                    style={{ width: `${barWidth}%` }}
                />
            </div>
        </div>
    );
}

// Queue visualization
function QueueVisualization() {
    const [positions, setPositions] = useState([
        { id: 1, priority: 85, age: 72, occupation: "Healthcare", status: "scheduled" },
        { id: 2, priority: 78, age: 68, occupation: "Retired", status: "waiting" },
        { id: 3, priority: 72, age: 45, occupation: "Teacher", status: "waiting" },
        { id: 4, priority: 65, age: 55, occupation: "Engineer", status: "waiting" },
        { id: 5, priority: 45, age: 32, occupation: "General", status: "aging" },
    ]);

    useEffect(() => {
        const interval = setInterval(() => {
            setPositions(prev => prev.map(p => ({
                ...p,
                priority: p.status === "aging" ? Math.min(p.priority + 1, 100) : p.priority
            })));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-2">
            {positions.map((pos, i) => (
                <div
                    key={pos.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-500 ${
                        pos.status === "scheduled" ? "bg-green-500/10 border border-green-500/30" :
                        pos.status === "aging" ? "bg-amber-500/10 border border-amber-500/30" :
                        "bg-[var(--bg-primary)] border border-[var(--border)]"
                    }`}
                >
                    <div className="w-6 h-6 rounded-full bg-[var(--accent)] text-white text-xs flex items-center justify-center font-medium">
                        {i + 1}
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-[var(--text-secondary)]">{pos.occupation}, {pos.age}</span>
                            <span className={`text-xs font-medium ${
                                pos.status === "scheduled" ? "text-green-500" :
                                pos.status === "aging" ? "text-amber-500" :
                                "text-[var(--text-muted)]"
                            }`}>
                                {pos.status === "aging" ? `+aging (${pos.priority})` : pos.priority}
                            </span>
                        </div>
                    </div>
                    {pos.status === "scheduled" && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {pos.status === "aging" && <TrendingUp className="w-4 h-4 text-amber-500" />}
                </div>
            ))}
            <p className="text-xs text-[var(--text-muted)] text-center mt-2">
                Aging mechanism prevents starvation — priority increases over time
            </p>
        </div>
    );
}

// Comparison card
function ComparisonCard({ algo, pros, cons, isPreferred }: { algo: string; pros: string; cons: string; isPreferred?: boolean }) {
    return (
        <div className={`p-4 rounded-xl border transition-colors ${isPreferred ? "border-[var(--accent)] bg-[var(--accent)]/5" : "border-[var(--border)] bg-[var(--bg-secondary)]"}`}>
            <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-[var(--text-primary)]">{algo}</span>
                {isPreferred && <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--accent)]/20 text-[var(--accent)]">Proposed</span>}
            </div>
            <div className="space-y-2">
                <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-[var(--text-secondary)]">{pros}</span>
                </div>
                <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-[var(--text-secondary)]">{cons}</span>
                </div>
            </div>
        </div>
    );
}


export function VaccineSchedulerPage({ project }: { project: Project }) {
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
                    <div className="flex items-center gap-3 mb-4">
                        <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)]" style={{ animation: 'fadeSlideUp 0.5s ease-out' }}>
                            Vaccine Scheduler
                        </h1>
                        <span className="px-2 py-1 text-xs font-medium rounded bg-blue-500/10 text-blue-500 border border-blue-500/20">
                            IEEE Published
                        </span>
                    </div>
                    <p className="text-xl text-[var(--text-secondary)] mb-6 max-w-3xl" style={{ animation: 'fadeSlideUp 0.5s ease-out 100ms both' }}>
                        CPU-scheduling-inspired vaccine prioritization with aging mechanism.
                    </p>
                    <div className="flex flex-wrap gap-2" style={{ animation: 'fadeSlideUp 0.5s ease-out 200ms both' }}>
                        {['Priority Scheduling', 'Aging Algorithm', 'Fairness', 'Research'].map((tech) => (
                            <span key={tech} className="px-3 py-1 text-xs font-medium rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">{tech}</span>
                        ))}
                    </div>
                </div>
            </header>

            {/* Priority Formula */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Priority Score Formula</h2>
                    <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] mb-6">
                        <div className="font-mono text-lg text-[var(--text-primary)] text-center mb-4">
                            Priority = w₁×medical + w₂×occupational + w₃×age + w₄×social + <span className="text-amber-500">aging_bonus</span>
                        </div>
                        <p className="text-sm text-[var(--text-muted)] text-center">
                            Multi-factor scoring with dynamic aging to prevent starvation
                        </p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <PriorityFactor icon={Activity} name="Medical Risk" weight="0.35" color="bg-red-500" delay={0} />
                        <PriorityFactor icon={Shield} name="Occupational Risk" weight="0.30" color="bg-blue-500" delay={100} />
                        <PriorityFactor icon={Users} name="Age Factor" weight="0.25" color="bg-purple-500" delay={200} />
                        <PriorityFactor icon={Users} name="Social Vulnerability" weight="0.10" color="bg-green-500" delay={300} />
                    </div>
                </div>
            </section>

            {/* Queue Visualization */}
            <section className="py-12 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Priority Queue (Live)</h2>
                            <QueueVisualization />
                        </div>
                        <div>
                            <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Starvation Prevention</h2>
                            <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                                <Clock className="w-8 h-8 text-amber-500 mb-4" />
                                <div className="text-sm font-medium text-[var(--text-primary)] mb-2">Aging Mechanism</div>
                                <p className="text-xs text-[var(--text-muted)] mb-4">
                                    Borrowed from OS scheduling: lower-priority individuals gradually gain priority over time.
                                </p>
                                <div className="font-mono text-sm text-[var(--text-secondary)] p-3 bg-[var(--bg-secondary)] rounded-lg">
                                    aging_bonus = min(days_waiting × 0.05, 15)
                                </div>
                                <p className="text-xs text-[var(--text-muted)] mt-3">
                                    Cap at 15 points — ensures everyone eventually gets vaccinated while maintaining priority for high-risk groups.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Algorithm Comparison */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">FCFS vs Priority-Based</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <ComparisonCard
                            algo="First-Come, First-Served (FCFS)"
                            pros="Simple, appears fair at surface level"
                            cons="Creates digital divide — favors those with internet access and tech literacy"
                        />
                        <ComparisonCard
                            algo="Priority-Based with Aging"
                            pros="Prioritizes high-risk populations, prevents indefinite waiting"
                            cons="More complex to explain, requires careful weight calibration"
                            isPreferred
                        />
                    </div>
                </div>
            </section>

            {/* System Components */}
            <section className="py-12 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">System Architecture</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                            { icon: Activity, name: "Priority Scoring", desc: "Multi-factor composite scores" },
                            { icon: Users, name: "Queue Management", desc: "Sorted queues with aging" },
                            { icon: Syringe, name: "Capacity Optimizer", desc: "Center allocation balancing" },
                            { icon: Clock, name: "Slot Allocation", desc: "Time-based assignment" },
                            { icon: CheckCircle, name: "Notification", desc: "SMS/Email confirmations" },
                            { icon: Shield, name: "Fairness Auditor", desc: "Equity metrics tracking" },
                        ].map((comp) => (
                            <div key={comp.name} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                                <comp.icon className="w-5 h-5 text-[var(--accent)] mb-2" />
                                <div className="text-sm font-medium text-[var(--text-primary)]">{comp.name}</div>
                                <div className="text-xs text-[var(--text-muted)]">{comp.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-[var(--border)]">
                        <StatCard value="4" label="Priority Factors" />
                        <StatCard value="0.05" label="Daily Aging Rate" />
                        <StatCard value="15" label="Max Aging Bonus" />
                        <StatCard value="IEEE" label="Published" />
                    </div>
                </div>
            </section>

            {/* Key Insight */}
            <section className="py-12 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-4xl mx-auto text-center">
                    <Syringe className="w-8 h-8 text-[var(--accent)] mx-auto mb-4" />
                    <blockquote className="text-lg text-[var(--text-secondary)] italic">
                        "The aging mechanism from CPU scheduling translates beautifully to real-world queues. Without it, lower-priority citizens could wait indefinitely, undermining public trust in the vaccination program."
                    </blockquote>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-[var(--border)]">
                <div className="max-w-6xl mx-auto">
                    <span className="text-[var(--text-muted)]">Published at AIMV-21 / IEEE Xplore</span>
                </div>
            </footer>
        </div>
    );
}
