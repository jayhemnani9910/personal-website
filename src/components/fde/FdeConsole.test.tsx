import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { FdeConsole } from "./FdeConsole";

// The console talks to /api/fde-sim, so every path below is a fetch outcome.
// These are the branches a visitor actually hits when something is wrong, and
// they are the ones nobody exercises by hand.
function mockFetch(status: number, body: unknown = {}) {
  const f = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
  vi.stubGlobal("fetch", f);
  return f;
}

function submit(brief: string) {
  fireEvent.change(screen.getByLabelText(/enter your problem brief/i), { target: { value: brief } });
  fireEvent.click(screen.getByRole("button", { name: /run sim/i }));
}

afterEach(() => vi.unstubAllGlobals());

describe("FdeConsole failure paths", () => {
  it("distinguishes a throttle from a bad brief", async () => {
    mockFetch(429);
    render(<FdeConsole />);
    submit("a support team drowning in tickets");

    // Telling someone their brief failed to parse when they were throttled
    // sends them off rewriting a brief that was fine.
    await waitFor(() => expect(screen.getByRole("alert").textContent).toMatch(/too many runs in a minute/i));
    expect(screen.getByRole("alert").textContent).not.toMatch(/trouble parsing/i);
  });

  it("explains a missing runtime rather than blaming the brief", async () => {
    // The real route answers this one with a JSON error code, not a bare 503.
    mockFetch(503, { error: "no-runtime" });
    render(<FdeConsole />);
    submit("a support team drowning in tickets");

    await waitFor(() => expect(screen.getByRole("alert").textContent).toMatch(/needs a runtime/i));
  });

  it("reports a parse failure on a 502", async () => {
    mockFetch(502);
    render(<FdeConsole />);
    submit("a support team drowning in tickets");

    await waitFor(() => expect(screen.getByRole("alert").textContent).toMatch(/trouble parsing/i));
  });

  it("survives a network rejection instead of leaving the button spinning", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    render(<FdeConsole />);
    submit("a support team drowning in tickets");

    await waitFor(() => expect(screen.getByRole("alert")).toBeDefined());
    expect(screen.getByRole("button", { name: /run sim/i })).toBeDefined();
  });

  it("offers a prepared example as the last fallback tier", async () => {
    mockFetch(503);
    render(<FdeConsole />);
    submit("our field engineers diagnose industrial pumps on site");

    const fallback = await screen.findByRole("button", { name: /closest prepared example/i });
    fireEvent.click(fallback);

    // It must not masquerade as an answer to their brief: the run is labelled
    // DEMO, and the brief shown is the preset's, not the visitor's.
    await waitFor(() => expect(document.body.textContent).toMatch(/DEMO/));
    expect(document.body.textContent).toMatch(/field technicians/i);
  });

  it("does not call the API for an empty brief", () => {
    const f = mockFetch(200);
    render(<FdeConsole />);
    fireEvent.click(screen.getByRole("button", { name: /run sim/i }));
    expect(f).not.toHaveBeenCalled();
  });
});

// ── Streaming ────────────────────────────────────────────────────────────────
// /api/fde-sim?stream=1 answers with server-sent events so the first section
// can be read at about 13s instead of the whole answer at about 21s. These
// cover what the console has to get right for that to be worth anything.

/** A fetch whose body yields the given SSE text in the given chunks. */
function mockStream(chunks: string[], status = 200) {
  const queue = [...chunks];
  const reader = {
    read: async () =>
      queue.length ? { done: false, value: queue.shift()! } : { done: true, value: undefined },
  };
  const f = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    body: { pipeThrough: () => ({ getReader: () => reader }) },
    json: async () => ({}),
  });
  vi.stubGlobal("fetch", f);
  return f;
}

const frame = (type: string, data: unknown) => `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;

const SCOPE = [{ q: "Which tickets count as resolved?", why: "Defines the target." }];
const DECOMP = [{ id: "D1", title: "Ticket ingest", why: "One queue first." }];

describe("FdeConsole streaming", () => {
  it("asks for the streaming endpoint", async () => {
    const f = mockStream([frame("section", { key: "scope", value: SCOPE }), frame("done", {})]);
    render(<FdeConsole />);
    submit("a support team drowning in tickets");
    await waitFor(() => expect(f).toHaveBeenCalled());
    expect(f.mock.calls[0][0]).toContain("stream=1");
  });

  // The whole point: content on screen at the first section, not the last.
  it("shows the simulation on the first section rather than waiting for done", async () => {
    mockStream([frame("section", { key: "scope", value: SCOPE })]);
    render(<FdeConsole />);
    submit("a support team drowning in tickets");

    await waitFor(() => expect(screen.getByText(SCOPE[0].q)).toBeDefined());
    // No "done" was ever sent, so this is genuinely mid-stream.
    expect(screen.getByRole("button", { name: /run sim/i })).toBeDefined();
  });

  it("leaves a section's tab shut until that section arrives", async () => {
    mockStream([frame("section", { key: "scope", value: SCOPE })]);
    render(<FdeConsole />);
    submit("a support team drowning in tickets");

    await waitFor(() => expect(screen.getByText(SCOPE[0].q)).toBeDefined());
    const risks = screen.getByRole("tab", { name: /risks/i });
    expect(risks).toHaveProperty("disabled", true);
  });

  it("opens a tab once its section lands", async () => {
    mockStream([
      frame("section", { key: "scope", value: SCOPE }),
      frame("section", { key: "decomposition", value: DECOMP }),
      frame("done", {}),
    ]);
    render(<FdeConsole />);
    submit("a support team drowning in tickets");

    await waitFor(() =>
      expect(screen.getByRole("tab", { name: /decompose/i })).toHaveProperty("disabled", false),
    );
  });

  // Frames do not arrive aligned to chunk boundaries.
  it("reassembles frames split across chunks", async () => {
    const wire = frame("section", { key: "scope", value: SCOPE }) + frame("done", {});
    mockStream(wire.match(/[\s\S]{1,7}/g)!);
    render(<FdeConsole />);
    submit("a support team drowning in tickets");
    await waitFor(() => expect(screen.getByText(SCOPE[0].q)).toBeDefined());
  });

  it("reports an error event without leaving a half-built panel behind", async () => {
    mockStream([frame("error", { error: "parse" })]);
    render(<FdeConsole />);
    submit("a support team drowning in tickets");

    await waitFor(() => expect(screen.getByRole("alert").textContent).toMatch(/trouble parsing/i));
    expect(screen.queryByRole("tablist")).toBeNull();
  });

  it("still names a missing runtime when the stream says so", async () => {
    mockStream([frame("error", { error: "no-runtime" })]);
    render(<FdeConsole />);
    submit("a support team drowning in tickets");

    await waitFor(() => expect(screen.getByRole("alert").textContent).toMatch(/needs a runtime/i));
  });
});
