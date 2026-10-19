import { beforeEach, describe, expect, it, vi } from "vitest";

let hashes: Map<string, Map<string, number>>;
let counts: Map<string, number>;

const redis = {
  hincrby: vi.fn(async (k: string, f: string, by: number) => {
    const h = hashes.get(k) ?? new Map();
    h.set(f, (h.get(f) ?? 0) + by);
    hashes.set(k, h);
    return h.get(f);
  }),
  incr: vi.fn(async (k: string) => {
    const n = (counts.get(k) ?? 0) + 1;
    counts.set(k, n);
    return n;
  }),
  expire: vi.fn(async () => 1),
  ttl: vi.fn(async () => 60),
};

vi.mock("@/lib/kv", () => ({ getRedis: () => redis }));

async function post(body: unknown, ip = "203.0.113.7") {
  const { POST } = await import("./route");
  const { NextRequest } = await import("next/server");
  return POST(
    new NextRequest("https://jayhemnani.in/api/events", {
      method: "POST",
      headers: { "content-type": "application/json", "x-real-ip": ip },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

describe("/api/events", () => {
  beforeEach(() => {
    hashes = new Map();
    counts = new Map();
  });

  it("counts a known event under today's key", async () => {
    expect((await post({ name: "resume:fde" })).status).toBe(204);
    expect((await post({ name: "resume:fde" })).status).toBe(204);
    const today = `events:${new Date().toISOString().slice(0, 10)}`;
    expect(hashes.get(today)?.get("resume:fde")).toBe(2);
  });

  it("refuses names it does not know, so nobody can add fields", async () => {
    expect((await post({ name: "resume:anything" })).status).toBe(400);
    expect((await post({ name: 7 })).status).toBe(400);
    expect((await post("not json")).status).toBe(400);
    expect(hashes.size).toBe(0);
  });

  it("stops counting a caller past thirty a minute", async () => {
    for (let i = 0; i < 30; i++) await post({ name: "out:github" });
    expect((await post({ name: "out:github" })).status).toBe(429);
    expect((await post({ name: "out:github" }, "198.51.100.1")).status).toBe(204);
  });
});
