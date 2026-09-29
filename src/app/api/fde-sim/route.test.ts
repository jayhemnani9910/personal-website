import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SimPayload } from "@/lib/fde-payload";

/**
 * Drives the streaming path of the real POST handler with a stubbed Gemini:
 * the retry rule from ADR 0013, the per-section leak and shape filter, the
 * error codes the visitor sees, the cache-hit replay and the daily budget.
 */

const SAMPLE: SimPayload = JSON.parse(
  readFileSync(join(process.cwd(), "tests/eval/responses/support-tickets.json"), "utf8"),
);

let store: Map<string, unknown>;
let counters: Map<string, number>;

const pipe: Record<string, unknown> = new Proxy({}, { get: (_t, prop) => (prop === "exec" ? async () => [] : () => pipe) });
const redis = {
  incr: vi.fn(async (k: string) => {
    const n = (counters.get(k) ?? 0) + 1;
    counters.set(k, n);
    return n;
  }),
  expire: vi.fn(async () => 1),
  ttl: vi.fn(async () => 60),
  get: vi.fn(async (k: string) => store.get(k) ?? null),
  set: vi.fn(async (k: string, v: unknown) => {
    store.set(k, v);
    return "OK";
  }),
  pipeline: () => pipe,
};

vi.mock("@/lib/kv", () => ({ getRedis: () => redis }));

/** A Gemini SSE body that streams `text` in small pieces. */
function geminiStream(text: string): Response {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += 40) {
    chunks.push(`data: ${JSON.stringify({ candidates: [{ content: { parts: [{ text: text.slice(i, i + 40) }] } }] })}\n\n`);
  }
  const body = new ReadableStream<Uint8Array>({
    start(c) {
      for (const ch of chunks) c.enqueue(new TextEncoder().encode(ch));
      c.close();
    },
  });
  return new Response(body, { status: 200, headers: { "content-type": "text/event-stream" } });
}

/** Sections first, then a network drop: the body errors after `text`. */
function geminiStreamThenDrop(text: string): Response {
  let sent = false;
  const body = new ReadableStream<Uint8Array>({
    pull(c) {
      if (!sent) {
        sent = true;
        c.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ candidates: [{ content: { parts: [{ text }] } }] })}\n\n`));
      } else {
        c.error(new Error("socket hang up"));
      }
    },
  });
  return new Response(body, { status: 200 });
}

async function run(): Promise<{ status: number; events: { type: string; data: Record<string, unknown> }[]; cache: string | null }> {
  const { POST } = await import("@/app/api/fde-sim/route");
  const { NextRequest } = await import("next/server");
  const res = await POST(
    new NextRequest("https://jayhemnani.in/api/fde-sim?stream=1", {
      method: "POST",
      headers: { "content-type": "application/json", "x-real-ip": "203.0.113.7" },
      body: JSON.stringify({ brief: "a support team is drowning in tickets" }),
    }),
  );
  const text = await res.text();
  const events = text
    .split("\n\n")
    .filter(Boolean)
    .map((frame) => ({
      type: frame.match(/^event: (.+)$/m)?.[1] ?? "",
      data: JSON.parse(frame.match(/^data: (.+)$/m)?.[1] ?? "{}"),
    }));
  return { status: res.status, events, cache: res.headers.get("x-sim-cache") };
}

beforeEach(() => {
  vi.resetModules();
  store = new Map();
  counters = new Map();
  vi.stubEnv("GEMINI_API_KEY", "test-key");
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("fde-sim streaming route", () => {
  it("streams every section, then done, and caches the answer", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => geminiStream(JSON.stringify(SAMPLE))));
    const { events } = await run();
    expect(events.filter((e) => e.type === "section").map((e) => e.data.key)).toEqual([
      "scope",
      "decomposition",
      "architecture",
      "sprint",
      "risks",
    ]);
    expect(events.at(-1)?.type).toBe("done");
    expect(redis.set).toHaveBeenCalledOnce();
  });

  it("retries a 5xx that sent nothing, and succeeds", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response("down", { status: 503 }))
      .mockResolvedValueOnce(geminiStream(JSON.stringify(SAMPLE)));
    vi.stubGlobal("fetch", fetchMock);
    const { events } = await run();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(events.at(-1)?.type).toBe("done");
  });

  it("does not retry a 4xx, and tells the visitor it was upstream, not their brief", async () => {
    const fetchMock = vi.fn(async () => new Response("bad key", { status: 403 }));
    vi.stubGlobal("fetch", fetchMock);
    const { events } = await run();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(events).toEqual([{ type: "error", data: { error: "upstream" } }]);
  });

  it("never retries once a section has been sent (ADR 0013)", async () => {
    const partial = JSON.stringify(SAMPLE).slice(0, JSON.stringify(SAMPLE).indexOf('"architecture"'));
    const fetchMock = vi.fn(async () => geminiStreamThenDrop(partial));
    vi.stubGlobal("fetch", fetchMock);
    const { events } = await run();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(events.filter((e) => e.type === "section").length).toBeGreaterThan(0);
    expect(events.at(-1)).toEqual({ type: "error", data: { error: "upstream" } });
  });

  it("drops a section that echoes the prompt before it reaches the browser", async () => {
    const leaky = { ...SAMPLE, scope: [{ q: "STYLE RULES: speak as Jay", why: "leak" }] };
    vi.stubGlobal("fetch", vi.fn(async () => geminiStream(JSON.stringify(leaky))));
    const { events } = await run();
    expect(events.some((e) => e.type === "section")).toBe(false);
    expect(events.at(-1)).toEqual({ type: "error", data: { error: "parse" } });
  });

  it("drops a malformed section instead of sending it", async () => {
    const bad = { ...SAMPLE, scope: [] };
    vi.stubGlobal("fetch", vi.fn(async () => geminiStream(JSON.stringify(bad))));
    const { events } = await run();
    expect(events.some((e) => e.type === "section")).toBe(false);
    expect(events.at(-1)?.type).toBe("error");
  });

  it("replays a cache hit in section order without calling the model", async () => {
    const fetchMock = vi.fn(async () => geminiStream(JSON.stringify(SAMPLE)));
    vi.stubGlobal("fetch", fetchMock);
    await run();
    vi.resetModules();
    const second = await run();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(second.cache).toBe("hit");
    expect(second.events.map((e) => e.data.key ?? e.type)).toEqual([
      "scope",
      "decomposition",
      "architecture",
      "sprint",
      "risks",
      "done",
    ]);
  });

  it("serves presets once the day's model budget is spent", async () => {
    const day = new Date().toISOString().slice(0, 10);
    counters.set(`budget:fde-sim:${day}`, 200);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { events } = await run();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(events).toEqual([{ type: "error", data: { error: "no-runtime" } }]);
  });
});
