"use client";

import { useState, useEffect, RefObject } from "react";

/**
 * useMousePosition Hook
 * 
 * Tracks mouse position relative to a given element.
 * Used for spotlight effects and interactive hover states.
 * 
 * @param ref - React ref to the element to track mouse position within
 * @returns Object with x and y coordinates relative to element
 */
export function useMousePosition(ref: RefObject<HTMLElement | null>) {
    const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rect = element.getBoundingClientRect();
            setPosition({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            });
        };

        element.addEventListener("mousemove", handleMouseMove);
        return () => element.removeEventListener("mousemove", handleMouseMove);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ref.current]);

    return position;
}
