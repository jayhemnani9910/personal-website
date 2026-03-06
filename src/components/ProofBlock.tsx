"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface ProofBlockProps {
    title?: string;
    children: ReactNode;
    className?: string;
}

export function ProofBlock({ title, children, className = "" }: ProofBlockProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className={`glass rounded-xl border border-[var(--border)] overflow-hidden ${className}`}
        >
            {title && (
                <div className="px-6 py-4 border-b border-[var(--border)] bg-white/[0.02]">
                    <h4 className="font-mono text-sm text-[var(--text-secondary)] uppercase tracking-wider">
                        {title}
                    </h4>
                </div>
            )}
            <div className="p-6">
                {children}
            </div>
        </motion.div>
    );
}
