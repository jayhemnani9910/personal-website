// The shape /api/fde-sim returns, and the guard that decides whether a model
// response is allowed to become one.
//
// This lives outside route.ts for two reasons. Next validates the exports of a
// route file, so the guard could not be exported for testing from there. And the
// guard is load-bearing in a way it did not used to be: what it accepts is what
// gets written to a 30-day cache, and what a later cache hit replays section by
// section to the browser.

export interface ArchComponent {
  id: string;
  name: string;
  kind: "ui" | "service" | "agent" | "data" | "external";
  col?: number;
  row?: number;
  sub: string;
  x?: number;
  y?: number;
}

export interface ArchEdge {
  from: string;
  to: string;
  label: string;
  dashed: boolean;
}

export interface SimPayload {
  scope: { q: string; why: string }[];
  decomposition: { id: string; title: string; why: string }[];
  architecture: { components: ArchComponent[]; edges: ArchEdge[] };
  sprint: { day: string; title: string; deliv: string }[];
  risks: { risk: string; mitigation: string }[];
}

/**
 * The order SIM_RESPONSE_SCHEMA declares, which is the order the sections
 * complete in, which is the order a cache hit replays them in.
 */
export const SECTION_ORDER = [
  "scope",
  "decomposition",
  "architecture",
  "sprint",
  "risks",
] as const;

/** The four sections that are plain arrays. `architecture` is checked separately. */
const ARRAY_SECTIONS = SECTION_ORDER.filter((k) => k !== "architecture");

/**
 * Guards against a malformed model response (valid JSON, wrong shape) being
 * treated as an answer.
 *
 * It used to check only that architecture.components was an array, on the
 * reasoning that this was the one field the route touched before returning.
 * Streaming ended that: a cache hit now replays every key in SECTION_ORDER, so a
 * payload missing `sprint` is sent as an event whose value JSON.stringify drops
 * entirely. The client reads that as a section that never arrived and renders a
 * blank panel with the tab disabled, for the full 30 days of the cache TTL.
 *
 * So the guard checks every section the replay will ask for. Deliberately shape
 * only: whether the contents are any *good* is what the golden set grades.
 */
export function isSimPayload(p: unknown): p is SimPayload {
  if (!p || typeof p !== "object") return false;
  const o = p as Record<string, unknown>;

  for (const key of ARRAY_SECTIONS) {
    if (!Array.isArray(o[key])) return false;
  }

  const arch = o.architecture;
  if (!arch || typeof arch !== "object") return false;
  const { components, edges } = arch as { components?: unknown; edges?: unknown };
  // FdeArchDiagram maps over both, so a payload carrying one and not the other
  // renders a diagram with no connections rather than failing honestly here.
  return Array.isArray(components) && Array.isArray(edges);
}
