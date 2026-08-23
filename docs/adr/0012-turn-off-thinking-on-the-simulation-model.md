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

This is filed as **Proposed**, not Accepted, and the distinction is the point.
The configuration is live, because the only way to measure the latency half is
to run it. The quality half is not measured yet: `npm run eval:fde` needs
`GEMINI_API_KEY`, which exists in production and not locally, so the thinking-off
scores do not exist at the time of writing.

The recorded thinking-on baseline is the comparison point:

| | model | date | golden-set checks passed |
|---|---|---|---|
| thinking on | `gemini-2.5-flash` | 2026-08-21 | 169 / 170 |

`tests/eval/baseline.json` holds that run.

## Consequences

**This record exists because a source comment pointed at it before it did.**
`fde-prompt.ts` said "See ADR 0012 for the before and after scores" while
`docs/adr/` stopped at 0011. A reader following that reference found nothing,
and the numbers it promised had never been produced. The comment now says what
is actually true: the baseline is recorded, the thinking-off run is not.

**Accepting or reverting this needs one command.** Run `npm run eval:fde` with a
key present. If the score holds near 169/170, move this record to Accepted and
write the after column into the table above. If it drops, delete the
`thinkingConfig` line; nothing else depends on it.

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
