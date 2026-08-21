import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import type { Redis } from "@upstash/redis";
import {
  LATENCY_WINDOW,
  classifyStatus,
  keys,
  percentile,
  readSimMetrics,
  recordSim,
} from "./fde-metrics";

/** Records the pipeline calls made, so the write path can be asserted without Redis. */
function fakeRedis(overrides: Partial<Record<string, unknown>> = {}) {
  const calls: [string, ...unknown[]][] = [];
  const pipe = {
    incr: (k: string) => calls.push(["incr", k]),
    incrby: (k: string, n: number) => calls.push(["incrby", k, n]),
    lpush: (k: string, v: number) => calls.push(["lpush", k, v]),
    ltrim: (k: string, a: number, b: number) => calls.push(["ltrim", k, a, b]),
    exec: vi.fn(async () => []),
  };
  return { redis: { pipeline: () => pipe, ...overrides } as unknown as Redis, calls, pipe };
}

describe("percentile", () => {
  // "No data" and "instant" are different answers, and 0 would read as the latter.
  it("returns null for an empty window", () => {
    expect(percentile([], 50)).toBeNull();
    expect(percentile([], 99)).toBeNull();
  });

  it("uses nearest rank, so every result is an observed sample", () => {
    const s = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    expect(percentile(s, 50)).toBe(50);
    expect(percentile(s, 90)).toBe(90);
    expect(percentile(s, 100)).toBe(100);
    // Nothing interpolated: 95% of 10 samples rounds up to rank 10.
    expect(percentile(s, 95)).toBe(100);
  });

  it("does not care what order the samples arrive in", () => {
    expect(percentile([90, 10, 50, 30, 70], 50)).toBe(50);
  });

  it("clamps rather than reading off the end", () => {
    expect(percentile([5], 1)).toBe(5);
    expect(percentile([5], 99)).toBe(5);
  });

  // The reason the window is 500: p99 lands on the 5th slowest, not the slowest.
  it("keeps p99 off the single worst sample at the configured window size", () => {
    const s = Array.from({ length: LATENCY_WINDOW }, (_, i) => i + 1);
    expect(percentile(s, 99)).toBe(495);
    expect(percentile(s, 100)).toBe(500);
  });
});

describe("classifyStatus", () => {
  // Split because a breaker treats them differently: throttled, versus down.
  it("separates throttling from provider failure from our own bad request", () => {
    expect(classifyStatus(429)).toBe("http_429");
    expect(classifyStatus(500)).toBe("http_5xx");
    expect(classifyStatus(503)).toBe("http_5xx");
    expect(classifyStatus(400)).toBe("http_4xx");
    expect(classifyStatus(403)).toBe("http_4xx");
  });
});

describe("recordSim", () => {
  it("writes nothing and reports so when no store is configured", async () => {
    expect(await recordSim(null, { outcome: "ok" })).toBe(false);
  });

  it("counts the outcome and every failed attempt in one round trip", async () => {
    const { redis, calls, pipe } = fakeRedis();
    const ok = await recordSim(redis, {
      outcome: "gave_up",
      failures: ["http_429", "shape"],
      latencyMs: 1234,
      promptTokens: 900,
      outputTokens: 1500,
    });

    expect(ok).toBe(true);
    expect(pipe.exec).toHaveBeenCalledTimes(1); // one round trip, not six
    expect(calls).toContainEqual(["incr", keys.outcome("gave_up")]);
    expect(calls).toContainEqual(["incr", keys.failure("http_429")]);
    expect(calls).toContainEqual(["incr", keys.failure("shape")]);
    expect(calls).toContainEqual(["lpush", keys.latency, 1234]);
    expect(calls).toContainEqual(["ltrim", keys.latency, 0, LATENCY_WINDOW - 1]);
    expect(calls).toContainEqual(["incrby", keys.promptTokens, 900]);
    expect(calls).toContainEqual(["incrby", keys.outputTokens, 1500]);
  });

  it("keeps the two latency windows separate", async () => {
    const { redis, calls } = fakeRedis();
    await recordSim(redis, { outcome: "ok", latencyMs: 9000, ttfsMs: 700 });
    expect(calls).toContainEqual(["lpush", keys.latency, 9000]);
    expect(calls).toContainEqual(["lpush", keys.ttfs, 700]);
    expect(calls.filter((c) => c[0] === "ltrim")).toHaveLength(2);
  });

  it("keeps the sample window bounded on every write", async () => {
    const { redis, calls } = fakeRedis();
    await recordSim(redis, { outcome: "ok", latencyMs: 10 });
    expect(calls.filter((c) => c[0] === "ltrim")).toHaveLength(1);
  });

  it("records no latency or tokens when there was no upstream call", async () => {
    const { redis, calls } = fakeRedis();
    await recordSim(redis, { outcome: "cache_hit" });
    expect(calls).toEqual([["incr", keys.outcome("cache_hit")]]);
  });

  // The point of the whole module is to observe the route, never to break it.
  it("swallows a failing store rather than failing the request", async () => {
    const { redis, pipe } = fakeRedis();
    pipe.exec.mockRejectedValueOnce(new Error("upstash down"));
    await expect(recordSim(redis, { outcome: "ok", latencyMs: 5 })).resolves.toBe(false);
  });

  it("survives a client that throws on pipeline() itself", async () => {
    const broken = { pipeline: () => { throw new Error("nope"); } } as unknown as Redis;
    await expect(recordSim(broken, { outcome: "ok" })).resolves.toBe(false);
  });
});

describe("readSimMetrics", () => {
  const OUTCOME_COUNT = 5;  // ok, cache_hit, rate_limited, no_runtime, gave_up
  const FAILURE_COUNT = 8;

  function reader(
    outcomes: number[],
    failures: number[],
    samples: number[],
    tokens: [number, number],
    ttfs: number[] = [],
  ) {
    return {
      mget: async () => [...outcomes, ...failures],
      // Keyed, so the two latency windows cannot be confused for each other.
      lrange: async (k: string) => (k === keys.ttfs ? ttfs : samples),
      get: async (k: string) => (k === keys.promptTokens ? tokens[0] : tokens[1]),
    } as unknown as Redis;
  }

  it("returns null when no store is configured", async () => {
    expect(await readSimMetrics(null)).toBeNull();
  });

  it("aggregates counts, rates and percentiles", async () => {
    const redis = reader(
      [60, 40, 3, 1, 6],                  // ok, cache_hit, rate_limited, no_runtime, gave_up
      [2, 1, 0, 1, 0, 3, 1, 0],
      [100, 200, 300, 400, 500],
      [60_000, 90_000],
    );
    const m = (await readSimMetrics(redis))!;

    expect(m.outcomes.ok).toBe(60);
    expect(m.outcomes.gave_up).toBe(6);
    expect(m.failures.http_429).toBe(2);
    expect(m.totals.requests).toBe(110);
    expect(m.totals.upstreamFailures).toBe(8);
    // Rate is over what was served, so our own 429s and 503s do not dilute it.
    expect(m.totals.cacheHitRate).toBe(0.4);
    expect(m.latencyMs).toMatchObject({ samples: 5, p50: 300, p99: 500 });
    expect(m.tokens.perAnsweredCall).toBe(2500);
    // Nothing has streamed in this fixture, so the second window is empty
    // rather than a copy of the first.
    expect(m.timeToFirstSectionMs).toMatchObject({ samples: 0, p50: null });
  });

  it("reads time to first section from its own window", async () => {
    const m = (await readSimMetrics(
      reader([1, 0, 0, 0, 0], Array(FAILURE_COUNT).fill(0), [9000], [0, 0], [400, 800, 1200]),
    ))!;
    expect(m.latencyMs.p50).toBe(9000);
    expect(m.timeToFirstSectionMs).toMatchObject({ samples: 3, p50: 800 });
  });

  it("reports nulls rather than zeros on an untouched store", async () => {
    const m = (await readSimMetrics(
      reader(Array(OUTCOME_COUNT).fill(0), Array(FAILURE_COUNT).fill(0), [], [0, 0]),
    ))!;
    expect(m.totals.requests).toBe(0);
    expect(m.totals.cacheHitRate).toBeNull();
    expect(m.latencyMs.p99).toBeNull();
    expect(m.timeToFirstSectionMs.p99).toBeNull();
    expect(m.tokens.perAnsweredCall).toBeNull();
  });

  // Upstash can hand back numbers as strings depending on how they were written.
  it("coerces string-shaped values before doing arithmetic", async () => {
    const redis = {
      mget: async () => ["10", "10", 0, 0, 0, ...Array(FAILURE_COUNT).fill(0)],
      lrange: async () => ["50", "150", "250"],
      get: async () => "1000",
    } as unknown as Redis;
    const m = (await readSimMetrics(redis))!;
    expect(m.totals.requests).toBe(20);
    expect(m.latencyMs.p50).toBe(150);
    expect(m.tokens.perAnsweredCall).toBe(200);
  });

  it("tolerates a null row from mget", async () => {
    const redis = {
      mget: async () => [null, null, null, null, null, ...Array(FAILURE_COUNT).fill(null)],
      lrange: async () => [],
      get: async () => null,
    } as unknown as Redis;
    const m = (await readSimMetrics(redis))!;
    expect(m.totals.requests).toBe(0);
  });
});

// The route is where these are actually written, and nothing above proves it
// calls recordSim at all. This is the same shape of guard as webmcp.test.ts:
// read the real source and check the two lists have not drifted apart. It
// cannot prove the call sites are correct, only that every name the module
// defines is one the route mentions, which catches the case of adding an
// outcome and never recording it.
describe("the route records every outcome this module defines", () => {
  const route = readFileSync(
    resolve(dirname(fileURLToPath(import.meta.url)), "../app/api/fde-sim/route.ts"),
    "utf8",
  );

  it.each(["ok", "cache_hit", "rate_limited", "no_runtime", "gave_up"])(
    "route.ts records the %s outcome",
    (outcome) => {
      expect(route).toContain(`outcome: "${outcome}"`);
    },
  );

  it("reads the counters back through the shared helper", () => {
    expect(route).toContain("readSimMetrics(getRedis())");
  });

  // Counting this would run before the rate limiter, see the comment on
  // SimOutcome. If it ever appears, that reasoning needs revisiting first.
  it("does not count malformed input", () => {
    expect(route).not.toContain('outcome: "bad_input"');
  });
});
