"use client";

import { motion } from "framer-motion";
import { FlaskConical, Terminal, Cpu, Zap, Brain, type LucideIcon } from "lucide-react";
import { springSoft, hoverScale, hoverGlow } from "@/lib/motion";
import { EXPERIMENTS, type Experiment } from "@/../content/lab";

// Map icon names to Lucide components
const ICON_MAP: Record<Experiment["icon"], LucideIcon> = {
    flask: FlaskConical,
    terminal: Terminal,
    cpu: Cpu,
    zap: Zap,
    brain: Brain,
};

export function LabSection() {
    return (
        <section id="extra" className="relative section-block section-shell scroll-mt-28 md:scroll-mt-32">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={springSoft}
                className="mb-12"
            >
                <div className="flex items-center gap-3 mb-4">
                    <span className="w-8 h-[1px] bg-[var(--neon-purple)]" />
                    <h2 className="text-sm font-mono text-[var(--neon-purple)] uppercase tracking-widest">
                        The Lab
                    </h2>
                </div>
                <p className="title-lg max-w-xl">
                    Experiments, snippets, and half-baked ideas.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {EXPERIMENTS.map((exp, i) => {
                    const IconComponent = ICON_MAP[exp.icon] || FlaskConical;
                    return (
                        <motion.div
                            key={exp.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ ...springSoft, delay: i * 0.1 }}
                            whileHover={{ ...hoverScale, ...hoverGlow }}
                            className="group relative p-6 rounded-xl border border-[var(--glass-border)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <IconComponent className="w-6 h-6 text-[var(--text-muted)] group-hover:text-[var(--neon-purple)] transition-colors" />
                                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded bg-[rgba(255,255,255,0.05)] text-[var(--text-muted)]">
                                    {exp.status}
                                </span>
                            </div>
                            <h3 className="text-lg font-mono font-bold text-[var(--text-primary)] mb-2">
                                {exp.title}
                            </h3>
                            <p className="text-sm text-[var(--text-secondary)] font-mono leading-relaxed">
                                {exp.description}
                            </p>
                        </motion.div>
                    );
                })}
            </div>
        </section>
    );
}
