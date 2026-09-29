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
import { FEATURED, buildReceipts } from "@/data/home";
import { WEBMCP_TOOL_COUNT } from "@/lib/webmcp-tools";
import { useShellIntent } from "@/lib/shell-intent";

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
    expect(dialog.textContent).toContain(`${PROJECT_COUNT - FEATURED.length} more at /projects`);
  });

  it("receipts prints every receipt's figure and label, not its title", () => {
    renderOpen();
    type("receipts");

    // Each receipt is its own row now, not one combined block, so assert
    // against the dialog's full text rather than a single text node. The
    // command is named after the number, so this checks for the padded
    // figure ("27", "94%", ...) next to its label, not the receipt's title.
    const dialog = screen.getByRole("dialog");
    const receipts = buildReceipts({ projectCount: PROJECT_COUNT, toolCount: WEBMCP_TOOL_COUNT });
    for (const r of receipts) {
      expect(dialog.textContent).toContain(`${r.n.padEnd(5)} ${r.label}`);
    }
  });

  it("rm refuses", () => {
    renderOpen();
    type("rm -rf .");
    expect(screen.getByText(/not a chance/i)).toBeDefined();
  });

  it("help lists the home page commands", () => {
    renderOpen();
    type("help");
    // The chip row always shows brief, receipts and cube, so check the log,
    // and for lines only help prints.
    const log = screen.getByRole("log");
    expect(log.textContent).toContain("things that work here:");
    expect(log.textContent).toContain("run the decomposer on your problem");
    expect(log.textContent).toContain("every number on this page, with source");
    expect(log.textContent).toContain("cube · joke");
  });

  it("renders a chip row whose entries are runnable commands", () => {
    renderOpen();
    const chip = screen.getByRole("button", { name: "receipts" });
    fireEvent.click(chip);
    const dialog = screen.getByRole("dialog");
    const receipts = buildReceipts({ projectCount: PROJECT_COUNT, toolCount: WEBMCP_TOOL_COUNT });
    expect(dialog.textContent).toContain(receipts[0].label);
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
    expect(screen.getByText(/you, however, remain a mystery/)).toBeDefined();
    expect(screen.queryByText(/command not found/)).toBeNull();
    expect(screen.getByLabelText("Terminal command input")).toBeDefined();
  });

  it("echoes an empty prompt on a bare Enter instead of wiping the log", () => {
    renderOpen();
    type("");
    expect(screen.getByText(/this is a real shell/)).toBeDefined();
    expect(screen.getByRole("log").children).toHaveLength(3);
  });

  it("puts command output in a log region, apart from the input", () => {
    renderOpen();
    type("whoami");
    const log = screen.getByRole("log");
    expect(log.textContent).toContain("Jay Hemnani");
    expect(log.contains(screen.getByLabelText("Terminal command input"))).toBe(false);
  });
});

// From any page but /, the home page's listeners do not exist yet when the
// command runs, so an event fired then is lost. The intent is carried across
// the navigation instead, and the home page takes it on mount.
describe("TerminalOverlay brief and cube off the home page", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/projects");
    window.sessionStorage.clear();
  });

  afterEach(() => {
    window.history.pushState({}, "", "/");
  });

  function Home() {
    useShellIntent("brief");
    useShellIntent("cube");
    return null;
  }

  it("brief navigates to /#brief and the home page replays it on mount", () => {
    renderOpen();
    const seen: string[] = [];
    const onBrief = (e: Event) => seen.push((e as CustomEvent<string>).detail);
    window.addEventListener("v4:brief", onBrief);

    type("brief we have data nobody trusts");
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(mockPush).toHaveBeenCalledWith("/#brief");
    expect(seen).toEqual([]);

    render(<Home />);
    expect(seen).toEqual(["we have data nobody trusts"]);

    // Taken once: a later visit to / does not run it again.
    render(<Home />);
    expect(seen).toHaveLength(1);
    window.removeEventListener("v4:brief", onBrief);
  });

  it("cube navigates to /#method and the home page replays it on mount", () => {
    renderOpen();
    let fired = 0;
    const onCube = () => {
      fired += 1;
    };
    window.addEventListener("v4:cube", onCube);

    type("cube");
    expect(mockPush).toHaveBeenCalledWith("/#method");
    expect(fired).toBe(0);

    render(<Home />);
    expect(fired).toBe(1);
    window.removeEventListener("v4:cube", onCube);
  });
});

// jsdom has no layout, so offsetParent is always null and the focus trap's list
// of focusable elements was always empty: the trap never ran in tests. Stubbing
// offsetParent lets it run.
describe("TerminalOverlay Tab handling", () => {
  const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetParent");

  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, "offsetParent", {
      configurable: true,
      get() {
        return this.parentNode;
      },
    });
  });

  afterEach(() => {
    if (original) Object.defineProperty(HTMLElement.prototype, "offsetParent", original);
  });

  it("completes a command on Tab and keeps focus in the input", () => {
    renderOpen();
    const input = screen.getByLabelText("Terminal command input") as HTMLInputElement;
    input.focus();
    fireEvent.change(input, { target: { value: "he" } });
    fireEvent.keyDown(input, { key: "Tab" });

    expect(input.value).toBe("help");
    expect(document.activeElement).toBe(input);
  });

  it("leaves Tab alone when there is nothing to complete", () => {
    renderOpen();
    const input = screen.getByLabelText("Terminal command input");
    input.focus();
    fireEvent.change(input, { target: { value: "help" } });

    const tab = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    act(() => {
      input.dispatchEvent(tab);
    });
    // The input is the dialog's last focusable element, so the trap wraps
    // focus to the first one, as it should for an ordinary Tab.
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Close shell" }));
  });

  it("does not swallow Shift+Tab in the input", () => {
    renderOpen();
    const input = screen.getByLabelText("Terminal command input");
    input.focus();
    fireEvent.change(input, { target: { value: "he" } });

    const shiftTab = new KeyboardEvent("keydown", { key: "Tab", shiftKey: true, bubbles: true, cancelable: true });
    act(() => {
      input.dispatchEvent(shiftTab);
    });
    expect(shiftTab.defaultPrevented).toBe(false);
    expect((input as HTMLInputElement).value).toBe("he");
  });
});
