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
};
