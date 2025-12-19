export interface TimelineItem {
    id: string;
    status: "now" | "recent" | "exploring" | "upcoming";
    title: string;
    description: string;
    tags?: string[];
    link?: string;
}

export const TIMELINE_ITEMS: TimelineItem[] = [
    {
        id: "website-revamp",
        status: "now",
        title: "Personal Website Revamp",
        description: "Visual demo pages, animated components, better UX",
        tags: ["Next.js", "React", "Framer Motion"]
    },
    {
        id: "distributed-systems",
        status: "recent",
        title: "Distributed Systems Deep Dive",
        description: "Event-driven architecture, microservices, Kafka pipelines",
        tags: ["Kafka", "Docker", "K8s"]
    },
    {
        id: "ai-agents",
        status: "exploring",
        title: "AI Agents & RAG Systems",
        description: "LangChain agents, semantic search, vector embeddings",
        tags: ["LangChain", "OpenAI", "Redis"]
    },
    {
        id: "automated-blog",
        status: "upcoming",
        title: "Automated Blog Pipeline",
        description: "Content automation and publishing workflow",
        tags: ["Automation", "CI/CD"]
    }
];

// Status config for display
export const STATUS_CONFIG = {
    now: { label: "Now", color: "#ef4444", bgColor: "#ef444420" },
    recent: { label: "Recent", color: "#3b82f6", bgColor: "#3b82f620" },
    exploring: { label: "Exploring", color: "#8b5cf6", bgColor: "#8b5cf620" },
    upcoming: { label: "Upcoming", color: "#10b981", bgColor: "#10b98120" }
} as const;
