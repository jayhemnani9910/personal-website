"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, Sun, Moon } from "lucide-react";
import { useTerminal } from "@/context/TerminalContext";
import { useTheme } from "@/context/ThemeContext";
import MagneticButton from "./MagneticButton";
import { NAV_LINKS } from "@/data/navigation";
import { useRouter } from "next/navigation";

import { useLenis } from "lenis/react";
import { scrollToTarget } from "@/lib/scroll";

export function Navbar() {
    const { toggleTerminal } = useTerminal();
    const { theme, toggleTheme } = useTheme();
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("");
    const [isHidden, setIsHidden] = useState(false);
    const { scrollY } = useScroll();
    const lenis = useLenis();

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() ?? 0;
        if (latest > previous && latest > 150) {
            setIsHidden(true);
        } else {
            setIsHidden(false);
        }
        setIsScrolled(latest > 50);
    });

    useEffect(() => {
        let rafId: number;

        const handleScroll = () => {
            const sections = NAV_LINKS.map(link => link.href.replace("/#", ""));

            // Find the current section based on scroll position
            // Optimized to avoid excessive DOM queries
            let current = "";
            const scrollPosition = window.scrollY + 200; // Offset for sticky header

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        current = section;
                        break;
                    }
                }
            }
            setActiveSection(current);
        };

        const onScroll = () => {
            if (!rafId) {
                rafId = requestAnimationFrame(() => {
                    handleScroll();
                    rafId = 0;
                });
            }
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", onScroll);
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, []);

    const router = useRouter();

    const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        // Handle both hash links and page routes
        if (href.startsWith("/#")) {
            const targetId = href.replace("/#", "#");
            const element = document.querySelector(targetId);
            if (element) {
                scrollToTarget(element, lenis, -100);
            } else {
                router.push(href);
            }
        } else if (href.startsWith("#")) {
            scrollToTarget(href, lenis, -100);
        } else {
            router.push(href);
        }
    };

    const springConfig = { type: "spring" as const, stiffness: 320, damping: 28 };

    return (
        <>
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{
                    y: isHidden ? -100 : 0,
                    opacity: 1
                }}
                transition={springConfig}
                className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-300 ${isScrolled ? "py-4" : "py-6"}`}
            >
                <div
                    className={`pointer-events-auto flex items-center gap-4 p-2 rounded-full border transition-all duration-500 ${isScrolled
                        ? "glass shadow-md"
                        : "bg-transparent border-transparent"
                        } hover:shadow-lg`}
                >
                    {/* Logo / Home Reset */}
                    <MagneticButton>
                        <Link href="/" className="relative z-50 group" aria-label="Home">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] backdrop-blur-md transition-all duration-300 group-hover:bg-[var(--bg-tertiary)] group-hover:scale-105">
                                <span className="font-mono font-bold text-sm tracking-tighter text-[var(--text-primary)]">JH</span>
                            </div>
                        </Link>
                    </MagneticButton>

                    {/* Centered Nav Links */}
                    <div className="hidden md:flex items-center gap-1 px-2">
                        {NAV_LINKS.map((link) => {
                            const isActive = activeSection === link.href.replace("/#", "");
                            return (
                                <MagneticButton key={link.name}>
                                    <motion.a
                                        href={link.href}
                                        onClick={(e) => handleScrollTo(e, link.href)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        transition={springConfig}
                                        className={`px-4 py-2 text-sm transition-colors block relative ${isActive ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                            }`}
                                    >
                                        {isActive && (
                                            <motion.span
                                                layoutId="activeSection"
                                                className="absolute inset-0 bg-[var(--bg-secondary)] rounded-full -z-10"
                                                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                            />
                                        )}
                                        {link.name}
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeUnderline"
                                                className="absolute -bottom-1 left-2 right-2 h-0.5 rounded-full"
                                                style={{
                                                    background: "linear-gradient(135deg, var(--accent-cyan, #00F5FF) 0%, var(--accent-purple, #A855F7) 100%)",
                                                }}
                                                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                            />
                                        )}
                                    </motion.a>
                                </MagneticButton>
                            );
                        })}
                    </div>

                    {/* System Status - Live Indicator */}
                    <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)]">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75 duration-1000"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent)]" style={{ boxShadow: '0 0 6px var(--accent)' }}></span>
                        </span>
                        <span className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider">Live</span>
                    </div>

                    {/* Theme Toggle */}
                    <MagneticButton>
                        <button
                            onClick={toggleTheme}
                            aria-label="Toggle Theme"
                            className="theme-toggle"
                        >
                            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        </button>
                    </MagneticButton>

                    {/* Terminal Toggle */}
                    <MagneticButton>
                        <button
                            onClick={toggleTerminal}
                            aria-label="Toggle Terminal"
                            className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors border border-[var(--border)] text-sm text-[var(--text-secondary)] group font-mono font-bold"
                        >
                            <span className="group-hover:text-[var(--accent)] transition-colors">&gt;_</span>
                        </button>
                    </MagneticButton>

                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden">
                        <MagneticButton>
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                aria-label={mobileMenuOpen ? "Close Menu" : "Open Menu"}
                                className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
                            >
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
                        className="fixed inset-0 z-40 bg-[var(--bg-primary)] pt-24 px-6 md:hidden"
                    >
                        <div className="flex flex-col gap-6 text-2xl font-medium">
                            {NAV_LINKS.map(link => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    onClick={(e) => {
                                        handleScrollTo(e, link.href);
                                        setMobileMenuOpen(false);
                                    }}
                                    className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                >
                                    {link.name}
                                </a>
                            ))}
                            <button
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    toggleTheme();
                                }}
                                className="text-left text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            >
                                {theme === "dark" ? "Light" : "Dark"} Mode
                            </button>
                            <button
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    toggleTerminal();
                                }}
                                className="text-left text-[var(--text-secondary)] hover:text-[var(--accent)] font-mono"
                            >
                                &gt;_ Terminal Mode
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
