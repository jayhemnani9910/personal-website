"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { TIMELINE_ITEMS, STATUS_CONFIG } from "@/data/timeline";

function TimelineCard({ item, index }: { item: typeof TIMELINE_ITEMS[0]; index: number }) {
    const statusConfig = STATUS_CONFIG[item.status];

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="relative pl-8 pb-8 last:pb-0"
        >
            {/* Timeline line */}
            <div className="absolute left-[11px] top-3 bottom-0 w-px bg-[var(--border)] last:hidden" />

            {/* Status dot */}
            <div
                className="absolute left-0 top-1.5 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: statusConfig.bgColor }}
            >
                <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: statusConfig.color }}
                />
            </div>

            {/* Content */}
            <div className="card card-interactive p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                        <span
                            className="inline-block px-2.5 py-1 text-xs font-medium rounded-full mb-2"
                            style={{
                                backgroundColor: statusConfig.bgColor,
                                color: statusConfig.color
                            }}
                        >
                            {statusConfig.label}
                        </span>
                        <h3 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                            {item.title}
                        </h3>
                    </div>
                </div>

                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                    {item.description}
                </p>

                {item.tags && (
                    <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag) => (
                            <span
                                key={tag}
                                className="px-2.5 py-1 text-xs rounded-md bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border)]"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

export function TimelineSection() {
    return (
        <section
            id="timeline"
            className="section-block scroll-mt-28 md:scroll-mt-32"
        >
            {/* Section Divider */}
            <div className="section-wide mb-12">
                <div className="h-px bg-[var(--border)]" />
            </div>

            <div className="section-wide">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mb-12"
                >
                    <p className="eyebrow mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Currently
                    </p>
                    <h2 className="title-xl mb-4">What I&apos;m Working On</h2>
                    <p className="body-base max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
                        Things I&apos;m building, learning, and thinking about.
                    </p>
                </motion.div>

                {/* Timeline */}
                <div className="max-w-2xl">
                    {TIMELINE_ITEMS.map((item, i) => (
                        <TimelineCard key={item.id} item={item} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}
