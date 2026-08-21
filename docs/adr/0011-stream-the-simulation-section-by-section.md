# 0011. Stream the simulation section by section

- **Status:** Accepted
- **Date:** 2026-08-21
- **Related:** ADR 0010 (the counters that measured the problem and now measure the fix)

## Context

`/api/fde-sim` made one call and returned one object. ADR 0010's counters put a
number on what that meant: **p50 latency of 21 seconds**, and for all of it
`FdeConsole` showed a single spinner reading "routing your brief through the
agent".

Systems Design for the LLM Era calls a spinner held for the whole wait a pattern
to avoid for anything conversational, and names time to first token as the
metric.

The response is one structured object rather than a token stream, so naive SSE
does not fit. But the five sections complete in order, and the page already
renders them as six phase tabs. So the UI was already shaped for this.

## Decision

Stream the sections, opt-in via `?stream=1`.

The buffered JSON response stays the default. The eval harness (ADR 0009) and
anything else that just wants the object are unaffected by this existing. It is
one implementation with two encodings: sections are extracted the same way
either way, and only the wire format differs.

**`json-sections.ts`** is a character scanner rather than a brace counter. It
tracks string and escape state, so a brace or quote inside a value cannot be
mistaken for structure, notes where each top-level value starts, and parses the
slice once its nesting closes. Nothing partial is ever emitted.

**`fde-stream.ts`** handles SSE in both directions: decoding Gemini's stream and
encoding ours.

**The leak filter had to move.** On the buffered path it inspects the whole
response before anything is sent. On a stream, by the time the object is
complete the content has already gone. It now runs per section, on the
serialized value, before emit, and fails closed.

**The architecture section is normalised as it arrives** rather than at the end,
for the same reason: `FdeArchDiagram` reads `c.x`/`c.y`, so a section emitted
without them draws nothing.

**No retry on the stream path.** The buffered path retries once, which it can
because nothing has been sent. Retrying mid-stream would mean a client that has
already rendered `scope` suddenly being handed a different `scope`.

**A cache hit still speaks the streaming protocol**, arriving all at once, so
the client has one code path rather than two.

**The client reveals on the first section, not on `done`.** Waiting for the last
event would keep the spinner up for the whole run and waste the point. A tab
whose section has not arrived is disabled, because opening it would show an
empty panel.

## Consequences

**Measured against production, on briefs the cache had never seen:**

| | first section | complete |
|---|---|---|
| run 1 | 14.5s | 22.8s |
| run 2 | 15.8s | 24.8s |

The counters agree: p50 time to first section 13.0s against p50 total latency
21.0s. Content reaches the visitor about 38 percent sooner, then arrives
steadily rather than all at once.

**13 seconds is still a long first wait, and this does not fix that.** The delay
is mostly ahead of the first output token, not in the streaming. `gemini-2.5-flash`
does thinking by default, which happens before any output. Setting
`thinkingConfig.thinkingBudget: 0` would cut it, and the honest way to find out
whether that costs quality is to run the golden set (ADR 0009) with and without.
That is the obvious next experiment and it is not done here.

**`FdeSimulation` now takes `Partial<Preset>`.** That is deliberate rather than
loose typing: it forced every section access in `PhaseContent` to be guarded,
and the type checker found all five. A non-null assertion would have compiled
and then thrown on the first mid-stream render.

**`no-transform` on the response matters as much as `no-cache`.** Without it a
proxy is free to buffer the body and deliver every section at the end, undoing
the whole thing silently.

## Compliance

`json-sections.test.ts`, 21 tests, brute-forces every possible chunk boundary on
four documents and replays a real recorded model response at six chunk sizes,
asserting each section equals what a whole-document parse gives. It also asserts
the first section is emitted before half the bytes have arrived, which is the
property the feature depends on.

`fde-stream.test.ts`, 12 tests, covers every chunk boundary, CRLF, payloads split
over several `data:` lines, and content containing newlines, which would
otherwise terminate a frame early.

`FdeConsole.test.tsx` gained 7 streaming tests: the endpoint is asked for with
`stream=1`, the panel appears on the first section with no `done` ever sent,
tabs stay shut until their section lands and open when it does, frames split
across 7-byte chunks reassemble, and an error event leaves no half-built panel.

## Notes

The first live attempt failed, and ADR 0010's counters diagnosed it in one
request: `http_5xx`, so Gemini's streaming endpoint had returned a server error
rather than rejecting the request. Retrying showed it was transient. Without the
counters the visible evidence would have been an error event and a guess.

Gemini's actual stream shape cannot be verified locally, because
`GEMINI_API_KEY` exists only in production. The parts that could be tested
without it were, and the integration was checked against production immediately
after deploy.
