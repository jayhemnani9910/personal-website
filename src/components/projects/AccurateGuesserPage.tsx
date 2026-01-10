"use client";

import { useState, useEffect } from "react";
import { Gamepad2, ArrowUp, ArrowDown, CheckCircle, RotateCcw, Play, Trophy } from "lucide-react";
import type { Project } from "@/lib/definitions";
import { ProjectHeader } from "./ProjectHeader";
import { StatCard } from "@/components/ui/StatCard";

// Game simulation
function GameDemo() {
    const [secretNumber] = useState(42);
    const [guess, setGuess] = useState("");
    const [feedback, setFeedback] = useState<{ type: string; message: string } | null>(null);
    const [attempts, setAttempts] = useState(0);
    const [gameState, setGameState] = useState<"playing" | "won">("playing");
    const [history, setHistory] = useState<Array<{ guess: number; result: string }>>([]);

    const handleGuess = () => {
        const num = parseInt(guess);
        if (isNaN(num) || num < 1 || num > 100) {
            setFeedback({ type: "error", message: "Enter 1-100" });
            return;
        }

        setAttempts(prev => prev + 1);

        if (num === secretNumber) {
            setFeedback({ type: "success", message: "Correct!" });
            setGameState("won");
            setHistory(prev => [...prev, { guess: num, result: "correct" }]);
        } else if (num < secretNumber) {
            setFeedback({ type: "low", message: "Too low!" });
            setHistory(prev => [...prev, { guess: num, result: "low" }]);
        } else {
            setFeedback({ type: "high", message: "Too high!" });
            setHistory(prev => [...prev, { guess: num, result: "high" }]);
        }
        setGuess("");
    };

    const resetGame = () => {
        setGuess("");
        setFeedback(null);
        setAttempts(0);
        setGameState("playing");
        setHistory([]);
    };

    return (
        <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
            <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-[var(--text-primary)]">Guess the Number (1-100)</span>
                <span className="text-xs text-[var(--text-muted)]">Attempts: {attempts}</span>
            </div>

            {gameState === "playing" ? (
                <div className="flex gap-2 mb-4">
                    <input
                        type="number"
                        min="1"
                        max="100"
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleGuess()}
                        className="flex-1 px-4 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-primary)] text-center text-lg font-mono focus:outline-none focus:border-[var(--accent)]"
                        placeholder="?"
                    />
                    <button
                        onClick={handleGuess}
                        className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white font-medium hover:opacity-90 transition-opacity"
                    >
                        Guess
                    </button>
                </div>
            ) : (
                <div className="flex items-center justify-center gap-4 mb-4">
                    <Trophy className="w-8 h-8 text-amber-500" />
                    <div className="text-center">
                        <div className="text-lg font-bold text-[var(--text-primary)]">You won in {attempts} attempts!</div>
                        <div className="text-sm text-[var(--text-muted)]">The number was {secretNumber}</div>
                    </div>
                    <button
                        onClick={resetGame}
                        className="p-2 rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
                    >
                        <RotateCcw className="w-5 h-5" />
                    </button>
                </div>
            )}

            {feedback && gameState === "playing" && (
                <div className={`flex items-center justify-center gap-2 p-3 rounded-lg mb-4 ${
                    feedback.type === "success" ? "bg-green-500/10 text-green-500" :
                    feedback.type === "high" ? "bg-red-500/10 text-red-500" :
                    feedback.type === "low" ? "bg-blue-500/10 text-blue-500" :
                    "bg-amber-500/10 text-amber-500"
                }`}>
                    {feedback.type === "high" && <ArrowDown className="w-4 h-4" />}
                    {feedback.type === "low" && <ArrowUp className="w-4 h-4" />}
                    {feedback.type === "success" && <CheckCircle className="w-4 h-4" />}
                    <span className="font-medium">{feedback.message}</span>
                </div>
            )}

            {history.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {history.map((h, i) => (
                        <span
                            key={i}
                            className={`px-2 py-1 text-xs rounded font-mono ${
                                h.result === "correct" ? "bg-green-500/20 text-green-500" :
                                h.result === "high" ? "bg-red-500/20 text-red-500" :
                                "bg-blue-500/20 text-blue-500"
                            }`}
                        >
                            {h.guess}
                            {h.result === "high" ? "↓" : h.result === "low" ? "↑" : "✓"}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

// State machine visualization
function StateMachine() {
    const [activeState, setActiveState] = useState(0);
    const states = ["INITIAL", "PLAYING", "FINISHED"];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveState((prev) => (prev + 1) % 3);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center justify-center gap-4">
            {states.map((state, i) => (
                <div key={state} className="flex items-center">
                    <div className={`px-4 py-2 rounded-lg border transition-all duration-300 ${
                        i === activeState
                            ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                            : "bg-[var(--bg-primary)] text-[var(--text-muted)] border-[var(--border)]"
                    }`}>
                        <span className="text-sm font-medium">{state}</span>
                    </div>
                    {i < states.length - 1 && (
                        <div className="w-8 h-0.5 bg-[var(--border)] mx-2" />
                    )}
                </div>
            ))}
        </div>
    );
}


export function AccurateGuesserPage({ project }: { project: Project }) {
    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            <ProjectHeader
                title="Accurate Guesser"
                description="Java Swing number guessing game demonstrating event-driven UI patterns."
                techStack={['Java', 'Swing', 'MVC', 'Event-Driven']}
            />

            {/* Live Demo */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Interactive Demo</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <GameDemo />
                        <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
                            <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">Game State Machine</h3>
                            <StateMachine />
                            <p className="text-xs text-[var(--text-muted)] mt-4 text-center">
                                Explicit states prevent edge cases like submitting after winning
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Architecture */}
            <section className="py-12 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">MVC Architecture</h2>
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                                <Gamepad2 className="w-5 h-5 text-blue-500" />
                            </div>
                            <div className="text-sm font-medium text-[var(--text-primary)] mb-1">GameEngine</div>
                            <div className="text-xs text-[var(--text-muted)]">Core game logic: random number, guess validation, scoring, state transitions</div>
                        </div>
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center mb-3">
                                <Play className="w-5 h-5 text-green-500" />
                            </div>
                            <div className="text-sm font-medium text-[var(--text-primary)] mb-1">GameUI (JFrame)</div>
                            <div className="text-xs text-[var(--text-muted)]">Swing components: input fields, buttons, feedback labels, layout management</div>
                        </div>
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3">
                                <RotateCcw className="w-5 h-5 text-purple-500" />
                            </div>
                            <div className="text-sm font-medium text-[var(--text-primary)] mb-1">Event Handlers</div>
                            <div className="text-xs text-[var(--text-muted)]">ActionListeners connecting UI actions to game logic callbacks</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Key Learnings */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Key Learnings</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {[
                            { title: "Event-Driven Architecture", desc: "Loose coupling through listeners. Callback-based control flow applicable to React, Vue." },
                            { title: "State Management", desc: "Without explicit states, edge cases emerge. Manual tracking doesn't scale to complex apps." },
                            { title: "Separation of Concerns", desc: "Mixing UI with logic creates brittle code. Refactoring to MVC enabled independent testing." },
                            { title: "Defense in Depth Validation", desc: "UI-level (DocumentFilter), app-level (range), domain-level (state). Each catches different failures." },
                        ].map((item) => (
                            <div key={item.title} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
                                <div className="text-sm font-medium text-[var(--text-primary)] mb-2">{item.title}</div>
                                <div className="text-xs text-[var(--text-muted)]">{item.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Design Decisions */}
            <section className="py-12 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Design Decisions</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                            <div className="text-sm font-medium text-[var(--text-primary)] mb-2">Swing over JavaFX</div>
                            <div className="text-xs text-[var(--text-muted)]">Maturity and extensive documentation. Ideal for learning event-driven fundamentals without framework abstractions.</div>
                        </div>
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                            <div className="text-sm font-medium text-[var(--text-primary)] mb-2">Explicit State Machine</div>
                            <div className="text-xs text-[var(--text-muted)]">INITIAL → PLAYING → FINISHED prevents invalid operations. Makes transitions explicit and testable.</div>
                        </div>
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                            <div className="text-sm font-medium text-[var(--text-primary)] mb-2">UI-Layer Input Validation</div>
                            <div className="text-xs text-[var(--text-muted)]">DocumentFilter for numeric input provides immediate feedback while GameEngine handles business rules.</div>
                        </div>
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                            <div className="text-sm font-medium text-[var(--text-primary)] mb-2">Modal Dialogs for State Changes</div>
                            <div className="text-xs text-[var(--text-muted)]">JOptionPane for win/loss notifications creates clear breakpoints. Prevents accidental resets.</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-[var(--border)]">
                        <StatCard value="Java" label="Language" />
                        <StatCard value="Swing" label="UI Framework" />
                        <StatCard value="3" label="Game States" />
                        <StatCard value="MVC" label="Architecture" />
                    </div>
                </div>
            </section>

            {/* Key Insight */}
            <section className="py-12 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-4xl mx-auto text-center">
                    <Gamepad2 className="w-8 h-8 text-[var(--accent)] mx-auto mb-4" />
                    <blockquote className="text-lg text-[var(--text-secondary)] italic">
                        "Simple concepts can teach foundational programming principles that scale to complex applications."
                    </blockquote>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-[var(--border)]">
                <div className="max-w-6xl mx-auto">
                    <span className="text-[var(--text-muted)]">Lightweight demo of event-driven desktop UI</span>
                </div>
            </footer>
        </div>
    );
}
