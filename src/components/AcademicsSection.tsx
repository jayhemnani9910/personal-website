"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { RESUME } from "@/data/resume";
import { BookOpen } from "lucide-react";
import { EducationItem, PublicationItem } from "@/data/types";
import { EducationModal } from "./EducationModal";
import { PublicationModal } from "./PublicationModal";

export function AcademicsSection() {
    const [selectedEducation, setSelectedEducation] = useState<EducationItem | null>(null);
    const [selectedPublication, setSelectedPublication] = useState<PublicationItem | null>(null);

    return (
        <section
            id="academics"
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
                    <p className="eyebrow mb-3">Background</p>
                    <h2 className="title-xl">Education & Research</h2>
                </motion.div>

                {/* Education Cards - 2 column grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                    {RESUME.education.map((edu, i) => (
                        <motion.article
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.05 }}
                            className="card card-interactive p-6"
                        >
                            <h3
                                className="title-lg title-link mb-2"
                                onClick={() => setSelectedEducation(edu)}
                            >
                                {edu.institution}
                            </h3>
                            <p className="body-base mb-2">{edu.degree}</p>
                            <p className="body-sm mb-4">{edu.location}</p>

                            {edu.gpa && (
                                <div className="mb-4">
                                    <span className="chip">GPA: {edu.gpa}</span>
                                </div>
                            )}

                            {edu.courses && edu.courses.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {edu.courses.slice(0, 4).map((course, j) => (
                                        <span key={j} className="chip">
                                            {course}
                                        </span>
                                    ))}
                                    {edu.courses.length > 4 && (
                                        <span className="chip" style={{ color: 'var(--accent)' }}>
                                            +{edu.courses.length - 4} more
                                        </span>
                                    )}
                                </div>
                            )}

                        </motion.article>
                    ))}
                </div>

                {/* Publications */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <h3 className="title-lg flex items-center gap-3">
                        <BookOpen className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                        Publications
                    </h3>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(RESUME.publications as PublicationItem[]).map((pub, i) => (
                        <motion.article
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.05 }}
                            className="card card-interactive p-6"
                        >
                            <h4
                                className="title-lg title-link leading-tight mb-3"
                                onClick={() => setSelectedPublication(pub)}
                            >
                                {pub.title}
                            </h4>

                            {pub.venue && (
                                <p className="body-sm mb-2" style={{ color: 'var(--accent)' }}>
                                    {pub.venue} {pub.year && `• ${pub.year}`}
                                </p>
                            )}

                            {pub.description && (
                                <p className="body-sm" style={{ color: 'var(--text-secondary)' }}>
                                    {pub.description}
                                </p>
                            )}
                        </motion.article>
                    ))}
                </div>
            </div>

            {/* Education Modal */}
            {selectedEducation && (
                <EducationModal
                    isOpen={!!selectedEducation}
                    onClose={() => setSelectedEducation(null)}
                    education={selectedEducation}
                />
            )}

            {/* Publication Modal */}
            {selectedPublication && (
                <PublicationModal
                    isOpen={!!selectedPublication}
                    onClose={() => setSelectedPublication(null)}
                    publication={selectedPublication}
                />
            )}
        </section>
    );
}
