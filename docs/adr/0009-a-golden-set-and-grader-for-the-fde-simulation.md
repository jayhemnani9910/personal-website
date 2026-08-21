# 0009. A golden set and grader for the FDE simulation

- **Status:** Accepted
- **Date:** 2026-08-21
- **Related:** ADR 0008 (the same split between what CI can gate and what it cannot)

## Context

`/api/fde-sim` sends a visitor's problem statement to Gemini and renders the
structured answer. `SYSTEM_PROMPT` states a precise contract: exactly 3 scope
questions, 4 to 6 decomposition items, 6 to 10 architecture components with
distinct ids and a `kind` from a fixed set, 6 to 14 edges, a sprint of 5 to 7
rows covering about 14 days, exactly 4 risks, no generic risks, no budget
questions.

None of it was checked. The route's `isSimPayload` verifies that
`architecture.components` is an array and nothing else, and the response schema
constrains types rather than counts. So if the prompt were edited or Gemini
shipped a new model version, the detector was Jay noticing the output had got
worse.

Systems Design for the LLM Era asks for a golden dataset of representative
inputs, run so that prompt changes do not silently degrade quality. It matters
more here than it usually would: the FDE page's whole argument is that Jay
decomposes ambiguous problems well, so a test of that claim is the most
on-message artefact this repo can hold.

## Decision

Three pieces, split by what can run without a model.

**`src/lib/fde-eval.ts`** holds ten golden briefs and a pure grader. The briefs
are ambiguous in the way real ones are and span ten domains, so an answer that
would fit any brief scores badly on groundedness. Seventeen checks per response
cover the counts the prompt states, architecture integrity (ids present, ids
distinct, every edge resolving to a component, kinds in the enum, grid bounds),
the sprint length, blank fields, lexical groundedness against the brief's
domain, the two phrasings the prompt bans by name, and the prompt-leak markers
the route already filters on.

Ten, not the fifty to a hundred the book asks for. Ten is what a person will
actually read when a score moves, and each fresh run costs real model calls.

**`src/lib/fde-eval.test.ts`** runs in CI with no key and no network. Every rule
is exercised twice: once on a response that satisfies it and once on the same
response with that rule broken. It also grades two recorded live responses,
which is what makes the grader improvable without spending calls.

**`src/lib/fde-eval.live.test.ts`** calls the real endpoint, and only when asked.
It runs against production, because `GEMINI_API_KEY` exists only there and a
local `next start` returns 503 from this route, so pointing at localhost would
measure the error path.

It is a **regression gate, not a pass/fail gate**. It reads the committed
baseline first, and asserts that no rule is broken now which was unbroken when
the baseline was recorded. A gate that fails every run over a known accepted
deviation is noise nobody reads.

Writes are read-only by default and happen only under `eval:fde:update`, which
is the same idiom as the visual baselines. Without that, a regression would be
absorbed into the baseline simply by running twice.

## Consequences

**It found real defects on its first run**, which is the argument for it. The
current baseline is 169 of 170 checks across ten briefs. The one deviation is
`onboarding-drop-off`, where the model placed two components at `col: 4` when
the prompt says 0 to 3.

That deviation is recorded accurately rather than dramatically: nothing visibly
breaks. `FdeArchDiagram` derives its `viewBox` from the components it is handed,
so an extra column widens the canvas instead of pushing anything off it. What
the check catches is the model drifting from an instruction, which is worth
knowing before it drifts somewhere that does not self-correct.

**Running it is cheap after the first time.** The route caches on a hash of the
normalised brief for 30 days, so a rerun inside that window is served from cache
and costs nothing. The baseline records `cached` per brief, because a run that
was entirely cached is not evidence about the current model. All ten in the
current baseline were cache hits after the first run.

**It is not in CI**, for the reason ADR 0008 gives about LCP: CI has no
`GEMINI_API_KEY`, and a suite that spends model calls on every push is a
different kind of decision. The offline half does run in CI, so the grader
cannot rot unnoticed.

**Ten calls per fresh run**, paced under the route's own limit of 8 per minute
per IP, with one backoff and retry on a 429.

## Compliance

`npm run eval:fde` runs and gates. `npm run eval:fde:update` rewrites the
baseline and the recorded responses after an intended change.

The gate was verified by injecting a regression: tightening one check made ten
briefs fail, the run exited 1 naming all ten as newly broken, and the baseline
was left untouched by the failing run. Restored, it exits 0.

## Notes

The grader's first version scored two false failures on a correct response, and
the mechanism is worth recording because it is easy to repeat. It reused the
"is this field filled in" predicate for component ids. That predicate requires
more than two characters, which is right for a one-sentence justification and
wrong for an identifier: a real response used `kb`, so that id was dropped,
which read as a missing id and made every edge touching it look dangling.

Identifier and prose are now separate predicates, and the recorded response that
exposed it is a committed fixture, graded clean in CI.

Not covered, and worth naming rather than implying: there is no LLM judge. The
book asks for one to score accuracy and tone. Everything here is deterministic
and lexical, which catches contract drift and domain-free answers, and will not
notice an answer that is well-formed, on-topic and simply not very good.
