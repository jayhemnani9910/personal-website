"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Droplets, Wifi, AlertTriangle, Database, BarChart3, Activity, Cloud, Cpu, ArrowRight } from "lucide-react";
import type { Project } from "@/lib/definitions";
import { StatCard } from "@/components/ui/StatCard";

// Flow rate gauge
function FlowGauge({ value, maxValue, label }: { value: number; label: string; maxValue: number }) {
    const percentage = Math.min((value / maxValue) * 100, 100);
    const isAnomaly = value > maxValue * 0.8;

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-24 h-24">
                <svg className="w-full h-full -rotate-90">
                    <circle
                        cx="48" cy="48" r="40"
                        className="fill-none stroke-[var(--border)]"
                        strokeWidth="8"
                    />
                    <circle
                        cx="48" cy="48" r="40"
                        className={`fill-none transition-all duration-1000 ${isAnomaly ? 'stroke-red-500' : 'stroke-[var(--accent)]'}`}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${percentage * 2.51} 251`}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-lg font-bold ${isAnomaly ? 'text-red-500' : 'text-[var(--text-primary)]'}`}>
                        {value.toFixed(1)}
                    </span>
                </div>
            </div>
            <span className="text-xs text-[var(--text-muted)] mt-2">{label}</span>
        </div>
    );
}

// Architecture layer
function ArchLayer({ name, components, icon: Icon, color }: { name: string; components: string[]; icon: React.ComponentType<{ className?: string }>; color: string }) {
    return (
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
            <div className="flex items-center gap-3 mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
                    <Icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-[var(--text-primary)]">{name}</span>
            </div>
            <div className="flex flex-wrap gap-2">
                {components.map((c) => (
                    <span key={c} className="px-2 py-1 text-xs rounded bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-secondary)]">
                        {c}
                    </span>
                ))}
            </div>
        </div>
    );
}

// Data flow step
function DataFlowStep({ step, title, desc }: { step: number; title: string; desc: string }) {
    return (
        <div className="flex gap-3">
            <div className="flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-[var(--accent)] text-white text-xs flex items-center justify-center font-medium">
                    {step}
                </div>
                <div className="w-0.5 flex-1 bg-[var(--border)] mt-1" />
            </div>
            <div className="pb-4">
                <div className="text-sm font-medium text-[var(--text-primary)]">{title}</div>
                <div className="text-xs text-[var(--text-muted)]">{desc}</div>
            </div>
        </div>
    );
}


export function SmartWaterIoTPage({ project }: { project: Project }) {
    const [flowRates, setFlowRates] = useState({ main: 2.5, shower: 0, outdoor: 0 });
    const [totalVolume, setTotalVolume] = useState(152.3);

    useEffect(() => {
        const interval = setInterval(() => {
            setFlowRates({
                main: 2.5 + Math.random() * 0.5 - 0.25,
                shower: Math.random() > 0.7 ? 8 + Math.random() * 2 : 0,
                outdoor: Math.random() > 0.9 ? 12 + Math.random() * 3 : 0,
            });
            setTotalVolume(prev => prev + 0.01);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

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
                        Smart Water Monitoring
                    </h1>
                    <p className="text-xl text-[var(--text-secondary)] mb-6 max-w-3xl" style={{ animation: 'fadeSlideUp 0.5s ease-out 100ms both' }}>
                        Raspberry Pi + IoT sensors for real-time usage tracking and anomaly detection.
                    </p>
                    <div className="flex flex-wrap gap-2" style={{ animation: 'fadeSlideUp 0.5s ease-out 200ms both' }}>
                        {['Raspberry Pi', 'Python', 'MQTT', 'InfluxDB', 'Grafana'].map((tech) => (
                            <span key={tech} className="px-3 py-1 text-xs font-medium rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">{tech}</span>
                        ))}
                    </div>
                </div>
            </header>

            {/* Live Dashboard */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Live Monitoring (Simulated)</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
                            <div className="flex items-center gap-2 mb-6">
                                <Droplets className="w-5 h-5 text-blue-500" />
                                <span className="text-sm font-medium text-[var(--text-primary)]">Flow Rates (L/min)</span>
                                <span className="ml-auto px-2 py-0.5 text-xs rounded bg-green-500/20 text-green-500" style={{ animation: 'pulse 2s infinite' }}>LIVE</span>
                            </div>
                            <div className="flex justify-around">
                                <FlowGauge value={flowRates.main} maxValue={15} label="Main Line" />
                                <FlowGauge value={flowRates.shower} maxValue={15} label="Shower" />
                                <FlowGauge value={flowRates.outdoor} maxValue={20} label="Outdoor" />
                            </div>
                        </div>
                        <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
                            <div className="flex items-center gap-2 mb-4">
                                <BarChart3 className="w-5 h-5 text-[var(--accent)]" />
                                <span className="text-sm font-medium text-[var(--text-primary)]">Today's Usage</span>
                            </div>
                            <div className="text-4xl font-bold text-[var(--text-primary)] mb-2">
                                {totalVolume.toFixed(1)} <span className="text-lg text-[var(--text-muted)]">liters</span>
                            </div>
                            <div className="h-2 rounded-full bg-[var(--bg-primary)] overflow-hidden">
                                <div className="h-full bg-[var(--accent)] rounded-full transition-all duration-500" style={{ width: `${Math.min(totalVolume / 200 * 100, 100)}%` }} />
                            </div>
                            <div className="flex justify-between text-xs text-[var(--text-muted)] mt-2">
                                <span>0 L</span>
                                <span>Target: 200 L/day</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Architecture */}
            <section className="py-12 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Edge-to-Cloud Architecture</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        <ArchLayer
                            name="Edge Layer"
                            components={['YF-S201 Sensors', 'GPIO Interrupts', 'Pulse Counter']}
                            icon={Activity}
                            color="bg-green-500"
                        />
                        <ArchLayer
                            name="Gateway (Pi)"
                            components={['Python Daemon', 'SQLite Cache', 'Anomaly Detection']}
                            icon={Cpu}
                            color="bg-blue-500"
                        />
                        <ArchLayer
                            name="Cloud"
                            components={['MQTT Broker', 'InfluxDB', 'Grafana']}
                            icon={Cloud}
                            color="bg-purple-500"
                        />
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-6 text-[var(--text-muted)]">
                        <span className="text-xs">Sensors</span>
                        <ArrowRight className="w-4 h-4" />
                        <span className="text-xs">Pi Hub</span>
                        <ArrowRight className="w-4 h-4" />
                        <span className="text-xs">MQTT</span>
                        <ArrowRight className="w-4 h-4" />
                        <span className="text-xs">Dashboard</span>
                    </div>
                </div>
            </section>

            {/* Anomaly Detection */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Anomaly Detection</h2>
                            <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
                                <AlertTriangle className="w-8 h-8 text-amber-500 mb-4" />
                                <div className="text-sm font-medium text-[var(--text-primary)] mb-2">Z-Score Based Detection</div>
                                <p className="text-xs text-[var(--text-muted)] mb-4">
                                    7-day rolling baseline per hour. Alerts when flow {">"} 2σ from expected.
                                </p>
                                <div className="font-mono text-xs p-3 bg-[var(--bg-primary)] rounded border border-[var(--border)] text-[var(--text-secondary)]">
                                    z = (current - μ) / σ<br />
                                    anomaly = |z| {">"} 2.0
                                </div>
                                <p className="text-xs text-[var(--text-muted)] mt-4">
                                    Continuous flow {">"} 30 min triggers leak alert via Pushover API.
                                </p>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Data Pipeline</h2>
                            <DataFlowStep step={1} title="Pulse Detection" desc="Hall-effect sensor generates pulses (~4.5 per mL)" />
                            <DataFlowStep step={2} title="GPIO Interrupt" desc="Pi captures rising edges with µs timestamps" />
                            <DataFlowStep step={3} title="Flow Calculation" desc="Pulses/sec × calibration → L/min" />
                            <DataFlowStep step={4} title="Local Storage" desc="SQLite buffer for offline resilience" />
                            <DataFlowStep step={5} title="MQTT Publish" desc="60-second aggregates to cloud broker" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Key Decisions */}
            <section className="py-12 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Design Decisions</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                            <div className="text-sm font-medium text-[var(--text-primary)] mb-2">MQTT over HTTP</div>
                            <div className="text-xs text-[var(--text-muted)]">Lightweight protocol with built-in QoS, persistent sessions, and 99.8% bandwidth reduction vs raw telemetry.</div>
                        </div>
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                            <div className="text-sm font-medium text-[var(--text-primary)] mb-2">Edge Analytics</div>
                            <div className="text-xs text-[var(--text-muted)]">Anomaly detection on Pi enables offline alerting and reduces cloud dependency.</div>
                        </div>
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                            <div className="text-sm font-medium text-[var(--text-primary)] mb-2">Per-Sensor Calibration</div>
                            <div className="text-xs text-[var(--text-muted)]">Factory calibration varied 5-12%. Field calibration improved accuracy from ±10% to ±2%.</div>
                        </div>
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                            <div className="text-sm font-medium text-[var(--text-primary)] mb-2">SQLite Buffer</div>
                            <div className="text-xs text-[var(--text-muted)]">30-day local history prevents data loss during outages, enables offline queries.</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-[var(--border)]">
                        <StatCard value="±2%" label="Sensor Accuracy" />
                        <StatCard value="60s" label="Cloud Sync Interval" />
                        <StatCard value="30min" label="Leak Alert Threshold" />
                        <StatCard value="15-30%" label="Potential Savings" />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-[var(--border)]">
                <div className="max-w-6xl mx-auto">
                    <span className="text-[var(--text-muted)]">IoT water monitoring for residential conservation</span>
                </div>
            </footer>
        </div>
    );
}
