"use client";
import { useState, useEffect, useRef } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis } from "recharts";

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
    const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const updateDimensions = () => {
            const { width, height } = container.getBoundingClientRect();
            if (width > 0 && height > 0) {
                setDimensions({ width, height });
            }
        };

        // Delay to ensure layout is ready
        const timeoutId = setTimeout(updateDimensions, 150);

        // Also observe for resize
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
                    setDimensions({
                        width: entry.contentRect.width,
                        height: entry.contentRect.height
                    });
                }
            }
        });
        observer.observe(container);

        return () => {
            clearTimeout(timeoutId);
            observer.disconnect();
        };
    }, []);

    return (
        <div ref={containerRef} className="w-full h-full min-h-[180px] flex items-center justify-center">
            {dimensions && (
                <RadarChart
                    width={dimensions.width}
                    height={dimensions.height}
                    cx="50%"
                    cy="50%"
                    outerRadius="70%"
                    data={data}
                >
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
            )}
        </div>
    );
}



