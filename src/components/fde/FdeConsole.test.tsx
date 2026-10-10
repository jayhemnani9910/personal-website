import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { FdeConsole } from "./FdeConsole";

// jsdom implements no layout, so it has no scrollIntoView. The console scrolls
// the panel into view 80ms after a run opens it.
Element.prototype.scrollIntoView = () => {};

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

    await waitFor(() => expect(screen.getByRole("alert").textContent).toMatch(/lost the connection/i));
    expect(screen.getByRole("alert").textContent).not.toMatch(/trouble parsing/i);
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

/**
 * A fetch whose body yields the given SSE text in the given chunks. With
 * `hang`, the body then stays open, as a run still generating does.
 */
function mockStream(chunks: string[], status = 200, { hang = false } = {}) {
  const queue = [...chunks];
  const reader = {
    read: () =>
      queue.length
        ? Promise.resolve({ done: false, value: queue.shift()! })
        : hang
          ? new Promise<never>(() => {})
          : Promise.resolve({ done: true, value: undefined }),
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
    mockStream([frame("section", { key: "scope", value: SCOPE })], 200, { hang: true });
    render(<FdeConsole />);
    submit("a support team drowning in tickets");

    await waitFor(() => expect(screen.getByText(SCOPE[0].q)).toBeDefined());
    // No "done" was ever sent and the body is still open, so this is
    // genuinely mid-stream.
    expect(screen.getByRole("button", { name: /run sim/i })).toBeDefined();
    expect(screen.getByRole("tab", { name: /risks/i }).getAttribute("title")).toBe("still generating");
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
  // The tab and the nav button are two ways to reach the same panel, so they
  // have to agree about whether it is reachable.
  it("keeps the continue button in step with the tabs", async () => {
    mockStream([frame("section", { key: "scope", value: SCOPE })]);
    render(<FdeConsole />);
    submit("a support team drowning in tickets");

    await waitFor(() => expect(screen.getByText(SCOPE[0].q)).toBeDefined());
    expect(screen.getByRole("button", { name: /continue/i })).toHaveProperty("disabled", true);
  });

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

// ── Error codes ──────────────────────────────────────────────────────────────
// Each code the route sends means something different to do next, so each gets
// its own message rather than all of them blaming the brief.

describe("FdeConsole error messages", () => {
  it("tells a visitor an upstream failure is not their brief's fault", async () => {
    mockStream([frame("error", { error: "upstream" })]);
    render(<FdeConsole />);
    submit("a support team drowning in tickets");

    await waitFor(() => expect(screen.getByRole("alert").textContent).toMatch(/try again in a minute/i));
    expect(screen.getByRole("alert").textContent).not.toMatch(/more specific brief/i);
  });

  it("names the length limit on a bad-input answer", async () => {
    mockFetch(400, { error: "bad-input" });
    render(<FdeConsole />);
    submit("a support team drowning in tickets");

    await waitFor(() => expect(screen.getByRole("alert").textContent).toMatch(/2,000 characters/));
  });

  it("caps the brief at the length the route accepts", () => {
    render(<FdeConsole />);
    expect(screen.getByLabelText(/enter your problem brief/i).getAttribute("maxlength")).toBe("2000");
  });

  it("shows the run state in the console header", async () => {
    mockStream([frame("error", { error: "parse" })]);
    render(<FdeConsole />);
    expect(document.body.textContent).toMatch(/● READY/);
    submit("a support team drowning in tickets");

    await waitFor(() => expect(document.body.textContent).toMatch(/● ERROR/));
  });

  it("does not pick a prepared example on filler words", async () => {
    mockFetch(503, { error: "no-runtime" });
    render(<FdeConsole />);
    // Every word the sales preset shares with this brief is filler.
    submit("We run a chain of clinics and doctors spend their evenings on notes. We want that time back.");

    fireEvent.click(await screen.findByRole("button", { name: /closest prepared example/i }));
    await waitFor(() => expect(document.body.textContent).toMatch(/DEMO/));
    expect(document.body.textContent).not.toMatch(/sales engineers/i);
  });
});

// ── Runs kept apart ──────────────────────────────────────────────────────────

describe("FdeConsole runs", () => {
  /** A stream the test feeds by hand, so it can act between sections. */
  function controlledStream() {
    const chunks: string[] = [];
    let wake: (() => void) | null = null;
    let ended = false;
    const reader = {
      read: async () => {
        while (!chunks.length && !ended) await new Promise<void>((r) => (wake = r));
        return chunks.length ? { done: false, value: chunks.shift()! } : { done: true, value: undefined };
      },
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        body: { pipeThrough: () => ({ getReader: () => reader }) },
        json: async () => ({}),
      }),
    );
    return {
      push: (chunk: string) => {
        chunks.push(chunk);
        wake?.();
      },
      end: () => {
        ended = true;
        wake?.();
      },
    };
  }

  const clickPreset = (chip: RegExp) => fireEvent.click(screen.getByRole("button", { name: chip }));

  it("starts a live run after a preset from nothing", async () => {
    mockStream([frame("section", { key: "scope", value: SCOPE })], 200, { hang: true });
    render(<FdeConsole />);
    clickPreset(/customer support deluge/i);
    await waitFor(() => expect(document.body.textContent).toMatch(/DEMO/));

    submit("a support team drowning in tickets");
    await waitFor(() => expect(screen.getByText(SCOPE[0].q)).toBeDefined());

    // Nothing of the preset may fill the tabs this run has not sent yet.
    expect(document.body.textContent).toMatch(/\* LIVE/);
    expect(screen.getByRole("tab", { name: /decompose/i })).toHaveProperty("disabled", true);
    expect(screen.getByRole("tab", { name: /risks/i })).toHaveProperty("disabled", true);
    expect(document.body.textContent).not.toMatch(/Of those ~2,000 tickets/);
  });

  it("stops generating when a run fails after some sections", async () => {
    mockStream([frame("section", { key: "scope", value: SCOPE }), frame("error", { error: "parse" })]);
    render(<FdeConsole />);
    submit("a support team drowning in tickets");

    await waitFor(() => expect(screen.getByRole("alert").textContent).toMatch(/trouble parsing/i));
    // What arrived stays readable; what did not says so, rather than spinning.
    expect(screen.getByText(SCOPE[0].q)).toBeDefined();
    expect(screen.getByRole("tab", { name: /risks/i }).getAttribute("title")).toBe("not generated");
    expect(document.body.textContent).not.toMatch(/STREAMING/);
  });

  it("treats a stream that ends without done as a failed run", async () => {
    mockStream([frame("section", { key: "scope", value: SCOPE })]);
    render(<FdeConsole />);
    submit("a support team drowning in tickets");

    await waitFor(() => expect(screen.getByRole("alert").textContent).toMatch(/lost the connection/i));
    expect(screen.getByRole("tab", { name: /risks/i }).getAttribute("title")).toBe("not generated");
  });

  it("keeps a preset open when a later run fails before any section", async () => {
    mockStream([frame("error", { error: "upstream" })]);
    render(<FdeConsole />);
    clickPreset(/contract review/i);
    await waitFor(() => expect(document.body.textContent).toMatch(/DEMO/));

    submit("a support team drowning in tickets");
    await waitFor(() => expect(screen.getByRole("alert")).toBeDefined());
    expect(screen.getByRole("tablist")).toBeDefined();
    expect(document.body.textContent).toMatch(/DEMO/);
  });

  it("drops a live run's later sections once a preset is picked", async () => {
    const stream = controlledStream();
    render(<FdeConsole />);
    submit("a support team drowning in tickets");
    stream.push(frame("section", { key: "scope", value: SCOPE }));
    await waitFor(() => expect(screen.getByText(SCOPE[0].q)).toBeDefined());

    clickPreset(/field diagnostics/i);
    await waitFor(() => expect(document.body.textContent).toMatch(/DEMO/));
    await act(async () => {
      stream.push(frame("section", { key: "decomposition", value: DECOMP }));
      stream.end();
    });

    expect(document.body.textContent).not.toMatch(/\* LIVE/);
    expect(screen.queryByRole("alert")).toBeNull();
    expect(document.body.textContent).toMatch(/field technicians/i);
  });

  it("does not reopen the panel after exit", async () => {
    const stream = controlledStream();
    render(<FdeConsole />);
    submit("a support team drowning in tickets");
    stream.push(frame("section", { key: "scope", value: SCOPE }));
    await waitFor(() => expect(screen.getByText(SCOPE[0].q)).toBeDefined());

    fireEvent.click(screen.getByRole("button", { name: /exit sim/i }));
    await act(async () => {
      stream.push(frame("section", { key: "decomposition", value: DECOMP }));
      stream.end();
    });

    expect(screen.queryByRole("tablist")).toBeNull();
    expect(document.activeElement).toBe(screen.getByLabelText(/enter your problem brief/i));
  });

  it("opens every new run on the first tab", async () => {
    render(<FdeConsole />);
    clickPreset(/customer support deluge/i);
    fireEvent.click(await screen.findByRole("tab", { name: /receipts/i }));
    expect(screen.getByRole("tab", { name: /receipts/i }).getAttribute("aria-selected")).toBe("true");

    clickPreset(/sales co-pilot/i);
    await waitFor(() =>
      expect(screen.getByRole("tab", { name: /scope/i }).getAttribute("aria-selected")).toBe("true"),
    );
  });

  it("moves between tabs with the arrow keys", async () => {
    render(<FdeConsole />);
    clickPreset(/customer support deluge/i);
    const tablist = await screen.findByRole("tablist");

    fireEvent.keyDown(tablist, { key: "ArrowRight" });
    const decompose = screen.getByRole("tab", { name: /decompose/i });
    expect(decompose.getAttribute("aria-selected")).toBe("true");
    expect(document.activeElement).toBe(decompose);
    // One tab stop for the whole list.
    expect(screen.getAllByRole("tab").filter((t) => t.tabIndex === 0)).toHaveLength(1);

    fireEvent.keyDown(tablist, { key: "End" });
    expect(screen.getByRole("tab", { name: /receipts/i }).getAttribute("aria-selected")).toBe("true");
  });
});

// A button that disables itself under keyboard focus drops focus to <body>.
// These are the places that used to, each fixed once already.
describe("FdeConsole keeps keyboard focus", () => {
  it("keeps focus on run sim while the run is pending", async () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    render(<FdeConsole />);
    fireEvent.change(screen.getByLabelText(/enter your problem brief/i), { target: { value: "a support team drowning in tickets" } });
    const run = screen.getByRole("button", { name: /run sim/i });
    run.focus();
    fireEvent.click(run);
    await waitFor(() => expect(run.getAttribute("aria-disabled")).toBe("true"));
    expect(document.activeElement).toBe(run);
  });

  it("hands focus to the tab when continue or previous runs out at either end", async () => {
    render(<FdeConsole />);
    fireEvent.click(screen.getByRole("button", { name: /customer support deluge/i }));
    const tabs = await screen.findAllByRole("tab");
    for (let i = 0; i < tabs.length - 1; i++) {
      const next = screen.getByRole("button", { name: /continue|see the receipts/i });
      next.focus();
      await act(async () => {
        fireEvent.click(next);
        await new Promise((r) => requestAnimationFrame(() => r(null)));
      });
    }
    expect(document.activeElement).toBe(screen.getAllByRole("tab").at(-1));

    for (let i = 0; i < tabs.length - 1; i++) {
      const prev = screen.getByRole("button", { name: /previous/i });
      prev.focus();
      await act(async () => {
        fireEvent.click(prev);
        await new Promise((r) => requestAnimationFrame(() => r(null)));
      });
    }
    expect(document.activeElement).toBe(screen.getAllByRole("tab")[0]);
  });
});
