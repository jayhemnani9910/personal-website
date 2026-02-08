"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Github, ExternalLink, Radio, Database, BarChart3, Workflow, ChevronRight, TrendingUp, TrendingDown } from "lucide-react";
import type { Project } from "@/lib/definitions";
import { StatCard } from "@/components/ui/StatCard";

// Live streaming ticker animation
function StreamingTicker() {
    const [ticks, setTicks] = useState<{ symbol: string; price: number; change: number; time: string }[]>([]);
    const tickerRef = useRef<HTMLDivElement>(null);

    const symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'AMD'];
    const baseprices: Record<string, number> = {
        AAPL: 178.50, GOOGL: 141.20, MSFT: 378.90, AMZN: 178.25,
        TSLA: 248.50, META: 505.75, NVDA: 875.30, AMD: 165.40
    };

    useEffect(() => {
        const interval = setInterval(() => {
            const symbol = symbols[Math.floor(Math.random() * symbols.length)];
            const base = baseprices[symbol];
            const change = (Math.random() - 0.5) * 2;
            const price = base + change;
            const time = new Date().toLocaleTimeString('en-US', { hour12: false });

            setTicks(prev => [{
                symbol,
                price: Math.round(price * 100) / 100,
                change: Math.round(change * 100) / 100,
                time
            }, ...prev].slice(0, 12));
        }, 800);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-[#0a0a0a]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-medium text-[var(--text-muted)]">LIVE FEED</span>
                </div>
                <span className="text-xs font-mono text-[var(--text-muted)]">10K+ ticks/sec</span>
            </div>

            {/* Ticker stream */}
            <div ref={tickerRef} className="h-64 overflow-hidden">
                <div className="space-y-0.5 p-2">
                    {ticks.map((tick, i) => (
                        <div
                            key={`${tick.symbol}-${tick.time}-${i}`}
                            className="flex items-center justify-between px-3 py-1.5 rounded bg-[var(--bg-secondary)]/50 font-mono text-sm"
                            style={{
                                animation: 'fadeSlideIn 0.3s ease-out',
                                opacity: 1 - (i * 0.08)
                            }}
                        >
                            <span className="text-[var(--text-primary)] font-medium w-16">{tick.symbol}</span>
                            <span className="text-[var(--text-secondary)]">${tick.price.toFixed(2)}</span>
                            <span className={`flex items-center gap-1 w-20 justify-end ${tick.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {tick.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {tick.change >= 0 ? '+' : ''}{tick.change.toFixed(2)}
                            </span>
                            <span className="text-[var(--text-muted)] text-xs w-20 text-right">{tick.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Candlestick chart mockup
function CandlestickChart() {
    // Generate some fake OHLC data
    const candles = Array.from({ length: 20 }, (_, i) => {
        const base = 150 + Math.sin(i * 0.5) * 20 + Math.random() * 10;
        const open = base + (Math.random() - 0.5) * 5;
        const close = base + (Math.random() - 0.5) * 5;
        const high = Math.max(open, close) + Math.random() * 3;
        const low = Math.min(open, close) - Math.random() * 3;
        return { open, close, high, low, volume: 1000 + Math.random() * 500 };
    });

    const maxHigh = Math.max(...candles.map(c => c.high));
    const minLow = Math.min(...candles.map(c => c.low));
    const range = maxHigh - minLow;

    const toY = (price: number) => ((maxHigh - price) / range) * 60 + 10;

    return (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[var(--text-primary)]">AAPL</span>
                    <span className="text-xs text-green-500">+2.34%</span>
                </div>
                <div className="flex gap-2">
                    {['1D', '1W', '1M', '6M'].map((tf) => (
                        <button
                            key={tf}
                            className={`px-2 py-0.5 text-xs rounded ${tf === '1D' ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-muted)]'}`}
                        >
                            {tf}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <div className="p-4">
                <svg viewBox="0 0 100 80" className="w-full h-48">
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4].map((i) => (
                        <line
                            key={i}
                            x1="5" y1={10 + i * 15}
                            x2="95" y2={10 + i * 15}
                            stroke="var(--border)"
                            strokeWidth="0.2"
                            strokeDasharray="2,2"
                        />
                    ))}

                    {/* Candlesticks */}
                    {candles.map((candle, i) => {
                        const x = 5 + (i / candles.length) * 90 + 2;
                        const isGreen = candle.close >= candle.open;
                        const color = isGreen ? '#22c55e' : '#ef4444';

                        return (
                            <g key={i}>
                                {/* Wick */}
                                <line
                                    x1={x}
                                    y1={toY(candle.high)}
                                    x2={x}
                                    y2={toY(candle.low)}
                                    stroke={color}
                                    strokeWidth="0.3"
                                />
                                {/* Body */}
                                <rect
                                    x={x - 1.5}
                                    y={toY(Math.max(candle.open, candle.close))}
                                    width="3"
                                    height={Math.abs(toY(candle.open) - toY(candle.close)) || 0.5}
                                    fill={color}
                                    rx="0.3"
                                />
                            </g>
                        );
                    })}

                    {/* Volume bars */}
                    {candles.map((candle, i) => {
                        const x = 5 + (i / candles.length) * 90 + 2;
                        const isGreen = candle.close >= candle.open;
                        const height = (candle.volume / 1500) * 8;

                        return (
                            <rect
                                key={`vol-${i}`}
                                x={x - 1}
                                y={72 - height}
                                width="2"
                                height={height}
                                fill={isGreen ? '#22c55e40' : '#ef444440'}
                            />
                        );
                    })}
                </svg>

                {/* Indicators */}
                <div className="flex gap-4 mt-2 text-xs">
                    <span className="text-blue-400">SMA(20): 152.34</span>
                    <span className="text-orange-400">EMA(50): 148.90</span>
                </div>
            </div>
        </div>
    );
}

// Pipeline stage
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

// Tool card
function ToolCard({ name, purpose, color, delay }: { name: string; purpose: string; color: string; delay: number }) {
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


export function StockDataPlatformPage({ project }: { project: Project }) {
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
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateX(-10px); }
                    to { opacity: 1; transform: translateX(0); }
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
                        Stock Data Platform
                    </h1>

                    <p
                        className="text-xl text-[var(--text-secondary)] mb-6 max-w-3xl"
                        style={{ animation: 'fadeSlideUp 0.5s ease-out 100ms both' }}
                    >
                        Unified batch + streaming market data. 10K+ ticks/second. Sub-50ms queries.
                    </p>

                    <div
                        className="flex flex-wrap items-center gap-4"
                        style={{ animation: 'fadeSlideUp 0.5s ease-out 200ms both' }}
                    >
                        <div className="flex flex-wrap gap-2">
                            {['Kafka', 'TimescaleDB', 'Airflow', 'Dash'].map((tech) => (
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

            {/* Live Ticker + Candlestick side by side */}
            <section className="py-12 px-6">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">
                        Real-Time Data Visualization
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <StreamingTicker />
                        <CandlestickChart />
                    </div>
                </div>
            </section>

            {/* Pipeline Flow */}
            <section className="py-16 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-8 text-center">
                        Data Pipeline
                    </h2>

                    <div className="flex flex-wrap md:flex-nowrap items-start justify-center gap-4 md:gap-0">
                        <PipelineStage icon={Radio} label="Streaming" sublabel="Kafka" delay={0} isActive={activeStage === 0} />
                        <PipelineArrow delay={100} />
                        <PipelineStage icon={Workflow} label="Orchestration" sublabel="Airflow" delay={150} isActive={activeStage === 1} />
                        <PipelineArrow delay={250} />
                        <PipelineStage icon={Database} label="Storage" sublabel="TimescaleDB" delay={300} isActive={activeStage === 2} />
                        <PipelineArrow delay={400} />
                        <PipelineStage icon={BarChart3} label="Analytics" sublabel="Dash" delay={450} isActive={activeStage === 3} />
                    </div>
                </div>
            </section>

            {/* Tools Grid */}
            <section className="py-16 px-6">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-8 text-center">
                        The Stack
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <ToolCard name="Kafka" purpose="10K+ ticks/sec with idempotent writes & replay" color="#231f20" delay={0} />
                        <ToolCard name="Airflow" purpose="20+ DAGs for batch orchestration & backfills" color="#017cee" delay={100} />
                        <ToolCard name="TimescaleDB" purpose="Hypertables, continuous aggregates, 15x compression" color="#fdb515" delay={200} />
                        <ToolCard name="Dash" purpose="Interactive charts, SMA/EMA, intraday heatmaps" color="#119dff" delay={300} />
                    </div>
                </div>
            </section>

            {/* Key Stats */}
            <section className="py-16 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-[var(--border)]">
                        <StatCard value="10K+" label="Ticks/Second" delay={0} />
                        <StatCard value="<50ms" label="Query Latency" delay={100} />
                        <StatCard value="15x" label="Compression" delay={200} />
                        <StatCard value="99.5%" label="DAG Success Rate" delay={300} />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-[var(--border)]">
                <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
                    <span className="text-[var(--text-muted)]">
                        Personal Project
                    </span>
                </div>
            </footer>
        </div>
    );
}
