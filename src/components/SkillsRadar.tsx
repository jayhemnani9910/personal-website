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
    const [hasSize, setHasSize] = useState(false);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Check initial size
        if (container.offsetWidth > 0 && container.offsetHeight > 0) {
            setHasSize(true);
            return;
        }

        // Use ResizeObserver to wait for container to have dimensions
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
                    setHasSize(true);
                    observer.disconnect();
                }
            }
        });

        observer.observe(container);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={containerRef} className="w-full h-[300px] md:h-[400px]">
            {hasSize && (
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: "var(--color-text-secondary)", fontSize: 12 }}
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

