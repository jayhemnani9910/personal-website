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
import { FEATURED, RECEIPT_INDEX } from "@/data/home";

// The real project count as of this write-up (see src/data/home.test.ts,
// which hardcodes the same number for the same reason: the overlay is a
// client component and cannot read content/projects/*.mdx itself, so the
// count arrives as a prop from the server, the same way it does in layout.tsx).
const PROJECT_COUNT = 27;

function renderOpen() {
  render(<TerminalOverlay projectCount={PROJECT_COUNT} />);
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

describe("TerminalOverlay chrome", () => {
  it("opens onto jay's shell, not a fake boot sequence", async () => {
    renderOpen();
    expect(screen.getByText("jay's shell")).toBeDefined();
    expect(screen.getByText(/no sudo required/)).toBeDefined();
    expect(screen.queryByText(/JEY-OS/)).toBeNull();
    expect(screen.queryByText(/INITIALIZING/)).toBeNull();
  });

  it("greets with the two lines the design specifies", () => {
    renderOpen();
    expect(screen.getByText(/this is a real shell, minus the part where you can break anything/)).toBeDefined();
    expect(screen.getByText(/try a chip above/)).toBeDefined();
  });

  it("offers the theme chip the design has and we were missing", () => {
    renderOpen();
    expect(screen.getByRole("button", { name: "theme" })).toBeDefined();
  });
});

describe("TerminalOverlay v4 commands", () => {
  it("brief dispatches v4:brief with the typed text and closes the overlay", () => {
    renderOpen();
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
    renderOpen();
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
    renderOpen();
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
    renderOpen();
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

  it("ls lists the featured projects and derives the remaining count", () => {
    renderOpen();
    type("ls");

    const dialog = screen.getByRole("dialog");
    for (const p of FEATURED) {
      expect(dialog.textContent).toContain(p.title);
    }
    expect(dialog.textContent).toContain(`${PROJECT_COUNT - FEATURED.length} more at /work`);
  });

  it("receipts prints every receipt from the shared index", () => {
    renderOpen();
    type("receipts");

    // Each receipt is its own row now, not one combined block, so assert
    // against the dialog's full text rather than a single text node.
    const dialog = screen.getByRole("dialog");
    for (const r of RECEIPT_INDEX) {
      expect(dialog.textContent).toContain(r.title);
      expect(dialog.textContent).toContain(r.label);
    }
  });

  it("rm refuses", () => {
    renderOpen();
    type("rm -rf .");
    expect(screen.getByText(/absolutely not/i)).toBeDefined();
  });

  it("help lists the home page commands", () => {
    renderOpen();
    type("help");
    const dialog = screen.getByRole("dialog");
    expect(dialog.textContent).toContain("brief");
    expect(dialog.textContent).toContain("receipts");
    expect(dialog.textContent).toContain("cube");
  });

  it("renders a chip row whose entries are runnable commands", () => {
    renderOpen();
    const chip = screen.getByRole("button", { name: "receipts" });
    fireEvent.click(chip);
    const dialog = screen.getByRole("dialog");
    expect(dialog.textContent).toContain(RECEIPT_INDEX[0].label);
  });

  // Regression. Enter ran the command, the command closed the overlay, closing
  // restored focus to the header's shell button, and Enter's own default action
  // then activated that newly focused button on keyup and reopened the dialog.
  // `exit` had always behaved this way; `cube` and `brief` inherited it.
  it("cancels Enter's default action so a closing command cannot reopen the dialog", () => {
    renderOpen();
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
    renderOpen();
    type("whoami");
    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Terminal command input")).toBeDefined();
  });
});
