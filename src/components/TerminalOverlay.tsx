"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTerminal } from "@/context/TerminalContext";
import { Terminal as TerminalIcon, Cpu, Wifi } from "lucide-react";
import { useRouter } from "next/navigation";
import { TERMINAL_FILES, BOOT_SEQUENCE, TERMINAL_CONFIG } from "@/../content/terminal";

interface CommandHistory {
    type: "input" | "output" | "error" | "system";
    content: string;
}

export function TerminalOverlay() {
    const { isOpen, closeTerminal } = useTerminal();
    const [input, setInput] = useState("");
    const [history, setHistory] = useState<CommandHistory[]>([]);
    const [isBooting, setIsBooting] = useState(true);
    const inputRef = useRef<HTMLInputElement>(null);
    const bottomRef = useRef<HTMLDivElement>(null);
    const timeoutsRef = useRef<number[]>([]);
    const router = useRouter();

    // Easter egg state
    const [isPurging, setIsPurging] = useState(false);

    const clearBootTimeouts = () => {
        timeoutsRef.current.forEach((t) => clearTimeout(t));
        timeoutsRef.current = [];
    };

    useEffect(() => {
        clearBootTimeouts();

        if (isOpen) {
            const timer = window.setTimeout(() => {
                setIsBooting(true);
                setHistory([]);
                let delay = 0;
                BOOT_SEQUENCE.forEach((line, i) => {
                    delay += Math.random() * 300 + 100;
                    const lineTimer = window.setTimeout(() => {
                        setHistory((prev) => [...prev, { type: "system", content: line }]);
                        if (i === BOOT_SEQUENCE.length - 1) {
                            setIsBooting(false);
                            const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 100);
                            timeoutsRef.current.push(focusTimer);
                        }
                    }, delay);
                    timeoutsRef.current.push(lineTimer);
                });
            }, 0);
            timeoutsRef.current.push(timer);
        }

        return () => clearBootTimeouts();
    }, [isOpen]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history, isBooting]);

    const handleCommand = (cmd: string) => {
        const trimmed = cmd.trim();
        if (!trimmed) return;

        const args = trimmed.split(" ");
        const command = args[0].toLowerCase();

        const newHistory: CommandHistory[] = [...history, { type: "input", content: cmd }];

        switch (command) {
            case "help":
                newHistory.push({
                    type: "output",
                    content: `Available commands:

Files
  ls              List available files
  cat [file]      Display file contents

Navigation
  projects        Go to projects page
  resume          Go to resume page

Quick Info
  skills          Display technical skills
  contact         Show contact info
  education       Show education
  experience      Show work experience

System
  help            Show this help message
  whoami          Current user
  date            Show current date
  open [url]      Open URL in browser
  clear           Clear terminal
  exit            Close terminal`,
                });
                break;
            case "ls":
                newHistory.push({
                    type: "output",
                    content: Object.keys(TERMINAL_FILES).join("  "),
                });
                break;
            case "cat":
                if (args[1] && TERMINAL_FILES[args[1] as keyof typeof TERMINAL_FILES]) {
                    newHistory.push({
                        type: "output",
                        content: TERMINAL_FILES[args[1] as keyof typeof TERMINAL_FILES],
                    });
                } else if (args[1]) {
                    newHistory.push({ type: "error", content: `File not found: ${args[1]}` });
                } else {
                    newHistory.push({ type: "error", content: "Usage: cat [filename]" });
                }
                break;
            case "clear":
                setHistory([]);
                setInput("");
                return;
            case "exit":
                closeTerminal();
                break;
            case "whoami":
                newHistory.push({ type: "output", content: "guest@portfolio" });
                break;
            case "date":
                newHistory.push({ type: "output", content: new Date().toString() });
                break;
            case "open":
                if (args[1]) {
                    if (args[1] === "projects") {
                        router.push("/projects");
                        newHistory.push({ type: "output", content: "Opening /projects..." });
                    } else {
                        window.open(args[1], "_blank");
                        newHistory.push({ type: "output", content: `Opening ${args[1]}...` });
                    }
                } else {
                    newHistory.push({ type: "error", content: "Usage: open [url]" });
                }
                break;
            case "sudo":
                if (trimmed === "sudo rm -rf /") {
                    setIsPurging(true);
                    newHistory.push({ type: "error", content: "INITIATING SYSTEM PURGE..." });
                    setTimeout(() => {
                        newHistory.push({ type: "error", content: "CRITICAL ERROR: ACCESS DENIED." });
                        newHistory.push({ type: "output", content: "Nice try. Security protocols engaged." });
                        setIsPurging(false);
                    }, 3000);
                } else {
                    newHistory.push({ type: "error", content: "User is not in the sudoers file. This incident will be reported." });
                }
                break;
            case "skills":
                newHistory.push({ type: "output", content: TERMINAL_FILES["skills.json"] });
                break;
            case "contact":
                newHistory.push({ type: "output", content: TERMINAL_FILES["contact.txt"] });
                break;
            case "education":
                newHistory.push({ type: "output", content: TERMINAL_FILES["education.md"] });
                break;
            case "experience":
                newHistory.push({ type: "output", content: TERMINAL_FILES["experience.md"] });
                break;
            case "projects":
                router.push("/projects");
                newHistory.push({ type: "output", content: "Navigating to /projects..." });
                closeTerminal();
                break;
            case "resume":
                router.push("/resume");
                newHistory.push({ type: "output", content: "Navigating to /resume..." });
                closeTerminal();
                break;
            default:
                newHistory.push({ type: "error", content: `Command not found: ${command}` });
        }

        setHistory(newHistory);
        setInput("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleCommand(input);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 ${isPurging ? "animate-shake" : ""}`}
                    onClick={closeTerminal}
                >
                    <div
                        className={`w-full max-w-4xl h-[70vh] bg-[#0c0c0c]/95 rounded-xl border border-white/10 shadow-2xl overflow-hidden flex flex-col relative backdrop-blur-xl ${isPurging ? "border-red-500 shadow-red-500/50" : ""}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* CRT Scanline Effect */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 bg-[length:100%_2px,3px_100%]" />

                        {/* Window Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
                            <div className="flex items-center gap-4">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80 cursor-pointer hover:bg-red-500" onClick={closeTerminal} />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80 cursor-pointer hover:bg-yellow-500" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/80 cursor-pointer hover:bg-green-500" />
                                </div>
                                <div className="flex items-center gap-2 text-xs text-white/40 font-mono">
                                    <TerminalIcon className="w-3 h-3" />
                                    <span>{TERMINAL_CONFIG.prompt}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-white/30 font-mono">
                                <div className="flex items-center gap-1">
                                    <Cpu className="w-3 h-3" />
                                    <span>CPU: 12%</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Wifi className="w-3 h-3" />
                                    <span>NET: ON</span>
                                </div>
                            </div>
                        </div>

                        {/* Terminal Body */}
                        <div className="flex-1 p-6 font-mono text-sm overflow-y-auto scrollbar-hide" onClick={() => inputRef.current?.focus()}>
                            {history.map((entry, i) => (
                                <div key={i} className={`mb-1 ${entry.type === "error" ? "text-red-400" :
                                    entry.type === "system" ? "text-blue-400" :
                                        entry.type === "input" ? "text-white/60" :
                                            isPurging ? "text-red-300" : "text-emerald-400"
                                    }`}>
                                    {entry.type === "input" ? (
                                        <span className="flex gap-2">
                                            <span className="text-emerald-500">➜</span>
                                            <span>{entry.content}</span>
                                        </span>
                                    ) : (
                                        <span>{entry.content}</span>
                                    )}
                                </div>
                            ))}

                            {!isBooting && (
                                <div className="flex items-center gap-2 mt-2">
                                    <span className={isPurging ? "text-red-500" : "text-emerald-500"}>➜</span>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        className={`bg-transparent outline-none flex-1 ${isPurging ? "text-red-400 caret-red-500" : "text-emerald-400 caret-emerald-500"}`}
                                        autoFocus
                                        spellCheck={false}
                                        autoComplete="off"
                                    />
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
