import { beforeEach, describe, expect, it, vi } from "vitest";

// The view count is shown publicly on project pages, so the dedup, the slug
// check and the store-error path are tested through the real handlers.

let data: Map<string, number>;
let broken = false;

const redis = {
  get: vi.fn(async (k: string) => {
    if (broken) throw new Error("store down");
    return data.get(k) ?? null;
  }),
  set: vi.fn(async (k: string, v: number, opts?: { nx?: boolean }) => {
    if (broken) throw new Error("store down");
    if (opts?.nx && data.has(k)) return null;
    data.set(k, v);
    return "OK";
  }),
  incr: vi.fn(async (k: string) => {
    if (broken) throw new Error("store down");
    const n = (data.get(k) ?? 0) + 1;
    data.set(k, n);
    return n;
  }),
  del: vi.fn(async (k: string) => {
    data.delete(k);
    return 1;
  }),
  expire: vi.fn(async () => 1),
  ttl: vi.fn(async () => 60),
};

vi.mock("@/lib/kv", () => ({ getRedis: () => redis }));

async function post(slug: unknown, ip = "203.0.113.7") {
  const { POST } = await import("./route");
  const { NextRequest } = await import("next/server");
  return POST(
    new NextRequest("https://jayhemnani.in/api/views", {
      method: "POST",
      headers: { "content-type": "application/json", "x-real-ip": ip },
      body: JSON.stringify({ slug }),
    }),
  );
}

async function get(slug: string) {
  const { GET } = await import("./route");
  const { NextRequest } = await import("next/server");
  return GET(new NextRequest(`https://jayhemnani.in/api/views?slug=${slug}`));
}

beforeEach(() => {
  data = new Map();
  broken = false;
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("/api/views", () => {
  it("counts a first view, and not a repeat from the same visitor", async () => {
    expect(await (await post("voxt")).json()).toEqual({ count: 1, counted: true });
    expect(await (await post("voxt")).json()).toEqual({ count: 1, counted: false });
    expect(await (await post("voxt", "198.51.100.9")).json()).toEqual({ count: 2, counted: true });
  });

  it("rejects a slug that is not a real project, so it cannot mint keys", async () => {
    const res = await post("zz-not-a-project-123");
    expect(res.status).toBe(400);
    expect([...data.keys()].some((k) => k.includes("zz-not-a-project"))).toBe(false);
    expect((await get("zz-not-a-project-123")).status).toBe(400);
  });

  it("reports a store error as an error, never as 0 views", async () => {
    broken = true;
    const res = await post("voxt");
    expect(res.status).toBe(503);
    expect(await res.json()).not.toHaveProperty("count");
    expect((await get("voxt")).status).toBe(503);
  });

  it("lets a retry count the view when the increment failed", async () => {
    const incr = redis.incr.getMockImplementation()!;
    redis.incr.mockImplementation(async (k: string) => {
      if (k.startsWith("views:")) throw new Error("store down");
      return incr(k);
    });
    expect((await post("voxt")).status).toBe(503);
    redis.incr.mockImplementation(incr);
    expect(await (await post("voxt")).json()).toEqual({ count: 1, counted: true });
  });
});
