import { beforeEach, describe, expect, it, vi } from "vitest";
import { clean, parseNote, visible } from "@/lib/guestbook";

// The wall is public, so validation, the rate limit and the hidden flag are
// tested through the real handlers against an in-memory list.

let list: unknown[];
let counts: Map<string, number>;
let broken = false;

const redis = {
  lrange: vi.fn(async (_k: string, start: number, stop: number) => {
    if (broken) throw new Error("store down");
    return list.slice(start, stop + 1);
  }),
  lpush: vi.fn(async (_k: string, v: unknown) => {
    if (broken) throw new Error("store down");
    list.unshift(v);
    return list.length;
  }),
  ltrim: vi.fn(async (_k: string, start: number, stop: number) => {
    list = list.slice(start, stop + 1);
    return "OK";
  }),
  incr: vi.fn(async (k: string) => {
    const n = (counts.get(k) ?? 0) + 1;
    counts.set(k, n);
    return n;
  }),
  expire: vi.fn(async () => 1),
  ttl: vi.fn(async () => 600),
};

vi.mock("@/lib/kv", () => ({ getRedis: () => redis }));

async function post(body: unknown, ip = "203.0.113.7") {
  const { POST } = await import("./route");
  const { NextRequest } = await import("next/server");
  return POST(
    new NextRequest("https://jayhemnani.in/api/guestbook", {
      method: "POST",
      headers: { "content-type": "application/json", "x-real-ip": ip },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

async function get() {
  const { GET } = await import("./route");
  return GET();
}

beforeEach(() => {
  list = [];
  counts = new Map();
  broken = false;
});

describe("guestbook route", () => {
  it("stores a note and returns it newest first", async () => {
    expect((await post({ name: "ana", msg: "first" })).status).toBe(201);
    expect((await post({ name: "ben", msg: "second" }, "203.0.113.8")).status).toBe(201);
    const { notes } = await (await get()).json();
    expect(notes.map((n: { msg: string }) => n.msg)).toEqual(["second", "first"]);
  });

  it("signs a nameless note as anonymous and strips tags", async () => {
    const res = await post({ name: "  ", msg: "<b>hi</b> <script>x</script>there" });
    const { note } = await res.json();
    expect(note.name).toBe("anonymous");
    expect(note.msg).toBe("hi xthere");
  });

  it("rejects an empty, overlong or blocked note", async () => {
    expect((await (await post({ msg: "   " })).json()).error).toBe("empty");
    expect((await (await post({ msg: "x".repeat(91) })).json()).error).toBe("too_long");
    expect((await (await post({ msg: "well shit" })).json()).error).toBe("blocked");
    expect((await post("not json")).status).toBe(400);
    expect(list).toHaveLength(0);
  });

  it("allows three notes per visitor per window, then 429", async () => {
    for (let i = 0; i < 3; i++) expect((await post({ msg: `note ${i}` })).status).toBe(201);
    expect((await post({ msg: "one too many" })).status).toBe(429);
    expect((await post({ msg: "someone else" }, "198.51.100.1")).status).toBe(201);
  });

  it("leaves hidden notes off the wall", async () => {
    list = [
      { name: "a", msg: "keep", at: 2 },
      { name: "b", msg: "gone", at: 1, hidden: true },
    ];
    const { notes } = await (await get()).json();
    expect(notes).toEqual([{ name: "a", msg: "keep", at: 2 }]);
  });

  it("answers 503 rather than an empty wall when the store is down", async () => {
    broken = true;
    expect((await get()).status).toBe(503);
    expect((await post({ msg: "hello" })).status).toBe(503);
  });
});

describe("guestbook helpers", () => {
  it("clean collapses whitespace and drops control characters", () => {
    expect(clean("  a\n\tb\u0007c  ")).toBe("a b c");
  });

  it("parseNote takes the limits after cleaning", () => {
    expect(parseNote({ msg: `<i>${"x".repeat(90)}</i>` })).toEqual({ ok: true, name: "anonymous", msg: "x".repeat(90) });
    expect(parseNote({ name: "n".repeat(25), msg: "ok" })).toEqual({ ok: false, error: "too_long" });
    expect(parseNote({ msg: 3 })).toEqual({ ok: false, error: "invalid" });
  });

  it("does not block words that only contain a blocked one", () => {
    expect(parseNote({ msg: "grapes and a shiitake" }).ok).toBe(true);
  });

  it("visible drops the hidden flag itself", () => {
    expect(visible([{ name: "a", msg: "b", at: 1, hidden: false }])).toEqual([{ name: "a", msg: "b", at: 1 }]);
  });
});
