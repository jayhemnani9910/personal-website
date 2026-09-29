import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SECTION_ORDER, isSimPayload, isSimSection } from "./fde-payload";
import { SIM_RESPONSE_SCHEMA } from "./fde-prompt";

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
    // Any number: recording a new golden brief must not fail this unit test.
    expect(recorded.length).toBeGreaterThan(0);
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
    // Against the schema itself, not a copy of the list: a section added to the
    // schema but not to SECTION_ORDER would bring the blank-panel replay back.
    expect([...SECTION_ORDER]).toEqual(SIM_RESPONSE_SCHEMA.required);
  });

  it("rejects empty sections, which would draw an empty diagram", () => {
    const [, sample] = recorded[0];
    expect(isSimPayload({ ...sample, risks: [] })).toBe(false);
    expect(isSimPayload({ ...sample, architecture: { components: [], edges: [] } })).toBe(false);
  });
});

describe("isSimSection", () => {
  it("checks one streamed section the way isSimPayload checks the whole", () => {
    expect(isSimSection("scope", [{ q: "q", why: "w" }])).toBe(true);
    expect(isSimSection("scope", [])).toBe(false);
    expect(isSimSection("scope", "nope")).toBe(false);
    expect(isSimSection("architecture", { components: [{ id: "a" }] })).toBe(false); // no edges
    expect(isSimSection("architecture", { components: [{ id: "a" }], edges: [] })).toBe(true);
    expect(isSimSection("extra", [1])).toBe(false);
  });
});
