import { Network, Brain, Eye, Workflow, FlaskConical, Code, Database } from "lucide-react";

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
        skills: ["LangChain", "LangGraph", "AI Agents", "RAG", "Semantic Search"],
        color: "#8b5cf6" // purple
    },
    {
        id: "computer-vision",
        title: "Computer Vision",
        icon: Eye,
        skills: ["PyTorch", "RF-DETR", "SAM2", "SigLIP", "ByteTrack"],
        color: "#06b6d4" // cyan
    },
    {
        id: "data-engineering",
        title: "Data Engineering",
        icon: Workflow,
        skills: ["Apache Airflow", "TimescaleDB", "ETL Pipelines", "Stream Processing"],
        color: "#f97316" // orange
    },
    {
        id: "mlops-experimentation",
        title: "MLOps & Experimentation",
        icon: FlaskConical,
        skills: ["Weights & Biases", "MLflow", "Experiment Tracking", "Model Benchmarking"],
        color: "#84cc16" // lime
    },
    {
        id: "fullstack-visualization",
        title: "Full-Stack & Visualization",
        icon: Code,
        skills: ["React", "Node.js", "FastAPI", "Streamlit", "Plotly"],
        color: "#10b981" // green
    },
    {
        id: "databases-storage",
        title: "Databases & Storage",
        icon: Database,
        skills: ["PostgreSQL", "MongoDB", "Redis", "pgvector", "FAISS"],
        color: "#ec4899" // pink
    }
];
