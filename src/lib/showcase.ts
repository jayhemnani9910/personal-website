// Per-project extras for the project page: an architecture diagram (`arch`)
// and a demo block (`demo`), both rendered by ProjectDetail. Plain module (no
// "use client") so server components can read it without RSC turning it into
// a client reference.

import { WEBMCP_TOOL_COUNT } from "@/lib/webmcp-tools";

export type ShowcaseDemo =
  | {
      kind: "compare";
      pairs: { before: string; after: string; label?: string }[];
    }
  | {
      kind: "report";
      title: string;
      note: string;
      findings: { verdict: "VERIFIED" | "FALSIFIED" | "UNCLEAR"; text: string }[];
      sourceUrl?: string;
    }
  | {
      kind: "tools";
      note: string;
      tools: { name: string; kind: "read" | "write"; description: string }[];
      sample: { tool: string; request: string; response: string };
    };

export type ShowcaseConfig = {
  demo?: ShowcaseDemo;
};

export const SHOWCASE_PROJECTS: Record<string, ShowcaseConfig> = {
  "fifa-soccer-ds": {
    demo: {
      kind: "compare",
      pairs: [
        { before: "/projects/fifa/input_5.jpg", after: "/projects/fifa/overlay_5.jpg", label: "RMA vs BAR" },
        { before: "/projects/fifa/input_8.jpg", after: "/projects/fifa/overlay_8.jpg" },
        { before: "/projects/fifa/input_10.jpg", after: "/projects/fifa/overlay_10.jpg" },
        { before: "/projects/fifa/input_15.jpg", after: "/projects/fifa/overlay_15.jpg" },
      ],
    },
  },
  "webmcp-portfolio": {
    demo: {
      kind: "tools",
      note: `The ${WEBMCP_TOOL_COUNT} tools this site registers with the WebMCP browser API. An agent in Chrome with the WebMCP flag on calls them directly; here is the catalog and one sample call.`,
      tools: [
        { name: "search_projects", kind: "read", description: "Search projects by query, tech, tag, domain, or featured-only." },
        { name: "get_project", kind: "read", description: "Full details for one project by ID: challenge, solution, impact, stack." },
        { name: "get_resume", kind: "read", description: "Resume data by section: experience, education, publications, skills, competencies, contact." },
        { name: "search_skills", kind: "read", description: "Technical skills by category or keyword." },
        { name: "get_contact", kind: "read", description: "Contact info and social links." },
        { name: "list_experiments", kind: "read", description: "What Jay is currently building, exploring, or watching in the lab." },
        { name: "switch_mode", kind: "write", description: "Toggle reader mode: a calm, motion-free reading view, or back to the full site." },
      ],
      sample: {
        tool: "search_projects",
        request: `{
  "tool": "search_projects",
  "arguments": { "query": "protein", "featured_only": true }
}`,
        response: `{
  "count": 2,
  "projects": [
    {
      "id": "nobel-dataintelligence",
      "title": "Nobel Data Intelligence",
      "summary": "Physics-informed deep learning for protein stability and enzyme kinetics. A tri-modal architecture fuses ProtT5 sequence embeddings, a VDOS vibrational spectrum from normal mode analysis, and ChemBERTa chemistry through learned gated attention.",
      "tech": ["Python", "PyTorch", "ProDy", "Transformers", "RDKit", "Biopython"],
      "tags": ["deep-learning", "molecular-biology", "pytorch", "research", "protein"],
      "domain": "Research",
      "url": "https://jayhemnani.in/projects/nobel-dataintelligence"
    },
    {
      "id": "biotech-accelerator",
      "title": "Biotech Accelerator",
      "summary": "Multi-agent AI system for biotech research that routes a query through protein databases, literature, structural analysis, and chemistry, then proposes experiments worth running next.",
      "tech": ["Python", "LangGraph", "ProDy", "httpx", "Rich", "Docker"],
      "tags": ["langgraph", "agents", "bioinformatics", "research"],
      "domain": "AI/ML",
      "url": "https://jayhemnani.in/projects/biotech-accelerator"
    }
  ]
}`,
      },
    },
  },
  "revolu-idea": {
    demo: {
      kind: "report",
      title: "Impact of remote work on productivity",
      note: "Static sample showing the shape of a CAG run, verdict-tagged findings. A real run grounds each claim in web citations and evidence objects.",
      findings: [
        { verdict: "VERIFIED", text: "Productivity impact is not uniform; it varies by role, tooling, and meeting load." },
        { verdict: "FALSIFIED", text: "Fully remote always increases productivity compared to hybrid arrangements." },
        { verdict: "VERIFIED", text: "Strong async practices reduce coordination overhead for distributed teams." },
        { verdict: "UNCLEAR", text: "A single policy works well for every team without exceptions." },
      ],
      sourceUrl: "https://github.com/jayhemnani9910/revolu-idea",
    },
  },
};
