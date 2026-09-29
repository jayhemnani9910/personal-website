import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { PRESETS, FEATURED, COPY } from "@/data/home";
import type { Receipt } from "@/data/home";
import { BRIEF_MAX, closestPreset } from "@/lib/decompose";

// jsdom implements no scrollIntoView, which the v4:brief event listener calls.
// Stubbed here rather than in the shared vitest.setup.ts, same reasoning as
// chrome.test.tsx / visuals.test.tsx.
Element.prototype.scrollIntoView = vi.fn();

const mockReduced = vi.fn();
vi.mock("@/hooks/usePrefersReducedMotion", () => ({
  usePrefersReducedMotion: () => mockReduced(),
  isMotionReduced: () => mockReduced(),
}));

import { Decomposer } from "./Decomposer";
import { Receipts } from "./Receipts";

const mockFetch = vi.fn();

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

afterEach(() => {
  mockReduced.mockReset();
  mockFetch.mockReset();
  vi.useRealTimers();
});

describe("Decomposer", () => {
  it("answers a preset chip locally: all four columns render, matches appear after the reveal, and fetch is never called", async () => {
    mockReduced.mockReturnValue(false);
    global.fetch = mockFetch as unknown as typeof fetch;
    vi.useFakeTimers();

    render(<Decomposer />);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(PRESETS[0].short, "i") }));

    expect(screen.getByText("00 SCOPE")).toBeDefined();
    expect(screen.getByText("01 ARCHITECTURE")).toBeDefined();
    expect(screen.getByText("02 PLAN")).toBeDefined();
    expect(screen.getByText("03 RISKS")).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(12 * 160);
    });

    for (const id of PRESETS[0].out.match) {
      const project = FEATURED.find((p) => p.id === id)!;
      const link = screen.getByRole("link", { name: new RegExp(project.title, "i") });
      expect(link.getAttribute("href")).toBe(`/projects/${id}`);
    }
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("falls back to the closest preset and says so offline when fetch rejects", async () => {
    mockReduced.mockReturnValue(false);
    mockFetch.mockRejectedValueOnce(new Error("network down"));
    global.fetch = mockFetch as unknown as typeof fetch;

    render(<Decomposer />);
    const text = "the metrics in our dashboard confuse everyone and nobody trusts the numbers";
    fireEvent.change(screen.getByLabelText(/your brief/i), { target: { value: text } });
    fireEvent.click(screen.getByRole("button", { name: /run/i }));

    await screen.findByText(COPY.offlineNote);
    const expected = closestPreset(text).out;
    expect(await screen.findByText(expected.scope[0])).toBeDefined();
  });

  it("shows the live-model label when fetch resolves 200", async () => {
    mockReduced.mockReturnValue(false);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ engine: "model", out: PRESETS[2].out }),
    });
    global.fetch = mockFetch as unknown as typeof fetch;

    render(<Decomposer />);
    const text = "our notebook model needs to predict churn for real customers next month";
    fireEvent.change(screen.getByLabelText(/your brief/i), { target: { value: text } });
    fireEvent.click(screen.getByRole("button", { name: /run/i }));

    expect(await screen.findByText(/live model/i)).toBeDefined();
  });

  it("says it is rate limited, not offline, when fetch resolves 429", async () => {
    mockReduced.mockReturnValue(false);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({ error: "rate_limited" }),
    });
    global.fetch = mockFetch as unknown as typeof fetch;

    render(<Decomposer />);
    const text = "a completely unprecedented widget factory coordination problem";
    fireEvent.change(screen.getByLabelText(/your brief/i), { target: { value: text } });
    fireEvent.click(screen.getByRole("button", { name: /run/i }));

    expect(await screen.findByText(/closest preset \(rate limited\)/i)).toBeDefined();
    expect(screen.getByText(COPY.limitedNote)).toBeDefined();
    expect(screen.queryByText(COPY.offlineNote)).toBeNull();
  });

  it("says the brief is too long, not offline, when fetch resolves 400 too_long", async () => {
    mockReduced.mockReturnValue(false);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: "too_long" }),
    });
    global.fetch = mockFetch as unknown as typeof fetch;

    render(<Decomposer />);
    const text = "a completely unprecedented widget factory coordination problem";
    fireEvent.change(screen.getByLabelText(/your brief/i), { target: { value: text } });
    fireEvent.click(screen.getByRole("button", { name: /run/i }));

    expect(await screen.findByText(/closest preset \(brief too long\)/i)).toBeDefined();
    expect(screen.getByText(COPY.tooLongNote(BRIEF_MAX))).toBeDefined();
    expect(screen.queryByText(COPY.offlineNote)).toBeNull();
  });

  it("keeps 'offline' for a 503", async () => {
    mockReduced.mockReturnValue(false);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => ({ error: "unavailable" }),
    });
    global.fetch = mockFetch as unknown as typeof fetch;

    render(<Decomposer />);
    fireEvent.change(screen.getByLabelText(/your brief/i), { target: { value: "some brief nobody has seen" } });
    fireEvent.click(screen.getByRole("button", { name: /run/i }));

    expect(await screen.findByText(COPY.offlineNote)).toBeDefined();
  });

  it("drops a late model answer once a newer run has started", async () => {
    mockReduced.mockReturnValue(true);
    const late = deferred<unknown>();
    mockFetch.mockReturnValueOnce(late.promise);
    global.fetch = mockFetch as unknown as typeof fetch;

    render(<Decomposer />);
    fireEvent.change(screen.getByLabelText(/your brief/i), { target: { value: "some brief nobody has seen" } });
    fireEvent.click(screen.getByRole("button", { name: /run/i }));
    fireEvent.click(screen.getByRole("button", { name: new RegExp(PRESETS[0].short, "i") }));
    expect(screen.getByText("preset")).toBeDefined();

    await act(async () => {
      late.resolve({ ok: true, status: 200, json: async () => ({ engine: "model", out: PRESETS[2].out }) });
    });

    expect(screen.getByText("preset")).toBeDefined();
    expect(screen.queryByText(/live model/i)).toBeNull();
    expect(screen.getByText(PRESETS[0].out.scope[0])).toBeDefined();
    expect(screen.queryByText(PRESETS[2].out.scope[0])).toBeNull();
  });

  it("starts no reveal when the answer arrives after unmount", async () => {
    mockReduced.mockReturnValue(false);
    vi.useFakeTimers();
    const late = deferred<unknown>();
    mockFetch.mockReturnValueOnce(late.promise);
    global.fetch = mockFetch as unknown as typeof fetch;

    const { unmount } = render(<Decomposer />);
    fireEvent.change(screen.getByLabelText(/your brief/i), { target: { value: "some brief nobody has seen" } });
    fireEvent.click(screen.getByRole("button", { name: /run/i }));
    unmount();

    await act(async () => {
      late.resolve({ ok: true, status: 200, json: async () => ({ engine: "model", out: PRESETS[2].out }) });
    });
    expect(vi.getTimerCount()).toBe(0);
  });

  it("sends one model call while a run is in flight, however often Run is pressed", async () => {
    mockReduced.mockReturnValue(false);
    const late = deferred<unknown>();
    mockFetch.mockReturnValueOnce(late.promise);
    global.fetch = mockFetch as unknown as typeof fetch;

    render(<Decomposer />);
    const field = screen.getByLabelText(/your brief/i);
    fireEvent.change(field, { target: { value: "some brief nobody has seen" } });
    const runButton = screen.getByRole("button", { name: /run/i });
    fireEvent.click(runButton);
    expect(runButton.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(runButton);
    fireEvent.keyDown(field, { key: "Enter", metaKey: true });
    expect(mockFetch).toHaveBeenCalledTimes(1);

    await act(async () => {
      late.resolve({ ok: true, status: 200, json: async () => ({ engine: "model", out: PRESETS[2].out }) });
    });
    expect(runButton.getAttribute("aria-disabled")).toBe("false");
  });

  it("stops the previous reveal when a new run starts, so the new answer reveals from the start", async () => {
    mockReduced.mockReturnValue(false);
    vi.useFakeTimers();
    const late = deferred<unknown>();
    mockFetch.mockReturnValueOnce(late.promise);
    global.fetch = mockFetch as unknown as typeof fetch;

    render(<Decomposer />);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(PRESETS[0].short, "i") }));
    act(() => {
      vi.advanceTimersByTime(320);
    });

    fireEvent.change(screen.getByLabelText(/your brief/i), { target: { value: "some brief nobody has seen" } });
    fireEvent.click(screen.getByRole("button", { name: /run/i }));
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    await act(async () => {
      late.resolve({ ok: true, status: 200, json: async () => ({ engine: "model", out: PRESETS[2].out }) });
    });
    // The answer lands with nothing shown yet, then reveals one line a step.
    expect(screen.queryByText(PRESETS[2].out.scope[0])).toBeNull();
    act(() => {
      vi.advanceTimersByTime(160);
    });
    expect(screen.getByText(PRESETS[2].out.scope[0])).toBeDefined();
    expect(screen.queryByText(PRESETS[2].out.risks[2])).toBeNull();
  });

  it("announces the engine status to assistive tech without the decorative dot", () => {
    mockReduced.mockReturnValue(true);
    global.fetch = mockFetch as unknown as typeof fetch;

    render(<Decomposer />);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(PRESETS[0].short, "i") }));
    const status = screen.getByRole("status");
    expect(status.textContent).toContain("preset");
    expect(status.querySelector('[aria-hidden="true"]')?.textContent).toContain("●");
  });

  it("counts characters against the cap, so a cut paste is visible", () => {
    mockReduced.mockReturnValue(false);
    render(<Decomposer />);
    const field = screen.getByLabelText(/your brief/i);
    expect(screen.getByText(`0/${BRIEF_MAX}`)).toBeDefined();
    fireEvent.change(field, { target: { value: "x".repeat(BRIEF_MAX) } });
    expect(screen.getByText(`${BRIEF_MAX}/${BRIEF_MAX}`)).toBeDefined();
    expect(field.getAttribute("aria-describedby")).toBe("brief-count");
  });

  it("reveals the full output immediately under reduced motion, with no timer advancement", () => {
    mockReduced.mockReturnValue(true);
    global.fetch = mockFetch as unknown as typeof fetch;

    render(<Decomposer />);
    fireEvent.click(screen.getByRole("button", { name: new RegExp(PRESETS[0].short, "i") }));

    // No vi.useFakeTimers()/advanceTimersByTime anywhere in this test: if the
    // component still relied on the interval, this would fail.
    expect(screen.getByText(PRESETS[0].out.risks[2])).toBeDefined();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  // The shell's `brief` command reaches the Decomposer only through this event.
  it("takes a v4:brief event: fills the field, scrolls to the section and runs it", () => {
    mockReduced.mockReturnValue(true);
    global.fetch = mockFetch as unknown as typeof fetch;
    const scroll = vi.mocked(Element.prototype.scrollIntoView);
    scroll.mockClear();

    render(
      <section id="brief">
        <Decomposer />
      </section>
    );
    act(() => {
      window.dispatchEvent(new CustomEvent("v4:brief", { detail: PRESETS[1].text }));
    });

    expect((screen.getByLabelText(/your brief/i) as HTMLTextAreaElement).value).toBe(PRESETS[1].text);
    expect(scroll).toHaveBeenCalledTimes(1);
    expect(scroll.mock.contexts[0]).toBe(document.getElementById("brief"));
    expect(screen.getByRole("status").textContent).toContain("preset");
    expect(screen.getByText(PRESETS[1].out.scope[0])).toBeDefined();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("gives the textarea an accessible name", () => {
    mockReduced.mockReturnValue(false);
    render(<Decomposer />);
    expect(screen.getByLabelText(/your brief/i)).toBeDefined();
  });
});

const RECEIPTS_FIXTURE: Receipt[] = [
  {
    n: "27",
    label: "projects in the archive, each with a write-up",
    cta: "open index",
    title: "The archive",
    note: "Sorted by priority, then id.",
    lines: [{ text: "Work index, filterable by domain and stack", meta: "/projects", href: "/projects" }],
  },
  {
    n: "3",
    label: "pull requests merged into ecosystem repositories",
    cta: "show PRs",
    title: "Merged upstream",
    note: "Small changes in large repos.",
    lines: [
      { text: "vllm-project/vllm", meta: "#31513", href: "https://github.com/vllm-project/vllm/pull/31513" },
      {
        text: "modelcontextprotocol/python-sdk",
        meta: "#1826",
        href: "https://github.com/modelcontextprotocol/python-sdk/pull/1826",
      },
      { text: "google/A2UI", meta: "#407", href: "https://github.com/google/A2UI/pull/407" },
    ],
  },
  {
    n: "2",
    label: "peer-reviewed IEEE papers, 2021",
    cta: "show papers",
    title: "IEEE AIMV 2021",
    note: "Both papers.",
    lines: [
      { text: "Diabetes Prediction", meta: "ieeexplore 9670920", href: "https://ieeexplore.ieee.org/document/9670920" },
    ],
  },
];

describe("Receipts", () => {
  it("toggles a tile open and closed, rendering and removing its panel", () => {
    mockReduced.mockReturnValue(false);
    render(<Receipts receipts={RECEIPTS_FIXTURE} />);
    const tiles = screen.getAllByRole("button");

    fireEvent.click(tiles[1]);
    expect(tiles[1].getAttribute("aria-expanded")).toBe("true");
    for (const line of RECEIPTS_FIXTURE[1].lines) {
      expect(screen.getByText(line.text)).toBeDefined();
    }

    fireEvent.click(tiles[1]);
    expect(tiles[1].getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByText(RECEIPTS_FIXTURE[1].lines[0].text)).toBeNull();
  });

  // The tools receipt has three lines pointing at the same project page. Keyed
  // by href alone, React deleted only one of them when another tile opened.
  it("replaces every line when switching tiles, even lines that share an href", () => {
    mockReduced.mockReturnValue(false);
    const shared = "/projects/webmcp-portfolio";
    const receipts: Receipt[] = [
      ...RECEIPTS_FIXTURE,
      {
        n: "6",
        label: "MCP tools",
        cta: "list tools",
        title: "document.modelContext",
        note: "Registered in webmcp.ts.",
        lines: [
          { text: "search_projects · get_project", meta: "read", href: shared },
          { text: "get_contact · list_experiments", meta: "read", href: shared },
          { text: "switch_mode", meta: "write", href: shared },
        ],
      },
    ];
    render(<Receipts receipts={receipts} />);
    const tiles = screen.getAllByRole("button");

    fireEvent.click(tiles[3]);
    fireEvent.click(tiles[0]);
    expect(screen.queryByText("search_projects · get_project")).toBeNull();
    expect(screen.queryByText("get_contact · list_experiments")).toBeNull();
    expect(screen.queryByText("switch_mode")).toBeNull();
    expect(screen.getByText(RECEIPTS_FIXTURE[0].lines[0].text)).toBeDefined();
  });

  it("points each tile at the panel it opens, a labelled region", () => {
    mockReduced.mockReturnValue(false);
    render(<Receipts receipts={RECEIPTS_FIXTURE} />);
    const tiles = screen.getAllByRole("button");
    fireEvent.click(tiles[1]);
    const region = screen.getByRole("region", { name: RECEIPTS_FIXTURE[1].title });
    for (const tile of tiles) expect(tile.getAttribute("aria-controls")).toBe(region.id);
    expect(tiles[1].textContent).not.toMatch(/^[▲▼]/);
  });

  it("keeps only one tile open at a time", () => {
    mockReduced.mockReturnValue(false);
    render(<Receipts receipts={RECEIPTS_FIXTURE} />);
    const tiles = screen.getAllByRole("button");

    fireEvent.click(tiles[0]);
    expect(tiles[0].getAttribute("aria-expanded")).toBe("true");

    fireEvent.click(tiles[2]);
    expect(tiles[0].getAttribute("aria-expanded")).toBe("false");
    expect(tiles[2].getAttribute("aria-expanded")).toBe("true");
  });
});
