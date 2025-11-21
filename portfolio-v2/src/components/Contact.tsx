"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Mail, Github, Linkedin, Twitter } from "lucide-react";
import MagneticButton from "./MagneticButton";
import { SOCIAL_LINKS } from "@/data/profile";

export function Contact() {
    const [formState, setFormState] = useState({
        name: "",
        email: "",
        message: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSubmitting(false);
        setIsSent(true);
        setFormState({ name: "", email: "", message: "" });
        setTimeout(() => setIsSent(false), 5000);
    };

    return (
        <section id="contact" className="relative section-block section-shell overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
                {/* Left Column: Info & Socials */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8 leading-[0.9]">
                        Let&apos;s build <br />
                        <span className="text-[var(--color-text-muted)]">something</span> <br />
                        <span className="text-[var(--color-accent-primary)]">extraordinary.</span>
                    </h2>

                    <p className="text-xl text-[var(--color-text-secondary)] mb-12 max-w-md leading-relaxed">
                        Open for collaborations, freelance projects, or just a chat about the future of data engineering.
                    </p>

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
                                    disabled={isSubmitting || isSent}
                                    className="w-full py-4 rounded-xl bg-[var(--color-text-primary)] text-[var(--color-bg-primary)] font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <span className="animate-pulse">Sending...</span>
                                    ) : isSent ? (
                                        <span>Message Sent!</span>
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
        </section>
    );
}
