"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    baseX: number;
    baseY: number;
    density: number;
}

export function ChronosBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const mouseRef = useRef<{ x: number; y: number }>({ x: -9999, y: -9999 });
    const prefersReducedMotion = useReducedMotion();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let particles: Particle[] = [];
        let animationFrameId: number;
        let timeString = "";

        const init = () => {
            const width = window.innerWidth;
            const height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;

            particles = [];
            const particleCount = width < 768 ? 40 : 80;

            for (let i = 0; i < particleCount; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                particles.push({
                    x,
                    y,
                    vx: (Math.random() - 0.5) * 0.2, // Slower, calmer movement
                    vy: (Math.random() - 0.5) * 0.2,
                    size: Math.random() * 1.5 + 0.5,
                    baseX: x,
                    baseY: y,
                    density: (Math.random() * 30) + 1,
                });
            }
        };

        const drawTime = () => {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, "0");
            const minutes = String(now.getMinutes()).padStart(2, "0");
            const seconds = String(now.getSeconds()).padStart(2, "0");
            timeString = `${hours}:${minutes}:${seconds}`;
        };
        const timeInterval = setInterval(drawTime, 1000);
        drawTime();

        const animate = () => {
            if (!ctx) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Cache theme lookup once per frame (was being read N+N² times before)
            const isDark = document.documentElement.getAttribute("data-theme") === "dark";
            const particleColor = isDark ? "rgba(0, 240, 255, 0.5)" : "rgba(0, 102, 255, 0.3)";
            const lineColorBase = isDark ? "0, 240, 255" : "0, 102, 255";
            const lineAlphaScale = isDark ? 1 : 0.6;

            // Draw Time (Bottom Left)
            ctx.font = "bold 6vw 'Geist Mono', monospace";
            ctx.fillStyle = isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.04)";
            ctx.textAlign = "left";
            ctx.textBaseline = "bottom";
            ctx.fillText(timeString, 40, canvas.height - 40);

            // Update and Draw Particles
            ctx.fillStyle = particleColor;
            particles.forEach((p) => {
                // Movement
                if (!prefersReducedMotion) {
                    p.x += p.vx * 1.5;
                    p.y += p.vy * 1.5;

                    // Bounce off edges
                    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
                }

                // Mouse Interaction (The "Wand" Effect)
                const dx = mouseRef.current.x - p.x;
                const dy = mouseRef.current.y - p.y;
                const distSq = dx * dx + dy * dy;
                const maxDistance = 250;
                const maxDistSq = maxDistance * maxDistance;

                if (distSq < maxDistSq) {
                    const distance = Math.sqrt(distSq) || 0.0001;
                    const force = (maxDistance - distance) / maxDistance;
                    p.x -= (dx / distance) * force * p.density * 0.5;
                    p.y -= (dy / distance) * force * p.density * 0.5;
                } else {
                    // Return to base drift if not disturbed
                    if (p.x !== p.baseX) p.x -= (p.x - p.baseX) * 0.01;
                    if (p.y !== p.baseY) p.y -= (p.y - p.baseY) * 0.01;
                }

                // Draw Particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });

            // Draw Connections — squared-distance check avoids sqrt for the majority that fail
            const connectDistance = 120;
            const connectDistSq = connectDistance * connectDistance;
            ctx.lineWidth = 0.5;
            for (let a = 0; a < particles.length; a++) {
                const pa = particles[a];
                for (let b = a + 1; b < particles.length; b++) {
                    const pb = particles[b];
                    const dx = pa.x - pb.x;
                    const dy = pa.y - pb.y;
                    const dSq = dx * dx + dy * dy;
                    if (dSq >= connectDistSq) continue;
                    const distance = Math.sqrt(dSq);
                    const alpha = (0.1 - (distance / connectDistance) * 0.1) * lineAlphaScale;
                    ctx.strokeStyle = `rgba(${lineColorBase}, ${alpha})`;
                    ctx.beginPath();
                    ctx.moveTo(pa.x, pa.y);
                    ctx.lineTo(pb.x, pb.y);
                    ctx.stroke();
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        init();

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };
        animate();

        const handleResize = () => {
            init();
        };

        window.addEventListener("resize", handleResize);
        window.addEventListener("mousemove", handleMouseMove, { passive: true });

        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("mousemove", handleMouseMove);
            cancelAnimationFrame(animationFrameId);
            clearInterval(timeInterval);
        };
    }, [prefersReducedMotion]);

    return (
        <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
            {/* Vignette for depth */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--bg-primary)_100%)] opacity-60" />
        </div>
    );
}
