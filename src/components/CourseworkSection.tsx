"use client";

import { motion } from "framer-motion";
import { Wrench } from "lucide-react";
import { SKILL_DOMAINS } from "@/data/coursework";

function SkillDomainCard({ domain, index }: { domain: typeof SKILL_DOMAINS[0]; index: number }) {
    const Icon = domain.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="card card-interactive p-6 group"
        >
            {/* Icon and Title */}
            <div className="flex items-start gap-4 mb-4">
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
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
            <div className="flex flex-wrap gap-2">
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
            {/* Section Divider */}
            <div className="section-wide mb-12">
                <div className="h-px bg-[var(--border)]" />
            </div>

            <div className="section-wide">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
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
