// Prompt, schema and cache-key construction for /api/decompose, kept out of
// the route file for the same reason fde-prompt.ts is: these pieces are
// unit-testable on their own, and Next validates the exports of a route file
// so none of this could be exported from there. See fde-prompt.ts, which this
// mirrors, and decompose.test.ts.

import { z } from "zod";
import { FEATURED } from "@/data/home";
import type { DecomposeOutput } from "@/data/home";

export const DecomposeOutputSchema = z.object({
  scope: z.array(z.string().min(1)).length(3),
  architecture: z.array(z.string().min(1)).length(3),
  plan: z.array(z.string().min(1)).length(3),
  risks: z.array(z.string().min(1)).length(3),
  match: z.array(z.string()).max(2),
});

// Compile-time-only: proves the schema's inferred shape is assignable to the
// structural DecomposeOutput type declared in @/data/home (a type-only
// import, erased at build, so this does not create a runtime cycle back to
// this module). If a schema edit ever diverges from that type, this line
// fails `tsc` instead of surfacing later as a mismatch between what this
// route validates and what the rest of the app expects to render.
type Inferred = z.infer<typeof DecomposeOutputSchema>;
const _assignable: DecomposeOutput = {} as Inferred;
void _assignable;

// Re-exported, not defined here. They live in presets.ts so the browser can
// import them without dragging Zod along; this module stays the one place the
// route and its tests import from.
export { BRIEF_MAX, closestPreset, findPreset } from "@/lib/presets";

// Built once at module load: one line per featured project, so the model has
// real ids to choose from and can't invent one the route would then have to
// filter out silently.
const PROJECT_LINES = FEATURED.map((p) => `${p.id} [${p.tags.join(", ")}]: ${p.did}`).join("\n");

export const DECOMPOSE_SYSTEM = `You are the decomposition engine on Jay Hemnani's portfolio. Jay is a Forward Deployed Engineer (agentic AI, data pipelines, distributed backends, computer vision). Given a vague customer brief, return ONLY JSON: {"scope":[3 short lines],"architecture":[3],"plan":[3 lines, week-by-week],"risks":[3],"match":[up to 2 project ids]}. Terse, concrete, no fluff, boring parts first. Never use em-dashes or en-dashes. Project ids to choose from:
${PROJECT_LINES}`;

// Every array field is exactly 3 items except match, which is 0 to 2: the
// model picks project ids, it doesn't have to find any.
const THREE_STRINGS = { type: "ARRAY", items: { type: "STRING" }, minItems: 3, maxItems: 3 };

/**
 * Build the Gemini request body.
 *
 * Mirrors buildGeminiBody's structure (systemInstruction / contents /
 * generationConfig): the rules live in systemInstruction, the visitor's brief
 * is its own user turn.
 *
 * The brief is fenced in a tag and followed by a fixed instruction, the same
 * shape fde-prompt.ts uses. Anyone can type into this box from the public home
 * page, so the text arrives as data to be read rather than as further
 * instructions, and the turn ends on a line the visitor did not write.
 */
export function buildDecomposeBody(brief: string) {
  return {
    systemInstruction: { parts: [{ text: DECOMPOSE_SYSTEM }] },
    contents: [
      {
        role: "user",
        parts: [{ text: `<customer_brief>\n${brief}\n</customer_brief>\n\nReturn the JSON now.` }],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "OBJECT",
        properties: {
          scope: THREE_STRINGS,
          architecture: THREE_STRINGS,
          plan: THREE_STRINGS,
          risks: THREE_STRINGS,
          match: { type: "ARRAY", items: { type: "STRING" }, maxItems: 2 },
        },
        required: ["scope", "architecture", "plan", "risks", "match"],
      },
      // ADR 0012 turned thinking off for the sibling simulation model on this
      // site (gemini-2.5-flash thinks before its first output token, so
      // streaming can't hide that wait) and measured roughly half the
      // latency for a wash on answer quality there. Same setting here, on
      // the same model, for the same reason.
      thinkingConfig: { thinkingBudget: 0 },
    },
  };
}

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Cache key for one brief under one recipe.
 *
 * `recipe` is everything that decides what an answer looks like: the model,
 * the system prompt, the response schema and the generation config. It has
 * to be part of the key, for the same reason it is in simCacheKey (see
 * fde-prompt.ts): a key built from the brief alone means that editing the
 * prompt, the schema or the model leaves every previously-seen brief
 * returning an answer from a configuration that no longer exists, for the
 * full TTL.
 *
 * The brief is normalised for case and whitespace so trivially different
 * phrasings of the same question share an answer.
 */
export async function decomposeCacheKey(brief: string, recipe: unknown): Promise<string> {
  const normalised = brief.toLowerCase().replace(/\s+/g, " ").trim();
  const [recipeHash, briefHash] = await Promise.all([
    sha256Hex(JSON.stringify(recipe)).then((h) => h.slice(0, 12)),
    sha256Hex(normalised),
  ]);
  return `decompose:v1:${recipeHash}:${briefHash}`;
}
