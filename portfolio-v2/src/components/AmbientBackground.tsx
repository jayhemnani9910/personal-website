"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * AmbientBackground - "The Living Void"
 * 
 * A breathing, organic background with three animated orbs moving in 
 * non-repeating paths. Creates depth and atmosphere for Project AETHER.
 * 
 * Performance: Uses transform: translate3d() for GPU acceleration.
 * Accessibility: Respects prefers-reduced-motion preference.
 */
export function AmbientBackground() {
    const prefersReducedMotion = useReducedMotion();

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            {/* Deep Void Base */}
            <div className="absolute inset-0 bg-[var(--bg-void)]" />

            {/* Animated Orb 1: Deep Indigo (Top Left) */}
            <motion.div
                className="absolute top-0 left-1/4 w-[800px] h-[800px] rounded-full blur-[120px] opacity-30"
                style={{
                    background: "radial-gradient(circle, #1a0a3e 0%, transparent 70%)",
                    willChange: prefersReducedMotion ? "auto" : "transform",
                }}
                animate={
                    prefersReducedMotion
                        ? {}
                        : {
                            x: [0, 100, -50, 0],
                            y: [0, -80, 60, 0],
                            scale: [1, 1.2, 0.8, 1],
                        }
                }
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Animated Orb 2: Midnight Blue (Bottom Right) */}
            <motion.div
                className="absolute bottom-0 right-1/3 w-[600px] h-[600px] rounded-full blur-[100px] opacity-20"
                style={{
                    background: "radial-gradient(circle, #0a1a3e 0%, transparent 70%)",
                    willChange: prefersReducedMotion ? "auto" : "transform",
                }}
                animate={
                    prefersReducedMotion
                        ? {}
                        : {
                            x: [0, -120, 80, 0],
                            y: [0, 100, -60, 0],
                            scale: [1, 0.9, 1.1, 1],
                        }
                }
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2,
                }}
            />

            {/* Animated Orb 3: Deep Purple (Center Right) */}
            <motion.div
                className="absolute top-1/2 right-1/4 w-[700px] h-[700px] rounded-full blur-[140px] opacity-15"
                style={{
                    background: "radial-gradient(circle, #1a0a2e 0%, transparent 70%)",
                    willChange: prefersReducedMotion ? "auto" : "transform",
                }}
                animate={
                    prefersReducedMotion
                        ? {}
                        : {
                            x: [0, 60, -100, 0],
                            y: [0, -100, 80, 0],
                            scale: [1, 1.1, 0.9, 1],
                        }
                }
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 4,
                }}
            />

            {/* Subtle Grid Overlay - "The Matrix" */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
          `,
                    backgroundSize: '80px 80px',
                    maskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 100%)',
                    WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black 40%, transparent 100%)',
                }}
            />
        </div>
    );
}
