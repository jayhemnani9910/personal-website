"use client";

import { motion } from "framer-motion";
import { useTypewriter } from "@/hooks/useTypewriter";
import { useCommand } from "@/components/CommandProvider";
import MagneticButton from "./MagneticButton";

/**
 * Terminal Commands Cycle
 * Backend engineer-themed commands for the typewriter effect
 */
const TERMINAL_COMMANDS = [
    "> initializing neural_net...",
    "> connecting to sjsu_cluster...",
    '> whoami --role="Data Engineer"',
    "> loading pipeline_architecture...",
    "> querying timescale_analytics...",
    "> STATUS: System Online",
];

/**
 * GlassTerminal Component
 * 
 * The new Hero section styled as a macOS terminal window with:
 * - Traffic light controls (inactive)
 * - Typewriter command effect cycling through backend commands
 * - Glassmorphic panel with edge lighting
 * - Metric cards showing system stats
 * - CTAs for command palette and project exploration
 */
export function GlassTerminal() {
    const currentCommand = useTypewriter(TERMINAL_COMMANDS, 60, 40, 2000);
    const { setOpen } = useCommand();

    return (
        <section className="relative min-h-screen flex items-center justify-center px-4 pt-32 pb-20">
            <div className="max-w-5xl w-full">
                {/* Main Terminal Window */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    className="glass-panel rounded-2xl overflow-hidden"
                >
                    {/* macOS-Style Header with Traffic Lights */}
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--glass-border)] bg-[var(--bg-abyss)]">
                        <div className="w-3 h-3 rounded-full bg-[#ff5f57] opacity-50" />
                        <div className="w-3 h-3 rounded-full bg-[#ffbd2e] opacity-50" />
                        <div className="w-3 h-3 rounded-full bg-[#28c840] opacity-50" />
                        <span className="ml-4 text-xs font-mono text-[var(--text-muted)]">
                            aether@backend ~ %
                        </span>
                    </div>

                    {/* Terminal Content */}
                    <div className="p-6 md:p-12 font-mono">
                        {/* Static Intro Lines */}
                        <div className="text-xs md:text-sm text-[var(--text-secondary)] mb-6 space-y-2">
                            <p className="opacity-60">Welcome to AETHER v2.0</p>
                            <p className="opacity-60">Backend Engineering Interface</p>
                            <p className="opacity-40 text-xs">Last login: {new Date().toLocaleDateString()}</p>
                        </div>

                        {/* Typewriter Command with Blinking Cursor */}
                        <div className="text-sm md:text-base lg:text-lg mb-8 min-h-[24px] md:min-h-[28px]">
                            <span className="text-[var(--neon-cyan)]">{currentCommand}</span>
                            <motion.span
                                className="inline-block w-2 h-4 md:h-5 ml-1 bg-[var(--neon-cyan)]"
                                animate={{ opacity: [1, 0] }}
                                transition={{ duration: 0.8, repeat: Infinity }}
                            />
                        </div>

                        {/* System Output */}
                        <div className="space-y-2 md:space-y-3 text-xs md:text-sm text-[var(--text-secondary)] mb-8 md:mb-10 border-l-2 border-[var(--neon-purple)] pl-3 md:pl-4">
                            <p>
                                <span className="text-[var(--neon-purple)]">Name:</span>{" "}
                                <span className="text-white">Jay Hemnani</span>
                            </p>
                            <p>
                                <span className="text-[var(--neon-purple)]">Role:</span>{" "}
                                <span className="text-white">Data Engineer</span>
                            </p>
                            <p className="hidden sm:block">
                                <span className="text-[var(--neon-purple)]">Specialty:</span>{" "}
                                <span className="text-white">
                                    Architecting scalable pipelines & intelligent systems
                                </span>
                            </p>
                            <p className="sm:hidden">
                                <span className="text-[var(--neon-purple)]">Specialty:</span>{" "}
                                <span className="text-white">
                                    Scalable pipelines & ML systems
                                </span>
                            </p>
                            <p>
                                <span className="text-[var(--neon-purple)]">Location:</span>{" "}
                                <span className="text-white">San Jose, CA</span>
                            </p>
                            <p>
                                <span className="text-[var(--neon-purple)]">Status:</span>{" "}
                                <span className="text-green-400 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                    Online
                                </span>
                            </p>
                        </div>
                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <MagneticButton onClick={() => setOpen(true)}>
                                <button className="px-6 py-3 rounded-lg bg-[var(--neon-cyan)] text-[var(--bg-void)] font-semibold hover:shadow-[0_0_20px_rgba(0,240,255,0.5)] transition-all duration-300 hover:scale-105">
                                    Initialize System (⌘K)
                                </button>
                            </MagneticButton>

                            <MagneticButton>
                                <a
                                    href="#projects"
                                    className="px-6 py-3 rounded-lg glass-panel glass-panel-hover text-[var(--text-primary)] font-medium inline-block text-center"
                                >
                                    Explore Architecture →
                                </a>
                            </MagneticButton>
                        </div>
                    </div>
                </motion.div>

                {/* Metric Cards - System Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <MetricCard
                        label="Pipeline Uptime"
                        value="99.8%"
                        icon="📊"
                        delay={0.1}
                    />
                    <MetricCard
                        label="Data Processed"
                        value="2.4TB"
                        icon="💾"
                        delay={0.2}
                    />
                    <MetricCard
                        label="Active Clusters"
                        value="12"
                        icon="🔗"
                        delay={0.3}
                    />
                </div>
            </div>
        </section>
    );
}

/**
 * MetricCard Component
 * 
 * Individual stat card with animated entrance
 */
function MetricCard({
    label,
    value,
    icon,
    delay = 0
}: {
    label: string;
    value: string;
    icon?: string;
    delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay }}
            className="glass-panel glass-panel-hover rounded-xl p-4 text-center group cursor-default"
        >
            <div className="flex items-center justify-center gap-2 mb-1">
                {icon && <span className="text-lg">{icon}</span>}
                <div className="text-2xl font-bold text-[var(--neon-cyan)] group-hover:scale-110 transition-transform">
                    {value}
                </div>
            </div>
            <div className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-mono">
                {label}
            </div>
        </motion.div>
    );
}
