"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mail, Github, Linkedin, Twitter, Youtube } from "lucide-react";
import MagneticButton from "./MagneticButton";
import { SOCIAL_LINKS } from "@/data/profile";
import { useTypewriterPlaceholder } from "@/hooks/useTypewriterPlaceholder";

interface FormErrors {
    name?: string;
    email?: string;
    message?: string;
}

// Placeholder phrases for typewriter effect (moved outside component)
const NAME_PHRASES = [
    "Tony Stark",
    "Future collaborator",
    "The next big thing",
    "Someone awesome",
    "A fellow builder",
    "Your name here :)",
];

const EMAIL_PHRASES = [
    "definitely.not.spam@gmail.com",
    "hire.me@please.com",
    "totally.real@email.com",
    "will.reply@promise.io",
    "not.a.bot@human.org",
    "your.actual@email.com",
];

const MESSAGE_PLACEHOLDER = `Hey Jay! I came across your portfolio and was impressed by your data engineering work. I'd love to chat about a potential opportunity...`;

// Social icon with brand-colored glow
function SocialIcon({ icon: Icon, href, label, glowColor }: {
    icon: typeof Github;
    href: string;
    label: string;
    glowColor: string;
}) {
    return (
        <MagneticButton>
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-300 hover:-translate-y-1.5"
                style={{
                    borderColor: 'var(--border)',
                }}
                aria-label={label}
            >
                <Icon
                    className="w-5 h-5 transition-all duration-300"
                    style={{
                        color: 'var(--text-secondary)',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = glowColor;
                        e.currentTarget.style.filter = `drop-shadow(0 0 8px ${glowColor}) drop-shadow(0 0 16px ${glowColor})`;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-secondary)';
                        e.currentTarget.style.filter = 'none';
                    }}
                />
            </a>
        </MagneticButton>
    );
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

    // Track focus state for each field
    const [focusedField, setFocusedField] = useState<string | null>(null);

    // Use the typewriter hook for animated placeholders
    const { text: namePlaceholder } = useTypewriterPlaceholder(NAME_PHRASES);
    const { text: emailPlaceholder } = useTypewriterPlaceholder(EMAIL_PHRASES, { typingSpeed: 70 });

    // Get placeholder based on focus state
    const getPlaceholder = (field: string, animatedPlaceholder: string, fallback: string) => {
        if (focusedField === field) return fallback;
        return animatedPlaceholder || fallback;
    };

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
            window.location.href = mailtoLink;
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

    const socialIcons = [
        { icon: Github, href: SOCIAL_LINKS.github, label: "GitHub", glowColor: "#ffffff" },
        { icon: Linkedin, href: SOCIAL_LINKS.linkedin, label: "LinkedIn", glowColor: "#0A66C2" },
        { icon: Youtube, href: SOCIAL_LINKS.youtube, label: "YouTube", glowColor: "#FF0000" },
        { icon: Twitter, href: SOCIAL_LINKS.twitter, label: "Twitter", glowColor: "#1DA1F2" }
    ];

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
                            {socialIcons.map((social) => (
                                <SocialIcon
                                    key={social.label}
                                    icon={social.icon}
                                    href={social.href}
                                    label={social.label}
                                    glowColor={social.glowColor}
                                />
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
                                    onFocus={() => setFocusedField("name")}
                                    onBlur={() => setFocusedField(null)}
                                    className={`input ${errors.name ? 'border-red-500 focus:border-red-500' : ''}`}
                                    placeholder={getPlaceholder("name", namePlaceholder, "Your name")}
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
                                    onFocus={() => setFocusedField("email")}
                                    onBlur={() => setFocusedField(null)}
                                    className={`input ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                                    placeholder={getPlaceholder("email", emailPlaceholder, "your@email.com")}
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
                                    rows={5}
                                    value={formState.message}
                                    onChange={(e) => {
                                        setFormState({ ...formState, message: e.target.value });
                                        if (errors.message) setErrors({ ...errors, message: undefined });
                                    }}
                                    onFocus={() => setFocusedField("message")}
                                    onBlur={() => setFocusedField(null)}
                                    className={`input resize-none ${errors.message ? 'border-red-500 focus:border-red-500' : ''}`}
                                    placeholder={focusedField === "message" ? "Tell me about your project..." : MESSAGE_PLACEHOLDER}
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
                                            Opening mail...
                                        </span>
                                    ) : isSent ? (
                                        <span>Check your mail app!</span>
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
                                {toastError ? toastError : "Your mail app should open now - just hit send!"}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
