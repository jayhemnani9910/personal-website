"use client";

import { Modal } from "./Modal";
import { PublicationItem } from "@/data/types";
import { Calendar, Users, ExternalLink, Github, FileText } from "lucide-react";

interface PublicationModalProps {
    isOpen: boolean;
    onClose: () => void;
    publication: PublicationItem;
}

export function PublicationModal({ isOpen, onClose, publication }: PublicationModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Publication">
            <div className="space-y-6">
                {/* Title */}
                <div>
                    <h3 className="text-2xl font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
                        {publication.title}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm" style={{ color: "var(--text-secondary)" }}>
                        {publication.venue && (
                            <span className="flex items-center gap-1.5">
                                <FileText className="w-4 h-4" style={{ color: "var(--accent)" }} />
                                {publication.venue}
                            </span>
                        )}
                        {publication.year && (
                            <span className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4" style={{ color: "var(--accent)" }} />
                                {publication.year}
                            </span>
                        )}
                    </div>
                </div>

                {/* Co-authors */}
                {publication.coAuthors && publication.coAuthors.length > 0 && (
                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                            <Users className="w-4 h-4" style={{ color: "var(--accent)" }} />
                            Co-Authors
                        </h4>
                        <p className="body-sm" style={{ color: "var(--text-secondary)" }}>
                            {publication.coAuthors.join(", ")}
                        </p>
                    </div>
                )}

                {/* Abstract */}
                {publication.abstract && (
                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
                            Abstract
                        </h4>
                        <p className="body-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                            {publication.abstract}
                        </p>
                    </div>
                )}

                {/* Links */}
                {(publication.link || publication.github) && (
                    <div className="flex flex-wrap gap-3 pt-2">
                        {publication.link && (
                            <a
                                href={publication.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-primary py-2 px-4 text-sm"
                            >
                                <ExternalLink className="w-4 h-4" />
                                View Paper
                            </a>
                        )}
                        {publication.github && (
                            <a
                                href={publication.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-secondary py-2 px-4 text-sm"
                                style={{ border: "1px solid var(--border)" }}
                            >
                                <Github className="w-4 h-4" />
                                Source Code
                            </a>
                        )}
                    </div>
                )}
            </div>
        </Modal>
    );
}
