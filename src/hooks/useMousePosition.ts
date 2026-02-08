"use client";

import { useState, useEffect, RefObject } from "react";

interface UseMousePositionOptions {
    /**
     * How to update the mouse position.
     * - 'state': Updates React state (triggers re-render). Default.
     * - 'css-vars': Updates CSS variables on the element directly (no re-render).
     */
    mode?: "state" | "css-vars";
    /**
     * The names of the CSS variables to update when mode is 'css-vars'.
     * Defaults to { x: "--mouse-x", y: "--mouse-y" }.
     */
    cssVars?: { x: string; y: string };
}

/**
 * useMousePosition Hook
 * 
 * Tracks mouse position relative to a given element.
 * Used for spotlight effects and interactive hover states.
 * 
 * @param ref - React ref to the element to track mouse position within
 * @param options - Configuration options
 * @returns Object with x and y coordinates relative to element (only updates in 'state' mode)
 */
export function useMousePosition(
    ref: RefObject<HTMLElement | null>,
    options: UseMousePositionOptions = {}
) {
    const { mode = "state", cssVars = { x: "--mouse-x", y: "--mouse-y" } } = options;
    const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (mode === "state") {
                setPosition({ x, y });
            } else {
                element.style.setProperty(cssVars.x, `${x}px`);
                element.style.setProperty(cssVars.y, `${y}px`);
            }
        };

        element.addEventListener("mousemove", handleMouseMove);
        return () => element.removeEventListener("mousemove", handleMouseMove);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ref.current, mode, cssVars.x, cssVars.y]);

    return position;
}
