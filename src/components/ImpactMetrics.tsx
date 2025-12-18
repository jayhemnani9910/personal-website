"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

interface Metric {
    value: string;
    label: string;
    numericValue?: number;
}

const metrics: Metric[] = [
    { value: "6+", label: "Production Systems", numericValue: 6 },
    { value: "10+", label: "ML Models Deployed", numericValue: 10 },
    { value: "3", label: "CV Pipelines", numericValue: 3 },
    { value: "<48hrs", label: "Idea to MVP" },
];

function AnimatedNumber({ value, numericValue }: { value: string; numericValue?: number }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!isInView || numericValue === undefined) return;

        let startTime: number | null = null;
        const duration = 1500;

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);

            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            setCount(Math.floor(easeOutQuart * numericValue));

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [isInView, numericValue]);

    if (numericValue !== undefined && isInView) {
        return <span ref={ref}>{count}{value.includes('+') ? '+' : ''}</span>;
    }

    return <span ref={ref}>{value}</span>;
}

export function ImpactMetrics() {
    return (
        <section id="impact" className="section-block section-shell">
            {/* Section Divider */}
            <div className="max-w-5xl mx-auto mb-12">
                <div className="h-px bg-[var(--border)]" />
            </div>

            <div className="max-w-5xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="eyebrow mb-4"
                    >
                        By the Numbers
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="title-xl"
                    >
                        Impact
                    </motion.h2>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {metrics.map((metric, index) => (
                        <motion.div
                            key={metric.label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="card card-interactive p-8 text-center"
                        >
                            <div className="title-xl mb-3" style={{ color: 'var(--accent)' }}>
                                <AnimatedNumber value={metric.value} numericValue={metric.numericValue} />
                            </div>
                            <div className="body-base">
                                {metric.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
