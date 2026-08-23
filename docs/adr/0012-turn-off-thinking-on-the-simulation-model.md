# 0012. Turn off thinking on the simulation model

- **Status:** Proposed
- **Date:** 2026-08-23
- **Related:** ADR 0009 (the golden set that has to judge this), ADR 0011 (the streaming work that exposed the problem)

## Context

ADR 0011 shipped section-by-section streaming and measured what it could and
could not fix. Time to first section came out at 13.0s against 21.0s for the
complete answer, and 0011 said plainly that the remaining 13 seconds is not a
streaming problem:

`gemini-2.5-flash` does thinking by default, and thinking happens before the
first output token rather than during the stream. No amount of streaming helps
with a wait that occurs before there is anything to stream. 0011 named the next
experiment: set `thinkingConfig.thinkingBudget: 0`, and use the golden set from
ADR 0009 to find out whether the answers get worse.

## Decision

Set `thinkingConfig: { thinkingBudget: 0 }` in `buildGeminiBody`.

This stays **Proposed**, and the reason has changed. It was Proposed because the
quality half was unmeasured. It has now been measured, and the result does not
decide the question on its own.

| | date | golden-set checks passed | p50 latency |
|---|---|---|---|
| thinking on | 2026-08-21 | 169 / 170 | ~21.0s |
| thinking off | 2026-08-23 | 169 / 170 | ~10.5s |

The totals match. They are not the same 169.

- **Fixed:** `onboarding-drop-off:arch.grid-bounds`, which the baseline carries as
  a known failure, now passes.
- **Broken:** `grant-compliance:tone.risks-specific` now fails, on a risk that
  reads "data quality issues". The grader calls that generic, and the prompt
  asks for risks specific to the brief rather than "AI might be inaccurate".

So the score is a wash and the composition moved. `npm run eval:fde` gates on
regressions rather than on the total, so it exits red on that one check.

The run was live rather than cached: the route's counters went from `ok=6` to
`ok=16` with `cache_hit` unchanged at 3, so all ten briefs were generated under
this configuration.

## Consequences

**This record exists because a source comment pointed at it before it did.**
`fde-prompt.ts` said "See ADR 0012 for the before and after scores" while
`docs/adr/` stopped at 0011. A reader following that reference found nothing,
and the numbers it promised had never been produced. They exist now, and they
are in the table above rather than in a comment.

**Latency roughly halved.** The route's p50 fell from 20,973ms to 10,532ms over
18 samples. That is the largest single improvement to this route so far, and much
bigger than the 38 percent that streaming bought in ADR 0011.

**The open question is one generic risk on one of ten briefs.** Taking it costs a
measurably worse answer on `grant-compliance`; refusing it costs about ten
seconds on every run. Reverting is deleting the `thinkingConfig` line, and
nothing else depends on it. Accepting means re-recording the baseline with
`npm run eval:fde:update` so the gate goes green on the new composition, which
also means accepting `tone.risks-specific` as a known failure in its place.

Not deciding is itself a choice, because the configuration is already live. That
is the state this record is in: measured, deployed, and not yet ratified.

**The cache key already covers this.** `simCacheKey` hashes the whole recipe,
including `generationConfig`, so turning thinking off did not leave a single
answer generated under the old configuration in the cache. That was the failure
mode ADR 0009's successor fixed, and it is why this change did not need a manual
cache flush.

**Latency is the only thing this is expected to improve.** If it also changes
answer shape, the response schema will still hold it to the same five sections;
what the golden set grades is whether the content inside them stays specific to
the brief.

## Compliance

`fde-eval.test.ts` unit-tests the grader itself, so a golden-set verdict cannot
be wrong because the scoring is wrong.

`fde-eval.live.test.ts` (`npm run eval:fde`, gated behind `FDE_EVAL_LIVE=1`) is
the run that decides this record's status. It is skipped in CI, which is why CI
staying green is not evidence for this decision either way.

`fde-payload.test.ts` asserts the shape guard accepts all ten recorded responses,
so a model configuration change that altered the response shape would fail
before it reached the quality question.

## Notes

The measurement in ADR 0011 was taken with ADR 0010's counters, which report
`ttfsMs` and `latencyMs` separately. Those counters are the fastest way to see
the latency half of this change land: `GET /api/fde-sim` returns them, and the
p50 time to first section should fall well below 13.0s if thinking was indeed
the bulk of the wait.
