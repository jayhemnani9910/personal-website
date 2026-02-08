"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Database, Users, FileText, Clock, Key, Link2, Table, ArrowRight } from "lucide-react";
import type { Project } from "@/lib/definitions";
import { StatCard } from "@/components/ui/StatCard";

// ERD Table component
function ERDTable({ name, columns, primaryKey, foreignKeys }: { name: string; columns: string[]; primaryKey: string; foreignKeys?: string[] }) {
    return (
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--accent)] transition-colors">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[var(--border)]">
                <Table className="w-4 h-4 text-[var(--accent)]" />
                <span className="text-sm font-medium text-[var(--text-primary)]">{name}</span>
            </div>
            <div className="space-y-1.5">
                {columns.map((col) => {
                    const isPK = col === primaryKey;
                    const isFK = foreignKeys?.includes(col);
                    return (
                        <div key={col} className="flex items-center gap-2 text-xs">
                            {isPK && <Key className="w-3 h-3 text-amber-500" />}
                            {isFK && <Link2 className="w-3 h-3 text-blue-500" />}
                            {!isPK && !isFK && <span className="w-3" />}
                            <span className={`${isPK ? "text-amber-500 font-medium" : isFK ? "text-blue-500" : "text-[var(--text-secondary)]"}`}>
                                {col}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Query example
function QueryExample({ title, query, description }: { title: string; query: string; description: string }) {
    return (
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
            <div className="text-sm font-medium text-[var(--text-primary)] mb-2">{title}</div>
            <pre className="text-xs text-[var(--accent)] bg-[var(--bg-primary)] p-3 rounded-lg overflow-x-auto font-mono mb-2">
                {query}
            </pre>
            <p className="text-xs text-[var(--text-muted)]">{description}</p>
        </div>
    );
}


export function ImmigrationDBPage({ project }: { project: Project }) {
    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            <style jsx global>{`
                @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>

            {/* Header */}
            <header className="pt-32 pb-8 px-6">
                <div className="max-w-6xl mx-auto">
                    <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors mb-8">
                        <ArrowLeft className="w-4 h-4" />Back to Projects
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4" style={{ animation: 'fadeSlideUp 0.5s ease-out' }}>
                        Immigration Management DB
                    </h1>
                    <p className="text-xl text-[var(--text-secondary)] mb-6 max-w-3xl" style={{ animation: 'fadeSlideUp 0.5s ease-out 100ms both' }}>
                        Normalized relational schema for case-centric immigration operations.
                    </p>
                    <div className="flex flex-wrap gap-2" style={{ animation: 'fadeSlideUp 0.5s ease-out 200ms both' }}>
                        {['SQL', 'MySQL', 'PostgreSQL', '3NF', 'ACID'].map((tech) => (
                            <span key={tech} className="px-3 py-1 text-xs font-medium rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">{tech}</span>
                        ))}
                    </div>
                </div>
            </header>

            {/* ERD Visualization */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Entity Relationship Diagram</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <ERDTable
                            name="persons"
                            columns={["person_id", "first_name", "last_name", "date_of_birth", "passport_number", "nationality"]}
                            primaryKey="person_id"
                        />
                        <ERDTable
                            name="cases"
                            columns={["case_id", "case_number", "case_type_id", "status", "filing_date", "priority"]}
                            primaryKey="case_id"
                            foreignKeys={["case_type_id"]}
                        />
                        <ERDTable
                            name="case_persons"
                            columns={["case_person_id", "case_id", "person_id", "role", "is_primary", "relationship"]}
                            primaryKey="case_person_id"
                            foreignKeys={["case_id", "person_id"]}
                        />
                        <ERDTable
                            name="documents"
                            columns={["document_id", "case_id", "document_type_id", "issue_date", "expiration_date", "status"]}
                            primaryKey="document_id"
                            foreignKeys={["case_id", "document_type_id"]}
                        />
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-6 text-xs text-[var(--text-muted)]">
                        <span className="flex items-center gap-1"><Key className="w-3 h-3 text-amber-500" /> Primary Key</span>
                        <span className="flex items-center gap-1"><Link2 className="w-3 h-3 text-blue-500" /> Foreign Key</span>
                    </div>
                </div>
            </section>

            {/* Relationships */}
            <section className="py-12 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Many-to-Many with Role Differentiation</h2>
                    <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                        <div className="flex items-center justify-center gap-8 flex-wrap">
                            <div className="flex flex-col items-center">
                                <Users className="w-10 h-10 text-[var(--accent)] mb-2" />
                                <span className="text-sm font-medium text-[var(--text-primary)]">Person</span>
                                <span className="text-xs text-[var(--text-muted)]">Can be in multiple cases</span>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <ArrowRight className="w-6 h-6 text-[var(--border)] mb-2" />
                                <span className="text-xs text-[var(--accent)] font-medium">case_persons</span>
                                <span className="text-xs text-[var(--text-muted)]">role, is_primary</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <FileText className="w-10 h-10 text-[var(--accent)] mb-2" />
                                <span className="text-sm font-medium text-[var(--text-primary)]">Case</span>
                                <span className="text-xs text-[var(--text-muted)]">Has multiple persons</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center mt-6">
                            {['APPLICANT', 'DEPENDENT', 'SPONSOR', 'ATTORNEY'].map((role) => (
                                <span key={role} className="px-2 py-1 text-xs rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
                                    {role}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Query Examples */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Common Query Patterns</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <QueryExample
                            title="Find Expiring Documents"
                            query={`SELECT case_number, expiration_date
FROM documents d
JOIN cases c ON d.case_id = c.case_id
WHERE expiration_date
  BETWEEN NOW() AND NOW() + 30 DAY;`}
                            description="Index on expiration_date enables efficient range scan"
                        />
                        <QueryExample
                            title="Case Details with Persons"
                            query={`SELECT c.case_number, p.first_name,
       cp.role, cp.is_primary
FROM cases c
JOIN case_persons cp ON c.case_id = cp.case_id
JOIN persons p ON cp.person_id = p.person_id;`}
                            description="Junction table enables flexible role assignment"
                        />
                    </div>
                </div>
            </section>

            {/* Design Decisions */}
            <section className="py-12 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Design Decisions</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                            <div className="text-sm font-medium text-[var(--text-primary)] mb-2">3NF with Strategic Denormalization</div>
                            <div className="text-xs text-[var(--text-muted)]">Keep person data normalized. Denormalize active_case_count to avoid expensive aggregates on every dashboard load.</div>
                        </div>
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                            <div className="text-sm font-medium text-[var(--text-primary)] mb-2">Separate Audit History Table</div>
                            <div className="text-xs text-[var(--text-muted)]">case_status_history enables SQL queries on historical data, unlike JSON blobs. Essential for compliance.</div>
                        </div>
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                            <div className="text-sm font-medium text-[var(--text-primary)] mb-2">ENUMs for Stable Domains</div>
                            <div className="text-xs text-[var(--text-muted)]">Use ENUMs for status/role (fast, schema-enforced). Use FK for case_type (extensible).</div>
                        </div>
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                            <div className="text-sm font-medium text-[var(--text-primary)] mb-2">UTF-8 for International Names</div>
                            <div className="text-xs text-[var(--text-muted)]">utf8mb4 encoding from day one. Immigration data includes names from diverse languages.</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Indexing Strategy */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Indexing Strategy</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { index: "(case_id, person_id, role)", purpose: "Relationship queries" },
                            { index: "(expiration_date, status)", purpose: "Deadline monitoring" },
                            { index: "(last_name, first_name)", purpose: "Person search" },
                            { index: "(status, filing_date)", purpose: "Case filtering" },
                        ].map((item) => (
                            <div key={item.index} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
                                <code className="text-xs text-[var(--accent)] block mb-2">{item.index}</code>
                                <span className="text-xs text-[var(--text-muted)]">{item.purpose}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-12 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-[var(--border)]">
                        <StatCard value="4" label="Core Tables" />
                        <StatCard value="3NF" label="Normalization" />
                        <StatCard value="ACID" label="Compliant" />
                        <StatCard value="UTF-8" label="Encoding" />
                    </div>
                </div>
            </section>

            {/* Key Insight */}
            <section className="py-12 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <Database className="w-8 h-8 text-[var(--accent)] mx-auto mb-4" />
                    <blockquote className="text-lg text-[var(--text-secondary)] italic">
                        "For regulated domains, invest in audit infrastructure early. Retrofitting is painful."
                    </blockquote>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-[var(--border)]">
                <div className="max-w-6xl mx-auto">
                    <span className="text-[var(--text-muted)]">Predictable performance & cleaner data model for immigration ops</span>
                </div>
            </footer>
        </div>
    );
}
