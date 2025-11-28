"use client";

import { motion, useSpring, useMotionTemplate } from "framer-motion";
import { useEffect } from "react";
import { useMousePosition } from "@/context/MousePositionContext";

export function GlobalBackground() {
    const { mousePosition } = useMousePosition();

    // Smooth spring animation for the gradient movement
    const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
    const mouseX = useSpring(0, springConfig);
    const mouseY = useSpring(0, springConfig);

    useEffect(() => {
        mouseX.set(mousePosition.x);
        mouseY.set(mousePosition.y);
    }, [mousePosition, mouseX, mouseY]);

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            {/* The Void Base */}
            <div className="absolute inset-0 bg-[var(--bg-void)]" />

            {/* The Wand Effect - Subtle global follow light */}
            <motion.div
                className="absolute inset-0 opacity-15"
                style={{
                    background: useMotionTemplate`
            radial-gradient(
              800px circle at ${mouseX}px ${mouseY}px,
              rgba(0, 240, 255, 0.15),
              transparent 80%
            )
          `,
                }}
            />

            {/* Noise Texture for depth */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('/noise.png')] mix-blend-overlay" />
        </div>
    );
}
