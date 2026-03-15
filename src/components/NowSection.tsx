"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GitCommit, Clock, Loader2 } from "lucide-react";

interface Commit {
    repo: string;
    message: string;
    date: string;
}

function timeAgo(dateStr: string): string {
    const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

// Configurable status — edit this to update what you're working on
const CURRENT_STATUS = {
    project: "Portfolio upgrades",
    active: true,
};

export function NowSection() {
    const [commits, setCommits] = useState<Commit[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/github")
            .then((res) => res.json())
            .then((data) => setCommits(data.commits || []))
            .catch(() => setCommits([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <section id="now" className="section-block">
            {/* Animated Divider */}
            <div className="section-wide mb-12">
                <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="h-px bg-[var(--border)] origin-right"
                />
            </div>

            <div className="section-wide">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="mb-8"
                >
                    <span className="eyebrow mb-3 block">Live</span>
                    <h2 className="title-xl">What I&apos;m Up To</h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Status Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="card p-6"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            {CURRENT_STATUS.active && (
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                                </span>
                            )}
                            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                Currently building
                            </span>
                        </div>
                        <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {CURRENT_STATUS.project}
                        </p>
                    </motion.div>

                    {/* Recent Commits */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="card p-6 md:col-span-2"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <GitCommit className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                                Recent commits
                            </span>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--text-muted)' }} />
                            </div>
                        ) : commits.length === 0 ? (
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                No recent activity
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {commits.map((commit, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-2 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                                                {commit.message}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs font-mono" style={{ color: 'var(--accent)' }}>
                                                    {commit.repo}
                                                </span>
                                                <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                                                    <Clock className="w-3 h-3" />
                                                    {timeAgo(commit.date)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
