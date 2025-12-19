import { Network, Brain, Zap, Code, Database } from "lucide-react";

export interface SkillDomain {
    id: string;
    title: string;
    icon: typeof Network;
    skills: string[];
    source: string;
    color: string; // accent color for the domain
}

export const SKILL_DOMAINS: SkillDomain[] = [
    {
        id: "distributed-systems",
        title: "Distributed Systems",
        icon: Network,
        skills: ["Apache Kafka", "Microservices", "Event-Driven", "Docker", "Kubernetes"],
        source: "DATA 236 · MS @ SJSU",
        color: "#3b82f6" // blue
    },
    {
        id: "ai-llm-engineering",
        title: "AI & LLM Engineering",
        icon: Brain,
        skills: ["LangChain", "Vector Embeddings", "Semantic Cache", "AI Agents", "GEval"],
        source: "DATA 236 · MS @ SJSU",
        color: "#8b5cf6" // purple
    },
    {
        id: "caching-performance",
        title: "Caching & Performance",
        icon: Zap,
        skills: ["Redis", "Semantic Caching", "HNSW Indexing", "TTL Strategies"],
        source: "DATA 236 · MS @ SJSU",
        color: "#f59e0b" // amber
    },
    {
        id: "fullstack-development",
        title: "Full-Stack Development",
        icon: Code,
        skills: ["React", "Redux", "Node.js", "Express", "FastAPI"],
        source: "DATA 236 · MS @ SJSU",
        color: "#10b981" // green
    },
    {
        id: "databases",
        title: "Databases",
        icon: Database,
        skills: ["MongoDB", "MySQL", "Redis Stack", "Vector Search"],
        source: "DATA 236 · MS @ SJSU",
        color: "#ec4899" // pink
    }
];
