export interface LabItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  progress?: number;
  link?: string;
}

export const LAB_ITEMS: Record<"building" | "exploring" | "radar", LabItem[]> = {
  building: [
    {
      id: "website-v4",
      title: "Portfolio V4",
      description:
        "This website - sans and mono on a yellow accent, a live brief decomposer on the home page, AI-queryable via WebMCP",
      tags: ["Next.js 16", "Framer Motion", "WebGL"],
      progress: 100,
      link: "https://github.com/jayhemnani9910/personal-website",
    },
    {
      id: "blog-pipeline",
      title: "Automated Blog Pipeline",
      description:
        "AI-assisted content generation and publishing workflow",
      tags: ["Claude API", "GitHub Actions", "MDX"],
      progress: 20,
    },
    {
      id: "webmcp-portfolio",
      title: "WebMCP Integration",
      description:
        "The proposed WebMCP browser API (a W3C Community Group draft), making this portfolio queryable by an AI agent in Chrome with the WebMCP flag on",
      tags: ["WebMCP", "AI Agents", "Chrome"],
      progress: 100,
      link: "https://jayhemnani.in/projects/webmcp-portfolio",
    },
  ],
  exploring: [
    {
      id: "ai-agents",
      title: "AI Agent Architectures",
      description:
        "LangChain agents, RAG systems, semantic caching patterns",
      tags: ["LangChain", "OpenAI", "Redis Vector"],
    },
    {
      id: "distributed-patterns",
      title: "Distributed System Patterns",
      description:
        "Event sourcing, CQRS, saga patterns with Kafka",
      tags: ["Kafka", "Event-Driven", "Microservices"],
    },
    {
      id: "edge-computing",
      title: "Edge AI",
      description:
        "Running ML models in browser with ONNX and WebGPU",
      tags: ["ONNX", "WebGPU", "TensorFlow.js"],
    },
  ],
  radar: [
    {
      id: "claude-sdk",
      title: "Claude Agent SDK",
      description:
        "Building custom AI agents with Anthropic's new SDK",
      tags: ["Anthropic", "Agents"],
    },
    {
      id: "local-llm",
      title: "Local LLM Tooling",
      description:
        "Ollama, llama.cpp, private document search",
      tags: ["Ollama", "Privacy-First"],
    },
    {
      id: "realtime-collab",
      title: "Real-time Collaboration",
      description:
        "CRDTs, operational transforms, multiplayer patterns",
      tags: ["WebSocket", "CRDTs"],
    },
  ],
};

/** Flat list of all lab experiments (used by WebMCP) */
export const LAB_EXPERIMENTS = [
  ...LAB_ITEMS.building,
  ...LAB_ITEMS.exploring,
  ...LAB_ITEMS.radar,
];
