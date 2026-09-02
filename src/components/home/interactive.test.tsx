import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { PRESETS, FEATURED, COPY } from "@/data/home";
import type { Receipt } from "@/data/home";
import { closestPreset } from "@/lib/decompose";

// jsdom implements neither scrollIntoView (used by the v4:brief event
// listener) nor IntersectionObserver. Stubbed here rather than in the shared
// vitest.setup.ts, same reasoning as chrome.test.tsx / visuals.test.tsx.
Element.prototype.scrollIntoView = vi.fn();

const mockReduced = vi.fn();
vi.mock("@/hooks/usePrefersReducedMotion", () => ({
  usePrefersReducedMotion: () => mockReduced(),
}));

import { Decomposer } from "./Decomposer";
import { Receipts } from "./Receipts";

const mockFetch = vi.fn();

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

  it("falls back to offline when fetch resolves 429", async () => {
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

    expect(await screen.findByText(/closest preset \(offline\)/i)).toBeDefined();
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
