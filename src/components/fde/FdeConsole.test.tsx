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
    mockFetch(503);
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
