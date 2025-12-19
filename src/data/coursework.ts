import { Network, Brain, Zap, Code, Database } from "lucide-react";

export interface SkillDomain {
    id: string;
    title: string;
    icon: typeof Network;
    skills: string[];
    color: string; // accent color for the domain
}

export const SKILL_DOMAINS: SkillDomain[] = [
    {
        id: "distributed-systems",
        title: "Distributed Systems",
        icon: Network,
        skills: ["Apache Kafka", "Microservices", "Event-Driven", "Docker", "Kubernetes"],
        color: "#3b82f6" // blue
    },
    {
        id: "ai-llm-engineering",
        title: "AI & LLM Engineering",
        icon: Brain,
        skills: ["LangChain", "Vector Embeddings", "Semantic Cache", "AI Agents", "GEval"],
        color: "#8b5cf6" // purple
    },
    {
        id: "caching-performance",
        title: "Caching & Performance",
        icon: Zap,
        skills: ["Redis", "Semantic Caching", "HNSW Indexing", "TTL Strategies"],
        color: "#f59e0b" // amber
    },
    {
        id: "fullstack-development",
        title: "Full-Stack Development",
        icon: Code,
        skills: ["React", "Redux", "Node.js", "Express", "FastAPI"],
        color: "#10b981" // green
    },
    {
        id: "databases",
        title: "Databases",
        icon: Database,
        skills: ["MongoDB", "MySQL", "Redis Stack", "Vector Search"],
        color: "#ec4899" // pink
    }
];
