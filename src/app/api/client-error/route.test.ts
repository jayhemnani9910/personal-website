import { beforeEach, describe, expect, it, vi } from "vitest";
import { OPS_ERRORS, OPS_KEPT } from "@/lib/ops-log";

let lists: Map<string, unknown[]>;
let counts: Map<string, number>;

const redis = {
  lpush: vi.fn(async (k: string, ...v: unknown[]) => {
    const l = lists.get(k) ?? [];
    l.unshift(...v);
    lists.set(k, l);
    return l.length;
  }),
  ltrim: vi.fn(async (k: string, start: number, stop: number) => {
    lists.set(k, (lists.get(k) ?? []).slice(start, stop + 1));
    return "OK";
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
    new NextRequest("https://jayhemnani.in/api/client-error", {
      method: "POST",
      headers: { "content-type": "application/json", "x-real-ip": ip },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

describe("/api/client-error", () => {
  const error = vi.spyOn(console, "error").mockImplementation(() => {});
  beforeEach(() => {
    lists = new Map();
    counts = new Map();
    error.mockClear();
  });

  it("keeps the crash, flattened to one line", async () => {
    expect((await post({ message: "boom\nsecond line", digest: "123", page: "/fde" })).status).toBe(204);
    const [entry] = lists.get(OPS_ERRORS) as { message: string; page: string; digest: string }[];
    expect(entry).toMatchObject({ message: "boom second line", page: "/fde", digest: "123" });
  });

  it("refuses an empty report or one that is not JSON", async () => {
    expect((await post({ page: "/" })).status).toBe(400);
    expect((await post("nope")).status).toBe(400);
    expect((await post("x".repeat(5_000))).status).toBe(413);
    expect(lists.size).toBe(0);
  });

  it("keeps at most five a minute from one tab, and never more than the cap", async () => {
    for (let i = 0; i < 8; i++) await post({ message: `crash ${i}`, page: "/" });
    expect(lists.get(OPS_ERRORS)).toHaveLength(5);
    for (let i = 0; i < OPS_KEPT + 5; i++) await post({ message: "x", page: "/" }, `198.51.${i >> 8}.${i & 255}`);
    expect(lists.get(OPS_ERRORS)).toHaveLength(OPS_KEPT);
  });
});
