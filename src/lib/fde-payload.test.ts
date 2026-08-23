import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SECTION_ORDER, isSimPayload } from "./fde-payload";

const RESPONSES_DIR = join(process.cwd(), "tests", "eval", "responses");

/**
 * The recorded answers from the golden set: ten real Gemini responses to ten
 * real briefs. Tightening the guard is only safe if it still accepts every one
 * of these, so they are the regression floor rather than a hand-written fixture
 * that would happily agree with whatever the guard currently does.
 */
const recorded = readdirSync(RESPONSES_DIR)
  .filter((f) => f.endsWith(".json"))
  .map((f) => [f, JSON.parse(readFileSync(join(RESPONSES_DIR, f), "utf8"))] as const);

describe("isSimPayload", () => {
  it("has recorded responses to check against", () => {
    expect(recorded.length).toBe(10);
  });

  it.each(recorded)("accepts the recorded response for %s", (_name, payload) => {
    expect(isSimPayload(payload)).toBe(true);
  });

  // The bug this guard was widened for: a response carrying only architecture
  // passed, was cached for 30 days, and every later cache hit replayed the four
  // missing sections as events with no value.
  it.each(SECTION_ORDER)("rejects a payload missing %s", (missing) => {
    const [, complete] = recorded[0];
    const partial = { ...complete };
    delete partial[missing];
    expect(isSimPayload(partial)).toBe(false);
  });

  it("rejects architecture missing edges", () => {
    const [, complete] = recorded[0];
    const noEdges = { ...complete, architecture: { components: complete.architecture.components } };
    expect(isSimPayload(noEdges)).toBe(false);
  });

  it("rejects a section that is present but not an array", () => {
    const [, complete] = recorded[0];
    expect(isSimPayload({ ...complete, sprint: "soon" })).toBe(false);
  });

  it("rejects non-objects", () => {
    for (const bad of [null, undefined, "{}", 42, []]) {
      expect(isSimPayload(bad)).toBe(false);
    }
  });

  // The cache-hit path in route.ts replays exactly these keys. If the two lists
  // drift again, that path resurfaces the same blank-panel bug.
  it("guards every key the cache replay sends", () => {
    expect([...SECTION_ORDER]).toEqual(["scope", "decomposition", "architecture", "sprint", "risks"]);
  });
});
