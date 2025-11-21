"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import MagneticButton from "./MagneticButton";

const TESTIMONIALS = [
    {
        id: 1,
        text: "Jay transformed our vague data requirements into a high-performance analytics engine. His ability to bridge technical complexity with business value is unmatched.",
        author: "Sarah Chen",
        role: "CTO",
        company: "Nexus AI",
        image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=faces"
    },
    {
        id: 2,
        text: "The dashboard Jay built isn't just functional; it's a work of art. The attention to detail in the user experience made adoption seamless across our organization.",
        author: "Marcus Thorne",
        role: "Product Director",
        company: "Vanguard Systems",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces"
    },
    {
        id: 3,
        text: "Working with Jay was a masterclass in modern engineering. He delivered a scalable, future-proof solution that cut our processing time by 60%.",
        author: "Elena Rodriguez",
        role: "VP of Engineering",
        company: "Streamline Data",
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=faces"
    }
];

export function Testimonials() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const prefersReducedMotion = useReducedMotion();

    const nextTestimonial = () => {
        setDirection(1);
        setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    };

    const prevTestimonial = () => {
        setDirection(-1);
        setActiveIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
    };

    useEffect(() => {
        if (prefersReducedMotion) return;
        const timer = setInterval(nextTestimonial, 8000);
        return () => clearInterval(timer);
    }, [prefersReducedMotion]);

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 100 : -100,
            opacity: 0,
            scale: 0.95
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 100 : -100,
            opacity: 0,
            scale: 0.95
        })
    };

    return (
        <section className="relative section-block section-shell overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)] blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto">
                <div className="text-center mb-10 md:mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">
                        Trusted by Industry Leaders
                    </h2>
                </div>

                <div className="relative min-h-[350px] md:min-h-[400px] flex items-center justify-center">
                    <AnimatePresence initial={false} custom={direction} mode="wait">
                        <motion.div
                            key={activeIndex}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 }
                            }}
                            className="absolute w-full"
                        >
                            <div className="glass-card p-8 md:p-12 rounded-3xl relative">
                                <Quote className="absolute top-8 left-8 w-12 h-12 text-[var(--color-accent-primary)] opacity-20" />

                                <div className="flex flex-col items-center text-center pt-8">
                                    <p className="text-xl md:text-2xl leading-relaxed text-[var(--color-text-primary)] mb-8 font-light italic">
                                        &ldquo;{TESTIMONIALS[activeIndex].text}&rdquo;
                                    </p>

                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full overflow-hidden border border-[rgba(255,255,255,0.1)]">
                                            <Image
                                                src={TESTIMONIALS[activeIndex].image}
                                                alt={TESTIMONIALS[activeIndex].author}
                                                width={48}
                                                height={48}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="text-left">
                                            <h4 className="font-bold text-[var(--color-text-primary)]">
                                                {TESTIMONIALS[activeIndex].author}
                                            </h4>
                                            <p className="text-sm text-[var(--color-text-secondary)]">
                                                {TESTIMONIALS[activeIndex].role}, {TESTIMONIALS[activeIndex].company}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Controls */}
                <div className="flex justify-center items-center gap-4 mt-8">
                    <MagneticButton onClick={prevTestimonial}>
                        <button className="p-3 rounded-full bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] transition-colors border border-[rgba(255,255,255,0.05)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    </MagneticButton>

                    <div className="flex gap-2">
                        {TESTIMONIALS.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    setDirection(i > activeIndex ? 1 : -1);
                                    setActiveIndex(i);
                                }}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${i === activeIndex
                                    ? "w-8 bg-[var(--color-accent-primary)]"
                                    : "bg-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.4)]"
                                    }`}
                            />
                        ))}
                    </div>

                    <MagneticButton onClick={nextTestimonial}>
                        <button className="p-3 rounded-full bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] transition-colors border border-[rgba(255,255,255,0.05)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </MagneticButton>
                </div>
            </div>
        </section>
    );
}
