# 0013. Retry a streamed simulation while nothing has been sent

- **Status:** Accepted
- **Date:** 2026-08-23
- **Related:** ADR 0011 (which decided the opposite and is amended by this)

## Context

ADR 0011 decided there would be no retry on the streaming path, and gave a good
reason: retrying mid-stream would hand a client that has already rendered
`scope` a different `scope`.

The reason is sound and the rule drawn from it was too wide. `FdeConsole` calls
`/api/fde-sim?stream=1` unconditionally, so streaming is not an opt-in mode
alongside the buffered one, it is the only path a visitor ever takes. The
buffered retry that ADR 0011 preserved is reachable by the eval harness and by
nobody else.

That matters because the failures the retry was written for mostly happen before
any output exists. A non-200 from Gemini, a network error, an empty body: at that
point nothing has been streamed, so the objection about a client re-rendering
`scope` does not apply. The route was giving up on the first failure, on the only
path anyone uses, while the comment directly above it still read "Retry once: the
model occasionally returns unparseable JSON; a second pass almost always
succeeds".

## Decision

Retry the streamed generation once, and only while nothing has been emitted.

`streamGenerate`'s `onSection` callback increments a counter. The attempt loop
runs at most twice and breaks as soon as either a payload came back or a section
has been sent. So:

- **Failure before any section** (non-200, network, empty body): retried, exactly
  as the buffered path always did.
- **Failure after a section has been sent** (a leak marker mid-stream, a shape
  failure at the end): not retried, exactly as ADR 0011 required.

Token counters accumulate across attempts rather than reporting the last call,
because a retry costs tokens that were really spent. This matches how the
buffered path has always counted them.

## Consequences

**ADR 0011's "No retry on the stream path" paragraph is amended, not reversed.**
Its underlying rule (never re-send a section a client has already rendered) is
what the emitted-counter enforces. What changed is that the rule now gates on the
actual condition rather than on the transport.

**The comment that described the retry now sits above the code that does it.**
It had drifted above the streaming branch while describing the buffered loop
below, which is how the gap survived review.

**A retry doubles the worst-case latency of a failing run.** That cost lands only
on runs that produced nothing, which were going to end in an error message
anyway, so the trade is a slower failure against a recovered one.

## Compliance

`fde-ratelimit.test.ts` drives the real `POST` handler with a mocked store, which
is the harness this and the rate-limit repair share.

The retry condition is exercised by the existing `FdeConsole.test.tsx` streaming
tests, which assert that an error event leaves no half-built panel: the
emitted-counter path is what keeps that true when a retry happens.

Gemini's live stream cannot be reproduced locally (`GEMINI_API_KEY` is
production-only), so the retry-on-network-failure branch is verified by reading
rather than by test, same limitation ADR 0011 recorded.

## Notes

Found by an audit of the route rather than by a failure report, which is the
awkward part: a visitor hitting a transient Gemini 5xx saw "The agent had trouble
parsing. Try a more specific brief" and would have gone off rewriting a brief
that was fine. ADR 0010's `http_5xx` counter would have shown the real cause, and
nobody was watching it.
