"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Github, MessageSquare, Brain, Zap, FileJson, ArrowRight, CheckCircle } from "lucide-react";
import type { Project } from "@/lib/definitions";
import { StatCard } from "@/components/ui/StatCard";

// Chat message component
function ChatMessage({ isBot, message, delay }: { isBot: boolean; message: string; delay: number }) {
    return (
        <div
            className={`flex ${isBot ? "justify-start" : "justify-end"}`}
            style={{ animation: `fadeSlideUp 0.3s ease-out ${delay}ms both` }}
        >
            <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                isBot
                    ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-bl-md"
                    : "bg-[var(--accent)] text-white rounded-br-md"
            }`}>
                <p className="text-sm">{message}</p>
            </div>
        </div>
    );
}

// Pipeline step
function PipelineStep({ step, title, desc, example }: { step: number; title: string; desc: string; example?: string }) {
    return (
        <div className="flex gap-4">
            <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-sm font-medium">
                    {step}
                </div>
                <div className="w-0.5 flex-1 bg-[var(--border)] mt-2" />
            </div>
            <div className="pb-6 flex-1">
                <div className="text-sm font-medium text-[var(--text-primary)] mb-1">{title}</div>
                <div className="text-xs text-[var(--text-muted)] mb-2">{desc}</div>
                {example && (
                    <div className="font-mono text-xs p-2 bg-[var(--bg-secondary)] rounded border border-[var(--border)] text-[var(--text-secondary)]">
                        {example}
                    </div>
                )}
            </div>
        </div>
    );
}

// Intent card
function IntentCard({ tag, patterns, confidence }: { tag: string; patterns: string[]; confidence: number }) {
    return (
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--accent)] transition-colors">
            <div className="flex items-center justify-between mb-3">
                <span className="px-2 py-1 text-xs font-medium rounded bg-[var(--accent)]/10 text-[var(--accent)]">{tag}</span>
                <span className="text-xs text-[var(--text-muted)]">{confidence}% conf</span>
            </div>
            <div className="space-y-1">
                {patterns.slice(0, 3).map((p, i) => (
                    <div key={i} className="text-xs text-[var(--text-secondary)]">"{p}"</div>
                ))}
            </div>
        </div>
    );
}

// Neural network visualization (simplified)
function NeuralNetworkViz() {
    const [activeLayer, setActiveLayer] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveLayer((prev) => (prev + 1) % 4);
        }, 800);
        return () => clearInterval(interval);
    }, []);

    const layers = [
        { name: "Input", nodes: 5, desc: "BoW Vector" },
        { name: "Hidden 1", nodes: 4, desc: "128 neurons" },
        { name: "Hidden 2", nodes: 3, desc: "64 neurons" },
        { name: "Output", nodes: 3, desc: "Softmax" },
    ];

    return (
        <div className="flex items-center justify-center gap-4 md:gap-8">
            {layers.map((layer, i) => (
                <div key={layer.name} className="flex flex-col items-center">
                    <div className="text-xs text-[var(--text-muted)] mb-2">{layer.name}</div>
                    <div className="flex flex-col gap-2">
                        {Array(layer.nodes).fill(0).map((_, j) => (
                            <div
                                key={j}
                                className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                                    i === activeLayer
                                        ? "bg-[var(--accent)] border-[var(--accent)] scale-110"
                                        : i < activeLayer
                                            ? "bg-[var(--accent)]/30 border-[var(--accent)]/50"
                                            : "bg-transparent border-[var(--border)]"
                                }`}
                            />
                        ))}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-2">{layer.desc}</div>
                </div>
            ))}
        </div>
    );
}


export function ChatbotIntentsPage({ project }: { project: Project }) {
    const [messages, setMessages] = useState<Array<{ isBot: boolean; message: string }>>([]);

    useEffect(() => {
        const conversation = [
            { isBot: false, message: "What's the weather like?" },
            { isBot: true, message: "I can help with weather info! What city?" },
            { isBot: false, message: "Thanks, bye!" },
            { isBot: true, message: "Goodbye! Have a great day!" },
        ];

        conversation.forEach((msg, i) => {
            setTimeout(() => {
                setMessages(prev => [...prev, msg]);
            }, i * 1000 + 500);
        });
    }, []);

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            <style jsx global>{`
                @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>

            {/* Header */}
            <header className="pt-32 pb-8 px-6">
                <div className="max-w-6xl mx-auto">
                    <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors mb-8">
                        <ArrowLeft className="w-4 h-4" />Back to Projects
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4" style={{ animation: 'fadeSlideUp 0.5s ease-out' }}>
                        Intent Classification Bot
                    </h1>
                    <p className="text-xl text-[var(--text-secondary)] mb-6 max-w-3xl" style={{ animation: 'fadeSlideUp 0.5s ease-out 100ms both' }}>
                        NLP chatbot with bag-of-words and neural network classification.
                    </p>
                    <div className="flex flex-wrap gap-2" style={{ animation: 'fadeSlideUp 0.5s ease-out 200ms both' }}>
                        {['Python', 'NLTK', 'TensorFlow', 'BoW', 'Neural Network'].map((tech) => (
                            <span key={tech} className="px-3 py-1 text-xs font-medium rounded-full bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">{tech}</span>
                        ))}
                    </div>
                </div>
            </header>

            {/* Live Chat Demo */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Demo Conversation</h2>
                            <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] min-h-[300px]">
                                <div className="space-y-4">
                                    {messages.map((msg, i) => (
                                        <ChatMessage key={i} isBot={msg.isBot} message={msg.message} delay={0} />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Intent Detection</h2>
                            <div className="space-y-4">
                                <IntentCard tag="weather" patterns={["What's the weather like?", "Tell me the forecast", "Is it going to rain?"]} confidence={94} />
                                <IntentCard tag="goodbye" patterns={["Bye", "See you later", "Thanks, bye!"]} confidence={97} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pipeline */}
            <section className="py-12 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">NLP Pipeline</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <PipelineStep
                                step={1}
                                title="Tokenization"
                                desc="Split sentence into words"
                                example={`"What's the weather?" → ["what", "the", "weather"]`}
                            />
                            <PipelineStep
                                step={2}
                                title="Stemming"
                                desc="Reduce to root forms (Porter Stemmer)"
                                example='["running", "runs"] → ["run", "run"]'
                            />
                            <PipelineStep
                                step={3}
                                title="Bag-of-Words"
                                desc="Binary vector encoding"
                                example='vocab=[hello,weather,bye] → [0,1,0]'
                            />
                            <PipelineStep
                                step={4}
                                title="Classification"
                                desc="Neural network predicts intent"
                                example='[0,1,0] → weather (94% confidence)'
                            />
                        </div>
                        <div className="flex items-center justify-center">
                            <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] w-full">
                                <h3 className="text-sm font-medium text-[var(--text-primary)] mb-6 text-center">Neural Network</h3>
                                <NeuralNetworkViz />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* JSON Corpus */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Modular Intent Corpus</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
                            <div className="flex items-center gap-2 mb-4">
                                <FileJson className="w-5 h-5 text-[var(--accent)]" />
                                <span className="text-sm font-medium text-[var(--text-primary)]">intents.json</span>
                            </div>
                            <pre className="text-xs text-[var(--text-secondary)] overflow-x-auto font-mono">
{`{
  "intents": [
    {
      "tag": "greeting",
      "patterns": ["Hi", "Hello", "Hey"],
      "responses": ["Hello!", "Hi there!"]
    },
    {
      "tag": "weather",
      "patterns": ["Weather?", "Forecast"],
      "responses": ["Which city?"]
    }
  ]
}`}
                            </pre>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    <span className="text-sm font-medium text-[var(--text-primary)]">Easy Updates</span>
                                </div>
                                <p className="text-xs text-[var(--text-muted)]">Add intents by editing JSON — no code changes needed</p>
                            </div>
                            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
                                <div className="flex items-center gap-2 mb-2">
                                    <Zap className="w-4 h-4 text-amber-500" />
                                    <span className="text-sm font-medium text-[var(--text-primary)]">Fast Retraining</span>
                                </div>
                                <p className="text-xs text-[var(--text-muted)]">{"<"}1 minute training on small datasets</p>
                            </div>
                            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
                                <div className="flex items-center gap-2 mb-2">
                                    <Brain className="w-4 h-4 text-purple-500" />
                                    <span className="text-sm font-medium text-[var(--text-primary)]">Confidence Threshold</span>
                                </div>
                                <p className="text-xs text-[var(--text-muted)]">Falls back to "I don't understand" when uncertain ({"<"}70%)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Design Decisions */}
            <section className="py-12 px-6 bg-[var(--bg-secondary)]">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-6">Design Decisions</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                            <div className="text-sm font-medium text-[var(--text-primary)] mb-2">BoW + NN over Transformers</div>
                            <div className="text-xs text-[var(--text-muted)]">Sub-50ms inference on CPU. Perfect for domain-specific intents where BERT/GPT would be overkill.</div>
                        </div>
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                            <div className="text-sm font-medium text-[var(--text-primary)] mb-2">Stemming {">"} Lemmatization</div>
                            <div className="text-xs text-[var(--text-muted)]">Faster, no POS tagging needed. Acceptable tradeoff for intent matching.</div>
                        </div>
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                            <div className="text-sm font-medium text-[var(--text-primary)] mb-2">Dropout for Regularization</div>
                            <div className="text-xs text-[var(--text-muted)]">50% dropout prevents overfitting on small training datasets.</div>
                        </div>
                        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
                            <div className="text-sm font-medium text-[var(--text-primary)] mb-2">Softmax with Threshold</div>
                            <div className="text-xs text-[var(--text-muted)]">Better to say "I don't know" than confidently return wrong answers.</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-x divide-[var(--border)]">
                        <StatCard value="<50ms" label="Inference Time" />
                        <StatCard value="0.7" label="Confidence Threshold" />
                        <StatCard value="128×64" label="Hidden Layers" />
                        <StatCard value="JSON" label="Intent Format" />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-[var(--border)]">
                <div className="max-w-6xl mx-auto">
                    <span className="text-[var(--text-muted)]">Lightweight NLP chatbot for FAQs and utilities</span>
                </div>
            </footer>
        </div>
    );
}
