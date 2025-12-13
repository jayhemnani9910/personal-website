"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PersonalPage() {
    return (
        <main className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Noise */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.08)_0.5px,_transparent_1px)] bg-[length:6px_6px] opacity-5 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-2xl text-center space-y-8 relative z-10"
            >
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-purple-500 to-orange-500 blur-xl opacity-50 animate-pulse" />

                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-orange-200">
                    The Human Side.
                </h1>

                <p className="text-xl text-white/60 leading-relaxed">
                    Beyond the code and data pipelines. This is where I share my thoughts,
                    daily feeds, and what I&apos;m currently exploring.
                </p>

                <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                    <p className="font-mono text-sm text-orange-400 mb-2">STATUS: CONSTRUCTION</p>
                    <p className="text-white/80">
                        Building a dynamic feed of my digital life. Check back soon.
                    </p>
                </div>

                <Link href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to System
                </Link>
            </motion.div>
        </main>
    );
}
