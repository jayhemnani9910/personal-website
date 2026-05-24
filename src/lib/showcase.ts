// Per-project showcase assets. A project listed here renders as a technical
// showcase (tabbed) instead of the standard dossier. Plain module (no
// "use client") so server components can read it without RSC turning it into
// a client reference.
export const SHOWCASE_PROJECTS: Record<string, { hero: string; arch?: string }> = {
  "stock-data-platform": {
    hero: "/projects/stock/dashboard.png",
    arch: "/projects/stock/architecture.png",
  },
};
