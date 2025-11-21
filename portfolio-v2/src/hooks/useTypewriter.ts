"use client";

import { useState, useEffect } from "react";

/**
 * useTypewriter Hook
 * 
 * Cycles through an array of strings with typing and deleting animation.
 * Perfect for terminal-style command displays.
 * 
 * @param words - Array of strings to cycle through
 * @param typingSpeed - Milliseconds per character when typing (default: 80)
 * @param deletingSpeed - Milliseconds per character when deleting (default: 50)
 * @param pauseDuration - Milliseconds to pause before deleting (default: 2000)
 * @returns Current displayed text
 */
export function useTypewriter(
    words: string[],
    typingSpeed = 80,
    deletingSpeed = 50,
    pauseDuration = 2000
) {
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [currentText, setCurrentText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (words.length === 0) return;

        const currentWord = words[currentWordIndex];

        const timeout = setTimeout(
            () => {
                if (!isDeleting) {
                    // Typing forward
                    if (currentText.length < currentWord.length) {
                        setCurrentText(currentWord.slice(0, currentText.length + 1));
                    } else {
                        // Finished typing, pause then start deleting
                        setTimeout(() => setIsDeleting(true), pauseDuration);
                    }
                } else {
                    // Deleting backward
                    if (currentText.length > 0) {
                        setCurrentText(currentText.slice(0, -1));
                    } else {
                        // Finished deleting, move to next word
                        setIsDeleting(false);
                        setCurrentWordIndex((prev) => (prev + 1) % words.length);
                    }
                }
            },
            isDeleting ? deletingSpeed : typingSpeed
        );

        return () => clearTimeout(timeout);
    }, [currentText, isDeleting, currentWordIndex, words, typingSpeed, deletingSpeed, pauseDuration]);

    return currentText;
}
