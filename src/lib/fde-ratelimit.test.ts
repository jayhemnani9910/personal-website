import { describe, expect, it, vi, beforeEach } from "vitest";

/**
 * Exercises the rate limiter through the real POST handler, because the limiter
 * itself cannot be exported (Next validates the exports of a route file).
 *
 * The bug: only the first request of a window sets the TTL. If that `expire`
 * failed, the key counted up forever with no expiry, so every later request saw
 * count > limit and that IP was throttled permanently.
 */

interface FakeRedis {
  incr: ReturnType<typeof vi.fn>;
  expire: ReturnType<typeof vi.fn>;
  ttl: ReturnType<typeof vi.fn>;
  get: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
  pipeline: () => Record<string, unknown>;
}

let redis: FakeRedis;

vi.mock("@/lib/kv", () => ({ getRedis: () => redis }));

function makeRedis(overrides: Partial<FakeRedis> = {}): FakeRedis {
  // A pipeline that swallows any chain of calls, so recordSim's metrics writes
  // are not what this test is about.
  const pipe: Record<string, unknown> = new Proxy(
    {},
    { get: (_t, prop) => (prop === "exec" ? async () => [] : () => pipe) },
  );
  return {
    incr: vi.fn(async () => 1),
    expire: vi.fn(async () => 1),
    ttl: vi.fn(async () => 60),
    get: vi.fn(async () => null),
    set: vi.fn(async () => "OK"),
    pipeline: () => pipe,
    ...overrides,
  };
}

async function post(ip = "203.0.113.7") {
  const { POST } = await import("@/app/api/fde-sim/route");
  const { NextRequest } = await import("next/server");
  const req = new NextRequest("https://jayhemnani.in/api/fde-sim", {
    method: "POST",
    headers: { "content-type": "application/json", "x-real-ip": ip },
    body: JSON.stringify({ brief: "a support team is drowning in tickets" }),
  });
  return POST(req);
}

describe("fde-sim rate limiting", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("lets the first request of a window through and sets a TTL", async () => {
    redis = makeRedis({ incr: vi.fn(async () => 1) });
    const res = await post();
    expect(res.status).not.toBe(429);
    expect(redis.expire).toHaveBeenCalled();
  });

  it("throttles once the count passes the limit and the window is intact", async () => {
    redis = makeRedis({ incr: vi.fn(async () => 9), ttl: vi.fn(async () => 42) });
    const res = await post();
    expect(res.status).toBe(429);
  });

  it("stays under the limit while the count is within it", async () => {
    redis = makeRedis({ incr: vi.fn(async () => 5) });
    const res = await post();
    expect(res.status).not.toBe(429);
  });

  // The regression: a key with no TTL used to mean a permanent ban.
  it("repairs a key that lost its TTL instead of banning the IP forever", async () => {
    redis = makeRedis({ incr: vi.fn(async () => 99), ttl: vi.fn(async () => -1) });
    const res = await post();
    expect(res.status).not.toBe(429);
    expect(redis.expire).toHaveBeenCalledWith(expect.stringContaining("ratelimit:fde-sim:"), 60);
  });

  it("fails open when the store throws", async () => {
    redis = makeRedis({
      incr: vi.fn(async () => {
        throw new Error("store down");
      }),
    });
    const res = await post();
    expect(res.status).not.toBe(429);
  });
});
