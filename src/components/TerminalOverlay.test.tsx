import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";

// jsdom implements no layout, so it has no scrollIntoView. The overlay scrolls
// its log to the bottom after every command.
Element.prototype.scrollIntoView = () => {};

// The overlay reads the terminal context for its open state and next/navigation
// for the two commands that leave the page. Both are mocked so the component can
// be driven directly.
const mockCloseTerminal = vi.fn();
const mockPush = vi.fn();

vi.mock("@/context/TerminalContext", () => ({
  useTerminal: () => ({ isOpen: true, toggleTerminal: vi.fn(), closeTerminal: mockCloseTerminal }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));


import { TerminalOverlay } from "./TerminalOverlay";
import { RECEIPT_INDEX } from "@/data/home";

// The overlay types a boot sequence on a timer when it opens, and neither the
// input nor the chips exist until that finishes. Every test drives it on fake
// timers rather than waiting.
function boot() {
  render(<TerminalOverlay />);
  act(() => {
    vi.advanceTimersByTime(5000);
  });
}

function type(cmd: string) {
  const input = screen.getByLabelText("Terminal command input");
  fireEvent.change(input, { target: { value: cmd } });
  fireEvent.keyDown(input, { key: "Enter" });
}

beforeEach(() => {
  vi.useFakeTimers();
  mockCloseTerminal.mockClear();
  mockPush.mockClear();
  window.location.hash = "";
});

afterEach(() => {
  vi.useRealTimers();
});

describe("TerminalOverlay v4 commands", () => {
  it("brief dispatches v4:brief with the typed text and closes the overlay", () => {
    boot();
    const seen: string[] = [];
    const onBrief = (e: Event) => seen.push((e as CustomEvent<string>).detail);
    window.addEventListener("v4:brief", onBrief);

    type("brief we have data nobody trusts");
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(seen).toEqual(["we have data nobody trusts"]);
    expect(mockCloseTerminal).toHaveBeenCalled();
    window.removeEventListener("v4:brief", onBrief);
  });

  it("brief strips surrounding quotes", () => {
    boot();
    const seen: string[] = [];
    const onBrief = (e: Event) => seen.push((e as CustomEvent<string>).detail);
    window.addEventListener("v4:brief", onBrief);

    type('brief "our model is stuck in a notebook"');
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(seen).toEqual(["our model is stuck in a notebook"]);
    window.removeEventListener("v4:brief", onBrief);
  });

  it("brief with no argument asks for one instead of dispatching", () => {
    boot();
    const seen: string[] = [];
    const onBrief = () => seen.push("fired");
    window.addEventListener("v4:brief", onBrief);

    type("brief");
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(seen).toEqual([]);
    expect(screen.getByText(/vaguer the better/i)).toBeDefined();
    window.removeEventListener("v4:brief", onBrief);
  });

  it("cube dispatches v4:cube", () => {
    boot();
    let fired = 0;
    const onCube = () => {
      fired += 1;
    };
    window.addEventListener("v4:cube", onCube);

    type("cube");
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(fired).toBe(1);
    expect(mockCloseTerminal).toHaveBeenCalled();
    window.removeEventListener("v4:cube", onCube);
  });

  it("receipts prints every receipt from the shared index", () => {
    boot();
    type("receipts");

    // One block of output, so assert on its text content rather than per-line.
    const printed = screen.getByText(/Every number on the home page/);
    for (const r of RECEIPT_INDEX) {
      expect(printed.textContent).toContain(r.title);
      expect(printed.textContent).toContain(r.label);
    }
  });

  it("rm refuses", () => {
    boot();
    type("rm -rf .");
    expect(screen.getByText(/Absolutely not/i)).toBeDefined();
  });

  it("help lists the home page commands", () => {
    boot();
    type("help");
    const printed = screen.getByText(/Available commands/);
    expect(printed.textContent).toContain("brief");
    expect(printed.textContent).toContain("receipts");
    expect(printed.textContent).toContain("cube");
  });

  it("renders a chip row whose entries are runnable commands", () => {
    boot();
    const chip = screen.getByRole("button", { name: "receipts" });
    fireEvent.click(chip);
    expect(screen.getByText(/Every number on the home page/)).toBeDefined();
  });

  // Regression. Enter ran the command, the command closed the overlay, closing
  // restored focus to the header's shell button, and Enter's own default action
  // then activated that newly focused button on keyup and reopened the dialog.
  // `exit` had always behaved this way; `cube` and `brief` inherited it.
  it("cancels Enter's default action so a closing command cannot reopen the dialog", () => {
    boot();
    const input = screen.getByLabelText("Terminal command input");
    fireEvent.change(input, { target: { value: "exit" } });

    const event = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
    act(() => {
      input.dispatchEvent(event);
    });

    expect(event.defaultPrevented).toBe(true);
    expect(mockCloseTerminal).toHaveBeenCalled();
  });

  it("still answers a pre-existing command", () => {
    boot();
    type("whoami");
    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Terminal command input")).toBeDefined();
  });
});
