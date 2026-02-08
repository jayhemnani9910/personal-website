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
            const particleCount = width < 768 ? 60 : 120;

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

            // Draw Time (Bottom Left)
            ctx.font = "bold 6vw 'Geist Mono', monospace";
            ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
            ctx.textAlign = "left";
            ctx.textBaseline = "bottom";
            ctx.fillText(timeString, 40, canvas.height - 40);

            // Update and Draw Particles
            particles.forEach((p) => {
                // Movement
                if (!prefersReducedMotion) {
                    p.x += p.vx * 1.5; // Faster movement
                    p.y += p.vy * 1.5;

                    // Bounce off edges
                    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
                }

                // Mouse Interaction (The "Wand" Effect)
                const dx = mouseRef.current.x - p.x;
                const dy = mouseRef.current.y - p.y;
                const distance = Math.sqrt(dx * dx + dy * dy) || 0.0001;
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const maxDistance = 250;
                const force = (maxDistance - distance) / maxDistance;

                if (distance < maxDistance) {
                    p.x -= forceDirectionX * force * p.density * 0.5;
                    p.y -= forceDirectionY * force * p.density * 0.5;
                } else {
                    // Return to base drift if not disturbed
                    if (p.x !== p.baseX) {
                        const dx = p.x - p.baseX;
                        p.x -= dx * 0.01;
                    }
                    if (p.y !== p.baseY) {
                        const dy = p.y - p.baseY;
                        p.y -= dy * 0.01;
                    }
                }

                // Draw Particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(0, 240, 255, 0.5)"; // Neon Cyan
                ctx.fill();
            });

            // Draw Connections (Voronoi-like)
            const connectDistance = 120;
            for (let a = 0; a < particles.length; a++) {
                for (let b = a; b < particles.length; b++) {
                    const dx = particles[a].x - particles[b].x;
                    const dy = particles[a].y - particles[b].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectDistance) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(0, 240, 255, ${0.1 - distance / connectDistance * 0.1})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[a].x, particles[a].y);
                        ctx.lineTo(particles[b].x, particles[b].y);
                        ctx.stroke();
                    }
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
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)] opacity-60" />
        </div>
    );
}
