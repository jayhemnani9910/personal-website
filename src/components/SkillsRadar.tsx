"use client";
import { useState, useEffect, useRef } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

interface Skill {
    subject: string;
    A: number;
    fullMark: number;
}

interface SkillsRadarProps {
    data: Skill[];
}

export function SkillsRadar({ data }: SkillsRadarProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let timeoutId: NodeJS.Timeout;

        // Small delay to ensure layout is stable and container has dimensions
        const scheduleRender = () => {
            timeoutId = setTimeout(() => {
                if (container.offsetWidth > 0 && container.offsetHeight > 0) {
                    setIsReady(true);
                }
            }, 100);
        };

        // Use ResizeObserver to detect when container gets dimensions
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
                    scheduleRender();
                    observer.disconnect();
                    break;
                }
            }
        });

        // Check if already has size, otherwise observe
        if (container.offsetWidth > 0 && container.offsetHeight > 0) {
            scheduleRender();
        } else {
            observer.observe(container);
        }

        return () => {
            observer.disconnect();
            clearTimeout(timeoutId);
        };
    }, []);

    return (
        <div ref={containerRef} className="w-full h-full min-h-[180px]">
            {isReady && (
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: "var(--color-text-secondary)", fontSize: 10 }}
                        />
                        <Radar
                            name="Skills"
                            dataKey="A"
                            stroke="var(--color-accent-primary)"
                            fill="var(--color-accent-primary)"
                            fillOpacity={0.3}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}


