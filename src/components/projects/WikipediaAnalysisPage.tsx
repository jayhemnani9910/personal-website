"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search, FileText, BarChart3, ArrowRight, Filter, Globe } from "lucide-react";
import type { Project } from "@/lib/definitions";
import { StatCard } from "@/components/ui/StatCard";

// Word frequency bar
function FrequencyBar({ word, count, maxCount, index }: { word: string; count: number; maxCount: number; index: number }) {
    const [width, setWidth] = useState(0);
    const percentage = (count / maxCount) * 100;

    useEffect(() => {
        const timer = setTimeout(() => {
            setWidth(percentage);
        }, index * 50 + 300);
        return () => clearTimeout(timer);
    }, [percentage, index]);

    return (
        <div className="flex items-center gap-3">
            <div className="w-20 text-right">
                <span className="text-sm font-medium text-[var(--text-primary)]">{word}</span>
            </div>
            <div className="flex-1 h-6 bg-[var(--bg-primary)] rounded overflow-hidden">
                <div
                    className="h-full bg-[var(--accent)] transition-all duration-700 ease-out flex items-center justify-end pr-2"
                    style={{ width: `${width}%` }}
                >
                    {width > 20 && <span className="text-xs text-white font-medium">{count}</span>}
                </div>
            </div>
            {width <= 20 && <span className="text-xs text-[var(--text-muted)] w-8">{count}</span>}
        </div>
    );
}

// Pipeline step
function PipelineStep({ icon: Icon, title, example, isLast }: { icon: React.ComponentType<{ className?: string }>; title: string; example: string; isLast?: boolean }) {
    return (
        <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center mb-3">
                <Icon className="w-6 h-6 text-[var(--accent)]" />
            </div>
            <div className="text-sm font-medium text-[var(--text-primary)] mb-1">{title}</div>
            <div className="text-xs text-[var(--text-muted)] font-mono bg-[var(--bg-secondary)] px-2 py-1 rounded">{example}</div>
            {!isLast && <ArrowRight className="w-4 h-4 text-[var(--border)] mt-4 rotate-90 md:rotate-0" />}
        </div>
    );
}


export function WikipediaAnalysisPage({ project }: { project: Project }) {
    const [url, setUrl] = useState("https://en.wikipedia.org/wiki/Machine_learning");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showResults, setShowResults] = useState(true);

    // Sample frequency data
    const frequencyData = [
        { word: "learning", count: 142 },
        { word: "machine", count: 128 },
        { word: "data", count: 95 },
        { word: "algorithms", count: 87 },
        { word: "model", count: 76 },
        { word: "training", count: 68 },
        { word: "neural", count: 54 },
        { word: "features", count: 48 },
        { word: "classification", count: 42 },
        { word: "prediction", count: 38 },
    ];

    const maxCount = frequencyData[0].count;

    const handleAnalyze = () => {
        setIsAnalyzing(true);
        setShowResults(false);
        setTimeout(() => {
            setIsAnalyzing(false);
            setShowResults(true);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            <style jsx global>{`
                @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
            `}</style>

            {/* Header */}
            <header className="pt-32 pb-8 px-6">
                <div className="max-w-6xl mx-auto">
                    <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors mb-8">
                        <ArrowLeft className="w-4 h-4" />Back to Projects
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4" style={{ animation: 'fadeSlideUp 0.5s ease-out' }}>
                        Wikipedia Word Analyzer
                    </h1>
                    <p className="text-xl text-[var(--text-secondary)] mb-6 max-w-3xl" style={{ animation: 'fadeSlideUp 0.5s ease-out 100ms both' }}>
                        URL → scrape → tokenize → visualize top frequent words.
                    </p>
                    <div className="flex flex-wrap gap-2" style={{ animation: 'fadeSlideUp 0.5s ease-out 200ms both' }}>
                        {['Python', 'Flask', 'BeautifulSoup', 'NLTK', 'Chart.js'].map((tech) => (
                            <span key={tech} className="px-3 py-1 text-xs font-medium rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">{tech}</span>
                        ))}
                    </div>
                </div>
            </header>

            {/* Demo Interface */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Interactive Demo (Simulated)</h2>
                    <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
                        <div className="flex gap-3 mb-6">
                            <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)]">
                                <Globe className="w-4 h-4 text-[var(--text-muted)]" />
                                <input
                                    type="text"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none"
                                    placeholder="Enter Wikipedia URL..."
                                />
                            </div>
                            <button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing}
                                className="px-6 py-3 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {isAnalyzing ? "Analyzing..." : "Analyze"}
                            </button>
                        </div>

                        {isAnalyzing && (
                            <div className="space-y-3">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div
                                        key={i}
                                        className="h-6 rounded bg-gradient-to-r from-[var(--bg-primary)] via-[var(--border)] to-[var(--bg-primary)] bg-[length:200%_100%]"
                                        style={{ animation: 'shimmer 1.5s infinite' }}
                                    />
                                ))}
                            </div>
                        )}

                        {showResults && !isAnalyzing && (
                            <div className="space-y-3">
                                {frequencyData.map((item, i) => (
                                    <FrequencyBar
                                        key={item.word}
                                        word={item.word}
                                        count={item.count}
                                        maxCount={maxCount}
                                        index={i}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* NLP Pipeline */}
            <section className="py-12 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">NLP Pipeline</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <PipelineStep
                            icon={Globe}
                            title="Fetch HTML"
                            example="requests.get(url)"
                        />
                        <PipelineStep
                            icon={FileText}
                            title="Extract Text"
                            example="#mw-content-text"
                        />
                        <PipelineStep
                            icon={Filter}
                            title="Tokenize & Filter"
                            example="NLTK stopwords"
                        />
                        <PipelineStep
                            icon={BarChart3}
                            title="Visualize"
                            example="Chart.js bars"
                            isLast
                        />
                    </div>
                </div>
            </section>

            {/* Stopword Filtering */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Extended Stopwords</h2>
                            <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
                                <p className="text-sm text-[var(--text-secondary)] mb-4">
                                    Standard NLTK stopwords aren't enough for Wikipedia. Added domain-specific terms:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {['the', 'is', 'at', 'wikipedia', 'cite', 'reference', 'retrieved', 'archive', 'edit', 'page', 'external', 'links'].map((word) => (
                                        <span key={word} className="px-2 py-1 text-xs rounded bg-red-500/10 text-red-400 border border-red-500/20 line-through">
                                            {word}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">HTML Exclusions</h2>
                            <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
                                <p className="text-sm text-[var(--text-secondary)] mb-4">
                                    Elements removed before text extraction:
                                </p>
                                <div className="space-y-2">
                                    {[
                                        { tag: 'table.infobox', desc: 'Sidebar info boxes' },
                                        { tag: 'sup.reference', desc: 'Citation brackets' },
                                        { tag: 'div.navbox', desc: 'Navigation templates' },
                                        { tag: '#References', desc: 'References section' },
                                    ].map((item) => (
                                        <div key={item.tag} className="flex justify-between text-xs">
                                            <code className="text-[var(--accent)]">{item.tag}</code>
                                            <span className="text-[var(--text-muted)]">{item.desc}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Design Decisions */}
            <section className="py-12 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Design Decisions</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                            <div className="text-sm font-medium text-[var(--text-primary)] mb-2">BeautifulSoup over Wikipedia API</div>
                            <div className="text-xs text-[var(--text-muted)]">More control over content extraction — can exclude specific sections that would skew analysis.</div>
                        </div>
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                            <div className="text-sm font-medium text-[var(--text-primary)] mb-2">Stateless Processing</div>
                            <div className="text-xs text-[var(--text-muted)]">No database, no persistence. Each request processed fresh for simplicity and easy deployment.</div>
                        </div>
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                            <div className="text-sm font-medium text-[var(--text-primary)] mb-2">Top-N Frequency Limit</div>
                            <div className="text-xs text-[var(--text-muted)]">Show 20-30 terms max. Long-tail words (1-2 occurrences) add noise without insight.</div>
                        </div>
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                            <div className="text-sm font-medium text-[var(--text-primary)] mb-2">Speed over Perfect Accuracy</div>
                            <div className="text-xs text-[var(--text-muted)]">Simple tokenization beats advanced NLP. 80% accuracy in milliseconds {">"} 95% in seconds.</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-[var(--border)]">
                        <StatCard value="<1s" label="Analysis Time" />
                        <StatCard value="25" label="Top Words Shown" />
                        <StatCard value="150+" label="Stopwords Filtered" />
                        <StatCard value="Flask" label="Backend Framework" />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-[var(--border)]">
                <div className="max-w-6xl mx-auto">
                    <span className="text-[var(--text-muted)]">Quick insights from Wikipedia articles for research & notes</span>
                </div>
            </footer>
        </div>
    );
}
