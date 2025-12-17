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

            {/* The Wand Effect - Enhanced subtle global follow light */}
            <motion.div
                className="absolute inset-0 opacity-20"
                style={{
                    background: useMotionTemplate`
            radial-gradient(
              900px circle at ${mouseX}px ${mouseY}px,
              rgba(0, 240, 255, 0.2),
              rgba(112, 0, 255, 0.08),
              transparent 85%
            )
          `,
                }}
            />

            {/* Data Stream Effects - Random vertical streams */}
            <div className="absolute inset-0 opacity-20">
                <div className="data-stream" style={{ left: '10%', animationDelay: '0s' }} />
                <div className="data-stream" style={{ left: '30%', animationDelay: '1.5s' }} />
                <div className="data-stream" style={{ left: '50%', animationDelay: '0.8s' }} />
                <div className="data-stream" style={{ left: '70%', animationDelay: '2.2s' }} />
                <div className="data-stream" style={{ left: '90%', animationDelay: '1.1s' }} />
            </div>

            {/* Noise Texture for depth */}
            <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.08)_0.5px,_transparent_1px)] bg-[length:6px_6px] mix-blend-overlay" />
        </div>
    );
}
