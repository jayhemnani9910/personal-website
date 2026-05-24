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
    };

export type ShowcaseConfig = {
  hero?: string;
  heroTag?: string;
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
