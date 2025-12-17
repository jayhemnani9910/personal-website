"use client";
import { useState, useEffect } from "react";
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
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return <div className="w-full h-[300px] md:h-[400px]" />;
    }

    return (
        <div className="w-full h-[300px] md:h-[400px]">
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
        </div>
    );
}
