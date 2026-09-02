import { describe, expect, it } from "vitest";
import { FEATURED, PRESETS } from "@/data/home";
import {
  BRIEF_MAX,
  DECOMPOSE_SYSTEM,
  DecomposeOutputSchema,
  buildDecomposeBody,
  closestPreset,
  decomposeCacheKey,
  findPreset,
} from "./decompose";

describe("closestPreset", () => {
  it("matches the data/dashboard/trust group", () => {
    expect(closestPreset("we have data nobody trusts")).toBe(PRESETS[1]);
  });

  it("matches the model/notebook group", () => {
    expect(closestPreset("our model is stuck in a notebook")).toBe(PRESETS[2]);
  });

  it("falls back to the first preset when nothing matches", () => {
    expect(closestPreset("hello there")).toBe(PRESETS[0]);
  });
});

describe("findPreset", () => {
  it("finds a preset by its exact text", () => {
    expect(findPreset(PRESETS[0].text)).toBe(PRESETS[0]);
  });

  it("returns undefined for text that matches no preset", () => {
    expect(findPreset("something else")).toBeUndefined();
  });
});

describe("DecomposeOutputSchema", () => {
  const VALID = {
    scope: ["a", "b", "c"],
    architecture: ["a", "b", "c"],
    plan: ["a", "b", "c"],
    risks: ["a", "b", "c"],
    match: ["x"],
  };

  it("accepts a well-formed output", () => {
    expect(DecomposeOutputSchema.safeParse(VALID).success).toBe(true);
  });

  it("rejects a 2-item scope", () => {
    const bad = { ...VALID, scope: ["a", "b"] };
    expect(DecomposeOutputSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects a 3-item match", () => {
    const bad = { ...VALID, match: ["x", "y", "z"] };
    expect(DecomposeOutputSchema.safeParse(bad).success).toBe(false);
  });
});

describe("buildDecomposeBody", () => {
  it("requests JSON mode with thinking off and the five-key response schema", () => {
    const body = buildDecomposeBody("x") as {
      generationConfig: {
        responseMimeType: string;
        thinkingConfig: { thinkingBudget: number };
        responseSchema: { properties: Record<string, unknown> };
      };
    };
    expect(body.generationConfig.responseMimeType).toBe("application/json");
    expect(body.generationConfig.thinkingConfig.thinkingBudget).toBe(0);
    expect(Object.keys(body.generationConfig.responseSchema.properties)).toEqual([
      "scope",
      "architecture",
      "plan",
      "risks",
      "match",
    ]);
  });
});

describe("DECOMPOSE_SYSTEM", () => {
  it("names every FEATURED project id", () => {
    for (const p of FEATURED) {
      expect(DECOMPOSE_SYSTEM).toContain(p.id);
    }
  });

  it("has no em-dash or en-dash", () => {
    expect(DECOMPOSE_SYSTEM).not.toMatch(/[—–]/);
  });
});

describe("decomposeCacheKey", () => {
  const RECIPE_A = { model: "gemini-2.5-flash", body: buildDecomposeBody("") };
  const RECIPE_B = { model: "gemini-9", body: buildDecomposeBody("") };

  it("differs for two different recipes on the same brief", async () => {
    const a = await decomposeCacheKey("same brief", RECIPE_A);
    const b = await decomposeCacheKey("same brief", RECIPE_B);
    expect(a).not.toBe(b);
  });

  it("normalises case and whitespace to the same key", async () => {
    const a = await decomposeCacheKey("Too   many\n tickets ", RECIPE_A);
    const b = await decomposeCacheKey("too many tickets", RECIPE_A);
    expect(a).toBe(b);
  });
});

describe("BRIEF_MAX", () => {
  it("is 600", () => {
    expect(BRIEF_MAX).toBe(600);
  });
});
