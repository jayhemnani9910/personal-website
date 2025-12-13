"use client";

import { ArrowUp } from "lucide-react";
import { motion } from "framer-motion";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="py-12 border-t border-[rgba(255,255,255,0.05)]">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <span className="font-mono font-bold text-lg text-[var(--color-text-primary)]">Jay Hemnani</span>
                        <p className="text-sm text-[var(--color-text-muted)]">
                            &copy; {currentYear} All rights reserved.
                        </p>
                    </div>

                    {/* Right Side: Scroll to Top */}
                    <motion.button
                        whileHover={{ scale: 1.1, y: -2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        className="group flex items-center justify-center w-12 h-12 rounded-full bg-white/5 border border-white/10 backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/20"
                    >
                        <ArrowUp className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
                    </motion.button>
                </div>
            </div>
        </footer>
    );
}
