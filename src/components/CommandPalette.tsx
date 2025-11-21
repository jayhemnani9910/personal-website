"use client";

import * as React from "react";
import { Command } from "cmdk";
import { Search, FileText, Code, User, Github, ExternalLink, Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { PROJECTS } from "@/data/projects";
import { useLenis } from "lenis/react";

interface CommandPaletteProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

export function CommandPalette({ open, setOpen }: CommandPaletteProps) {
    const router = useRouter();
    const lenis = useLenis();

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen(!open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, [setOpen, open]);

    const runCommand = React.useCallback((command: () => void) => {
        setOpen(false);
        command();
    }, [setOpen]);

    const handleNavigation = (href: string) => {
        runCommand(() => {
            if (href.startsWith("#")) {
                if (lenis) lenis.scrollTo(href, { offset: -100 });
                else router.push(href);
            } else {
                router.push(href);
            }
        });
    };

    const copyEmail = () => {
        navigator.clipboard.writeText("jay.hemnani@sjsu.edu");
        // Could add a toast here
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm pt-[20vh] px-4"
                    onClick={() => setOpen(false)}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 10 }}
                        transition={{ type: "spring", stiffness: 320, damping: 28 }}
                        className="w-full max-w-2xl overflow-hidden rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(10,10,10,0.8)] shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] backdrop-blur-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Command className="w-full bg-transparent">
                            <div className="flex items-center border-b border-[rgba(255,255,255,0.08)] px-4" cmdk-input-wrapper="">
                                <Search className="mr-2 h-5 w-5 shrink-0 text-[var(--color-text-muted)]" />
                                <Command.Input
                                    placeholder="Type a command or search..."
                                    className="flex h-14 w-full rounded-md bg-transparent py-3 text-base outline-none placeholder:text-[var(--color-text-muted)] text-[var(--color-text-primary)]"
                                />
                                <div className="flex gap-1">
                                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-1.5 font-mono text-[10px] font-medium text-[var(--color-text-muted)] opacity-100">
                                        <span className="text-xs">ESC</span>
                                    </kbd>
                                </div>
                            </div>
                            <Command.List className="max-h-[60vh] overflow-y-auto p-2 scroll-py-2">
                                <Command.Empty className="py-6 text-center text-sm text-[var(--color-text-muted)]">
                                    No results found.
                                </Command.Empty>

                                <Command.Group heading="Navigation" className="text-[var(--color-text-muted)] px-2 py-1.5 text-xs font-medium">
                                    <Command.Item
                                        onSelect={() => handleNavigation("/")}
                                        className="flex cursor-pointer select-none items-center rounded-md px-2 py-2 text-sm outline-none aria-selected:bg-[var(--color-bg-tertiary)] aria-selected:text-[var(--color-accent-primary)] text-[var(--color-text-secondary)]"
                                    >
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Home</span>
                                    </Command.Item>
                                    <Command.Item
                                        onSelect={() => handleNavigation("#projects")}
                                        className="flex cursor-pointer select-none items-center rounded-md px-2 py-2 text-sm outline-none aria-selected:bg-[var(--color-bg-tertiary)] aria-selected:text-[var(--color-accent-primary)] text-[var(--color-text-secondary)]"
                                    >
                                        <Code className="mr-2 h-4 w-4" />
                                        <span>Projects</span>
                                    </Command.Item>
                                    <Command.Item
                                        onSelect={() => handleNavigation("#experience")}
                                        className="flex cursor-pointer select-none items-center rounded-md px-2 py-2 text-sm outline-none aria-selected:bg-[var(--color-bg-tertiary)] aria-selected:text-[var(--color-accent-primary)] text-[var(--color-text-secondary)]"
                                    >
                                        <FileText className="mr-2 h-4 w-4" />
                                        <span>Experience</span>
                                    </Command.Item>
                                </Command.Group>

                                <Command.Separator className="my-1 h-px bg-[var(--color-border)]" />

                                <Command.Group heading="Projects" className="text-[var(--color-text-muted)] px-2 py-1.5 text-xs font-medium">
                                    {PROJECTS.map((project) => (
                                        <Command.Item
                                            key={project.id}
                                            onSelect={() => handleNavigation(`/projects/${project.id}`)}
                                            className="flex cursor-pointer select-none items-center rounded-md px-2 py-2 text-sm outline-none aria-selected:bg-[var(--color-bg-tertiary)] aria-selected:text-[var(--color-accent-primary)] text-[var(--color-text-secondary)]"
                                        >
                                            <Code className="mr-2 h-4 w-4 opacity-50" />
                                            <span>{project.title}</span>
                                        </Command.Item>
                                    ))}
                                </Command.Group>

                                <Command.Separator className="my-1 h-px bg-[var(--color-border)]" />

                                <Command.Group heading="Actions" className="text-[var(--color-text-muted)] px-2 py-1.5 text-xs font-medium">
                                    <Command.Item
                                        onSelect={() => runCommand(copyEmail)}
                                        className="flex cursor-pointer select-none items-center rounded-md px-2 py-2 text-sm outline-none aria-selected:bg-[var(--color-bg-tertiary)] aria-selected:text-[var(--color-accent-primary)] text-[var(--color-text-secondary)]"
                                    >
                                        <Copy className="mr-2 h-4 w-4" />
                                        <span>Copy Email</span>
                                        <span className="ml-auto text-xs opacity-50">jay.hemnani@sjsu.edu</span>
                                    </Command.Item>
                                    <Command.Item
                                        onSelect={() => runCommand(() => window.open("https://github.com/jeyhemnani99", "_blank"))}
                                        className="flex cursor-pointer select-none items-center rounded-md px-2 py-2 text-sm outline-none aria-selected:bg-[var(--color-bg-tertiary)] aria-selected:text-[var(--color-accent-primary)] text-[var(--color-text-secondary)]"
                                    >
                                        <Github className="mr-2 h-4 w-4" />
                                        <span>GitHub</span>
                                        <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
                                    </Command.Item>
                                </Command.Group>
                            </Command.List>
                            <div className="border-t border-[rgba(255,255,255,0.08)] px-4 py-2 flex items-center justify-between text-[10px] text-[var(--color-text-muted)]">
                                <div className="flex gap-2">
                                    <span>Select</span>
                                    <kbd className="font-mono bg-[rgba(255,255,255,0.05)] px-1 rounded">↵</kbd>
                                </div>
                                <div className="flex gap-2">
                                    <span>Navigate</span>
                                    <kbd className="font-mono bg-[rgba(255,255,255,0.05)] px-1 rounded">↑↓</kbd>
                                </div>
                            </div>
                        </Command>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
