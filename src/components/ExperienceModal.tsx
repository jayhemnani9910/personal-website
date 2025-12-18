"use client";

import { Modal } from "./Modal";
import { Role } from "@/data/types";
import { MapPin, Calendar, Briefcase } from "lucide-react";

interface ExperienceModalProps {
    isOpen: boolean;
    onClose: () => void;
    company: string;
    role: Role;
}

export function ExperienceModal({ isOpen, onClose, company, role }: ExperienceModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={company}>
            <div className="space-y-6">
                {/* Role Header */}
                <div>
                    <h3 className="text-2xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                        {role.title}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm" style={{ color: "var(--text-secondary)" }}>
                        {role.period?.label && (
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" style={{ color: "var(--accent)" }} />
                                {role.period.label}
                            </span>
                        )}
                        {role.location && (
                            <span className="flex items-center gap-1.5">
                                <MapPin className="w-4 h-4" style={{ color: "var(--accent)" }} />
                                {role.location}
                            </span>
                        )}
                        {role.employmentType && (
                            <span className="flex items-center gap-1.5">
                                <Briefcase className="w-4 h-4" style={{ color: "var(--accent)" }} />
                                {role.employmentType.charAt(0).toUpperCase() + role.employmentType.slice(1)}
                            </span>
                        )}
                    </div>
                </div>

                {/* Summary */}
                {role.summary && (
                    <p className="body-base" style={{ color: "var(--text-secondary)" }}>
                        {role.summary}
                    </p>
                )}

                {/* Tech Stack */}
                {role.tech && role.tech.length > 0 && (
                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                            Tech Stack
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {role.tech.map((tech) => (
                                <span
                                    key={tech}
                                    className="chip"
                                    style={{ background: "var(--bg-secondary)" }}
                                >
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Achievements */}
                <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                        Key Achievements
                    </h4>
                    <ul className="space-y-3">
                        {role.bullets.map((bullet, i) => (
                            <li key={i} className="flex gap-3">
                                <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent)" }} />
                                <span className="body-sm" style={{ color: "var(--text-secondary)" }}>
                                    {bullet.text}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </Modal>
    );
}
