"use client";

import { useState, useEffect } from "react";

interface UseTypewriterPlaceholderOptions {
    /**
     * Typing speed in milliseconds per character.
     * Defaults to 80ms.
     */
    typingSpeed?: number;
    /**
     * Pause duration in milliseconds after completing a phrase.
     * Defaults to 2000ms.
     */
    pauseDuration?: number;
}

interface UseTypewriterPlaceholderResult {
    text: string;
    isTyping: boolean;
}

/**
 * useTypewriterPlaceholder Hook
 *
 * Creates a typewriter effect that cycles through an array of phrases.
 * Useful for animated placeholder text in form inputs.
 *
 * @param phrases - Array of strings to cycle through
 * @param options - Configuration options for typing speed and pause duration
 * @returns Object with current display text and typing state
 */
export function useTypewriterPlaceholder(
    phrases: string[],
    options: UseTypewriterPlaceholderOptions = {}
): UseTypewriterPlaceholderResult {
    const { typingSpeed = 80, pauseDuration = 2000 } = options;

    const [displayText, setDisplayText] = useState("");
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (phrases.length === 0) return;

        const currentPhrase = phrases[phraseIndex];

        const timeout = setTimeout(
            () => {
                if (!isDeleting) {
                    if (displayText.length < currentPhrase.length) {
                        setDisplayText(currentPhrase.slice(0, displayText.length + 1));
                    } else {
                        setTimeout(() => setIsDeleting(true), pauseDuration);
                    }
                } else {
                    if (displayText.length > 0) {
                        setDisplayText(displayText.slice(0, -1));
                    } else {
                        setIsDeleting(false);
                        setPhraseIndex((prev) => (prev + 1) % phrases.length);
                    }
                }
            },
            isDeleting ? typingSpeed / 2 : typingSpeed
        );

        return () => clearTimeout(timeout);
    }, [displayText, isDeleting, phraseIndex, phrases, typingSpeed, pauseDuration]);

    return {
        text: displayText,
        isTyping: !isDeleting && displayText.length < (phrases[phraseIndex]?.length ?? 0)
    };
}
