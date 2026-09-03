import { describe, expect, it } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { TerminalProvider, useTerminal } from "./TerminalContext";

// The header badge (HomeHeader.tsx) advertises "shell `", so backtick has to
// actually open the overlay. It used to bind nothing at all: only Ctrl/Cmd+K
// worked, which is advertised nowhere. Guarded against text fields so typing
// a literal backtick, including into the shell's own command input, never
// yanks focus by toggling the overlay mid-keystroke.

function Probe() {
  const { isOpen } = useTerminal();
  return <span data-testid="open">{isOpen ? "open" : "closed"}</span>;
}

function renderProbe() {
  render(
    <TerminalProvider>
      <Probe />
      <input data-testid="page-input" />
      <textarea data-testid="page-textarea" />
    </TerminalProvider>,
  );
}

// Dispatches a real, cancelable KeyboardEvent on the given target (bubbles to
// the document, where the provider's listener lives) and returns whether the
// handler called preventDefault on it. A guarded key press that leaves
// defaultPrevented false is exactly what lets the browser's own default
// action (inserting the character) happen normally, the same technique the
// Enter regression test in TerminalOverlay.test.tsx already uses.
function dispatchKey(target: EventTarget, init: KeyboardEventInit) {
  const event = new KeyboardEvent("keydown", { bubbles: true, cancelable: true, ...init });
  act(() => {
    target.dispatchEvent(event);
  });
  return event;
}

describe("TerminalProvider keyboard shortcuts", () => {
  it("backtick opens the overlay", () => {
    renderProbe();
    expect(screen.getByTestId("open").textContent).toBe("closed");

    dispatchKey(document, { key: "`" });

    expect(screen.getByTestId("open").textContent).toBe("open");
  });

  it("backtick while typing in an input does not open it, and types normally", () => {
    renderProbe();
    const input = screen.getByTestId("page-input");

    const event = dispatchKey(input, { key: "`" });

    expect(screen.getByTestId("open").textContent).toBe("closed");
    expect(event.defaultPrevented).toBe(false);
  });

  it("backtick while typing in a textarea does not open it, and types normally", () => {
    renderProbe();
    const textarea = screen.getByTestId("page-textarea");

    const event = dispatchKey(textarea, { key: "`" });

    expect(screen.getByTestId("open").textContent).toBe("closed");
    expect(event.defaultPrevented).toBe(false);
  });

  it("Ctrl+K still opens it", () => {
    renderProbe();

    dispatchKey(document, { key: "k", ctrlKey: true });

    expect(screen.getByTestId("open").textContent).toBe("open");
  });

  it("Cmd+K still opens it", () => {
    renderProbe();

    dispatchKey(document, { key: "k", metaKey: true });

    expect(screen.getByTestId("open").textContent).toBe("open");
  });
});
