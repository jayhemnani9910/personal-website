import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";

// jsdom implements no layout, so it has no scrollIntoView. The overlay scrolls
// its log to the bottom after every command.
Element.prototype.scrollIntoView = () => {};

// The overlay reads the terminal context for its open state. It is mocked so
// the component can be driven directly.
const mockCloseTerminal = vi.fn();

vi.mock("@/context/TerminalContext", () => ({
  useTerminal: () => ({ isOpen: true, toggleTerminal: vi.fn(), closeTerminal: mockCloseTerminal }),
}));


import { TerminalOverlay } from "./TerminalOverlay";
import { FEATURED, buildReceipts } from "@/data/home";
import { WEBMCP_TOOL_COUNT } from "@/lib/webmcp-tools";

// A fixture count. The overlay is a client component and cannot read
// content/projects/*.mdx itself, so the count arrives as a prop from the
// server, the same way it does in layout.tsx; any number exercises that.
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

  it("offers the eggs chip, and no theme chip now there is one theme", () => {
    renderOpen();
    expect(screen.getByRole("button", { name: "eggs" })).toBeDefined();
    expect(screen.queryByRole("button", { name: "theme" })).toBeNull();
  });
});

describe("TerminalOverlay commands", () => {
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
    // And each one names where it can be checked, as help promises.
    expect(dialog.textContent?.match(/source: /g)).toHaveLength(receipts.length);
    expect(dialog.textContent).toContain("source: ieeexplore.ieee.org");
  });

  it("eggs lists the home page's secrets, naming only the ones found", () => {
    localStorage.setItem("jh_eggs", JSON.stringify(["cube"]));
    renderOpen();
    type("eggs");
    const log = screen.getByRole("log");
    expect(log.textContent).toContain("1/5 secrets found");
    expect(log.textContent).toContain("Scrambler");
    expect(log.textContent).not.toContain("Yeet");
    localStorage.clear();
  });

  it("open prints the numbered project in three lines, and refuses numbers out of range", () => {
    renderOpen();
    type("open 2");
    const log = screen.getByRole("log");
    expect(log.textContent).toContain(FEATURED[1].title);
    expect(log.textContent).toContain(`arrived as: ${FEATURED[1].arrived}`);
    type("open 7");
    type("open fifa");
    expect(log.textContent?.match(/six, not seven/g)).toHaveLength(2);
  });

  it("contact prints the email and the profile links without the scheme", () => {
    renderOpen();
    type("contact");
    const log = screen.getByRole("log");
    expect(log.textContent).toContain("jayhemnani992000@gmail.com");
    expect(log.textContent).toContain("github.com/jayhemnani9910");
    expect(log.textContent).not.toContain("https://");
  });

  it("joke and sudo answer, and an unknown command names itself", () => {
    renderOpen();
    type("joke");
    type("sudo make me a sandwich");
    type("Frobnicate");
    const log = screen.getByRole("log");
    expect(log.textContent).toContain("casts itself to string");
    expect(log.textContent).toContain("trust and tomato");
    expect(log.textContent).toContain("command not found: frobnicate");
  });

  it("rm refuses", () => {
    renderOpen();
    type("rm -rf .");
    expect(screen.getByText(/not a chance/i)).toBeDefined();
  });

  it("help lists the commands", () => {
    renderOpen();
    type("help");
    // The chip row also shows receipts, so check the log, and for lines only
    // help prints.
    const log = screen.getByRole("log");
    expect(log.textContent).toContain("things that work here:");
    expect(log.textContent).toContain("the headline numbers, with their sources");
    expect(log.textContent).toContain("contact · joke");
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
