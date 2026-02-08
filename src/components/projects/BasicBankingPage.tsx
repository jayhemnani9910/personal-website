"use client";

import { useState, useEffect } from "react";
import { CreditCard, Lock, ArrowRightLeft, Database, Code, CheckCircle, User } from "lucide-react";
import type { Project } from "@/lib/definitions";
import { ProjectHeader } from "./ProjectHeader";
import { StatCard } from "@/components/ui/StatCard";

// Transaction animation
function TransactionFlow() {
    const [step, setStep] = useState(0);
    const steps = ["Login", "Select", "Amount", "Confirm", "Done"];

    useEffect(() => {
        const interval = setInterval(() => {
            setStep((prev) => (prev + 1) % steps.length);
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center justify-between">
            {steps.map((s, i) => (
                <div key={s} className="flex items-center">
                    <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                            i <= step ? "bg-[var(--accent)] text-white" : "bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-muted)]"
                        }`}>
                            {i < step ? <CheckCircle className="w-5 h-5" /> : i + 1}
                        </div>
                        <span className="text-xs text-[var(--text-muted)] mt-2">{s}</span>
                    </div>
                    {i < steps.length - 1 && (
                        <div className={`w-12 h-0.5 mx-2 transition-colors duration-300 ${
                            i < step ? "bg-[var(--accent)]" : "bg-[var(--border)]"
                        }`} />
                    )}
                </div>
            ))}
        </div>
    );
}

// Simple account card
function AccountCard({ name, balance, type }: { name: string; balance: string; type: string }) {
    return (
        <div className="p-4 rounded-xl border border-[var(--border)] bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-primary)]">
            <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <span className="text-xs text-[var(--text-muted)]">{type}</span>
            </div>
            <div className="text-xl font-bold text-[var(--text-primary)] mb-1">{balance}</div>
            <div className="text-sm text-[var(--text-muted)]">{name}</div>
        </div>
    );
}

// Learning point
function LearningPoint({ title, description }: { title: string; description: string }) {
    return (
        <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-[var(--accent)]" />
            </div>
            <div>
                <div className="text-sm font-medium text-[var(--text-primary)] mb-1">{title}</div>
                <div className="text-xs text-[var(--text-muted)]">{description}</div>
            </div>
        </div>
    );
}

export function BasicBankingPage({ project }: { project: Project }) {
    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            <ProjectHeader
                title="Basic Banking System"
                description="Simple login + transactions to learn full-stack fundamentals."
                techStack={['PHP', 'MySQL', 'HTML/CSS', 'Sessions']}
                githubUrl="https://github.com/jeyhemnani99/Basic-banking-system"
                badge={{ text: "Internship Project", variant: "purple" }}
            />

            {/* Transaction Flow Demo */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Transaction Flow</h2>
                    <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
                        <TransactionFlow />
                    </div>
                </div>
            </section>

            {/* Account Cards */}
            <section className="py-12 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Demo Accounts</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        <AccountCard name="John Doe" balance="$5,240.00" type="Savings" />
                        <AccountCard name="Jane Smith" balance="$12,100.50" type="Checking" />
                        <AccountCard name="Admin User" balance="$50,000.00" type="Admin" />
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Core Features</h2>
                    <div className="grid md:grid-cols-4 gap-4">
                        {[
                            { icon: Lock, name: "Authentication", desc: "Session-based login/logout" },
                            { icon: ArrowRightLeft, name: "Transfers", desc: "Send between accounts" },
                            { icon: CreditCard, name: "Balance View", desc: "Real-time account status" },
                            { icon: User, name: "Admin Panel", desc: "User management view" },
                        ].map((feat) => (
                            <div key={feat.name} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--accent)] transition-colors">
                                <feat.icon className="w-6 h-6 text-[var(--accent)] mb-3" />
                                <div className="text-sm font-medium text-[var(--text-primary)] mb-1">{feat.name}</div>
                                <div className="text-xs text-[var(--text-muted)]">{feat.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Architecture */}
            <section className="py-12 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Simple MVC Architecture</h2>
                    <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 rounded-xl bg-blue-500/10 flex items-center justify-center mb-2">
                                    <Code className="w-8 h-8 text-blue-500" />
                                </div>
                                <span className="text-sm font-medium text-[var(--text-primary)]">Views</span>
                                <span className="text-xs text-[var(--text-muted)]">HTML + PHP templates</span>
                            </div>
                            <div className="w-12 h-0.5 md:w-0.5 md:h-12 bg-[var(--border)]" />
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 rounded-xl bg-green-500/10 flex items-center justify-center mb-2">
                                    <Code className="w-8 h-8 text-green-500" />
                                </div>
                                <span className="text-sm font-medium text-[var(--text-primary)]">Controllers</span>
                                <span className="text-xs text-[var(--text-muted)]">PHP form handlers</span>
                            </div>
                            <div className="w-12 h-0.5 md:w-0.5 md:h-12 bg-[var(--border)]" />
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 rounded-xl bg-purple-500/10 flex items-center justify-center mb-2">
                                    <Database className="w-8 h-8 text-purple-500" />
                                </div>
                                <span className="text-sm font-medium text-[var(--text-primary)]">Models</span>
                                <span className="text-xs text-[var(--text-muted)]">MySQL queries</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Learnings */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Key Learnings</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <LearningPoint
                            title="SQL Injection Prevention"
                            description="Initially wrote vulnerable code, learned to use prepared statements and parameterized queries."
                        />
                        <LearningPoint
                            title="Session Management"
                            description="Understanding cookies, server-side storage, and stateless HTTP. Foundation for later JWT learning."
                        />
                        <LearningPoint
                            title="Database Design"
                            description="Primary keys, foreign keys, and why atomicity matters in financial transactions."
                        />
                        <LearningPoint
                            title="Form Validation"
                            description="Server-side validation is essential. Client-side validation alone isn't enough for security."
                        />
                    </div>
                </div>
            </section>

            {/* Design Choices */}
            <section className="py-12 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Design Choices</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                            <div className="text-sm font-medium text-[var(--text-primary)] mb-2">Procedural PHP {">"} Frameworks</div>
                            <div className="text-xs text-[var(--text-muted)]">Wanted to understand fundamentals before using abstractions like Laravel. This helped appreciate what frameworks do under the hood.</div>
                        </div>
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                            <div className="text-sm font-medium text-[var(--text-primary)] mb-2">Manual SQL {">"} ORM</div>
                            <div className="text-xs text-[var(--text-muted)]">Needed to learn SQL syntax, table relationships, and query optimization basics. Wrote JOIN queries by hand.</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-[var(--border)]">
                        <StatCard value="PHP" label="Backend" />
                        <StatCard value="MySQL" label="Database" />
                        <StatCard value="Feb '20" label="Built" />
                        <StatCard value="Internship" label="Context" />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-[var(--border)]">
                <div className="max-w-6xl mx-auto">
                    <span className="text-[var(--text-muted)]">Good primer on forms, security basics, and SQL operations</span>
                </div>
            </footer>
        </div>
    );
}
