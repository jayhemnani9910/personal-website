"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Command, Menu, X } from "lucide-react";
import { useCommand } from "@/components/CommandProvider";
import MagneticButton from "./MagneticButton";
import { NAV_LINKS } from "@/data/navigation";

import { useLenis } from "lenis/react";

export function Navbar() {
    const { setOpen } = useCommand();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const lenis = useLenis();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        if (lenis) {
            lenis.scrollTo(href, { offset: -100 });
        }
    };

    const springConfig = { type: "spring" as const, stiffness: 320, damping: 28 };

    return (
        <>
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={springConfig}
                className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4"
            >
                <div
                    className={`pointer-events-auto flex items-center gap-2 p-2 rounded-full border transition-all duration-500 ${scrolled
                        ? "bg-[rgba(5,5,5,0.6)] backdrop-blur-xl border-[rgba(255,255,255,0.08)] shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]"
                        : "bg-transparent border-transparent"
                        }`}
                >
                    <MagneticButton>
                        <a
                            href="#"
                            onClick={(e) => handleScrollTo(e, "#")}
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] transition-colors border border-[rgba(255,255,255,0.05)]"
                        >
                            <span className="font-mono font-bold text-sm">JH</span>
                        </a>
                    </MagneticButton>

                    <div className="hidden md:flex items-center gap-1 px-2">
                        {NAV_LINKS.map((link) => (
                            <MagneticButton key={link.name}>
                                <motion.a
                                    href={link.href}
                                    onClick={(e) => handleScrollTo(e, link.href)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={springConfig}
                                    className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors block"
                                >
                                    {link.name}
                                </motion.a>
                            </MagneticButton>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.05)]">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent-cyan)] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-accent-cyan)]"></span>
                        </span>
                        <span className="text-xs font-mono text-[var(--color-text-muted)]">System Online</span>
                    </div>

                    <MagneticButton onClick={() => setOpen(true)}>
                        <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.1)] transition-colors border border-[rgba(255,255,255,0.05)] text-sm text-[var(--color-text-secondary)] group">
                            <Command className="w-4 h-4 group-hover:text-[var(--color-text-primary)] transition-colors" />
                            <span className="hidden md:inline group-hover:text-[var(--color-text-primary)] transition-colors">
                                Menu
                            </span>
                        </button>
                    </MagneticButton>

                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden">
                        <MagneticButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            <button className="flex items-center justify-center w-10 h-10 rounded-full bg-[rgba(255,255,255,0.05)] text-[var(--color-text-secondary)]">
                                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                            </button>
                        </MagneticButton>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={springConfig}
                        className="fixed inset-0 z-40 bg-[var(--color-bg-primary)] pt-24 px-6 md:hidden"
                    >
                        <div className="flex flex-col gap-6 text-2xl font-medium">
                            {NAV_LINKS.map(link => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                                >
                                    {link.name}
                                </a>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
