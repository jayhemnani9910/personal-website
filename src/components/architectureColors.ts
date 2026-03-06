import type { ArchitectureNode } from "@/data/types";

export const typeColors: Record<ArchitectureNode["type"], string> = {
    database: "var(--neon-purple)",
    service: "var(--neon-cyan)",
    stream: "var(--neon-blue)",
    client: "#c7d2fe",
    cache: "#fbbf24",
    queue: "#22d3ee",
    ml: "#c084fc",
    search: "#a855f7",
    other: "var(--glass-border)"
};
