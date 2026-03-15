"use client";

import { motion, useTransform } from "framer-motion";
import { Wrench } from "lucide-react";
import { SKILL_DOMAINS } from "@/data/coursework";
import { use3DTilt } from "@/hooks/use3DTilt";

function SkillDomainCard({ domain, index }: { domain: typeof SKILL_DOMAINS[0]; index: number }) {
    const Icon = domain.icon;
    const { cardRef, rotateX, rotateY, glowX, glowY, handleMouseMove, handleMouseLeave } = use3DTilt(4);

    return (
        <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
            whileHover={{ y: -6, transition: { type: "spring", stiffness: 300, damping: 25 } }}
            style={{
                rotateX,
                rotateY,
                transformPerspective: 800,
                transformStyle: "preserve-3d",
            }}
            className={`relative card card-interactive p-6 group/card overflow-hidden ${index < 2 ? "md:col-span-2 lg:col-span-1" : ""}`}
        >
            {/* Glow spot that follows cursor */}
            <motion.div
                className="absolute inset-0 opacity-0 group-hover/card:opacity-100 pointer-events-none transition-opacity duration-300"
                style={{
                    background: useTransform(
                        [glowX, glowY],
                        ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, ${domain.color}15 0%, transparent 60%)`
                    ),
                }}
            />

            {/* Icon and Title */}
            <div className="flex items-start gap-4 mb-4 relative z-10">
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover/card:scale-110"
                    style={{
                        backgroundColor: `${domain.color}15`,
                    }}
                >
                    <Icon
                        className="w-6 h-6 transition-all duration-300"
                        style={{ color: domain.color }}
                    />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {domain.title}
                    </h3>
                </div>
            </div>

            {/* Skills as chips */}
            <div className="flex flex-wrap gap-2 relative z-10">
                {domain.skills.map((skill) => (
                    <span
                        key={skill}
                        className="px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 hover:scale-105"
                        style={{
                            backgroundColor: `${domain.color}10`,
                            color: domain.color,
                            border: `1px solid ${domain.color}30`,
                        }}
                    >
                        {skill}
                    </span>
                ))}
            </div>
        </motion.div>
    );
}

export function CourseworkSection() {
    return (
        <section
            id="coursework"
            className="section-block scroll-mt-28 md:scroll-mt-32"
        >
            {/* Animated Divider */}
            <div className="section-wide mb-12">
                <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="h-px bg-[var(--border)] origin-left"
                />
            </div>

            <div className="section-wide">
                {/* Header — slide from right */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="mb-12"
                >
                    <p className="eyebrow mb-3 flex items-center gap-2">
                        <Wrench className="w-4 h-4" />
                        Skills
                    </p>
                    <h2 className="title-xl mb-4">My Toolkit</h2>
                    <p className="body-base max-w-2xl" style={{ color: 'var(--text-secondary)' }}>
                        Technologies I&apos;ve been building with lately.
                    </p>
                </motion.div>

                {/* Skill Domain Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {SKILL_DOMAINS.map((domain, i) => (
                        <SkillDomainCard key={domain.id} domain={domain} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}
