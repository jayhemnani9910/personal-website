"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { useTerminal } from "@/context/TerminalContext";
import { HERO_CONTENT } from "@/data/profile";

interface HeroProps {
    stats?: {
        projects: number;
        technologies: number;
        domains: number;
    };
}

export function Hero({ stats }: HeroProps) {
    const { toggleTerminal } = useTerminal();
    const prefersReducedMotion = useReducedMotion();
    const ref = useRef(null);

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"]
    });

    // Parallax: background moves slower than scroll
    const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    const fadeIn = {
        initial: { opacity: 0, y: 30 },
        animate: { opacity: 1, y: 0 },
    };

    return (
        <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Parallax Background */}
            {!prefersReducedMotion && (
                <motion.div
                    style={{ y }}
                    className="absolute inset-0 pointer-events-none"
                >
                    {/* Left top orb */}
                    <div
                        className="absolute top-1/4 left-[10%] w-64 h-64 rounded-full blur-3xl"
                        style={{ background: 'var(--accent)', opacity: 'var(--orb-opacity-2)' }}
                    />
                    {/* Left bottom orb */}
                    <div
                        className="absolute bottom-1/4 left-[5%] w-48 h-48 rounded-full blur-3xl"
                        style={{ background: 'var(--accent)', opacity: 'var(--orb-opacity-2)' }}
                    />
                    {/* Right top orb */}
                    <div
                        className="absolute top-1/5 right-[10%] w-56 h-56 rounded-full blur-3xl"
                        style={{ background: 'var(--accent)', opacity: 'var(--orb-opacity-2)' }}
                    />
                    {/* Right bottom orb */}
                    <div
                        className="absolute bottom-1/3 right-[8%] w-72 h-72 rounded-full blur-3xl"
                        style={{ background: 'var(--accent)', opacity: 'var(--orb-opacity-2)' }}
                    />
                </motion.div>
            )}

            <motion.div style={{ opacity }} className="section-shell text-center py-32 relative z-10">
                {/* Name */}
                <motion.h1
                    variants={fadeIn}
                    initial="initial"
                    animate="animate"
                    transition={{ duration: 0.6 }}
                    className="title-hero mb-6"
                >
                    {HERO_CONTENT.title}
                </motion.h1>

                {/* Tagline */}
                <motion.p
                    variants={fadeIn}
                    initial="initial"
                    animate="animate"
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="body-lg max-w-2xl mx-auto mb-4"
                >
                    {HERO_CONTENT.tagline}
                </motion.p>

                {/* Sub-tagline */}
                <motion.p
                    variants={fadeIn}
                    initial="initial"
                    animate="animate"
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="body-base max-w-xl mx-auto mb-12"
                    style={{ color: "var(--text-muted)" }}
                >
                    {HERO_CONTENT.subTagline}
                </motion.p>

                {/* CTAs */}
                <motion.div
                    variants={fadeIn}
                    initial="initial"
                    animate="animate"
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-wrap items-center justify-center gap-4"
                >
                    <button
                        onClick={toggleTerminal}
                        className="btn btn-primary"
                    >
                        {HERO_CONTENT.cta.primary}
                    </button>

                    <a href="#projects" className="btn btn-secondary">
                        View Projects
                    </a>
                </motion.div>

                {/* Stats */}
                {stats && (
                    <motion.div
                        variants={fadeIn}
                        initial="initial"
                        animate="animate"
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="mt-20"
                    >
                        <div className="grid grid-cols-3 gap-8 md:gap-16 max-w-lg mx-auto">
                            <div className="text-center">
                                <div className="text-4xl md:text-5xl font-semibold mb-2" style={{ color: 'var(--accent)' }}>
                                    {stats.projects}
                                </div>
                                <div className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                                    Projects
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl md:text-5xl font-semibold mb-2" style={{ color: 'var(--accent)' }}>
                                    {stats.technologies}
                                </div>
                                <div className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                                    Technologies
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl md:text-5xl font-semibold mb-2" style={{ color: 'var(--accent)' }}>
                                    {stats.domains}
                                </div>
                                <div className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                                    Domains
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </section>
    );
}
