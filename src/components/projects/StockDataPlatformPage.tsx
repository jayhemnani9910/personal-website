"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Radio, Database, BarChart3, Workflow, FileText, Building2, Github, ExternalLink } from "lucide-react";
import type { Project } from "@/lib/definitions";
import { BackButton } from "@/components/BackButton";
import { SPRINGS, EASINGS } from "@/lib/motion";

// =============================================================================
// PALETTE + DATA
// =============================================================================

const W = {
    bg: "#0a0a0a", card: "#111", border: "#1a1a1a",
    green: "#00c853", red: "#ff1744", gold: "#ffd700", muted: "#555",
} as const;

const SYMBOLS = ['AAPL', 'NVDA', 'MSFT', 'GOOG', 'AMZN', 'META', 'TSLA', 'JPM', 'NFLX', 'DIS'];
const BASE_PRICES: Record<string, number> = {
    AAPL: 250.12, NVDA: 117.92, MSFT: 388.45, GOOG: 171.30, AMZN: 197.52,
    META: 597.81, TSLA: 249.30, JPM: 238.75, NFLX: 922.67, DIS: 101.20,
};

const DATA_SOURCES = [
    { name: "yfinance", desc: "OHLCV prices, fundamentals, earnings", icon: TrendingUp, color: W.green },
    { name: "SEC EDGAR", desc: "10-K/10-Q financial statements", icon: FileText, color: W.gold },
    { name: "FRED", desc: "Fed funds rate, CPI, GDP, unemployment", icon: Building2, color: "#60a5fa" },
    { name: "Kafka", desc: "Live streaming ingestion every 15s", icon: Radio, color: W.red },
];

const PIPELINE = [
    { label: "Ingest", detail: "Kafka producers poll 4 sources every 15 seconds", icon: Radio },
    { label: "Orchestrate", detail: "~18 Airflow DAGs schedule batch + streaming jobs", icon: Workflow },
    { label: "Store", detail: "8-table star schema in TimescaleDB", icon: Database },
    { label: "Visualize", detail: "Interactive Dash dashboards with SMA/EMA", icon: BarChart3 },
];

const SERVICES = ["TimescaleDB", "Airflow Web", "Airflow Scheduler", "Zookeeper", "Kafka", "Producer", "Consumer"];

// Pre-computed OHLC candles (module-level)
const CANDLES = Array.from({ length: 20 }, (_, i) => {
    const base = 150 + Math.sin(i * 0.5) * 20 + (i * 0.3);
    const open = base + ((i * 7 + 3) % 5 - 2.5);
    const close = base + ((i * 11 + 7) % 5 - 2.5);
    const high = Math.max(open, close) + ((i * 3 + 1) % 3);
    const low = Math.min(open, close) - ((i * 5 + 2) % 3);
    return { open, close, high, low, volume: 1000 + ((i * 13) % 5) * 100 };
});
const C_MAX = Math.max(...CANDLES.map(c => c.high));
const C_MIN = Math.min(...CANDLES.map(c => c.low));
const C_RANGE = C_MAX - C_MIN;

// =============================================================================
// COMPONENTS
// =============================================================================

function StreamingTicker() {
    const [ticks, setTicks] = useState<{ symbol: string; price: number; change: number; time: string }[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
            const base = BASE_PRICES[symbol];
            const change = (Math.random() - 0.5) * 4;
            const price = base + change;
            const time = new Date().toLocaleTimeString('en-US', { hour12: false });
            setTicks(prev => [{ symbol, price: Math.round(price * 100) / 100, change: Math.round(change * 100) / 100, time }, ...prev].slice(0, 12));
        }, 800);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="rounded-xl overflow-hidden" style={{ background: W.bg, border: `1px solid ${W.border}` }}>
            <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: `1px solid ${W.border}`, background: W.card }}>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: W.green }} />
                    <span className="text-xs font-mono" style={{ color: W.muted }}>LIVE FEED</span>
                </div>
                <span className="text-xs font-mono" style={{ color: W.muted }}>15s POLL</span>
            </div>
            <div className="h-64 overflow-hidden p-2 space-y-0.5">
                {ticks.map((tick, i) => (
                    <div
                        key={`${tick.symbol}-${tick.time}-${i}`}
                        className="flex items-center justify-between px-3 py-1.5 rounded font-mono text-sm"
                        style={{ background: `${W.card}80`, opacity: 1 - (i * 0.07) }}
                    >
                        <span className="font-medium w-14" style={{ color: "#fff" }}>{tick.symbol}</span>
                        <span style={{ color: "#ccc" }}>${tick.price.toFixed(2)}</span>
                        <span className="flex items-center gap-1 w-20 justify-end" style={{ color: tick.change >= 0 ? W.green : W.red }}>
                            {tick.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {tick.change >= 0 ? '+' : ''}{tick.change.toFixed(2)}
                        </span>
                        <span className="text-xs w-20 text-right" style={{ color: W.muted }}>{tick.time}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function CandlestickChart() {
    const toY = (price: number) => ((C_MAX - price) / C_RANGE) * 60 + 10;

    return (
        <div className="rounded-xl overflow-hidden" style={{ background: W.card, border: `1px solid ${W.border}` }}>
            <div className="flex items-center justify-between px-4 py-2" style={{ borderBottom: `1px solid ${W.border}` }}>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: "#fff" }}>AAPL</span>
                    <span className="text-xs" style={{ color: W.green }}>+2.34%</span>
                </div>
                <div className="flex gap-2">
                    {['1D', '1W', '1M', '6M'].map((tf) => (
                        <button key={tf} className="px-2 py-0.5 text-xs rounded" style={{ background: tf === '1D' ? 'var(--accent)' : 'transparent', color: tf === '1D' ? '#fff' : W.muted }}>
                            {tf}
                        </button>
                    ))}
                </div>
            </div>
            <div className="p-4">
                <svg viewBox="0 0 100 80" className="w-full h-48">
                    {[0, 1, 2, 3, 4].map((i) => (
                        <line key={i} x1="5" y1={10 + i * 15} x2="95" y2={10 + i * 15} stroke={W.border} strokeWidth="0.2" strokeDasharray="2,2" />
                    ))}
                    {CANDLES.map((c, i) => {
                        const x = 5 + (i / CANDLES.length) * 90 + 2;
                        const up = c.close >= c.open;
                        const color = up ? W.green : W.red;
                        return (
                            <g key={i}>
                                <line x1={x} y1={toY(c.high)} x2={x} y2={toY(c.low)} stroke={color} strokeWidth="0.3" />
                                <rect x={x - 1.5} y={toY(Math.max(c.open, c.close))} width="3" height={Math.abs(toY(c.open) - toY(c.close)) || 0.5} fill={color} rx="0.3" />
                            </g>
                        );
                    })}
                    {CANDLES.map((c, i) => {
                        const x = 5 + (i / CANDLES.length) * 90 + 2;
                        const h = (c.volume / 1500) * 8;
                        return <rect key={`v${i}`} x={x - 1} y={72 - h} width="2" height={h} fill={c.close >= c.open ? `${W.green}40` : `${W.red}40`} />;
                    })}
                </svg>
                <div className="flex gap-4 mt-2 text-xs">
                    <span style={{ color: "#60a5fa" }}>SMA(20): 152.34</span>
                    <span style={{ color: "#fb923c" }}>EMA(50): 148.90</span>
                </div>
            </div>
        </div>
    );
}

// =============================================================================
// MAIN
// =============================================================================

export function StockDataPlatformPage({ project }: { project: Project }) {
    return (
        <div className="min-h-screen" style={{ background: W.bg }}>

            {/* HERO */}
            <header className="pt-28 pb-12 px-6">
                <div className="max-w-5xl mx-auto">
                    <BackButton />

                    <motion.h1
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={SPRINGS.default}
                        className="text-4xl md:text-6xl font-bold mt-6 mb-4"
                        style={{ color: "#fff", textShadow: `0 0 10px ${W.gold}40, 0 0 40px ${W.gold}20` }}
                    >
                        Stock Data Platform
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...SPRINGS.default, delay: 0.1 }}
                        className="text-lg mb-8 max-w-2xl"
                        style={{ color: "#aaa" }}
                    >
                        Unified batch + streaming market data warehouse. 10 tickers, 25 years of history, 4 data sources, refreshed every 15 seconds.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...SPRINGS.default, delay: 0.2 }}
                        className="flex flex-wrap items-center gap-4 mb-8"
                    >
                        {project.github && (
                            <a href={project.github} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                style={{ color: "#fff", border: `1px solid ${W.border}`, background: W.card }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = W.gold; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = W.border; }}>
                                <Github className="w-4 h-4" /> Source
                            </a>
                        )}
                        <div className="flex flex-wrap gap-2">
                            {['Kafka', 'Airflow', 'TimescaleDB', 'Dash', 'Docker'].map(t => (
                                <span key={t} className="px-2 py-1 text-xs font-mono rounded" style={{ color: W.gold, border: `1px solid ${W.gold}30`, background: `${W.gold}08` }}>
                                    {t}
                                </span>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...SPRINGS.default, delay: 0.3 }}
                        className="flex flex-wrap gap-6"
                    >
                        {[
                            { v: "10", l: "Tickers" }, { v: "25 yrs", l: "History" },
                            { v: "4", l: "Sources" }, { v: "15s", l: "Updates" },
                        ].map(s => (
                            <div key={s.l}>
                                <div className="text-xl font-bold font-mono" style={{ color: W.gold }}>{s.v}</div>
                                <div className="text-xs" style={{ color: W.muted }}>{s.l}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </header>

            {/* TICKER TAPE */}
            <div className="overflow-hidden py-2" style={{ borderTop: `1px solid ${W.border}`, borderBottom: `1px solid ${W.border}`, background: W.card }}>
                <div className="flex gap-8 animate-[ticker_25s_linear_infinite] whitespace-nowrap">
                    {[...SYMBOLS, ...SYMBOLS].map((sym, i) => {
                        const price = BASE_PRICES[sym];
                        const change = ((sym.charCodeAt(0) + i) % 7 - 3) * 0.5;
                        const up = change >= 0;
                        return (
                            <span key={`${sym}-${i}`} className="inline-flex items-center gap-2 text-sm font-mono">
                                <span style={{ color: "#fff" }}>{sym}</span>
                                <span style={{ color: "#aaa" }}>${price.toFixed(2)}</span>
                                <span style={{ color: up ? W.green : W.red }}>{up ? '+' : ''}{change.toFixed(2)}%</span>
                            </span>
                        );
                    })}
                </div>
                <style>{`@keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
            </div>

            {/* LIVE DATA */}
            <section className="py-12 px-6">
                <div className="max-w-5xl mx-auto">
                    <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="eyebrow mb-6">Live Data</motion.p>
                    <div className="grid md:grid-cols-2 gap-6">
                        <StreamingTicker />
                        <CandlestickChart />
                    </div>
                </div>
            </section>

            {/* DATA SOURCES */}
            <section className="py-16 px-6" style={{ background: W.card }}>
                <div className="max-w-5xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: EASINGS.apple }} className="mb-8">
                        <p className="eyebrow mb-2">Sources</p>
                        <h2 className="text-2xl font-bold" style={{ color: "#fff" }}>What It Tracks</h2>
                    </motion.div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {DATA_SOURCES.map((src, i) => {
                            const Icon = src.icon;
                            return (
                                <motion.div
                                    key={src.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.06, duration: 0.4, ease: EASINGS.apple }}
                                    whileHover={{ y: -3, borderColor: src.color, boxShadow: `0 0 15px ${src.color}25` }}
                                    className="p-5 rounded-xl transition-colors duration-200"
                                    style={{ background: W.bg, border: `1px solid ${W.border}` }}
                                >
                                    <Icon className="w-5 h-5 mb-3" style={{ color: src.color }} />
                                    <div className="text-sm font-semibold mb-1" style={{ color: "#fff" }}>{src.name}</div>
                                    <div className="text-xs" style={{ color: W.muted }}>{src.desc}</div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ARCHITECTURE */}
            <section className="py-16 px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: EASINGS.apple }} className="mb-8">
                        <p className="eyebrow mb-2">Architecture</p>
                        <h2 className="text-2xl font-bold" style={{ color: "#fff" }}>From Ingestion to Dashboard</h2>
                    </motion.div>
                    <div className="space-y-3 mb-10">
                        {PIPELINE.map((step, i) => {
                            const Icon = step.icon;
                            return (
                                <motion.div
                                    key={step.label}
                                    initial={{ opacity: 0, x: -16 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.08, duration: 0.4, ease: EASINGS.apple }}
                                    className="flex items-start gap-4 p-4 rounded-lg transition-colors duration-200 hover:border-[var(--accent)]/40"
                                    style={{ background: W.card, border: `1px solid ${W.border}` }}
                                >
                                    <span className="shrink-0 w-7 h-7 rounded flex items-center justify-center text-xs font-bold font-mono" style={{ background: `${W.gold}15`, color: W.gold }}>{i + 1}</span>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <Icon className="w-4 h-4" style={{ color: W.gold }} />
                                            <span className="text-sm font-semibold" style={{ color: "#fff" }}>{step.label}</span>
                                        </div>
                                        <p className="text-sm mt-0.5" style={{ color: W.muted }}>{step.detail}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Docker services */}
                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-6">
                        <p className="text-xs font-mono uppercase tracking-wider mb-3" style={{ color: W.gold }}>7 Docker Services</p>
                        <div className="flex flex-wrap gap-2">
                            {SERVICES.map(s => (
                                <span key={s} className="px-3 py-1 text-xs font-mono rounded-full" style={{ color: "#ccc", border: `1px solid ${W.border}` }}>
                                    {s}
                                </span>
                            ))}
                        </div>
                    </motion.div>

                    {/* Star schema callout */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="p-4 rounded-lg"
                        style={{ background: `${W.gold}08`, border: `1px solid ${W.gold}20` }}
                    >
                        <div className="text-sm font-semibold" style={{ color: W.gold }}>8-Table Star Schema</div>
                        <p className="text-xs mt-1" style={{ color: W.muted }}>Dimensional modeling — fact tables for prices, fundamentals, earnings, SEC filings, and macro data with company and date dimensions.</p>
                    </motion.div>
                </div>
            </section>

            {/* FOOTER */}
            <div className="py-8 px-6" style={{ borderTop: `1px solid ${W.border}` }}>
                <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-6">
                    <div className="flex flex-wrap gap-6 font-mono text-xs">
                        {[{ v: "7", l: "Services" }, { v: "~18", l: "DAGs" }, { v: "8", l: "Tables" }].map(s => (
                            <span key={s.l}><span style={{ color: W.gold }}>{s.v}</span> <span style={{ color: W.muted }}>{s.l}</span></span>
                        ))}
                    </div>
                    <div className="flex items-center gap-4">
                        {project.github && (
                            <a href={project.github} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm transition-colors" style={{ color: W.muted }}
                                onMouseEnter={e => { e.currentTarget.style.color = W.gold; }} onMouseLeave={e => { e.currentTarget.style.color = W.muted; }}>
                                <Github className="w-4 h-4" /> Source <ExternalLink className="w-3 h-3" />
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
