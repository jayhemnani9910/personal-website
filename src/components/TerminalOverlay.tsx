"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { m, AnimatePresence } from "framer-motion";
import { useTerminal } from "@/context/TerminalContext";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "next/navigation";
import { EASE, DUR } from "@/lib/motion-tokens";
import { FEATURED, buildReceipts } from "@/data/home";
import { SITE_CONFIG } from "@/../content/site";
import { WEBMCP_TOOL_COUNT } from "@/lib/webmcp";

// All available commands for tab-completion. `exit` is not advertised in
// `help` or the chip row (the design has no such command), but it is kept
// working: see the Enter handler below.
const COMMANDS = [
    "help", "brief", "whoami", "ls", "open", "receipts", "contact",
    "theme", "cube", "joke", "sudo", "rm", "clear", "exit",
];

// Shown above the input. Each is a command the shell actually runs, so the
// row doubles as the discoverable half of `help`. Verbatim from the design.
const CHIPS = ["help", "brief we have data nobody trusts", "ls", "receipts", "cube", "joke", "theme"];

type ColorKey = "text" | "mute" | "faint" | "accent" | "ok";

const TEXT_COLOR: Record<ColorKey, string> = {
    text: "text-tr-text",
    mute: "text-tr-text-mute",
    faint: "text-tr-text-faint",
    accent: "text-tr-accent",
    ok: "text-tr-ok",
};

type Line = { text: string; color: ColorKey; icon: string; iconColor: ColorKey };

const line = (text: string, color: ColorKey = "mute", icon = " ", iconColor: ColorKey = "faint"): Line => ({
    text,
    color,
    icon,
    iconColor,
});
const ok = (text: string): Line => line(text, "text", "✓", "ok");
const info = (text: string): Line => line(text, "text", "·", "faint");
const warn = (text: string): Line => line(text, "mute", "!", "accent");
const err = (text: string): Line => line(text, "text", "✗", "accent");

// The shell's greeting, printed once on mount. Verbatim from the design.
const INITIAL_LINES: Line[] = [
    line("hey. this is a real shell, minus the part where you can break anything.", "text", "☺", "accent"),
    line("try a chip above, or type `brief we have data nobody trusts`"),
];

export function TerminalOverlay({ projectCount }: { projectCount: number }) {
    const { isOpen, closeTerminal } = useTerminal();
    const { theme, toggleTheme } = useTheme();
    const [input, setInput] = useState("");
    const [history, setHistory] = useState<Line[]>(INITIAL_LINES);
    const inputRef = useRef<HTMLInputElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const previouslyFocusedRef = useRef<HTMLElement | null>(null);
    const router = useRouter();

    // Command history for arrow key navigation
    const cmdHistoryRef = useRef<string[]>([]);
    const historyIndexRef = useRef(-1);

    // Focuses the input once the panel has finished sliding in, matching the
    // comp's own 380ms delay rather than fighting the entrance transition.
    useEffect(() => {
        if (!isOpen) return;
        const t = window.setTimeout(() => inputRef.current?.focus(), 380);
        return () => window.clearTimeout(t);
    }, [isOpen]);

    // Dialog semantics: remember what had focus before opening (to restore
    // it on close), trap Tab/Shift+Tab inside the panel, and close on
    // Escape. Re-runs each time the dialog opens or closes.
    useEffect(() => {
        if (!isOpen) return;
        previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

        const getFocusable = () => {
            if (!panelRef.current) return [];
            return Array.from(
                panelRef.current.querySelectorAll<HTMLElement>(
                    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
                )
            ).filter((el) => el.offsetParent !== null);
        };

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                closeTerminal();
                return;
            }
            if (e.key === "Tab") {
                const focusable = getFocusable();
                if (focusable.length === 0) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            previouslyFocusedRef.current?.focus();
        };
    }, [isOpen, closeTerminal]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history]);

    const handleCommand = useCallback((raw: string) => {
        const trimmed = raw.trim();
        if (!trimmed) {
            setHistory([]);
            setInput("");
            return;
        }

        cmdHistoryRef.current.push(trimmed);
        historyIndexRef.current = -1;

        const sp = trimmed.indexOf(" ");
        const command = (sp < 0 ? trimmed : trimmed.slice(0, sp)).toLowerCase();
        const rest = sp < 0 ? "" : trimmed.slice(sp + 1).trim();

        if (command === "clear") {
            setHistory([]);
            setInput("");
            return;
        }

        const echo = line(trimmed, "text", "❯", "faint");
        let out: Line[];

        switch (command) {
            case "help":
                out = [
                    line("things that work here:", "mute", "?", "accent"),
                    info(`${"brief <text>".padEnd(15)}run the decomposer on your problem`),
                    info(`${"ls".padEnd(15)}the six featured projects`),
                    info(`${"open <1-6>".padEnd(15)}one project, in three lines`),
                    info(`${"receipts".padEnd(15)}every number on this page, with source`),
                    line("whoami · contact · theme · cube · joke · clear"),
                ];
                break;
            case "brief": {
                const text = rest.replace(/^"|"$/g, "");
                if (!text) {
                    out = [warn("brief <your vague problem>. The vaguer the better, honestly.")];
                    break;
                }
                out = [ok("Running the decomposer up top.")];
                closeTerminal();
                if (window.location.pathname !== "/") router.push("/");
                window.setTimeout(() => {
                    window.dispatchEvent(new CustomEvent("v4:brief", { detail: text }));
                    window.location.hash = "brief";
                }, 60);
                break;
            }
            case "whoami":
                out = [
                    ok("Jay Hemnani, Forward Deployed Engineer. Gujarat, IN. Relocating."),
                    line("you, however, remain a mystery."),
                ];
                break;
            case "ls": {
                const more = projectCount - FEATURED.length;
                out = [
                    ...FEATURED.map((p) => info(`${p.num}  ${p.title.padEnd(26)} ${p.tech.slice(0, 3).join(", ")}`)),
                    line(`… ${more} more at /work`),
                ];
                break;
            }
            case "open": {
                const p = FEATURED[(parseInt(rest, 10) || 0) - 1];
                out = p
                    ? [ok(p.title), line(`arrived as: ${p.arrived}`), line(`did: ${p.did}`), line(p.changed, "ok", "✓", "ok")]
                    : [warn("open <1-6>. six, not seven. i checked.")];
                break;
            }
            case "receipts":
                // Both of buildReceipts's dynamic inputs are honestly available
                // here: projectCount arrives as a prop (see layout.tsx), and
                // WEBMCP_TOOL_COUNT is a static array length, not a fs read.
                out = buildReceipts({ projectCount, toolCount: WEBMCP_TOOL_COUNT }).map((r) => info(`${r.n.padEnd(5)} ${r.label}`));
                break;
            case "contact":
                out = [
                    ok(SITE_CONFIG.social.email),
                    line(`${SITE_CONFIG.social.github.replace(/^https:\/\//, "")} · ${SITE_CONFIG.social.linkedin.replace(/^https:\/\//, "")}`),
                ];
                break;
            case "theme": {
                const next = theme === "dark" ? "light" : "dark";
                toggleTheme();
                out = [ok(`theme → ${next}. your retinas thank you. or not.`)];
                break;
            }
            case "cube":
                out = [ok("Scrambling the cube in section 03.")];
                closeTerminal();
                if (window.location.pathname !== "/") router.push("/");
                window.setTimeout(() => {
                    window.dispatchEvent(new Event("v4:cube"));
                    window.location.hash = "method";
                }, 60);
                break;
            case "joke":
                out = [line("a data pipeline walks into a bar. the bartender says: we don't serve your type here. the pipeline casts itself to string.", "text", "☺", "accent")];
                break;
            case "sudo":
                out = [err("nice try. this shell runs on trust and yellow.")];
                break;
            case "rm":
                out = [err("not a chance. it took me four years to build this.")];
                break;
            case "exit":
                out = [];
                closeTerminal();
                break;
            default:
                out = [err(`command not found: ${command}. try help, it's the one command everyone skips.`)];
        }

        setHistory((prev) => [...prev, echo, ...out]);
        setInput("");
    }, [closeTerminal, router, projectCount, theme, toggleTheme]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            // Without this, a command that closes the overlay reopens it
            // immediately. Closing restores focus to whatever opened the
            // dialog, which is the header's shell button, and Enter's default
            // action then activates that newly focused button on keyup. The
            // dialog looked like it ignored `exit` entirely.
            e.preventDefault();
            handleCommand(input);
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            const cmds = cmdHistoryRef.current;
            if (cmds.length === 0) return;
            const newIndex = historyIndexRef.current === -1
                ? cmds.length - 1
                : Math.max(0, historyIndexRef.current - 1);
            historyIndexRef.current = newIndex;
            setInput(cmds[newIndex]);
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            const cmds = cmdHistoryRef.current;
            if (historyIndexRef.current === -1) return;
            const newIndex = historyIndexRef.current + 1;
            if (newIndex >= cmds.length) {
                historyIndexRef.current = -1;
                setInput("");
            } else {
                historyIndexRef.current = newIndex;
                setInput(cmds[newIndex]);
            }
        } else if (e.key === "Tab") {
            e.preventDefault();
            if (!input) return;
            const match = COMMANDS.find((c) => c.startsWith(input.toLowerCase()));
            if (match) setInput(match);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <m.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 24 }}
                    transition={{ duration: DUR.base, ease: EASE }}
                    className="fixed inset-0 z-[var(--tr-z-overlay)] flex items-end justify-center bg-black/40 px-[clamp(1rem,4vw,2rem)] pb-6"
                    onClick={closeTerminal}
                >
                    <div
                        ref={panelRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label="jay's shell"
                        className="w-[min(880px,100%)] overflow-hidden rounded-[var(--tr-r-xl)] border border-tr-hairline bg-tr-surface-1 shadow-[0_40px_100px_-30px_rgba(0,0,0,.7)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Window header */}
                        <div className="flex h-11 items-center gap-3 border-b border-tr-hairline px-4 font-mono text-[length:var(--tr-t-mono)] text-tr-text-mute">
                            <span aria-hidden="true" className="flex gap-[5px]">
                                <i className="block h-[9px] w-[9px] rounded-full bg-[#FF5F57]" />
                                <i className="block h-[9px] w-[9px] rounded-full bg-[#FEBC2E]" />
                                <i className="block h-[9px] w-[9px] rounded-full bg-[#28C840]" />
                            </span>
                            <span className="text-tr-text">{"jay's shell"}</span>
                            <span className="text-tr-text-faint">· no sudo required</span>
                            <button
                                type="button"
                                onClick={closeTerminal}
                                className="ml-auto cursor-pointer border-0 bg-transparent text-tr-text-mute hover:text-tr-accent"
                            >
                                esc ✕
                            </button>
                        </div>

                        {/* Chips: the discoverable half of `help`. Each runs a
                            real command, so nothing here can drift from the
                            dispatcher above. */}
                        <div className="flex flex-wrap gap-[.4rem] border-b border-tr-hairline bg-tr-bg px-4 py-3">
                            {CHIPS.map((chip) => (
                                <button
                                    key={chip}
                                    type="button"
                                    onClick={() => handleCommand(chip)}
                                    className="h-[26px] cursor-pointer rounded-full border border-tr-hairline bg-tr-surface-1 px-[.65rem] font-mono text-[length:var(--tr-t-mono-xs)] text-tr-text-mute hover:border-tr-accent hover:text-tr-text"
                                >
                                    {chip}
                                </button>
                            ))}
                        </div>

                        {/* Shell body. 12.5px is a literal: none of the four
                            mono tokens (12/11.5/11/10.5) matches the comp's
                            body size, and it has exactly one call site. */}
                        <div
                            className="h-[280px] overflow-y-auto p-4 font-mono text-[12.5px] leading-[var(--tr-lh-shell)]"
                            onClick={() => inputRef.current?.focus()}
                        >
                            {history.map((entry, i) => (
                                <div
                                    key={i}
                                    className={`grid grid-cols-[1.4rem_minmax(0,1fr)] gap-[.4rem] whitespace-pre-wrap ${TEXT_COLOR[entry.color]}`}
                                >
                                    <span className={TEXT_COLOR[entry.iconColor]}>{entry.icon}</span>
                                    <span>{entry.text}</span>
                                </div>
                            ))}

                            <div className="grid grid-cols-[1.4rem_minmax(0,1fr)] items-center gap-[.4rem]">
                                <span className="text-tr-accent">❯</span>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="type something, or hit a chip above"
                                    className="border-0 bg-transparent p-0 text-tr-text outline-none"
                                    spellCheck={false}
                                    autoComplete="off"
                                    aria-label="Terminal command input"
                                />
                            </div>
                            <div ref={bottomRef} />
                        </div>
                    </div>
                </m.div>
            )}
        </AnimatePresence>
    );
}
