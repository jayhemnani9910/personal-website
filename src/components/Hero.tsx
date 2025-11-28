"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { TRANSITIONS, VARIANTS } from "@/lib/motion-tokens";
import { useTerminal } from "@/context/TerminalContext";
import MagneticButton from "./MagneticButton";
import { HERO_CONTENT, UI_COPY } from "@/data/profile";

export function Hero() {
    const { toggleTerminal } = useTerminal();
    const { scrollY } = useScroll();
    const prefersReducedMotion = useReducedMotion();

    // Cinematic Scroll Effects (respect reduced motion)
    const yMotion = useTransform(scrollY, [0, 500], [0, 200]); // Text parallax
    const scaleMotion = useTransform(scrollY, [0, 300], [1, 0.9]); // Text zoom out
    const opacityMotion = useTransform(scrollY, [0, 300], [1, 0]); // Fade out

    return (
        <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">

            {/* Content Layer */}
            <motion.div
                style={{ y: prefersReducedMotion ? 0 : yMotion, scale: prefersReducedMotion ? 1 : scaleMotion, opacity: opacityMotion }}
                className="relative z-10 text-center px-6 max-w-5xl mx-auto"
            >


                <motion.h1
                    variants={VARIANTS.fadeInUp}
                    initial="initial"
                    animate="animate"
                    transition={{ ...TRANSITIONS.smooth, duration: 1 }}
                    className="text-7xl md:text-9xl font-bold tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/50"
                >
                    {HERO_CONTENT.title}
                </motion.h1>

                <motion.div
                    variants={VARIANTS.fadeInUp}
                    initial="initial"
                    animate="animate"
                    transition={{ ...TRANSITIONS.smooth, delay: 0.2 }}
                    className="space-y-6 mb-12"
                >
                    <p className="text-xl md:text-2xl text-[var(--color-text-secondary)] max-w-3xl mx-auto leading-relaxed font-light">
                        {HERO_CONTENT.tagline}
                    </p>
                    <p className="text-lg md:text-xl text-[var(--color-text-muted)] max-w-2xl mx-auto">
                        {HERO_CONTENT.subTagline}
                    </p>
                </motion.div>

                {/* Magnetic Command Group */}
                <motion.div
                    variants={VARIANTS.fadeInUp}
                    initial="initial"
                    animate="animate"
                    transition={{ ...TRANSITIONS.smooth, delay: 0.4 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <MagneticButton>
                        <button
                            onClick={toggleTerminal}
                            className="group relative px-8 py-4 rounded-full bg-white text-black font-semibold text-lg transition-all hover:scale-105 active:scale-95"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {HERO_CONTENT.cta.primary}
                                <span className="text-xs font-mono opacity-50 group-hover:opacity-100 transition-opacity">⌘K</span>
                            </span>
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[var(--neon-cyan)] to-[var(--neon-purple)] opacity-0 group-hover:opacity-20 blur-lg transition-opacity duration-500" />
                        </button>
                    </MagneticButton>

                    <MagneticButton>
                        <a
                            href="#projects"
                            className="group relative px-8 py-4 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white font-medium text-lg backdrop-blur-md transition-all hover:bg-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)]"
                        >
                            <span>Explore Projects</span>
                        </a>
                    </MagneticButton>
                </motion.div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
                <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-muted)]">{UI_COPY.nav.scroll}</span>
                <div className="w-[1px] h-12 bg-gradient-to-b from-[var(--color-text-muted)] to-transparent" />
            </motion.div>
        </section>
    );
}
