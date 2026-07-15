import type { ArchitectureNode } from "@/data/types";

// TWO READERS: ember is the only saturated colour, reserved for the one surface the
// human acts on (the client). Every other node type steps down through the neutral
// text tiers — the node already prints its kind as a mono label, so hue is not what
// carries the category. These editorial vars inherit the .tr-editorial-scope override
// on the project page, so they resolve to the --tr-* palette in both themes.
export const typeColors: Record<ArchitectureNode["type"], string> = {
    client: "var(--accent)",
    ml: "var(--ink)",
    service: "var(--ink-mute)",
    search: "var(--ink-mute)",
    database: "var(--ink-mute)",
    stream: "var(--ink-mute)",
    cache: "var(--ink-faint)",
    queue: "var(--ink-faint)",
    other: "var(--ink-faint)",
};
