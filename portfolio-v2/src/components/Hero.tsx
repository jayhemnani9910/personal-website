"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useCommand } from "@/components/CommandProvider";
import MagneticButton from "./MagneticButton";
import { HERO_CONTENT, UI_COPY } from "@/data/profile";
import { springSoft } from "@/lib/animation";

export function Hero() {
    const { setOpen } = useCommand();
    const { scrollY } = useScroll();
    const prefersReducedMotion = useReducedMotion();

    // Cinematic Scroll Effects (respect reduced motion)
    const yMotion = useTransform(scrollY, [0, 500], [0, 200]); // Text parallax
    const scaleMotion = useTransform(scrollY, [0, 300], [1, 0.9]); // Text zoom out
    const opacityMotion = useTransform(scrollY, [0, 300], [1, 0]); // General fade
    const buttonOpacityMotion = useTransform(scrollY, [0, 100], [1, 0]); // Button fade out fast
    const bgMotion = useTransform(scrollY, [0, 500], [0, 100]); // Background parallax

    const y1 = prefersReducedMotion ? 0 : yMotion;
    const scale = prefersReducedMotion ? 1 : scaleMotion;
    const opacity = prefersReducedMotion ? 1 : opacityMotion;
    const buttonOpacity = prefersReducedMotion ? 1 : buttonOpacityMotion;
    const bgY = prefersReducedMotion ? 0 : bgMotion;

    return (
        <section className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden pt-20">
            {/* Subtle Grid Background with Parallax */}
            <motion.div style={{ y: bgY, willChange: "transform" }} className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
                <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-[var(--color-accent-primary)] opacity-10 blur-[100px]" />
            </motion.div>

            <motion.div
                style={{ y: y1 ?? 0, opacity: opacity ?? 1, scale: scale ?? 1 }}
                className="z-10 container mx-auto px-4 text-center flex flex-col items-center"
            >
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...springSoft, delay: 0.1 }}
                    className="text-8xl md:text-[10rem] font-bold tracking-tighter mb-8 text-balance text-white leading-[0.9]"
                >
                    {HERO_CONTENT.title}
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...springSoft, delay: 0.2 }}
                    className="text-2xl md:text-3xl text-[var(--color-text-secondary)] max-w-3xl mb-12 leading-relaxed font-light"
                >
                    {HERO_CONTENT.role} {HERO_CONTENT.tagline}
                    <br />
                    {HERO_CONTENT.subTagline} <span className="text-white font-medium">{HERO_CONTENT.highlight}</span>.
                </motion.p>

                <motion.div
                    style={{ opacity: buttonOpacity ?? 1 }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="flex flex-col sm:flex-row gap-4"
                >
                    <MagneticButton onClick={() => setOpen(true)}>
                        <button className="relative px-8 py-4 rounded-full bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] font-semibold overflow-hidden group">
                            <span className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <span className="relative z-10">{HERO_CONTENT.cta.primary}</span>
                        </button>
                    </MagneticButton>

                    <MagneticButton>
                        <a
                            href="#projects"
                            className="px-8 py-4 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-[var(--color-text-primary)] font-medium hover:bg-[rgba(255,255,255,0.1)] transition-colors backdrop-blur-sm"
                        >
                            {HERO_CONTENT.cta.secondary}
                        </a>
                    </MagneticButton>
                </motion.div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
                style={{ opacity: opacity ?? 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
                <span className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)]">{UI_COPY.nav.scroll}</span>
                <motion.div
                    animate={{
                        y: [0, 12, 0],
                        opacity: [1, 0, 1]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="w-[1px] h-12 bg-gradient-to-b from-[var(--color-text-muted)] to-transparent"
                />
            </motion.div>
        </section>
    );
}
