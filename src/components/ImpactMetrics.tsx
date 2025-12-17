"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

interface Metric {
    value: string;
    label: string;
    numericValue?: number;
}

const metrics: Metric[] = [
    { value: "6+", label: "Production Systems Shipped", numericValue: 6 },
    { value: "10+", label: "ML Models Deployed", numericValue: 10 },
    { value: "3", label: "Computer Vision Pipelines", numericValue: 3 },
    { value: "< 48hrs", label: "Idea to MVP" },
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
        <section className="relative section-block section-shell overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.03)_0%,transparent_70%)] blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto">
                <div className="text-center mb-12 md:mb-16">
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="eyebrow mb-4"
                    >
                        IMPACT
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-3xl md:text-4xl heading-premium text-[var(--text-primary)]"
                    >
                        Building systems that scale
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {metrics.map((metric, index) => (
                        <motion.div
                            key={metric.label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="glass-panel rounded-2xl p-8 text-center"
                        >
                            <div className="text-4xl md:text-5xl metric-number mb-3">
                                <AnimatedNumber value={metric.value} numericValue={metric.numericValue} />
                            </div>
                            <div className="text-sm md:text-base text-[var(--text-secondary)] leading-relaxed font-medium">
                                {metric.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
