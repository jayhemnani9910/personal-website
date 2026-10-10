"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { m, AnimatePresence } from "framer-motion";
import { useLenis } from "lenis/react";
import { useTerminal } from "@/context/TerminalContext";
import { EASE, DUR } from "@/lib/motion-tokens";
import { FEATURED, buildReceipts } from "@/data/home";
import { SITE_CONFIG } from "@/../content/site";
import { WEBMCP_TOOL_COUNT } from "@/lib/webmcp-tools";
import { scrollBehavior } from "@/lib/scroll";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { readEggs } from "@/components/home-desk/deskStore";
import { SECRETS } from "@/components/home-desk/secrets";
import { DOT, DOTS } from "@/components/desk";

// All available commands for tab-completion. `exit` is not advertised in
// `help` or the chip row (the design has no such command), but it is kept
// working: see the Enter handler below.
const COMMANDS = [
    "help", "whoami", "ls", "open", "receipts", "contact",
    "eggs", "joke", "sudo", "rm", "clear", "exit",
];

// Shown above the input. Each is a command the shell actually runs, so the
// row doubles as the discoverable half of `help`.
const CHIPS = ["help", "ls", "receipts", "eggs", "joke"];

type ColorKey = "text" | "mute" | "faint" | "accent" | "ok" | "err";

// The shell is an ink panel, so every colour is an on-ink one. Tomato is a fill
// on paper (3.11:1) but clears 4.78:1 on ink, so the error glyph may wear it;
// tokens.test.ts checks that pair.
const TEXT_COLOR: Record<ColorKey, string> = {
    text: "text-tr-on-ink",
    mute: "text-tr-on-ink-mute",
    faint: "text-tr-on-ink-faint",
    accent: "text-tr-butter",
    ok: "text-tr-mint",
    // Tomato on ink is 4.78:1, checked in tokens.test.ts. The utility form is
    // spelled out because the fill-accent text utility is banned on paper.
    err: "text-[color:var(--tr-accent)]",
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
const err = (text: string): Line => line(text, "text", "✗", "err");

// The shell's greeting, printed once on mount.
const INITIAL_LINES: Line[] = [
    line("hey. this is a real shell, minus the part where you can break anything.", "text", "☺", "accent"),
    line("try a chip above, or type `eggs`"),
];

export function TerminalOverlay({ projectCount }: { projectCount: number }) {
    const { isOpen, closeTerminal } = useTerminal();
    // The 24px slide is motion; under reduced motion or reader mode it only fades.
    const slide = usePrefersReducedMotion() ? 0 : 24;
    const [input, setInput] = useState("");
    const [history, setHistory] = useState<Line[]>(INITIAL_LINES);
    const inputRef = useRef<HTMLInputElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const previouslyFocusedRef = useRef<HTMLElement | null>(null);

    // Command history for arrow key navigation
    const cmdHistoryRef = useRef<string[]>([]);
    const historyIndexRef = useRef(-1);

    // A modal keeps the page behind it still: no native scroll, and on the home
    // page no Lenis wheel either. The gutter stays, so nothing shifts sideways.
    const lenis = useLenis();
    useEffect(() => {
        if (!isOpen) return;
        const html = document.documentElement;
        const { overflow, scrollbarGutter } = html.style;
        html.style.overflow = "hidden";
        html.style.scrollbarGutter = "stable";
        lenis?.stop();
        return () => {
            html.style.overflow = overflow;
            html.style.scrollbarGutter = scrollbarGutter;
            // Leaving / while open destroys this Lenis first, and starting a
            // destroyed one would put its class back on <html>. A live Lenis
            // always keeps the "lenis" class there.
            if (html.classList.contains("lenis")) lenis?.start();
        };
    }, [isOpen, lenis]);

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
            // defaultPrevented: the input already used this Tab to complete a
            // command, so focus must stay where it is.
            if (e.key === "Tab" && !e.defaultPrevented) {
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
        bottomRef.current?.scrollIntoView({ behavior: scrollBehavior() });
    }, [history]);

    const handleCommand = useCallback((raw: string) => {
        const trimmed = raw.trim();
        // An empty line echoes an empty prompt, as a shell does. Only `clear`
        // wipes the log.
        if (!trimmed) {
            setHistory((prev) => [...prev, line("", "text", "❯", "faint")]);
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
                    info(`${"ls".padEnd(15)}the six featured projects`),
                    info(`${"open <1-6>".padEnd(15)}one project, in three lines`),
                    info(`${"receipts".padEnd(15)}the headline numbers, with their sources`),
                    info(`${"eggs".padEnd(15)}the home page's secrets, found and not`),
                    line("whoami · contact · joke · clear"),
                ];
                break;
            case "whoami":
                out = [
                    ok("Jay Hemnani, Forward Deployed Engineer. Gujarat, IN. Open to relocate."),
                    line("you, however, remain a mystery."),
                ];
                break;
            case "ls": {
                const more = projectCount - FEATURED.length;
                out = [
                    ...FEATURED.map((p) => info(`${p.num}  ${p.title.padEnd(26)} ${p.tech.slice(0, 3).join(", ")}`)),
                    line(`… ${more} more at /projects`),
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
                // Each figure with the link it rests on: the last line of its
                // receipt is the broadest source (the search, the paper, the file).
                out = buildReceipts({ projectCount, toolCount: WEBMCP_TOOL_COUNT }).flatMap((r) => {
                    const source = r.lines.at(-1)?.href.replace(/^https:\/\//, "");
                    return [info(`${r.n.padEnd(5)} ${r.label}`), ...(source ? [line(`${"".padEnd(5)} source: ${source}`)] : [])];
                });
                break;
            case "contact":
                out = [
                    ok(SITE_CONFIG.social.email),
                    line(`${SITE_CONFIG.social.github.replace(/^https:\/\//, "")} · ${SITE_CONFIG.social.linkedin.replace(/^https:\/\//, "")}`),
                ];
                break;
            case "eggs": {
                const found = readEggs();
                out = [
                    line(`${found.length}/${SECRETS.length} secrets found on the home page.`, "mute", "★", "accent"),
                    ...SECRETS.map((s) =>
                        found.includes(s.id) ? ok(`${s.title.padEnd(12)}${s.hint}`) : info(`${"???".padEnd(12)}${s.hint}`),
                    ),
                ];
                break;
            }
            case "joke":
                out = [line("a data pipeline walks into a bar. the bartender says: we don't serve your type here. the pipeline casts itself to string.", "text", "☺", "accent")];
                break;
            case "sudo":
                out = [err("nice try. this shell runs on trust and tomato.")];
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
    }, [closeTerminal, projectCount]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            // Without this, a command that closes the overlay reopens it
            // immediately. Closing restores focus to whatever opened the
            // dialog, such as the footer's shell button, and Enter's default
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
        } else if (e.key === "Tab" && !e.shiftKey && input) {
            // Only a Tab that completes something stays in the input. Any
            // other Tab (or Shift+Tab) moves focus as usual.
            const match = COMMANDS.find((c) => c.startsWith(input.toLowerCase()));
            if (match && match !== input) {
                e.preventDefault();
                setInput(match);
            }
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <m.div
                    initial={{ opacity: 0, y: slide }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: slide }}
                    transition={{ duration: DUR.base, ease: EASE }}
                    // w-screen, not right-0: with the page's scrollbar gutter
                    // kept, right-0 would leave that strip undimmed.
                    className="fixed inset-y-0 left-0 z-[var(--tr-z-overlay)] flex w-screen items-end justify-center bg-tr-text/45 px-[clamp(1rem,4vw,2rem)] pb-6"
                    onClick={closeTerminal}
                >
                    <div
                        ref={panelRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label="jay's shell"
                        // Lenis (home page smooth scroll) takes every wheel event
                        // unless an ancestor opts out, so without this the page
                        // behind the modal scrolled instead of the log.
                        data-lenis-prevent
                        // An ink shadow would vanish against the scrim, so this
                        // one panel throws a butter one.
                        className="ink-panel w-[min(880px,100%)] overflow-hidden rounded-[var(--tr-r-2xl)] border-[1.5px] border-tr-on-ink-line bg-tr-text text-tr-on-ink shadow-[8px_8px_0_var(--tr-butter)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Window header */}
                        <div className="flex h-12 items-center gap-3 border-b-[1.5px] border-tr-on-ink-line px-4 font-mono text-[13px] text-tr-on-ink-mute">
                            <span aria-hidden="true" className="flex gap-1.5">
                                {DOTS.slice(0, 3).map((c) => (
                                    <i key={c} className={`${DOT} size-3`} style={{ background: c }} />
                                ))}
                            </span>
                            <span className="font-semibold text-tr-on-ink">{"jay's shell"}</span>
                            <span className="hidden text-tr-on-ink-faint sm:inline">· no sudo required</span>
                            <button
                                type="button"
                                onClick={closeTerminal}
                                aria-label="Close shell"
                                className="ml-auto cursor-pointer border-0 bg-transparent text-tr-on-ink-mute hover:text-tr-butter"
                            >
                                <span aria-hidden="true">esc ✕</span>
                            </button>
                        </div>

                        {/* Chips: the discoverable half of `help`. Each runs a
                            real command, so nothing here can drift from the
                            dispatcher above. */}
                        <div className="flex flex-wrap gap-2 border-b-[1.5px] border-tr-on-ink-line px-4 py-3">
                            {CHIPS.map((chip) => (
                                <button
                                    key={chip}
                                    type="button"
                                    onClick={() => handleCommand(chip)}
                                    className="cursor-pointer rounded-full border-[1.5px] border-tr-on-ink-line px-3 py-1 font-mono text-[12px] text-tr-on-ink hover:border-tr-butter hover:text-tr-butter"
                                >
                                    {chip}
                                </button>
                            ))}
                        </div>

                        {/* Shell body. 12.5px is a literal: none of the four
                            mono tokens (12/11.5/11/10.5) matches the comp's
                            body size, and it has exactly one call site. */}
                        <div
                            className="h-[280px] overflow-y-auto overscroll-contain p-4 font-mono text-[12.5px] leading-[var(--tr-lh-shell)]"
                            onClick={() => inputRef.current?.focus()}
                        >
                            {/* role="log" (polite by default) so a screen reader
                                hears each command's output. The input row sits
                                outside it. */}
                            <div role="log" aria-label="Shell output">
                                {history.map((entry, i) => (
                                    <div
                                        key={i}
                                        className={`grid grid-cols-[1.4rem_minmax(0,1fr)] gap-[.4rem] whitespace-pre-wrap ${TEXT_COLOR[entry.color]}`}
                                    >
                                        <span className={TEXT_COLOR[entry.iconColor]}>{entry.icon}</span>
                                        <span className="min-w-0 [overflow-wrap:anywhere]">{entry.text}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-[1.4rem_minmax(0,1fr)] items-center gap-[.4rem]">
                                <span className="text-tr-butter">❯</span>
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="type something, or hit a chip above"
                                    className="border-0 bg-transparent p-0 text-tr-on-ink placeholder:text-tr-on-ink-faint"
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
