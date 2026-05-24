// Per-project showcase config. A project listed here renders as a technical
// showcase (tabbed) instead of the standard dossier. Plain module (no
// "use client") so server components can read it without RSC turning it into
// a client reference.

export type ShowcaseDemo =
  | { kind: "iframe"; url: string }
  | {
      kind: "compare";
      pairs: { before: string; after: string; label?: string }[];
      liveUrl?: string;
    }
  | {
      kind: "report";
      title: string;
      note: string;
      findings: { verdict: "VERIFIED" | "CONTESTED" | "UNVERIFIED"; text: string }[];
      sourceUrl?: string;
    }
  | {
      kind: "tools";
      note: string;
      tools: { name: string; kind: "read" | "write"; description: string }[];
      sample: { tool: string; request: string; response: string };
    };

export type ShowcaseConfig = {
  hero?: string;
  heroTag?: string;
  heroFit?: "cover" | "contain";
  arch?: string;
  demo?: ShowcaseDemo;
};

export const SHOWCASE_PROJECTS: Record<string, ShowcaseConfig> = {
  "stock-data-platform": {
    hero: "/projects/stock/dashboard.png",
    heroTag: "Live dashboard",
    arch: "/projects/stock/architecture.png",
    // demo falls back to links.demo (iframe) from the MDX
  },
  "fifa-soccer-ds": {
    hero: "/projects/fifa/overlay_5.jpg",
    heroTag: "YOLOv8 + ByteTrack",
    demo: {
      kind: "compare",
      liveUrl: "https://jayhemnani9910.github.io/fifa-soccer-ds/",
      pairs: [
        { before: "/projects/fifa/input_5.jpg", after: "/projects/fifa/overlay_5.jpg", label: "RMA vs BAR" },
        { before: "/projects/fifa/input_8.jpg", after: "/projects/fifa/overlay_8.jpg" },
        { before: "/projects/fifa/input_10.jpg", after: "/projects/fifa/overlay_10.jpg" },
        { before: "/projects/fifa/input_15.jpg", after: "/projects/fifa/overlay_15.jpg" },
      ],
    },
  },
  "soccer-vision-research": {
    hero: "/projects/svr/pipeline.png",
    heroTag: "RF-DETR · SAM2 · SigLIP",
    // Demo tab iframes the live landing page (from MDX links.demo)
  },
  "biotech-accelerator": {
    hero: "/projects/bio/pipeline.png",
    heroFit: "contain",
    heroTag: "LangGraph · UniProt · PDB · ChEMBL",
    arch: "/projects/bio/architecture.png",
    // Demo tab iframes the live site (from MDX links.demo)
  },
  "scheduling-visualizer": {
    // hero: "/projects/scheduling/gantt.png",  // enable once gantt.png is placed
    heroTag: "9 algorithms · Gantt",
    // Demo tab iframes the live app (from MDX links.demo)
  },
  "rubiks-timer": {
    // hero: "/projects/rubiks/app.png",  // enable once a fresh screenshot is placed
    heroTag: "Three.js · WASM solver",
    // Demo tab iframes the live app (from MDX links.demo)
  },
  "webcrawler": {
    // hero: "/projects/webcrawler/pipeline.png",  // enable once pipeline.png is placed
    heroTag: "ArchiveBox · Merkle · OpenTimestamps",
    // Demo tab iframes the GitHub Pages docs (from MDX links.demo)
  },
  "contextbox": {
    // hero: "/projects/contextbox/pipeline.png",  // enable once pipeline.png is placed
    heroTag: "OCR · embeddings · Q&A",
    // Demo tab iframes the live docs site (from MDX links.demo)
  },
  "webmcp-portfolio": {
    hero: "/projects/webmcp/handshake.png",
    heroTag: "navigator.modelContext",
    demo: {
      kind: "tools",
      note: "The 8 tools this site registers with the WebMCP browser API. An agent in Chrome 146+ calls them directly; here is the catalog and one sample call.",
      tools: [
        { name: "search_projects", kind: "read", description: "Search projects by query, tech, tag, domain, or featured-only." },
        { name: "get_project", kind: "read", description: "Full details for one project by ID: challenge, solution, impact, stack." },
        { name: "get_resume", kind: "read", description: "Resume data by section: experience, education, skills, competencies, contact." },
        { name: "search_skills", kind: "read", description: "Technical skills by category or keyword." },
        { name: "get_contact", kind: "read", description: "Contact info and social links." },
        { name: "list_experiments", kind: "read", description: "What Jay is currently building, exploring, or watching in the lab." },
        { name: "toggle_theme", kind: "write", description: "Switch the site between light and dark theme." },
        { name: "switch_mode", kind: "write", description: "Switch presentation mode: portfolio, brand, product, or blog." },
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
      "tech": ["Python", "PyTorch", "ProDy", "Transformers"],
      "domain": "Computational Biology",
      "url": "https://jayhemnani.me/projects/nobel-dataintelligence"
    },
    {
      "id": "biotech-accelerator",
      "title": "Biotech Accelerator",
      "tech": ["Python", "LangGraph", "ProDy", "httpx"],
      "domain": "AI/ML",
      "url": "https://jayhemnani.me/projects/biotech-accelerator"
    }
  ]
}`,
      },
    },
  },
  "nobel-dataintelligence": {
    hero: "/projects/nobel/fusion.png",
    heroTag: "ProtT5 · VDOS · ChemBERTa",
    // Demo tab iframes the live site (from MDX links.demo)
  },
  "revolu-idea": {
    hero: "/projects/cag/flow.png",
    heroTag: "Causal-Adversarial · LangGraph",
    demo: {
      kind: "report",
      title: "Impact of remote work on productivity",
      note: "Static sample showing the shape of a CAG run, verdict-tagged findings. A real run grounds each claim in web citations and evidence objects.",
      findings: [
        { verdict: "VERIFIED", text: "Productivity impact is not uniform; it varies by role, tooling, and meeting load." },
        { verdict: "CONTESTED", text: "Fully remote always increases productivity compared to hybrid arrangements." },
        { verdict: "VERIFIED", text: "Strong async practices reduce coordination overhead for distributed teams." },
        { verdict: "UNVERIFIED", text: "A single policy works well for every team without exceptions." },
      ],
      sourceUrl: "https://github.com/jayhemnani9910/revolu-idea",
    },
  },
};
