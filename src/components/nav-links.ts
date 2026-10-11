import type { Route } from "next";

// Every page the site links from its header, in one list so the home page's
// nav, the inner pages' nav and both footers cannot drift apart. /fde and /lab
// stay live and reachable by URL but are not linked here (ADR 0014, decision D3).
export const NAV: { label: string; href: Route }[] = [
  { label: "work", href: "/projects" },
  { label: "writing", href: "/blog" },
  { label: "oss", href: "/oss" },
  { label: "about", href: "/resume" },
  { label: "channel", href: "/youtube" },
];
