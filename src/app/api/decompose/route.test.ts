import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FEATURED, PRESETS } from "@/data/home";

/**
 * Mirrors fde-ratelimit.test.ts's approach: getRedis is mocked to hand back a
 * module-level `redis` fake that each test can shape, and the route is
 * re-imported dynamically per test so a fresh module (and RECIPE) is built
 * against whatever `redis` and env vars that test set up.
 */
interface FakeRedis {
  incr: ReturnType<typeof vi.fn>;
  expire: ReturnType<typeof vi.fn>;
  ttl: ReturnType<typeof vi.fn>;
  get: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
}

let redis: FakeRedis;

vi.mock("@/lib/kv", () => ({ getRedis: () => redis }));

function makeRedis(overrides: Partial<FakeRedis> = {}): FakeRedis {
  // A real Map behind get/set, so a route under test can round-trip its own
  // cache writes within one test (the "served from cache" case needs that).
  const store = new Map<string, unknown>();
  return {
    incr: vi.fn(async () => 1),
    expire: vi.fn(async () => 1),
    ttl: vi.fn(async () => 60),
    get: vi.fn(async (key: string) => store.get(key) ?? null),
    set: vi.fn(async (key: string, value: unknown) => {
      store.set(key, value);
      return "OK";
    }),
    ...overrides,
  };
}

async function post(brief: string, ip = "203.0.113.7") {
  const { POST } = await import("@/app/api/decompose/route");
  const { NextRequest } = await import("next/server");
  const req = new NextRequest("https://www.jayhemnani.me/api/decompose", {
    method: "POST",
    headers: { "content-type": "application/json", "x-real-ip": ip },
    body: JSON.stringify({ brief }),
  });
  return POST(req);
}

const VALID_OUT = {
  scope: ["s1", "s2", "s3"],
  architecture: ["a1", "a2", "a3"],
  plan: ["p1", "p2", "p3"],
  risks: ["r1", "r2", "r3"],
  match: [FEATURED[0].id, "not-a-real-project-id"],
};

function geminiResponse(text: string) {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    json: async () => ({ candidates: [{ content: { parts: [{ text }] } }] }),
  };
}

describe("POST /api/decompose", () => {
  const originalKey = process.env.GEMINI_API_KEY;

  beforeEach(() => {
    vi.resetModules();
    redis = makeRedis();
    process.env.GEMINI_API_KEY = "test-key";
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
  });

  it("rejects an empty brief", async () => {
    const res = await post("");
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "empty" });
  });

  it("rejects a brief over BRIEF_MAX", async () => {
    const res = await post("a".repeat(601));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "too_long" });
  });

  it("answers a preset's exact text without calling fetch", async () => {
    const res = await post(PRESETS[0].text);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.engine).toBe("preset");
    expect(body.out).toEqual(PRESETS[0].out);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns 429 when the rate limiter is over the limit", async () => {
    redis = makeRedis({ incr: vi.fn(async () => 99), ttl: vi.fn(async () => 60) });
    const res = await post("a brief nobody has a preset for");
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ error: "rate_limited" });
  });

  it("returns 503 when GEMINI_API_KEY is unset", async () => {
    delete process.env.GEMINI_API_KEY;
    const res = await post("a brief nobody has a preset for");
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "unavailable" });
  });

  it("returns 503 when the upstream call fails", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: async () => ({}),
    } as Response);
    const res = await post("a brief nobody has a preset for");
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "unavailable" });
  });

  it("returns 503 when the upstream text is unparseable", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(geminiResponse("not json at all") as Response);
    const res = await post("a brief nobody has a preset for");
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "unavailable" });
  });

  it("returns 200 with the model engine and filters match to known ids", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(geminiResponse(JSON.stringify(VALID_OUT)) as Response);
    const res = await post("a brief nobody has a preset for");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.engine).toBe("model");
    expect(body.out.match).toEqual([FEATURED[0].id]);
  });

  it("serves a second identical call from the cache, calling fetch once", async () => {
    vi.mocked(fetch).mockResolvedValue(geminiResponse(JSON.stringify(VALID_OUT)) as Response);
    const brief = "a brief nobody has a preset for, asked twice";

    const first = await post(brief);
    expect(first.status).toBe(200);
    const second = await post(brief);
    expect(second.status).toBe(200);

    const secondBody = await second.json();
    expect(secondBody.engine).toBe("model");
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
