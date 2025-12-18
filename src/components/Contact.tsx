"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mail, Github, Linkedin, Twitter, Youtube } from "lucide-react";
import MagneticButton from "./MagneticButton";
import { SOCIAL_LINKS } from "@/data/profile";

interface FormErrors {
    name?: string;
    email?: string;
    message?: string;
}

export function Contact() {
    const [formState, setFormState] = useState({
        name: "",
        email: "",
        message: ""
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [toastError, setToastError] = useState<string | null>(null);

    const validateField = (name: string, value: string): string => {
        switch (name) {
            case "name":
                if (!value.trim()) return "Name is required";
                if (value.trim().length < 2) return "Name must be at least 2 characters";
                return "";
            case "email":
                if (!value.trim()) return "Email is required";
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email";
                return "";
            case "message":
                if (!value.trim()) return "Message is required";
                if (value.trim().length < 10) return "Message must be at least 10 characters";
                return "";
            default:
                return "";
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        const nameError = validateField("name", formState.name);
        const emailError = validateField("email", formState.email);
        const messageError = validateField("message", formState.message);

        if (nameError) newErrors.name = nameError;
        if (emailError) newErrors.email = emailError;
        if (messageError) newErrors.message = messageError;

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        setToastError(null);
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
            setErrors({});
            setTimeout(() => setIsSent(false), 4000);
        } catch {
            setToastError("Couldn't open your mail app. Email me directly at " + SOCIAL_LINKS.email);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="contact" className="section-block section-shell scroll-mt-28 md:scroll-mt-32">
            {/* Section Divider */}
            <div className="mb-12">
                <div className="h-px bg-[var(--border)]" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
                {/* Left Column: Info & Socials */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col justify-center"
                >
                    <h2 className="title-hero mb-8">
                        Let&apos;s Build <br />
                        <span style={{ color: 'var(--accent)' }}>Something</span>
                    </h2>

                    <p className="body-lg mb-8 max-w-md">
                        Currently open to full-time roles and select freelance projects.
                    </p>

                    {/* CTA */}
                    <div className="mb-12">
                        <MagneticButton>
                            <a
                                href={`mailto:${SOCIAL_LINKS.email}?subject=Full-Time Opportunity`}
                                className="card card-interactive p-6 block"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                                            Hire Me Full-Time
                                        </h3>
                                        <p className="body-sm">
                                            Looking for a Data Engineer to join your team
                                        </p>
                                    </div>
                                    <Mail className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                                </div>
                            </a>
                        </MagneticButton>
                    </div>

                    <div className="flex flex-col gap-6">
                        <a
                            href={`mailto:${SOCIAL_LINKS.email}`}
                            className="flex items-center gap-3 group"
                        >
                            <Mail className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                            <span className="body-base font-medium group-hover:text-[var(--accent)] transition-colors" style={{ color: 'var(--text-primary)' }}>
                                {SOCIAL_LINKS.email}
                            </span>
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
                                        className="w-12 h-12 rounded-full border flex items-center justify-center transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                                        style={{
                                            borderColor: 'var(--border)',
                                            color: 'var(--text-secondary)'
                                        }}
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
                    className="flex items-center"
                >
                    <div className="card card-interactive p-8 md:p-10 w-full">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label
                                    htmlFor="name"
                                    className="body-sm font-medium"
                                >
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={formState.name}
                                    onChange={(e) => {
                                        setFormState({ ...formState, name: e.target.value });
                                        if (errors.name) setErrors({ ...errors, name: undefined });
                                    }}
                                    className={`input ${errors.name ? 'border-red-500 focus:border-red-500' : ''}`}
                                    placeholder="John Doe"
                                />
                                <AnimatePresence>
                                    {errors.name && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            className="text-sm text-red-500"
                                        >
                                            {errors.name}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="email"
                                    className="body-sm font-medium"
                                >
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={formState.email}
                                    onChange={(e) => {
                                        setFormState({ ...formState, email: e.target.value });
                                        if (errors.email) setErrors({ ...errors, email: undefined });
                                    }}
                                    className={`input ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                                    placeholder="john@example.com"
                                />
                                <AnimatePresence>
                                    {errors.email && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            className="text-sm text-red-500"
                                        >
                                            {errors.email}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="space-y-2">
                                <label
                                    htmlFor="message"
                                    className="body-sm font-medium"
                                >
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    rows={4}
                                    value={formState.message}
                                    onChange={(e) => {
                                        setFormState({ ...formState, message: e.target.value });
                                        if (errors.message) setErrors({ ...errors, message: undefined });
                                    }}
                                    className={`input resize-none ${errors.message ? 'border-red-500 focus:border-red-500' : ''}`}
                                    placeholder="Tell me about your project..."
                                />
                                <AnimatePresence>
                                    {errors.message && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            className="text-sm text-red-500"
                                        >
                                            {errors.message}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>

                            <MagneticButton>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn btn-primary w-full py-4 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Sending...
                                        </span>
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
            <AnimatePresence>
                {(isSent || toastError) && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-8 right-8 px-6 py-4 rounded-xl border backdrop-blur-md z-50"
                        style={{
                            background: toastError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            borderColor: toastError ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)',
                            color: toastError ? '#ef4444' : '#10b981'
                        }}
                        aria-live="polite"
                    >
                        <div className="flex items-center gap-3">
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ background: toastError ? '#ef4444' : '#10b981' }}
                            />
                            <p className="font-medium">
                                {toastError ? toastError : "Opening your mail app... If nothing happens, email me directly at " + SOCIAL_LINKS.email}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
