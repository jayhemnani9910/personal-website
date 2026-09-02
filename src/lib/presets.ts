// The parts of the decomposer that both the browser and the route need:
// the length cap and the two preset lookups.
//
// These used to live in decompose.ts, next to the Zod schema and the prompt.
// That put Zod in the home page's first-load bundle, because Decomposer.tsx
// imports the lookups and a bundler cannot drop a module whose top level
// builds schema objects. Splitting them costs one file and takes about 140 KB
// of JavaScript off a page that never validates anything.
//
// Nothing here may import zod, the prompt, or anything server-only.

import { PRESETS } from "@/data/home";
import type { Preset } from "@/data/home";

// The longest brief the route accepts. Presets and the model call both sit
// behind this, so it bounds token spend as well as abuse.
export const BRIEF_MAX = 600;

/**
 * The offline fallback: no model call, no network. Mirrors the design's
 * fallback() (docs/design, portfolio-home export, line 341) so a visitor
 * without a live backend still gets a plausible answer shaped like a real
 * one, just not read from their actual brief.
 */
export function closestPreset(text: string): Preset {
  const lower = text.toLowerCase();
  if (/(data|dashboard|metric|number|warehouse|trust)/.test(lower)) return PRESETS[1];
  if (/(model|ml|notebook|predict|vision|video|customer)/.test(lower)) return PRESETS[2];
  return PRESETS[0];
}

/** Exact-text match against the three worked examples on the page. */
export function findPreset(text: string): Preset | undefined {
  return PRESETS.find((p) => p.text === text);
}
