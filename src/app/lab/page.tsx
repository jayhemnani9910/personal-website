"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ChronosBackground } from "@/components/ChronosBackground";
import {
    Sparkles,
    Rocket,
    Telescope,
    Lightbulb,
    ExternalLink,
    Github,
    ArrowRight
} from "lucide-react";
import { LAB_ITEMS, type LabItem } from "@/data/lab";

type TabKey = "building" | "exploring" | "radar";

const TABS: { key: TabKey; label: string; icon: typeof Rocket; color: string }[] = [
    { key: "building", label: "Building", icon: Rocket, color: "#ef4444" },
    { key: "exploring", label: "Exploring", icon: Telescope, color: "#3b82f6" },
    { key: "radar", label: "On My Radar", icon: Lightbulb, color: "#10b981" }
];

function LabCard({ item, index, color }: {
    item: LabItem;
    index: number;
    color: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="group relative p-6 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.05] hover:border-white/20 transition-all duration-300"
        >
            {/* Glow effect on hover */}
            <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                    background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${color}10, transparent 40%)`
                }}
            />

            <div className="relative z-10">
                {/* Title and Link */}
                <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white group-hover:text-white/90">
                        {item.title}
                    </h3>
                    {item.link && (
                        <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            <Github className="w-4 h-4 text-white/60" />
                        </a>
                    )}
                </div>

                {/* Description */}
                <p className="text-sm text-white/60 mb-4 leading-relaxed">
                    {item.description}
                </p>

                {/* Progress bar (if exists) */}
                {"progress" in item && item.progress !== undefined && (
                    <div className="mb-4">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-white/40">Progress</span>
                            <span style={{ color }}>{item.progress}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${item.progress}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="h-full rounded-full"
                                style={{ backgroundColor: color }}
                            />
                        </div>
                    </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                        <span
                            key={tag}
                            className="px-2.5 py-1 text-xs rounded-full bg-white/5 text-white/50 border border-white/10"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

export default function LabPage() {
    const [activeTab, setActiveTab] = useState<TabKey>("building");
    const activeTabData = TABS.find(t => t.key === activeTab)!;

    return (
        <main className="relative min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
            {/* Animated Background */}
            <ChronosBackground />

            {/* Content */}
            <div className="relative z-10">
                <Navbar />

                {/* Hero */}
                <section className="pt-32 pb-16 px-6">
                    <div className="max-w-5xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <p className="flex items-center gap-2 text-sm font-medium text-cyan-400 mb-4">
                                <Sparkles className="w-4 h-4" />
                                The Lab
                            </p>
                            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-white to-white/50 bg-clip-text text-transparent">
                                What I&apos;m Working On
                            </h1>
                            <p className="text-lg text-white/60 max-w-2xl">
                                Experiments, explorations, and ideas in progress.
                                Things I&apos;m building, learning, and keeping an eye on.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Tabs */}
                <section className="px-6 pb-8">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex gap-2 p-1.5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 w-fit">
                            {TABS.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.key;
                                return (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                                            isActive
                                                ? "text-white"
                                                : "text-white/50 hover:text-white/70"
                                        }`}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute inset-0 rounded-xl"
                                                style={{ backgroundColor: `${tab.color}20` }}
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <Icon className="w-4 h-4 relative z-10" style={{ color: isActive ? tab.color : undefined }} />
                                        <span className="relative z-10">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Cards Grid */}
                <section className="px-6 pb-24">
                    <div className="max-w-5xl mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {LAB_ITEMS[activeTab].map((item, i) => (
                                    <LabCard
                                        key={item.id}
                                        item={item}
                                        index={i}
                                        color={activeTabData.color}
                                    />
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </section>

                {/* CTA */}
                <section className="px-6 pb-24">
                    <div className="max-w-5xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="relative p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden"
                        >
                            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-2">
                                        Want to collaborate?
                                    </h3>
                                    <p className="text-white/60">
                                        Always open to interesting projects and ideas.
                                    </p>
                                </div>
                                <a
                                    href="/#contact"
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-medium hover:bg-white/90 transition-colors"
                                >
                                    Let&apos;s Talk
                                    <ArrowRight className="w-4 h-4" />
                                </a>
                            </div>
                        </motion.div>
                    </div>
                </section>

                <Footer />
            </div>
        </main>
    );
}
