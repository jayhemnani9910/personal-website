// Operational counters for /api/fde-sim.
//
// Systems Design for the LLM Era: existing dashboards are insufficient in the
// LLM era, so track cost per query, latency percentiles, and the 429 and 5xx
// rates per provider, the last of which is what a circuit breaker reads.
//
// Before this the route called console.error on each failure path and nothing
// else. Vercel collects those lines, so a single failure is findable, but there
// was no rate, no latency, and no way to notice the key had started getting
// throttled short of a visitor seeing a 502.
//
// Percentiles, not averages. An average latency over a route that is sometimes
// a cache hit at 30ms and sometimes a model call at 6s describes neither.

import type { Redis } from "@upstash/redis";

/** What happened to one request. Exactly one of these is recorded per call. */
export type SimOutcome =
  | "ok"              // model answered and the payload passed the shape check
  | "cache_hit"
  | "rate_limited"    // OUR limit, applied to the visitor
  | "no_runtime"      // GEMINI_API_KEY missing
  | "gave_up";        // both attempts failed, visitor got a 502

// Malformed input is deliberately NOT an outcome here. That check runs before
// the rate limiter, so counting it would give anyone an unmetered way to make
// this route write to Redis. It is also not an LLM metric.

/**
 * Why a single upstream attempt failed. Several can be recorded per request,
 * since the route retries once. `http_429` and `http_5xx` are split out from
 * `http_4xx` on purpose: they are the two a breaker would trip on, and they mean
 * opposite things (throttled versus provider down).
 */
export type SimFailure =
  | "http_429"
  | "http_5xx"
  | "http_4xx"
  | "empty"        // 200 with no text
  | "leak"         // response echoed the system prompt
  | "shape"        // valid JSON, wrong shape
  | "unparseable"  // no JSON could be extracted
  | "network";     // fetch threw

const PREFIX = "fdesim";

/** Bounded sample window for percentiles. 500 keeps p99 meaningful at five samples. */
export const LATENCY_WINDOW = 500;

export const keys = {
  outcome: (o: SimOutcome) => `${PREFIX}:outcome:${o}`,
  failure: (f: SimFailure) => `${PREFIX}:failure:${f}`,
  latency: `${PREFIX}:latency`,
  /** Time to first section on the streaming path. The book's "time to first token". */
  ttfs: `${PREFIX}:ttfs`,
  promptTokens: `${PREFIX}:tokens:prompt`,
  outputTokens: `${PREFIX}:tokens:output`,
};

export interface SimEvent {
  outcome: SimOutcome;
  /** One entry per failed upstream attempt. */
  failures?: SimFailure[];
  /** Wall-clock ms for the upstream call(s). Omitted when none was made. */
  latencyMs?: number;
  /**
   * Ms until the first section reached the visitor. Streaming path only, so the
   * two windows answer different questions: how long the whole answer took, and
   * how long before there was anything to read.
   */
  ttfsMs?: number;
  promptTokens?: number;
  outputTokens?: number;
}

/**
 * Classify an upstream HTTP status. Split so a breaker can tell "we are being
 * throttled" from "the provider is broken" from "we sent something wrong".
 */
export function classifyStatus(status: number): SimFailure {
  if (status === 429) return "http_429";
  if (status >= 500) return "http_5xx";
  return "http_4xx";
}

/**
 * Write one request's metrics. Pipelined into a single round trip, and it never
 * throws: a metrics backend being down must not turn a working simulation into
 * an error. Returns whether anything was written, which is what makes it
 * testable.
 */
export async function recordSim(redis: Redis | null, event: SimEvent): Promise<boolean> {
  if (!redis) return false;
  try {
    const pipe = redis.pipeline();
    pipe.incr(keys.outcome(event.outcome));
    for (const f of event.failures ?? []) pipe.incr(keys.failure(f));
    if (typeof event.latencyMs === "number" && event.latencyMs >= 0) {
      pipe.lpush(keys.latency, event.latencyMs);
      pipe.ltrim(keys.latency, 0, LATENCY_WINDOW - 1);
    }
    if (typeof event.ttfsMs === "number" && event.ttfsMs >= 0) {
      pipe.lpush(keys.ttfs, event.ttfsMs);
      pipe.ltrim(keys.ttfs, 0, LATENCY_WINDOW - 1);
    }
    if (event.promptTokens) pipe.incrby(keys.promptTokens, event.promptTokens);
    if (event.outputTokens) pipe.incrby(keys.outputTokens, event.outputTokens);
    await pipe.exec();
    return true;
  } catch {
    // Deliberately silent. This runs on the response path of a route whose job
    // is not to report on itself.
    return false;
  }
}

/**
 * Nearest-rank percentile over a sample window.
 *
 * p99 of 500 samples is the 5th slowest, which is a real observation rather than
 * an interpolation between two. Returns null for an empty window instead of 0,
 * because "no data" and "instant" are different answers.
 */
export function percentile(samples: number[], p: number): number | null {
  if (samples.length === 0) return null;
  const sorted = [...samples].sort((a, b) => a - b);
  const rank = Math.ceil((p / 100) * sorted.length);
  return sorted[Math.min(Math.max(rank, 1), sorted.length) - 1];
}

export interface SimMetrics {
  outcomes: Record<string, number>;
  failures: Record<string, number>;
  totals: {
    requests: number;
    cacheHitRate: number | null;
    upstreamFailures: number;
  };
  latencyMs: { samples: number; p50: number | null; p95: number | null; p99: number | null };
  /** Streaming path only. Empty until something streams. */
  timeToFirstSectionMs: { samples: number; p50: number | null; p95: number | null; p99: number | null };
  tokens: { prompt: number; output: number; perAnsweredCall: number | null };
}

const OUTCOMES: SimOutcome[] = ["ok", "cache_hit", "rate_limited", "no_runtime", "gave_up"];
const FAILURES: SimFailure[] = ["http_429", "http_5xx", "http_4xx", "empty", "leak", "shape", "unparseable", "network"];

/** Read the counters back. Returns null when no store is configured. */
export async function readSimMetrics(redis: Redis | null): Promise<SimMetrics | null> {
  if (!redis) return null;

  const outcomeKeys = OUTCOMES.map(keys.outcome);
  const failureKeys = FAILURES.map(keys.failure);

  const [counts, samples, ttfsSamples, promptTokens, outputTokens] = await Promise.all([
    redis.mget<(number | null)[]>(...outcomeKeys, ...failureKeys),
    redis.lrange<number>(keys.latency, 0, LATENCY_WINDOW - 1),
    redis.lrange<number>(keys.ttfs, 0, LATENCY_WINDOW - 1),
    redis.get<number>(keys.promptTokens),
    redis.get<number>(keys.outputTokens),
  ]);

  const num = (v: number | null | undefined) => Number(v ?? 0);
  const outcomes = Object.fromEntries(OUTCOMES.map((o, i) => [o, num(counts?.[i])]));
  const failures = Object.fromEntries(FAILURES.map((f, i) => [f, num(counts?.[OUTCOMES.length + i])]));

  const requests = OUTCOMES.reduce((sum, o) => sum + outcomes[o], 0);
  const served = outcomes.ok + outcomes.cache_hit;
  // Numbers stored as strings by some clients; coerce before arithmetic.
  const ms = (samples ?? []).map(Number).filter((n) => Number.isFinite(n));
  const ttfs = (ttfsSamples ?? []).map(Number).filter((n) => Number.isFinite(n));

  return {
    outcomes,
    failures,
    totals: {
      requests,
      cacheHitRate: served > 0 ? Number((outcomes.cache_hit / served).toFixed(3)) : null,
      upstreamFailures: FAILURES.reduce((sum, f) => sum + failures[f], 0),
    },
    latencyMs: {
      samples: ms.length,
      p50: percentile(ms, 50),
      p95: percentile(ms, 95),
      p99: percentile(ms, 99),
    },
    timeToFirstSectionMs: {
      samples: ttfs.length,
      p50: percentile(ttfs, 50),
      p95: percentile(ttfs, 95),
      p99: percentile(ttfs, 99),
    },
    tokens: {
      prompt: num(promptTokens),
      output: num(outputTokens),
      // Tokens, not currency. A hardcoded price per million goes stale silently
      // and this file has no way to notice; tokens are what was actually spent.
      perAnsweredCall: outcomes.ok > 0
        ? Math.round((num(promptTokens) + num(outputTokens)) / outcomes.ok)
        : null,
    },
  };
}
