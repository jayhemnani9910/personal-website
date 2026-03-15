"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

const EMOJIS = [
    { key: "fire", emoji: "\uD83D\uDD25", label: "Fire" },
    { key: "rocket", emoji: "\uD83D\uDE80", label: "Rocket" },
    { key: "heart", emoji: "\u2764\uFE0F", label: "Heart" },
    { key: "mind_blown", emoji: "\uD83E\uDD2F", label: "Mind Blown" },
] as const;

type EmojiKey = typeof EMOJIS[number]["key"];
type Counts = Record<EmojiKey, number>;

export function ReactionBar({ slug }: { slug: string }) {
    const [counts, setCounts] = useState<Counts>({ fire: 0, rocket: 0, heart: 0, mind_blown: 0 });
    const [reacted, setReacted] = useState<Set<EmojiKey>>(() => {
        if (typeof window === "undefined") return new Set();
        try {
            const stored = localStorage.getItem(`reactions-${slug}`);
            return stored ? new Set(JSON.parse(stored)) : new Set();
        } catch { return new Set(); }
    });
    const [animating, setAnimating] = useState<EmojiKey | null>(null);

    useEffect(() => {
        fetch(`/api/reactions?slug=${slug}`)
            .then((res) => res.json())
            .then((data) => setCounts(data))
            .catch(() => {});
    }, [slug]);

    const react = useCallback((emoji: EmojiKey) => {
        if (reacted.has(emoji)) return;

        // Optimistic update
        setCounts((prev) => ({ ...prev, [emoji]: prev[emoji] + 1 }));
        const newReacted = new Set(reacted).add(emoji);
        setReacted(newReacted);
        setAnimating(emoji);
        setTimeout(() => setAnimating(null), 400);

        // Persist to localStorage
        localStorage.setItem(`reactions-${slug}`, JSON.stringify([...newReacted]));

        // Send to API
        fetch("/api/reactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug, emoji }),
        }).catch(() => {});
    }, [slug, reacted]);

    return (
        <div className="flex items-center gap-2">
            {EMOJIS.map(({ key, emoji, label }) => (
                <motion.button
                    key={key}
                    onClick={() => react(key)}
                    animate={animating === key ? { scale: [1, 1.3, 1] } : {}}
                    transition={{ duration: 0.3 }}
                    disabled={reacted.has(key)}
                    aria-label={`React with ${label}`}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-all ${
                        reacted.has(key)
                            ? "border-[var(--accent)]/30 bg-[var(--accent)]/5"
                            : "border-[var(--border)] hover:border-[var(--accent)]/40 hover:bg-[var(--bg-secondary)]"
                    }`}
                >
                    <span>{emoji}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{counts[key]}</span>
                </motion.button>
            ))}
        </div>
    );
}
