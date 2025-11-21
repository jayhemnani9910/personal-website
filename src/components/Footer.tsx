"use client";

import { NAV_LINKS } from "@/data/navigation";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="py-12 border-t border-[rgba(255,255,255,0.05)]">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <span className="font-mono font-bold text-lg text-[var(--color-text-primary)]">Jay Hemnani</span>
                        <p className="text-sm text-[var(--color-text-muted)]">
                            &copy; {currentYear} All rights reserved.
                        </p>
                    </div>

                    <div className="flex gap-8">
                        {NAV_LINKS.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
