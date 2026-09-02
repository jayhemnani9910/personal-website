import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { GlBackdrop } from "./GlBackdrop";
import { MethodCube } from "./MethodCube";

const mockReduced = vi.fn();
vi.mock("@/hooks/usePrefersReducedMotion", () => ({
  usePrefersReducedMotion: () => mockReduced(),
}));

afterEach(() => {
  mockReduced.mockReset();
  vi.useRealTimers();
});

describe("GlBackdrop", () => {
  it("renders nothing under reduced motion", () => {
    mockReduced.mockReturnValue(true);
    const { container } = render(<GlBackdrop />);
    expect(container.querySelector("canvas")).toBeNull();
  });

  it("renders a hidden canvas and does not throw when jsdom has no webgl context", () => {
    mockReduced.mockReturnValue(false);
    expect(() => render(<GlBackdrop />)).not.toThrow();
    const canvas = document.querySelector("canvas");
    expect(canvas).not.toBeNull();
    expect(canvas?.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("MethodCube", () => {
  it("renders the label and the personal-best time", () => {
    mockReduced.mockReturnValue(false);
    render(<MethodCube />);
    expect(screen.getByText("OFF THE CLOCK · WCA")).toBeDefined();
    expect(screen.getByText("16.7")).toBeDefined();
  });

  it("renders exactly one scramble button", () => {
    mockReduced.mockReturnValue(false);
    render(<MethodCube />);
    const buttons = screen.getAllByRole("button", { name: "Scramble the cube" });
    expect(buttons).toHaveLength(1);
  });

  it("scrambles on click, then reports the elapsed time and links to the timer app", () => {
    mockReduced.mockReturnValue(false);
    vi.useFakeTimers();
    render(<MethodCube />);

    fireEvent.click(screen.getByRole("button", { name: "Scramble the cube" }));
    expect(screen.getByText(/scrambling/i)).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    const note = screen.getByText(/^Solved\./);
    expect(note).toBeDefined();

    const link = screen.getByRole("link", { name: /the timer app/i });
    expect(link.getAttribute("href")).toBe("/projects/rubiks-timer");
    expect(link.closest("button")).toBeNull();
  });
});
