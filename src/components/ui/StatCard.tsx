"use client";

import { motion } from "framer-motion";
import { VARIANTS, SPRINGS } from "@/lib/motion";

interface StatCardProps {
    value: string;
    label: string;
    delay?: number;
}

export function StatCard({ value, label, delay = 0 }: StatCardProps) {
    return (
        <motion.div
            className="text-center p-4"
            variants={VARIANTS.fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ ...SPRINGS.default, delay: delay / 1000 }}
        >
            <div className="text-3xl md:text-4xl font-bold text-[var(--accent)]">{value}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">{label}</div>
        </motion.div>
    );
}
