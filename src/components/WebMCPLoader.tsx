import { getAllProjects } from "@/lib/content";
import { RESUME } from "@/data/resume";
import { SITE_CONFIG } from "@/../content/site";
import { WebMCPProvider } from "./WebMCPProvider";
import type { SiteData } from "@/lib/webmcp";

// Lab experiments (duplicated from lab page since they're inline there)
const LAB_EXPERIMENTS = [
  { id: "website-v3", title: "Portfolio V3", description: "Visual demo pages, animated components, AI-powered features", tags: ["Next.js", "Framer Motion", "Three.js"], progress: 85 },
  { id: "blog-pipeline", title: "Automated Blog Pipeline", description: "AI-assisted content generation and publishing workflow", tags: ["Claude API", "GitHub Actions", "MDX"], progress: 20 },
  { id: "ai-agents", title: "AI Agent Architectures", description: "LangChain agents, RAG systems, semantic caching patterns", tags: ["LangChain", "OpenAI", "Redis Vector"] },
  { id: "distributed-patterns", title: "Distributed System Patterns", description: "Event sourcing, CQRS, saga patterns with Kafka", tags: ["Kafka", "Event-Driven", "Microservices"] },
  { id: "edge-computing", title: "Edge AI", description: "Running ML models in browser with ONNX and WebGPU", tags: ["ONNX", "WebGPU", "TensorFlow.js"] },
  { id: "claude-sdk", title: "Claude Agent SDK", description: "Building custom AI agents with Anthropic's new SDK", tags: ["Anthropic", "Agents"] },
  { id: "local-llm", title: "Local LLM Tooling", description: "Ollama, llama.cpp, private document search", tags: ["Ollama", "Privacy-First"] },
  { id: "webmcp-portfolio", title: "WebMCP Integration", description: "W3C WebMCP standard integration — making this portfolio AI-agent queryable", tags: ["WebMCP", "W3C", "Chrome 146", "AI Agents"], progress: 70 },
];

/**
 * Server component that loads site data at build time
 * and passes it to the WebMCPProvider client component.
 */
export async function WebMCPLoader() {
  const projects = await getAllProjects();

  const data: SiteData = {
    projects: projects.map((p) => ({
      id: p.id,
      title: p.title,
      summary: p.summary,
      role: p.role,
      period: p.period,
      domain: p.domain,
      tags: p.tags,
      tech: p.tech,
      featured: p.featured,
      priority: p.priority,
      github: p.github,
      challenge: p.challenge,
      solution: p.solution,
      impact: p.impact,
    })),
    resume: {
      name: RESUME.name,
      tagline: RESUME.tagline,
      summary: RESUME.summary,
      location: RESUME.location,
      contact: RESUME.contact,
      coreCompetencies: RESUME.coreCompetencies,
      skills: RESUME.skills,
      experience: RESUME.experience.map((e) => ({
        name: e.name,
        location: e.location,
        roles: e.roles.map((r) => ({
          title: r.title,
          employmentType: r.employmentType,
          period: r.period ? { label: r.period.label } : undefined,
          location: r.location,
          tech: r.tech,
          bullets: r.bullets,
        })),
      })),
      education: RESUME.education.map((e) => ({
        institution: e.institution,
        degree: e.degree,
        location: e.location,
        start: e.start,
        end: e.end,
        gpa: e.gpa,
      })),
    },
    social: SITE_CONFIG.social,
    experiments: LAB_EXPERIMENTS,
  };

  return <WebMCPProvider data={data} />;
}
