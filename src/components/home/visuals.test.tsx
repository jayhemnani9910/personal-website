import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { RESUME } from "@/data/resume";
import { GlBackdrop } from "./GlBackdrop";
import { CUBE_PB, MethodCube } from "./MethodCube";

const mockReduced = vi.fn();
vi.mock("@/hooks/usePrefersReducedMotion", () => ({
  usePrefersReducedMotion: () => mockReduced(),
  isMotionReduced: () => mockReduced(),
}));

afterEach(() => {
  mockReduced.mockReset();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

// A WebGL context where every call succeeds, enough to get GlBackdrop past
// compile and link into its draw loop.
function fakeGl() {
  return new Proxy({} as Record<string | symbol, unknown>, {
    get: (target, key) => (key in target ? target[key] : () => ({})),
  });
}

// requestAnimationFrame as a queue the test flushes one display frame at a time.
function fakeFrames() {
  let queue = new Map<number, FrameRequestCallback>();
  let nextId = 1;
  let now = 0;
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
    queue.set(nextId, cb);
    return nextId++;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => {
    queue.delete(id);
  });
  return {
    pending: () => queue.size,
    // Runs one display frame; returns how many callbacks it ran.
    tick(ms = 1000 / 60) {
      now += ms;
      const due = queue;
      queue = new Map();
      due.forEach((cb) => cb(now));
      return due.size;
    },
  };
}

function setHidden(hidden: boolean) {
  Object.defineProperty(document, "hidden", { configurable: true, value: hidden });
  document.dispatchEvent(new Event("visibilitychange"));
}

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

  it("runs a single draw loop after mounting in a hidden tab, and none after unmount", () => {
    mockReduced.mockReturnValue(false);
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
      () => fakeGl() as unknown as RenderingContext
    );
    const frames = fakeFrames();
    setHidden(true);

    const { unmount } = render(<GlBackdrop />);
    expect(frames.pending()).toBe(0);

    setHidden(false);
    for (let i = 0; i < 5; i++) expect(frames.tick()).toBe(1);

    setHidden(true);
    setHidden(false);
    expect(frames.tick()).toBe(1);

    unmount();
    expect(frames.pending()).toBe(0);
    setHidden(false);
  });

  it("stops the loop when the WebGL context is lost", () => {
    mockReduced.mockReturnValue(false);
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
      () => fakeGl() as unknown as RenderingContext
    );
    const frames = fakeFrames();
    render(<GlBackdrop />);
    expect(frames.tick()).toBe(1);

    document.querySelector("canvas")!.dispatchEvent(new Event("webglcontextlost"));
    expect(frames.pending()).toBe(0);
    setHidden(true);
    setHidden(false);
    expect(frames.pending()).toBe(0);
  });

  it("does not start a loop when the shader program fails to link", () => {
    mockReduced.mockReturnValue(false);
    const gl = fakeGl();
    gl.getProgramParameter = () => false;
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(() => gl as unknown as RenderingContext);
    const frames = fakeFrames();
    render(<GlBackdrop />);
    expect(frames.pending()).toBe(0);
  });

  it("draws at most about 30 times a second on a 60 Hz display", () => {
    mockReduced.mockReturnValue(false);
    const gl = fakeGl();
    const draws = vi.fn();
    gl.drawArrays = draws;
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(() => gl as unknown as RenderingContext);
    const frames = fakeFrames();
    render(<GlBackdrop />);
    for (let i = 0; i < 60; i++) frames.tick();
    expect(draws.mock.calls.length).toBe(30);
  });
});

describe("MethodCube", () => {
  it("renders the label and the personal best parsed from the resume", () => {
    mockReduced.mockReturnValue(false);
    const achievement = RESUME.education
      .flatMap((edu) => edu.achievements ?? [])
      .find((s) => s.startsWith("Rubik's Cube"));
    // No fallback number in the component: if the resume wording stops
    // parsing, this is where it shows.
    expect(CUBE_PB).toMatch(/^\d+(\.\d+)?$/);
    expect(achievement).toContain(CUBE_PB);

    render(<MethodCube />);
    expect(screen.getByText("OFF THE CLOCK · WCA")).toBeDefined();
    expect(screen.getByText(CUBE_PB)).toBeDefined();
  });

  it("keeps the stickers solved while scrambling under reduced motion, but still runs the timer and notes", () => {
    mockReduced.mockReturnValue(true);
    vi.useFakeTimers();
    const { container } = render(<MethodCube />);
    const stickers = () => Array.from(container.querySelectorAll("button span")).map((el) => el.getAttribute("style"));
    const solved = stickers();

    fireEvent.click(screen.getByRole("button", { name: "Scramble the cube" }));
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(stickers()).toEqual(solved);

    act(() => {
      vi.advanceTimersByTime(1400);
    });
    expect(screen.getByText(/^Solved\./)).toBeDefined();
  });

  it("announces the scramble notes through a polite live region", () => {
    mockReduced.mockReturnValue(false);
    render(<MethodCube />);
    fireEvent.click(screen.getByRole("button", { name: "Scramble the cube" }));
    expect(screen.getByText(/scrambling/i).getAttribute("aria-live")).toBe("polite");
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
