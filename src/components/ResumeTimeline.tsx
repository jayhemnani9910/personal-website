"use client";

import { useState } from "react";
import { RESUME } from "@/data/resume";
import { UI_COPY } from "@/data/profile";
import { motion } from "framer-motion";
import { Role } from "@/data/types";
import { ExperienceModal } from "./ExperienceModal";

interface RoleWithCompany extends Role {
    company: string;
}

export function ResumeTimeline() {
    const [selectedRole, setSelectedRole] = useState<RoleWithCompany | null>(null);

    const allRoles: RoleWithCompany[] = RESUME.experience.flatMap((company) =>
        company.roles.map((role) => ({ company: company.name, ...role }))
    );

    return (
        <section
            id="experience"
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
                    <p className="eyebrow mb-3">Career</p>
                    <h2 className="title-xl">{UI_COPY.resume.experience}</h2>
                </motion.div>

                {/* Experience Cards - 2 column grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {allRoles.map((role, i) => (
                        <motion.article
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.05 }}
                            className="card card-interactive p-6"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3
                                        className="title-lg title-link"
                                        onClick={() => setSelectedRole(role)}
                                    >
                                        {role.company}
                                    </h3>
                                    <p className="body-base mt-1">{role.title}</p>
                                </div>
                                {role.period && (
                                    <span className="chip">{role.period.label}</span>
                                )}
                            </div>

                            <ul className="space-y-2">
                                {role.bullets.slice(0, 3).map((bullet, k) => (
                                    <li key={k} className="body-sm flex gap-3">
                                        <span className="text-[var(--accent)] shrink-0">•</span>
                                        <span className="text-[var(--text-secondary)]">
                                            {bullet.text}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            {/* "View More" indicator */}
                            {role.bullets.length > 3 && (
                                <p className="body-sm mt-4" style={{ color: 'var(--text-muted)' }}>
                                    +{role.bullets.length - 3} more
                                </p>
                            )}
                        </motion.article>
                    ))}
                </div>
            </div>

            {/* Experience Modal */}
            {selectedRole && (
                <ExperienceModal
                    isOpen={!!selectedRole}
                    onClose={() => setSelectedRole(null)}
                    company={selectedRole.company}
                    role={selectedRole}
                />
            )}
        </section>
    );
}
