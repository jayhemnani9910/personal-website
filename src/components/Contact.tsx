"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Mail, Github, Linkedin, Twitter, Youtube } from "lucide-react";
import MagneticButton from "./MagneticButton";
import { SOCIAL_LINKS } from "@/data/profile";
// import { sendEmail } from "@/actions/sendEmail"; // Removed for static export

export function Contact() {
    const [formState, setFormState] = useState({
        name: "",
        email: "",
        message: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.name.trim() || !formState.email.trim() || !formState.message.trim()) {
            setError("Please fill in all fields.");
            return;
        }
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formState.email)) {
            setError("Enter a valid email address.");
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setIsSent(false);

        const subject = `Portfolio Contact from ${formState.name}`;
        const body = `Name: ${formState.name}\nEmail: ${formState.email}\n\nMessage:\n${formState.message}`;
        const mailtoLink = `mailto:${SOCIAL_LINKS.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        try {
            const opened = window.open(mailtoLink, "_self");
            if (opened === null) {
                throw new Error("Mail client blocked");
            }
            setIsSent(true);
            setFormState({ name: "", email: "", message: "" });
            setTimeout(() => setIsSent(false), 4000);
        } catch {
            setError("Couldn't open your mail app. Email me directly at " + SOCIAL_LINKS.email);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="contact" className="relative section-block section-shell overflow-hidden scroll-mt-28 md:scroll-mt-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
                {/* Left Column: Info & Socials */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-5xl md:text-7xl heading-premium-lg mb-8">
                        Let&apos;s Build <br />
                        <span className="text-[var(--color-accent-primary)]">Something</span>
                    </h2>

                    <p className="text-lg text-[var(--color-text-secondary)] mb-8 max-w-md">
                        Currently open to full-time roles and select freelance projects.
                    </p>

                    {/* CTA Options */}
                    <div className="flex flex-col gap-4 mb-12">
                        <MagneticButton>
                            <a
                                href={`mailto:${SOCIAL_LINKS.email}?subject=Full-Time Opportunity`}
                                className="glass-card p-6 rounded-2xl border border-[rgba(255,255,255,0.1)] hover:border-[var(--color-accent-primary)] transition-all group block"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
                                            Hire Me Full-Time
                                        </h3>
                                        <p className="text-sm text-[var(--color-text-secondary)]">
                                            Looking for a Data Engineer to join your team
                                        </p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center group-hover:bg-[var(--color-accent-primary)] transition-colors duration-300 flex-shrink-0">
                                        <Mail className="w-5 h-5 text-[var(--color-text-primary)]" />
                                    </div>
                                </div>
                            </a>
                        </MagneticButton>

                        <MagneticButton>
                            <a
                                href={`mailto:${SOCIAL_LINKS.email}?subject=Freelance Project Inquiry`}
                                className="glass-card p-6 rounded-2xl border border-[rgba(255,255,255,0.1)] hover:border-[var(--color-accent-primary)] transition-all group block"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
                                            Freelance Project
                                        </h3>
                                        <p className="text-sm text-[var(--color-text-secondary)]">
                                            Contract work and consulting engagements
                                        </p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center group-hover:bg-[var(--color-accent-primary)] transition-colors duration-300 flex-shrink-0">
                                        <Mail className="w-5 h-5 text-[var(--color-text-primary)]" />
                                    </div>
                                </div>
                            </a>
                        </MagneticButton>
                    </div>

                    <div className="flex flex-col gap-6">
                        <a
                            href={`mailto:${SOCIAL_LINKS.email}`}
                            className="flex items-center gap-4 group"
                        >
                            <div className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.05)] flex items-center justify-center group-hover:bg-[var(--color-accent-primary)] transition-colors duration-300">
                                <Mail className="w-5 h-5 text-[var(--color-text-primary)]" />
                            </div>
                            <div>
                                <p className="text-sm text-[var(--color-text-muted)]">Email Me</p>
                                <p className="text-lg font-medium text-[var(--color-text-primary)]">{SOCIAL_LINKS.email}</p>
                            </div>
                        </a>

                        <div className="flex gap-4 mt-4">
                            {[
                                { icon: Github, href: SOCIAL_LINKS.github, label: "GitHub" },
                                { icon: Linkedin, href: SOCIAL_LINKS.linkedin, label: "LinkedIn" },
                                { icon: Youtube, href: SOCIAL_LINKS.youtube, label: "YouTube" },
                                { icon: Twitter, href: SOCIAL_LINKS.twitter, label: "Twitter" }
                            ].map((social) => (
                                <MagneticButton key={social.label}>
                                    <a
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-12 h-12 rounded-full border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[rgba(255,255,255,0.05)] transition-all"
                                        aria-label={social.label}
                                    >
                                        <social.icon className="w-5 h-5" />
                                    </a>
                                </MagneticButton>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Right Column: Form */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="relative"
                >
                    <div className="glass-card p-8 md:p-10 rounded-3xl">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium text-[var(--color-text-secondary)]">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    required
                                    value={formState.name}
                                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] focus:border-[var(--color-accent-primary)] focus:bg-[rgba(255,255,255,0.05)] outline-none transition-all text-[var(--color-text-primary)]"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium text-[var(--color-text-secondary)]">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    required
                                    value={formState.email}
                                    onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] focus:border-[var(--color-accent-primary)] focus:bg-[rgba(255,255,255,0.05)] outline-none transition-all text-[var(--color-text-primary)]"
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="message" className="text-sm font-medium text-[var(--color-text-secondary)]">Message</label>
                                <textarea
                                    id="message"
                                    required
                                    rows={4}
                                    value={formState.message}
                                    onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] focus:border-[var(--color-accent-primary)] focus:bg-[rgba(255,255,255,0.05)] outline-none transition-all text-[var(--color-text-primary)] resize-none"
                                    placeholder="Tell me about your project..."
                                />
                            </div>

                            <MagneticButton>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-4 rounded-xl bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <span className="animate-pulse">Opening mail app…</span>
                                    ) : isSent ? (
                                        <span>Mail app opened</span>
                                    ) : (
                                        <>
                                            Send Message
                                            <Send className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </MagneticButton>
                        </form>
                    </div>
                </motion.div>
            </div>

            {/* Toast Notification */}
            {(isSent || error) && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className={`fixed bottom-8 right-8 px-6 py-4 rounded-xl border backdrop-blur-md z-50 ${error
                        ? "bg-red-500/10 border-red-500/20 text-red-400"
                        : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        }`}
                    aria-live="polite"
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${error ? "bg-red-500" : "bg-emerald-500"}`} />
                        <p className="font-medium">
                            {error ? error : "Opening your mail app… If nothing happens, email me directly at " + SOCIAL_LINKS.email}
                        </p>
                    </div>
                </motion.div>
            )}
        </section>
    );
}
