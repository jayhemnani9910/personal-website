# 0010. Operational counters for the LLM route

- **Status:** Accepted
- **Date:** 2026-08-21
- **Related:** ADR 0009 (what the model produces), this record (what the route does)

## Context

`/api/fde-sim` called `console.error` on each failure path and nothing else.
Vercel collects those lines, so any single failure is findable after the fact.
What did not exist was a rate: no count of calls, no cache hit ratio, no
latency, no split between "the provider throttled us" and "the model rambled".

The practical consequence: if the API key started getting rate-limited, the
first signal would be a visitor seeing a 502.

Systems Design for the LLM Era argues that ordinary dashboards are insufficient
here, and names the three things worth tracking: cost per query, latency
percentiles, and the 429 and 5xx rates per provider. The last of those is what a
circuit breaker reads, which is why this comes before any breaker work.

## Decision

`src/lib/fde-metrics.ts` holds the counters, and the route writes one record at
whichever exit it reaches.

**Outcomes**, one per request: `ok`, `cache_hit`, `rate_limited`, `no_runtime`,
`gave_up`.

**Failures**, one per failed upstream attempt, so a request that succeeded on
retry still records the first attempt's cause: `http_429`, `http_5xx`,
`http_4xx`, `empty`, `leak`, `shape`, `unparseable`, `network`.

`http_429` and `http_5xx` are split from `http_4xx` deliberately. They are the
two a breaker would trip on and they mean opposite things: throttled, versus the
provider is down. Collapsing them into one "upstream error" number would lose
exactly the distinction the breaker needs.

**Latency** is a bounded sample window of 500, and the endpoint reports p50, p95
and p99 rather than a mean. An average over a route that is sometimes a 30ms
cache hit and sometimes a 6s model call describes neither case. The window size
is chosen so p99 lands on the fifth slowest sample rather than on the single
worst one.

Latency is measured across **both** attempts, because a retry is time the
visitor waited through. Timing only the successful call would report the fast
half of a slow request.

**Cost is recorded as tokens**, from Gemini's `usageMetadata`, including for
calls whose body is then rejected, because those cost tokens too. Not currency:
a hardcoded price per million goes stale silently and this file has no way to
notice. Tokens are what was actually spent.

**Malformed input is not counted.** That check runs before the rate limiter, so
counting it would hand anyone an unmetered way to make this route write to
Redis. It is also not an LLM metric.

**Reading is a `GET` on the same route**, returning aggregates only: no briefs,
no IPs, no keys, nothing about an individual visitor. Public on purpose. A
counter nobody can read is not observability, gating it behind a token would add
configuration that has to exist before the endpoint does anything, and the site's
own copy says it publishes load-bearing numbers. It returns 503 when no store is
configured, which is also the local development answer.

## Consequences

**One extra Redis round trip per request**, pipelined into a single call rather
than six. On the `ok` path the model call dominates by three orders of
magnitude. On `cache_hit` it roughly doubles a fast path that was one read, which
is the real cost of this decision and is accepted: a cache hit rate nobody can
see is not worth having a cache hit rate for.

**Metrics never break the request.** Every write is wrapped and returns a boolean
instead of throwing, including when the client throws on `pipeline()` itself.
Both cases are covered by tests, because the failure mode worth avoiding is a
working simulation turned into an error by its own instrumentation.

**The breaker in C9 now has its inputs.** `http_429` and `http_5xx` rates over a
window are what it would read. This record does not build it.

**The counters are cumulative and never reset.** There is no windowing, so the
rates are lifetime rates. That is enough to notice a key being throttled and not
enough to see a spike from last Tuesday.

## Compliance

`src/lib/fde-metrics.test.ts`, 17 tests, runs in CI with no Redis: a fake client
records the pipeline calls. It covers nearest-rank percentiles including the
empty window returning null rather than zero, the 429/5xx/4xx split, one round
trip per request, the sample window staying bounded, string-shaped values from
Upstash being coerced before arithmetic, and both throw paths returning false.

Nothing asserts that the route calls `recordSim` at every exit. That is a
reading of the route, not a test, and it is the obvious gap here.

## Notes

Adding a `GET` to a route that previously exported only `POST` risks Next
prerendering it at build time, which would bake a no-store 503 into a static
response. Checked rather than assumed: the build still reports `ƒ /api/fde-sim`,
server-rendered on demand. No `force-dynamic` was added, since it is already
dynamic and a redundant export is a thing to keep true later.

Not done, and worth naming: the numbers are not shown anywhere a person would
look. The FDE page could carry a line reading how many briefs have been
decomposed and at what p95, which would make the instrumentation visible and is
the same argument the page already makes about itself.
