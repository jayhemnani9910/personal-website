"use client";

import { Modal } from "./Modal";
import { EducationItem } from "@/data/types";
import { MapPin, Calendar, Award, BookOpen, GraduationCap } from "lucide-react";

interface EducationModalProps {
    isOpen: boolean;
    onClose: () => void;
    education: EducationItem;
}

export function EducationModal({ isOpen, onClose, education }: EducationModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={education.institution}>
            <div className="space-y-6">
                {/* Degree Header */}
                <div>
                    <h3 className="text-2xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                        {education.degree}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm" style={{ color: "var(--text-secondary)" }}>
                        {(education.start || education.end) && (
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" style={{ color: "var(--accent)" }} />
                                {education.start} – {education.end || "Present"}
                            </span>
                        )}
                        {education.location && (
                            <span className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4" style={{ color: "var(--accent)" }} />
                                {education.location}
                            </span>
                        )}
                        {education.gpa && (
                            <span className="flex items-center gap-1.5">
                                <GraduationCap className="w-4 h-4" style={{ color: "var(--accent)" }} />
                                GPA: {education.gpa}
                            </span>
                        )}
                    </div>
                </div>

                {/* Achievements */}
                {education.achievements && education.achievements.length > 0 && (
                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                            <Award className="w-4 h-4" style={{ color: "var(--accent)" }} />
                            Achievements & Honors
                        </h4>
                        <ul className="space-y-2">
                            {education.achievements.map((achievement, i) => (
                                <li key={i} className="flex gap-3">
                                    <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
                                    <span className="body-sm" style={{ color: "var(--text-secondary)" }}>
                                        {achievement}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Thesis/Capstone */}
                {education.thesis && (
                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                            Thesis / Capstone
                        </h4>
                        <div
                            className="p-4 rounded-lg"
                            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
                        >
                            <p className="font-medium mb-2" style={{ color: "var(--text-primary)" }}>
                                {education.thesis}
                            </p>
                            {education.thesisDescription && (
                                <p className="body-sm" style={{ color: "var(--text-secondary)" }}>
                                    {education.thesisDescription}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Courses */}
                {education.courses && education.courses.length > 0 && (
                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                            <BookOpen className="w-4 h-4" style={{ color: "var(--accent)" }} />
                            Relevant Coursework
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {education.courses.map((course) => (
                                <span
                                    key={course}
                                    className="chip"
                                    style={{ background: "var(--bg-secondary)" }}
                                >
                                    {course}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
