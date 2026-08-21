import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  GOLDEN_BRIEFS,
  VALID_KINDS,
  gradeSim,
  scoreChecks,
  sprintLastDay,
  allText,
  type GoldenBrief,
} from "./fde-eval";
import { SYSTEM_PROMPT } from "./fde-prompt";

// The grader is the thing CI can check without a key or a model call, so it has
// to be worth trusting. Every rule it enforces is exercised twice: once on a
// response that satisfies it, and once on the same response with that one rule
// broken. A grader nobody has watched fail is a grader that scores everything
// green.

const GOLDEN: GoldenBrief = GOLDEN_BRIEFS[0]; // support tickets

/** A response that satisfies every rule SYSTEM_PROMPT states. */
function goodPayload() {
  return {
    scope: [
      { q: "Which ticket outcomes count as resolved today?", why: "Defines the target." },
      { q: "Who currently decides a ticket is urgent, and on what?", why: "Names the human judgement." },
      { q: "What happens to a customer when triage gets it wrong?", why: "Sets the error budget." },
    ],
    decomposition: [
      { id: "D1", title: "Ticket ingest", why: "Everything downstream needs one queue." },
      { id: "D2", title: "Urgency scoring", why: "The actual judgement being automated." },
      { id: "D3", title: "Agent routing", why: "A score with no destination changes nothing." },
      { id: "D4", title: "Feedback capture", why: "Without it the score never improves." },
    ],
    architecture: {
      components: [
        { id: "inbox", name: "Ticket inbox", kind: "external", col: 0, row: 0, sub: "Zendesk webhook" },
        { id: "api", name: "Intake API", kind: "service", col: 1, row: 0, sub: "normalises payloads" },
        { id: "store", name: "Ticket store", kind: "data", col: 1, row: 1, sub: "queue of record" },
        { id: "scorer", name: "Urgency agent", kind: "agent", col: 2, row: 0, sub: "ranks the queue" },
        { id: "rules", name: "Routing rules", kind: "service", col: 2, row: 1, sub: "score to team" },
        { id: "console", name: "Agent console", kind: "ui", col: 3, row: 0, sub: "what support sees" },
      ],
      edges: [
        { from: "inbox", to: "api", label: "new ticket", dashed: false },
        { from: "api", to: "store", label: "persist", dashed: false },
        { from: "store", to: "scorer", label: "batch", dashed: false },
        { from: "scorer", to: "rules", label: "score", dashed: false },
        { from: "rules", to: "console", label: "assign", dashed: false },
        { from: "console", to: "store", label: "feedback", dashed: true },
      ],
    },
    sprint: [
      { day: "Day 1-2", title: "Ingest one queue", deliv: "Tickets land in the store." },
      { day: "Day 3-5", title: "Baseline scoring", deliv: "Every ticket carries a score." },
      { day: "Day 6-8", title: "Routing rules", deliv: "Scores assign to a named team." },
      { day: "Day 9-11", title: "Console view", deliv: "Support sees a ranked queue." },
      { day: "Day 12-14", title: "Feedback loop", deliv: "Overrides recorded and counted." },
    ],
    risks: [
      { risk: "Urgency labels in history reflect who was on shift.", mitigation: "Hand-label a holdout set." },
      { risk: "Agents ignore the ranking and work top-down anyway.", mitigation: "Measure override rate weekly." },
      { risk: "Zendesk webhook drops during a spike.", mitigation: "Reconcile against the API nightly." },
      { risk: "A misrouted refund ticket ages past its SLA.", mitigation: "Floor on ticket age overrides score." },
    ],
  };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const failing = (payload: any, golden = GOLDEN) =>
  gradeSim(payload, golden).filter((c) => !c.ok).map((c) => c.id);

describe("fde-sim golden set", () => {
  it("has ten briefs with unique ids", () => {
    expect(GOLDEN_BRIEFS).toHaveLength(10);
    expect(new Set(GOLDEN_BRIEFS.map((b) => b.id)).size).toBe(10);
  });

  it("gives every brief enough domain terms for groundedness to mean something", () => {
    for (const b of GOLDEN_BRIEFS) {
      expect(b.brief.length, b.id).toBeGreaterThan(60);
      // The check needs 3 hits, so a brief with 3 terms could only pass perfectly.
      expect(b.domainTerms.length, b.id).toBeGreaterThanOrEqual(5);
      expect(b.domainTerms, b.id).toEqual(b.domainTerms.map((t) => t.toLowerCase()));
    }
  });

  // If the prompt stops naming a kind, the grader is checking a rule that is no
  // longer stated, and a valid response would fail.
  it("grades against the component kinds the prompt actually names", () => {
    for (const kind of VALID_KINDS) {
      expect(SYSTEM_PROMPT, kind).toContain(kind);
    }
  });
});

describe("fde-sim grader", () => {
  it("passes a response that follows every rule", () => {
    const score = scoreChecks(gradeSim(goodPayload(), GOLDEN));
    expect(score.failed, score.failed.map((f) => `${f.id}: ${f.detail}`).join("; ")).toEqual([]);
    expect(score.passed).toBe(score.total);
  });

  it("does not throw on junk", () => {
    expect(failing(null)).toContain("payload.object");
    expect(failing("a string")).toContain("payload.object");
    expect(() => gradeSim({}, GOLDEN)).not.toThrow();
  });

  it.each([
    ["count.scope", (p: any) => p.scope.pop()],
    ["count.decomposition", (p: any) => p.decomposition.splice(2)],
    ["count.components", (p: any) => p.architecture.components.splice(3)],
    ["count.edges", (p: any) => p.architecture.edges.splice(2)],
    ["count.sprint", (p: any) => p.sprint.splice(2)],
    ["count.risks", (p: any) => p.risks.pop()],
  ])("fails %s when the count leaves the stated range", (id, breakIt) => {
    const p = goodPayload();
    breakIt(p);
    expect(failing(p)).toContain(id);
  });

  it("fails arch.ids-distinct on a duplicate component id", () => {
    const p = goodPayload();
    p.architecture.components[1].id = "inbox";
    expect(failing(p)).toContain("arch.ids-distinct");
  });

  it("fails arch.ids-present when a component has no id", () => {
    const p = goodPayload();
    delete (p.architecture.components[1] as any).id;
    expect(failing(p)).toContain("arch.ids-present");
  });

  // Regression. The first version of this grader reused the prose "is it filled
  // in" predicate for component ids, which requires more than two characters. A
  // real response used `kb`, so that id was dropped, which read as a missing id
  // and turned every edge touching it into a dangling edge. Two false failures
  // on a response that was correct.
  it("accepts short component ids, which are how engineers name things", () => {
    const p = goodPayload();
    p.architecture.components[0].id = "kb";
    p.architecture.edges[0].from = "kb";
    const ids = failing(p);
    expect(ids).not.toContain("arch.ids-present");
    expect(ids).not.toContain("arch.ids-distinct");
    expect(ids).not.toContain("arch.edges-resolve");
  });

  it("fails arch.edges-resolve when an edge points at nothing", () => {
    const p = goodPayload();
    p.architecture.edges[0].to = "does_not_exist";
    expect(failing(p)).toContain("arch.edges-resolve");
  });

  it("fails arch.kinds-valid on a kind the diagram cannot render", () => {
    const p = goodPayload();
    p.architecture.components[0].kind = "database";
    expect(failing(p)).toContain("arch.kinds-valid");
  });

  it("fails arch.grid-bounds when a component lands off the grid", () => {
    const p = goodPayload();
    p.architecture.components[0].col = 7;
    expect(failing(p)).toContain("arch.grid-bounds");
  });

  it("fails sprint.covers-14-days on a sprint that stops early", () => {
    const p = goodPayload();
    p.sprint[4].day = "Day 5-6";
    expect(failing(p)).toContain("sprint.covers-14-days");
  });

  it("fails content.no-blanks on a stub field", () => {
    const p = goodPayload();
    p.risks[0].mitigation = "";
    expect(failing(p)).toContain("content.no-blanks");
  });

  // The failure this is really for: a fluent answer that would fit any brief.
  it("fails content.grounded on an answer that never mentions the domain", () => {
    const p = goodPayload();
    const generic = JSON.parse(
      JSON.stringify(p)
        .replace(/[Tt]icket/g, "item")
        .replace(/[Ss]upport/g, "team")
        .replace(/[Aa]gent/g, "worker")
        .replace(/[Qq]ueue/g, "list")
        .replace(/[Tt]riage/g, "sorting")
        .replace(/[Cc]ustomer/g, "person"),
    );
    expect(failing(generic)).toContain("content.grounded");
  });

  it("fails tone.risks-specific on boilerplate the prompt bans by name", () => {
    const p = goodPayload();
    p.risks[0].risk = "AI might be inaccurate and produce wrong answers.";
    expect(failing(p)).toContain("tone.risks-specific");
  });

  it("fails tone.questions-hard on the filler question the prompt bans", () => {
    const p = goodPayload();
    p.scope[0].q = "What is the budget for this project?";
    expect(failing(p)).toContain("tone.questions-hard");
  });

  it("fails safety.no-prompt-leak when the system prompt comes back", () => {
    const p = goodPayload();
    p.decomposition[0].why = "Following the STYLE RULES given above.";
    expect(failing(p)).toContain("safety.no-prompt-leak");
  });
});

describe("grader helpers", () => {
  it("reads the last day out of sprint labels", () => {
    expect(sprintLastDay([{ day: "Day 1-2" }, { day: "Day 12-14" }])).toBe(14);
    expect(sprintLastDay([{ day: "Week 1" }])).toBe(1);
    expect(sprintLastDay([])).toBe(0);
    expect(sprintLastDay([{}])).toBe(0);
  });

  it("flattens every nested string, lowercased", () => {
    const text = allText({ a: "One", b: [{ c: "TWO" }], d: { e: ["Three"] }, n: 4 });
    expect(text).toContain("one");
    expect(text).toContain("two");
    expect(text).toContain("three");
  });
});
/* eslint-enable @typescript-eslint/no-explicit-any */

// Recorded from the live endpoint by `npm run eval:fde`. Grading them offline is
// what lets the grader change without spending model calls, and it is how the
// short-id false positive above was found and then pinned.
describe("recorded responses", () => {
  const dir = resolve(dirname(fileURLToPath(import.meta.url)), "../../tests/eval/responses");
  const read = (id: string) => JSON.parse(readFileSync(resolve(dir, `${id}.json`), "utf8"));

  it("grades the contract-review response clean", () => {
    const golden = GOLDEN_BRIEFS.find((b) => b.id === "contract-review")!;
    const score = scoreChecks(gradeSim(read("contract-review"), golden));
    expect(score.failed.map((f) => `${f.id}: ${f.detail}`)).toEqual([]);
  });

  // Kept failing on purpose: it is the only rule any of the ten live responses
  // broke, and pinning it means a prompt change that fixes it will show up here.
  //
  // Stated accurately, because it would be easy to overstate: the model placed
  // two components at col 4 where the prompt says 0 to 3, and nothing visibly
  // breaks. FdeArchDiagram derives its viewBox from the components it is given
  // (maxX = max(c.x + BOX_W) + PAD), so an extra column widens the canvas rather
  // than pushing anything outside it. What this catches is the model drifting
  // from an instruction, which is worth knowing before the drift reaches
  // something that does not self-correct.
  it("still catches the off-grid components in the onboarding response", () => {
    const golden = GOLDEN_BRIEFS.find((b) => b.id === "onboarding-drop-off")!;
    const failed = gradeSim(read("onboarding-drop-off"), golden).filter((c) => !c.ok);
    expect(failed.map((f) => f.id)).toEqual(["arch.grid-bounds"]);
  });
});
