"use client";

import { useRef } from "react";
import { useMotionValue, useSpring, useTransform } from "framer-motion";

export function use3DTilt(tiltDegrees = 6) {
    const cardRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0.5);
    const mouseY = useMotionValue(0.5);

    const rotateX = useSpring(useTransform(mouseY, [0, 1], [tiltDegrees, -tiltDegrees]), { stiffness: 200, damping: 20 });
    const rotateY = useSpring(useTransform(mouseX, [0, 1], [-tiltDegrees, tiltDegrees]), { stiffness: 200, damping: 20 });
    const glowX = useTransform(mouseX, [0, 1], [0, 100]);
    const glowY = useTransform(mouseY, [0, 1], [0, 100]);

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = cardRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouseX.set((e.clientX - rect.left) / rect.width);
        mouseY.set((e.clientY - rect.top) / rect.height);
    };

    const handleMouseLeave = () => {
        mouseX.set(0.5);
        mouseY.set(0.5);
    };

    return { cardRef, rotateX, rotateY, glowX, glowY, handleMouseMove, handleMouseLeave };
}
