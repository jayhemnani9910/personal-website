// Golden set and grader for /api/fde-sim.
//
// Systems Design for the LLM Era, on testability: build a golden dataset of
// representative inputs, run it so that prompt edits or model upgrades do not
// silently degrade quality, and score for accuracy, groundedness and tone.
//
// The response schema guarantees shape. Nothing checked quality, or in fact most
// of the shape: SYSTEM_PROMPT states a precise contract (exactly 3 scope
// questions, 4 to 6 decomposition items, 6 to 10 components with distinct ids
// and a `kind` from a fixed set, edges that resolve, a sprint covering about 14
// days, exactly 4 risks) and isSimPayload only verifies that each section is
// present and is the right kind of container. Every rule the prompt states is
// graded here, so "the model stopped following the prompt" is a detectable event
// rather than something to notice by eye.
//
// Nothing in this file makes a network call. The live runner is
// scripts/eval-fde.mjs; these functions grade whatever it brings back, which is
// what lets the grader itself be unit-tested in CI without a key.

import { PROMPT_LEAK_MARKERS } from "./fde-prompt";

export interface GoldenBrief {
  id: string;
  /** The visitor's problem statement, as they would actually type it. */
  brief: string;
  /**
   * Lowercase terms from the problem domain. Groundedness is scored as: did the
   * answer engage with THIS problem, or return something that would fit any
   * brief. Deliberately generous, since a good answer may reasonably rename
   * things; the check is that it is not domain-free.
   */
  domainTerms: string[];
}

/**
 * Ten briefs, chosen to be ambiguous in the way real ones are and to span
 * different domains, so a generic answer scores badly on at least one of them.
 * The book asks for 50 to 100; ten is what a person will actually read through
 * when a score moves, and each live run costs real model calls.
 */
export const GOLDEN_BRIEFS: GoldenBrief[] = [
  {
    id: "support-tickets",
    brief:
      "We have a customer support team drowning in tickets and no real idea which ones actually matter. Something should help them.",
    domainTerms: ["ticket", "support", "customer", "triage", "queue", "agent"],
  },
  {
    id: "contract-review",
    brief:
      "Our legal team reviews about 400 vendor contracts a quarter by hand. We want to speed that up but we cannot be wrong about liability clauses.",
    domainTerms: ["contract", "legal", "clause", "vendor", "review", "liability"],
  },
  {
    id: "warehouse-picking",
    brief:
      "Pickers in our warehouse walk too far per order. We have the WMS data but nobody has ever looked at it properly.",
    domainTerms: ["warehouse", "pick", "order", "route", "wms", "inventory"],
  },
  {
    id: "clinical-notes",
    brief:
      "Doctors at our clinic spend evenings finishing notes. We would like that time back without anything going into a chart that a clinician did not approve.",
    domainTerms: ["clinic", "note", "chart", "doctor", "clinician", "patient"],
  },
  {
    id: "fraud-signals",
    brief:
      "Chargebacks went up 40 percent last quarter. The fraud team says they can see patterns but cannot act fast enough.",
    domainTerms: ["fraud", "chargeback", "transaction", "risk", "signal", "review"],
  },
  {
    id: "internal-search",
    brief:
      "Nobody at the company can find anything. Docs are spread over Confluence, Drive, Slack and a very old wiki nobody will admit to owning.",
    domainTerms: ["search", "document", "wiki", "slack", "drive", "index"],
  },
  {
    id: "churn-early-warning",
    brief:
      "We usually find out a customer is leaving when they tell us. Success managers want a heads up but they do not trust a score with no reason attached.",
    domainTerms: ["churn", "customer", "success", "account", "signal", "renewal"],
  },
  {
    id: "field-technician",
    brief:
      "Field techs call the depot constantly to ask which part fits which unit. The manuals exist as thousands of scanned PDFs.",
    domainTerms: ["technician", "field", "part", "manual", "pdf", "equipment"],
  },
  {
    id: "grant-compliance",
    brief:
      "Every grant we take on has different reporting rules and we track them in a spreadsheet that one person understands.",
    domainTerms: ["grant", "compliance", "report", "funder", "deadline", "requirement"],
  },
  {
    id: "onboarding-drop-off",
    brief:
      "Half our signups never finish setup. Product has theories, nobody has evidence, and the analytics were instrumented by an intern in 2021.",
    domainTerms: ["onboarding", "signup", "setup", "funnel", "analytics", "event"],
  },
];

/** Component kinds SYSTEM_PROMPT names. FdeArchDiagram renders by these. */
export const VALID_KINDS = ["ui", "service", "agent", "data", "external"];

/**
 * Phrases the prompt explicitly rules out. It bans "AI might be inaccurate" as a
 * risk by name and "what's your budget" as a scope question by name, and both
 * are what a model reaches for when it has not engaged with the problem.
 */
export const GENERIC_RISK_PHRASES = [
  "ai might be inaccurate",
  "ai may be inaccurate",
  "model may be inaccurate",
  "data quality issues",
  "scope creep",
  "lack of user adoption",
];

export const LAZY_QUESTION_PHRASES = ["your budget", "what is the budget", "what's the budget", "your timeline"];

export interface Check {
  id: string;
  ok: boolean;
  detail: string;
}

const check = (id: string, ok: boolean, detail: string): Check => ({ id, ok, detail });

// Prose fields: a one-character "why" is a stub, not an answer.
const isFilled = (s: unknown): boolean => typeof s === "string" && s.trim().length > 2;

// Identifiers are not prose. `kb`, `ui` and `db` are how engineers actually name
// things, and an earlier version of this grader reused isFilled here: it dropped
// every id of two characters or fewer, which then read as a missing id AND made
// every edge touching it look dangling. One real response scored two false
// failures that way. See the contract-review fixture in fde-eval.test.ts.
const isId = (s: unknown): boolean => typeof s === "string" && s.trim().length > 0;

/** Every string in the payload, flattened, lowercased. Used for text-level checks. */
export function allText(payload: Record<string, unknown>): string {
  const out: string[] = [];
  const walk = (v: unknown) => {
    if (typeof v === "string") out.push(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  walk(payload);
  return out.join("\n").toLowerCase();
}

/** Highest integer appearing in the sprint's `day` labels ("Day 12-14" -> 14). */
export function sprintLastDay(sprint: { day?: string }[]): number {
  let max = 0;
  for (const row of sprint) {
    for (const n of String(row?.day ?? "").matchAll(/\d+/g)) {
      max = Math.max(max, Number(n[0]));
    }
  }
  return max;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Grade one response. Returns every check, passing and failing, so a report can
 * show what held as well as what broke. Never throws: a malformed payload is a
 * failing grade, not an exception, because that is exactly the case worth
 * catching.
 */
export function gradeSim(payload: any, golden: GoldenBrief): Check[] {
  const checks: Check[] = [];

  if (!payload || typeof payload !== "object") {
    return [check("payload.object", false, "response was not a JSON object")];
  }

  const scope = Array.isArray(payload.scope) ? payload.scope : [];
  const decomposition = Array.isArray(payload.decomposition) ? payload.decomposition : [];
  const sprint = Array.isArray(payload.sprint) ? payload.sprint : [];
  const risks = Array.isArray(payload.risks) ? payload.risks : [];
  const components = Array.isArray(payload.architecture?.components) ? payload.architecture.components : [];
  const edges = Array.isArray(payload.architecture?.edges) ? payload.architecture.edges : [];

  // ── The counts SYSTEM_PROMPT states ────────────────────────────────────────
  checks.push(check("count.scope", scope.length === 3, `${scope.length} scope questions, prompt says exactly 3`));
  checks.push(
    check("count.decomposition", decomposition.length >= 4 && decomposition.length <= 6,
      `${decomposition.length} decomposition items, prompt says 4 to 6`),
  );
  checks.push(
    check("count.components", components.length >= 6 && components.length <= 10,
      `${components.length} components, prompt says 6 to 10`),
  );
  checks.push(
    check("count.edges", edges.length >= 6 && edges.length <= 14,
      `${edges.length} edges, prompt says 6 to 14`),
  );
  checks.push(
    check("count.sprint", sprint.length >= 5 && sprint.length <= 7,
      `${sprint.length} sprint rows, prompt says 5 to 7`),
  );
  checks.push(check("count.risks", risks.length === 4, `${risks.length} risks, prompt says exactly 4`));

  // ── Architecture integrity. These are the ones that break the diagram. ─────
  const ids = components.map((c: any) => c?.id).filter(isId);
  checks.push(
    check("arch.ids-present", ids.length === components.length,
      `${ids.length} of ${components.length} components carry an id`),
  );
  checks.push(
    check("arch.ids-distinct", new Set(ids).size === ids.length,
      `${new Set(ids).size} distinct ids across ${ids.length} ids`),
  );

  const idSet = new Set(ids);
  const dangling = edges.filter((e: any) => !idSet.has(e?.from) || !idSet.has(e?.to));
  checks.push(
    check("arch.edges-resolve", dangling.length === 0,
      dangling.length === 0
        ? "every edge resolves to a component"
        : `${dangling.length} edges point at ids that do not exist: ` +
          dangling.slice(0, 3).map((e: any) => `${e?.from}->${e?.to}`).join(", "),
  ));

  const badKinds = components.filter((c: any) => !VALID_KINDS.includes(c?.kind));
  checks.push(
    check("arch.kinds-valid", badKinds.length === 0,
      badKinds.length === 0
        ? `all kinds in ${VALID_KINDS.join("/")}`
        : `unknown kinds: ${[...new Set(badKinds.map((c: any) => String(c?.kind)))].join(", ")}`),
  );

  const offGrid = components.filter(
    (c: any) => !(Number.isInteger(c?.col) && c.col >= 0 && c.col <= 3 && Number.isInteger(c?.row) && c.row >= 0 && c.row <= 2),
  );
  checks.push(
    check("arch.grid-bounds", offGrid.length === 0,
      offGrid.length === 0 ? "all components inside col 0-3, row 0-2" : `${offGrid.length} components outside the grid`),
  );

  // ── The sprint is supposed to be about a fortnight ─────────────────────────
  const lastDay = sprintLastDay(sprint);
  checks.push(
    check("sprint.covers-14-days", lastDay >= 12 && lastDay <= 16, `sprint ends on day ${lastDay}, prompt says about 14`),
  );

  // ── Nothing blank ──────────────────────────────────────────────────────────
  const blanks =
    scope.filter((s: any) => !isFilled(s?.q) || !isFilled(s?.why)).length +
    decomposition.filter((d: any) => !isFilled(d?.title) || !isFilled(d?.why)).length +
    sprint.filter((s: any) => !isFilled(s?.title) || !isFilled(s?.deliv)).length +
    risks.filter((r: any) => !isFilled(r?.risk) || !isFilled(r?.mitigation)).length +
    components.filter((c: any) => !isFilled(c?.name) || !isFilled(c?.sub)).length;
  checks.push(check("content.no-blanks", blanks === 0, `${blanks} empty or stub fields`));

  // ── Groundedness: did it engage with THIS problem ──────────────────────────
  const text = allText(payload);
  const hit = golden.domainTerms.filter((t) => text.includes(t));
  checks.push(
    check("content.grounded", hit.length >= 3,
      `${hit.length}/${golden.domainTerms.length} domain terms present (${hit.join(", ") || "none"}), need 3`),
  );

  // ── Tone: the prompt bans these by name ────────────────────────────────────
  const riskText = risks.map((r: any) => String(r?.risk ?? "")).join("\n").toLowerCase();
  const generic = GENERIC_RISK_PHRASES.filter((p) => riskText.includes(p));
  checks.push(
    check("tone.risks-specific", generic.length === 0,
      generic.length === 0 ? "no boilerplate risks" : `generic risks: ${generic.join(", ")}`),
  );

  const scopeText = scope.map((s: any) => String(s?.q ?? "")).join("\n").toLowerCase();
  const lazy = LAZY_QUESTION_PHRASES.filter((p) => scopeText.includes(p));
  checks.push(
    check("tone.questions-hard", lazy.length === 0,
      lazy.length === 0 ? "no budget or timeline filler" : `filler questions: ${lazy.join(", ")}`),
  );

  // ── The injection symptom the route already filters for ────────────────────
  const leaked = PROMPT_LEAK_MARKERS.filter((m) => text.includes(m.toLowerCase()));
  checks.push(
    check("safety.no-prompt-leak", leaked.length === 0,
      leaked.length === 0 ? "no system prompt echoed" : `leaked markers: ${leaked.join(", ")}`),
  );

  return checks;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface Score {
  passed: number;
  total: number;
  failed: Check[];
}

export function scoreChecks(checks: Check[]): Score {
  const failed = checks.filter((c) => !c.ok);
  return { passed: checks.length - failed.length, total: checks.length, failed };
}
