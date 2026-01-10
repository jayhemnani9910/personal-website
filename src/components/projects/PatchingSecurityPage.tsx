"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Shield, AlertTriangle, CheckCircle, XCircle, Search, Wrench, TestTube, Rocket, ArrowRight } from "lucide-react";
import type { Project } from "@/lib/definitions";
import { StatCard } from "@/components/ui/StatCard";

// Vulnerability card
function VulnCard({ cwe, name, severity, status }: { cwe: string; name: string; severity: string; status: string }) {
    const severityColors: Record<string, string> = {
        HIGH: "bg-red-500/10 text-red-500 border-red-500/20",
        MEDIUM: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        LOW: "bg-green-500/10 text-green-500 border-green-500/20",
    };

    const statusIcons: Record<string, React.ReactNode> = {
        patched: <CheckCircle className="w-4 h-4 text-green-500" />,
        detected: <AlertTriangle className="w-4 h-4 text-amber-500" />,
        blocked: <XCircle className="w-4 h-4 text-red-500" />,
    };

    return (
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--accent)] transition-colors">
            <div className="flex items-start justify-between mb-2">
                <code className="text-xs text-[var(--accent)]">{cwe}</code>
                {statusIcons[status]}
            </div>
            <div className="text-sm font-medium text-[var(--text-primary)] mb-2">{name}</div>
            <span className={`px-2 py-0.5 text-xs rounded border ${severityColors[severity]}`}>
                {severity}
            </span>
        </div>
    );
}

// Pipeline stage
function PipelineStage({ icon: Icon, title, desc, stage }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string; stage: number }) {
    return (
        <div className="flex flex-col items-center text-center p-4">
            <div className="w-12 h-12 rounded-xl bg-[var(--accent)] flex items-center justify-center mb-3 relative">
                <Icon className="w-6 h-6 text-white" />
                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[var(--bg-primary)] border border-[var(--border)] text-xs flex items-center justify-center text-[var(--text-muted)]">
                    {stage}
                </span>
            </div>
            <div className="text-sm font-medium text-[var(--text-primary)] mb-1">{title}</div>
            <div className="text-xs text-[var(--text-muted)]">{desc}</div>
        </div>
    );
}

// Canary deployment visualization
function CanaryViz() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) return 0;
                return prev + 5;
            });
        }, 500);
        return () => clearInterval(interval);
    }, []);

    const segments = [5, 25, 50, 100];
    const activeSegment = segments.findIndex(s => progress <= s);

    return (
        <div className="space-y-4">
            <div className="flex gap-1">
                {segments.map((segment, i) => (
                    <div
                        key={segment}
                        className={`h-3 rounded flex-1 transition-colors duration-300 ${
                            progress >= segment ? 'bg-green-500' :
                            i === activeSegment ? 'bg-[var(--accent)]' :
                            'bg-[var(--border)]'
                        }`}
                    />
                ))}
            </div>
            <div className="flex justify-between text-xs text-[var(--text-muted)]">
                <span className={progress >= 5 ? "text-green-500" : ""}>5% Canary</span>
                <span className={progress >= 25 ? "text-green-500" : ""}>25%</span>
                <span className={progress >= 50 ? "text-green-500" : ""}>50%</span>
                <span className={progress >= 100 ? "text-green-500" : ""}>100%</span>
            </div>
        </div>
    );
}


export function PatchingSecurityPage({ project }: { project: Project }) {
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
                        Binary Security Patching
                    </h1>
                    <p className="text-xl text-[var(--text-secondary)] mb-6 max-w-3xl" style={{ animation: 'fadeSlideUp 0.5s ease-out 100ms both' }}>
                        Automatic hardening to neutralize vulnerability classes without source code.
                    </p>
                    <div className="flex flex-wrap gap-2" style={{ animation: 'fadeSlideUp 0.5s ease-out 200ms both' }}>
                        {['Binary Analysis', 'Security', 'DevSecOps', 'Automated Testing'].map((tech) => (
                            <span key={tech} className="px-3 py-1 text-xs font-medium rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">{tech}</span>
                        ))}
                    </div>
                </div>
            </header>

            {/* Problem Statement */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="p-6 rounded-xl border border-amber-500/30 bg-amber-500/5">
                        <div className="flex items-start gap-4">
                            <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0" />
                            <div>
                                <div className="text-sm font-medium text-[var(--text-primary)] mb-2">The Time-to-Patch Gap</div>
                                <p className="text-sm text-[var(--text-secondary)]">
                                    Vulnerabilities are disclosed, but vendor patches take days or weeks. This window leaves systems exposed to known exploits. Binary patching fills this gap — applying defensive hardening directly to compiled binaries before official fixes arrive.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pipeline */}
            <section className="py-12 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Three-Stage Pipeline</h2>
                    <div className="grid md:grid-cols-4 gap-4">
                        <PipelineStage icon={Search} title="Analyze" desc="Scan for vulnerability patterns" stage={1} />
                        <div className="hidden md:flex items-center justify-center">
                            <ArrowRight className="w-6 h-6 text-[var(--border)]" />
                        </div>
                        <PipelineStage icon={Wrench} title="Patch" desc="Insert defensive guards" stage={2} />
                        <PipelineStage icon={TestTube} title="Validate" desc="Regression + canary deploy" stage={3} />
                    </div>
                </div>
            </section>

            {/* Vulnerability Classes */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Targeted Vulnerability Classes</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <VulnCard cwe="CWE-120" name="Buffer Overflow" severity="HIGH" status="patched" />
                        <VulnCard cwe="CWE-134" name="Format String" severity="HIGH" status="patched" />
                        <VulnCard cwe="CWE-190" name="Integer Overflow" severity="MEDIUM" status="patched" />
                        <VulnCard cwe="CWE-476" name="NULL Pointer" severity="MEDIUM" status="patched" />
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-4 text-center">
                        Class-based patching neutralizes entire vulnerability categories, including unknown variants
                    </p>
                </div>
            </section>

            {/* Canary Deployment */}
            <section className="py-12 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Canary Deployment</h2>
                            <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                                <Rocket className="w-8 h-8 text-[var(--accent)] mb-4" />
                                <p className="text-sm text-[var(--text-secondary)] mb-4">
                                    Patched binaries deploy gradually with real-time monitoring. Anomalies trigger automatic rollback.
                                </p>
                                <CanaryViz />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Regression Gates</h2>
                            <div className="space-y-3">
                                {[
                                    { check: "Functional equivalence", status: "pass" },
                                    { check: "Performance < 5% overhead", status: "pass" },
                                    { check: "Exploit PoC blocked", status: "pass" },
                                    { check: "24h canary monitoring", status: "pass" },
                                ].map((item) => (
                                    <div key={item.check} className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)]">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        <span className="text-sm text-[var(--text-secondary)]">{item.check}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Key Decisions */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Design Principles</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
                            <div className="text-sm font-medium text-[var(--text-primary)] mb-2">Class-Based {">"} CVE-Specific</div>
                            <div className="text-xs text-[var(--text-muted)]">Targeting entire vulnerability classes provides defense-in-depth against zero-days, not just cataloged CVEs.</div>
                        </div>
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
                            <div className="text-sm font-medium text-[var(--text-primary)] mb-2">Conservative Patching</div>
                            <div className="text-xs text-[var(--text-muted)]">Better to leave potential vulnerability than introduce confirmed instability. All patches must pass regression gates.</div>
                        </div>
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
                            <div className="text-sm font-medium text-[var(--text-primary)] mb-2">Binary-Level Access</div>
                            <div className="text-xs text-[var(--text-muted)]">Enables patching closed-source and legacy systems where source code is unavailable.</div>
                        </div>
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
                            <div className="text-sm font-medium text-[var(--text-primary)] mb-2">Automated Rollback</div>
                            <div className="text-xs text-[var(--text-muted)]">Telemetry-driven rollback if anomalies detected. Speed AND safety, not speed over safety.</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-12 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-[var(--border)]">
                        <StatCard value="<5%" label="Max Performance Overhead" />
                        <StatCard value="4" label="Vulnerability Classes" />
                        <StatCard value="24-48h" label="Canary Period" />
                        <StatCard value="0" label="Tolerance for Instability" />
                    </div>
                </div>
            </section>

            {/* Key Insight */}
            <section className="py-12 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <Shield className="w-8 h-8 text-[var(--accent)] mx-auto mb-4" />
                    <blockquote className="text-lg text-[var(--text-secondary)] italic">
                        "DevSecOps is about speed AND safety. True velocity comes from confidence in your safety systems, not from skipping validation steps."
                    </blockquote>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-[var(--border)]">
                <div className="max-w-6xl mx-auto">
                    <span className="text-[var(--text-muted)]">Rapid mitigation while upstream fixes land</span>
                </div>
            </footer>
        </div>
    );
}
