"use client";

import { useReducedMotion } from "framer-motion";

/**
 * ScanLine Component
 *
 * Adds a subtle scan line effect for a techy, cyberpunk feel.
 * Respects prefers-reduced-motion.
 */
export function ScanLine() {
    const prefersReducedMotion = useReducedMotion();

    if (prefersReducedMotion) return null;

    return (
        <div className="scan-line-container">
            <div className="scan-line" />
        </div>
    );
}
