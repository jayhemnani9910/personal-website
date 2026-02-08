"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, TrendingDown, Package, Truck, Clock, AlertTriangle, BarChart3, Database, ArrowRight } from "lucide-react";
import type { Project } from "@/lib/definitions";
import { StatCard } from "@/components/ui/StatCard";

// Animated metric card
function MetricCard({ icon: Icon, value, label, trend, color, delay }: { icon: React.ComponentType<{ className?: string }>; value: string; label: string; trend: string; color: string; delay: number }) {
    return (
        <div
            className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--accent)] transition-all duration-300"
            style={{ animation: `fadeSlideUp 0.5s ease-out ${delay}ms both` }}
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-green-500">{trend}</span>
            </div>
            <div className="text-2xl font-bold text-[var(--text-primary)] mb-1">{value}</div>
            <div className="text-sm text-[var(--text-muted)]">{label}</div>
        </div>
    );
}

// Pipeline step
function PipelineStep({ step, title, desc, isLast }: { step: number; title: string; desc: string; isLast?: boolean }) {
    return (
        <div className="flex gap-4">
            <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-sm font-medium">
                    {step}
                </div>
                {!isLast && <div className="w-0.5 h-full bg-[var(--border)] mt-2" />}
            </div>
            <div className="pb-8">
                <div className="text-sm font-medium text-[var(--text-primary)] mb-1">{title}</div>
                <div className="text-xs text-[var(--text-muted)]">{desc}</div>
            </div>
        </div>
    );
}

// Risk tier indicator
function RiskTier({ tier, percentage }: { tier: string; percentage: number }) {
    const colors: Record<string, string> = {
        Low: "bg-green-500",
        Medium: "bg-amber-500",
        High: "bg-red-500"
    };

    return (
        <div className="flex items-center gap-3">
            <div className="flex-1">
                <div className="flex justify-between mb-1">
                    <span className="text-xs text-[var(--text-muted)]">{tier} Risk</span>
                    <span className="text-xs text-[var(--text-secondary)]">{percentage}%</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--bg-primary)] overflow-hidden">
                    <div
                        className={`h-full rounded-full ${colors[tier]} transition-all duration-1000`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        </div>
    );
}


export function OptisupplyPage({ project }: { project: Project }) {
    const [animatedPercentages, setAnimatedPercentages] = useState({ low: 0, medium: 0, high: 0 });

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedPercentages({ low: 65, medium: 25, high: 10 });
        }, 500);
        return () => clearTimeout(timer);
    }, []);

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
                        OptiSupply
                    </h1>
                    <p className="text-xl text-[var(--text-secondary)] mb-6 max-w-3xl" style={{ animation: 'fadeSlideUp 0.5s ease-out 100ms both' }}>
                        Supply chain analytics reducing costs, delays, and inventory.
                    </p>
                    <div className="flex flex-wrap gap-2" style={{ animation: 'fadeSlideUp 0.5s ease-out 200ms both' }}>
                        {['Python', 'Pandas', 'Scikit-learn', 'PuLP', 'Plotly'].map((tech) => (
                            <span key={tech} className="px-3 py-1 text-xs font-medium rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">{tech}</span>
                        ))}
                    </div>
                </div>
            </header>

            {/* Impact Metrics - Hero */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Impact Achieved</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <MetricCard
                            icon={Truck}
                            value="15%"
                            label="Shipping Cost Reduction"
                            trend="−$200K/yr"
                            color="bg-blue-500"
                            delay={0}
                        />
                        <MetricCard
                            icon={Clock}
                            value="20%"
                            label="Delay Reduction"
                            trend="−8 days avg"
                            color="bg-amber-500"
                            delay={100}
                        />
                        <MetricCard
                            icon={Package}
                            value="10%"
                            label="Inventory Optimization"
                            trend="−$150K carry"
                            color="bg-green-500"
                            delay={200}
                        />
                    </div>
                </div>
            </section>

            {/* Analytics Components */}
            <section className="py-12 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Analytics Components</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                            <AlertTriangle className="w-6 h-6 text-amber-500 mb-4" />
                            <div className="text-sm font-medium text-[var(--text-primary)] mb-2">Supplier Risk Scoring</div>
                            <p className="text-xs text-[var(--text-muted)] mb-4">
                                On-time delivery, lead time variability, and quality metrics combined into composite risk scores.
                            </p>
                            <div className="space-y-3">
                                <RiskTier tier="Low" percentage={animatedPercentages.low} />
                                <RiskTier tier="Medium" percentage={animatedPercentages.medium} />
                                <RiskTier tier="High" percentage={animatedPercentages.high} />
                            </div>
                        </div>
                        <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                            <Truck className="w-6 h-6 text-blue-500 mb-4" />
                            <div className="text-sm font-medium text-[var(--text-primary)] mb-2">Lane Optimizer</div>
                            <p className="text-xs text-[var(--text-muted)] mb-4">
                                Linear programming (PuLP) for optimal lane selection balancing cost vs transit time.
                            </p>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-[var(--text-muted)]">Cost per unit</span>
                                    <span className="text-[var(--text-secondary)]">Optimized</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-[var(--text-muted)]">Transit time</span>
                                    <span className="text-[var(--text-secondary)]">Constrained</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-[var(--text-muted)]">Capacity</span>
                                    <span className="text-[var(--text-secondary)]">Bounded</span>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                            <Package className="w-6 h-6 text-green-500 mb-4" />
                            <div className="text-sm font-medium text-[var(--text-primary)] mb-2">Inventory Model</div>
                            <p className="text-xs text-[var(--text-muted)] mb-4">
                                Safety stock and reorder point optimization based on demand and lead time variability.
                            </p>
                            <div className="p-3 bg-[var(--bg-secondary)] rounded-lg font-mono text-xs text-[var(--text-secondary)]">
                                SS = Z × √(LT×σ²ᴅ + μ²ᴅ×σ²ᴸᵀ)
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Data Pipeline */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Monthly Analytics Cycle</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <PipelineStep step={1} title="Data Extraction" desc="Pull orders, shipments, inventory from SAP/TMS/WMS" />
                            <PipelineStep step={2} title="Transformation" desc="Normalize, calculate KPIs, build rolling averages" />
                            <PipelineStep step={3} title="Analytics & Modeling" desc="Update risk scores, optimize lanes, refresh inventory recs" />
                            <PipelineStep step={4} title="Reporting & Action" desc="Executive summary, dashboards, monthly review" isLast />
                        </div>
                        <div className="flex items-center justify-center">
                            <div className="w-full max-w-xs">
                                <div className="flex items-center justify-between mb-4">
                                    <Database className="w-10 h-10 text-[var(--text-muted)]" />
                                    <ArrowRight className="w-5 h-5 text-[var(--border)]" />
                                    <BarChart3 className="w-10 h-10 text-[var(--accent)]" />
                                </div>
                                <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-center">
                                    <div className="text-2xl font-bold text-[var(--text-primary)]">500K+</div>
                                    <div className="text-xs text-[var(--text-muted)]">Order lines processed monthly</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Decision Framework */}
            <section className="py-12 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Key Design Decisions</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                            <div className="text-sm font-medium text-[var(--text-primary)] mb-2">Interpretability {">"} Complexity</div>
                            <div className="text-xs text-[var(--text-muted)]">Transparent scoring models (weighted averages) over black-box ML. Stakeholders need to understand and trust the risk scores.</div>
                        </div>
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                            <div className="text-sm font-medium text-[var(--text-primary)] mb-2">Batch + Exception Alerting</div>
                            <div className="text-xs text-[var(--text-muted)]">Monthly analytics aligned with decision cycles, plus daily alerts for critical delays ({">"} 5 days late).</div>
                        </div>
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                            <div className="text-sm font-medium text-[var(--text-primary)] mb-2">What-If {">"} Auto-Optimization</div>
                            <div className="text-xs text-[var(--text-muted)]">Scenario analysis for human-in-the-loop decisions. Supply chain involves non-quantifiable factors like vendor relationships.</div>
                        </div>
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                            <div className="text-sm font-medium text-[var(--text-primary)] mb-2">SKU-Level Data, Category-Level Analysis</div>
                            <div className="text-xs text-[var(--text-muted)]">Maintain granular data for deep-dives, but aggregate for clearer insights and faster queries.</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-[var(--border)]">
                        <StatCard value="50+" label="Suppliers Tracked" />
                        <StatCard value="8" label="Countries" />
                        <StatCard value="500K" label="Order Lines/Month" />
                        <StatCard value="3" label="Analytics Models" />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-[var(--border)]">
                <div className="max-w-6xl mx-auto">
                    <span className="text-[var(--text-muted)]">Supply chain analytics for fashion retail</span>
                </div>
            </footer>
        </div>
    );
}
