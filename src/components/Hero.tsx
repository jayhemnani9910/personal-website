"use client";

import { motion, useScroll, useTransform, useReducedMotion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTerminal } from "@/context/TerminalContext";
import { HERO_CONTENT } from "@/data/profile";
import { ChronosBackground } from "@/components/ChronosBackground";

// ── Animated counter that counts up when in view ──
function AnimatedStat({ value, label }: { value: number; label: string }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        if (!isInView) return;
        let start = 0;
        const duration = 1200;
        const startTime = performance.now();
        const step = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            start = Math.round(eased * value);
            setDisplay(start);
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [isInView, value]);

    return (
        <div ref={ref} className="text-center">
            <div className="text-4xl md:text-5xl font-semibold mb-2" style={{ color: 'var(--accent)' }}>
                {display}
            </div>
            <div className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                {label}
            </div>
        </div>
    );
}

// ── Word-by-word reveal animation ──
function RevealText({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
    const words = text.split(" ");
    return (
        <span className={className}>
            {words.map((word, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{
                        duration: 0.5,
                        delay: delay + i * 0.06,
                        ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    className="inline-block mr-[0.3em]"
                >
                    {word}
                </motion.span>
            ))}
        </span>
    );
}

// ── Terminal hint that shows once per visitor ──
function TerminalHint() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (localStorage.getItem("terminal-hint-seen")) return;
        const timer = setTimeout(() => setShow(true), 3500);
        return () => clearTimeout(timer);
    }, []);

    const dismiss = () => {
        setShow(false);
        localStorage.setItem("terminal-hint-seen", "1");
    };

    if (!show) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] shadow-lg cursor-pointer"
            onClick={dismiss}
        >
            <span className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>
                Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--accent)] font-bold text-xs">`</kbd> to open terminal
            </span>
        </motion.div>
    );
}

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
    const [hasScrolled, setHasScrolled] = useState(false);

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"]
    });

    // Multi-depth parallax
    const yOrbs1 = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
    const yOrbs2 = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
    const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.7], [1, 0.95]);

    // Track scroll to hide scroll indicator
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 100) setHasScrolled(true);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <section ref={ref} className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Particle Background */}
            {!prefersReducedMotion && <ChronosBackground />}

            {/* Parallax Orbs - Layer 1 (slower) */}
            {!prefersReducedMotion && (
                <motion.div
                    style={{ y: yOrbs1 }}
                    className="absolute inset-0 pointer-events-none"
                >
                    <div
                        className="absolute top-1/4 left-[10%] w-64 h-64 rounded-full blur-3xl"
                        style={{ background: 'var(--accent)', opacity: 'var(--orb-opacity-2)' }}
                    />
                    <div
                        className="absolute bottom-1/3 right-[8%] w-72 h-72 rounded-full blur-3xl"
                        style={{ background: 'var(--accent)', opacity: 'var(--orb-opacity-2)' }}
                    />
                </motion.div>
            )}

            {/* Parallax Orbs - Layer 2 (faster) */}
            {!prefersReducedMotion && (
                <motion.div
                    style={{ y: yOrbs2 }}
                    className="absolute inset-0 pointer-events-none"
                >
                    <div
                        className="absolute bottom-1/4 left-[5%] w-48 h-48 rounded-full blur-3xl"
                        style={{ background: 'var(--accent)', opacity: 'var(--orb-opacity-1)' }}
                    />
                    <div
                        className="absolute top-1/5 right-[10%] w-56 h-56 rounded-full blur-3xl"
                        style={{ background: 'var(--accent)', opacity: 'var(--orb-opacity-1)' }}
                    />
                </motion.div>
            )}

            <motion.div style={{ opacity, scale, y: contentY }} className="section-shell text-center py-32 relative z-10">
                {/* Name — word-by-word reveal */}
                <h1 className="title-hero mb-6">
                    {prefersReducedMotion ? (
                        HERO_CONTENT.title
                    ) : (
                        <RevealText text={HERO_CONTENT.title} delay={0.2} />
                    )}
                </h1>

                {/* Tagline — word-by-word reveal */}
                <p className="body-lg max-w-2xl mx-auto mb-4">
                    {prefersReducedMotion ? (
                        HERO_CONTENT.tagline
                    ) : (
                        <RevealText text={HERO_CONTENT.tagline} delay={0.6} />
                    )}
                </p>

                {/* Sub-tagline */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 1.2 }}
                    className="body-base max-w-xl mx-auto mb-12"
                    style={{ color: "var(--text-muted)" }}
                >
                    {HERO_CONTENT.subTagline}
                </motion.p>

                {/* CTAs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.4 }}
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

                {/* Animated Stats */}
                {stats && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1.6 }}
                        className="mt-20"
                    >
                        <div className="grid grid-cols-3 gap-8 md:gap-16 max-w-lg mx-auto">
                            <AnimatedStat value={stats.projects} label="Projects" />
                            <AnimatedStat value={stats.technologies} label="Technologies" />
                            <AnimatedStat value={stats.domains} label="Domains" />
                        </div>
                    </motion.div>
                )}
            </motion.div>

            {/* Terminal Hint */}
            <TerminalHint />

            {/* Scroll Indicator */}
            {!prefersReducedMotion && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hasScrolled ? 0 : 1 }}
                    transition={{ duration: 0.4, delay: hasScrolled ? 0 : 2.0 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
                >
                    <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                        Scroll
                    </span>
                    <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <ChevronDown className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                    </motion.div>
                </motion.div>
            )}
        </section>
    );
}
