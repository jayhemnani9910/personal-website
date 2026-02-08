"use client";

import { motion, useSpring, useTransform, useInView } from "framer-motion";
import { useEffect, useRef } from "react";

interface ImpactCounterProps {
    value: number;
    label: string;
    suffix?: string;
    prefix?: string;
    duration?: number;
}

export function ImpactCounter({ value, label, suffix = "", prefix = "", duration = 2 }: ImpactCounterProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    const spring = useSpring(0, {
        duration: duration * 1000,
        bounce: 0,
    });

    const displayValue = useTransform(spring, (current) => Math.round(current));

    useEffect(() => {
        if (isInView) {
            spring.set(value);
        }
    }, [isInView, value, spring]);

    return (
        <div ref={ref} className="flex flex-col items-center">
            <div className="text-4xl md:text-5xl font-bold font-mono text-[var(--color-text-primary)] flex items-baseline">
                {prefix}
                <motion.span>{displayValue}</motion.span>
                {suffix}
            </div>
            <div className="text-sm text-[var(--color-text-muted)] uppercase tracking-wider mt-2">
                {label}
            </div>
        </div>
    );
}
