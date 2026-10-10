import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

// A stand-in for the Lenis instance on the home page: scrollTo starts a glide,
// raf is the frame step the layout is meant to drive only while one runs.
const lenis = vi.hoisted(() => ({
  isScrolling: false as false | "smooth",
  time: 1234,
  raf: (() => {}) as (time: number) => void,
  scrollTo: (() => {}) as (target: number) => void,
}));

vi.mock("lenis/react", () => ({ ReactLenis: () => null, useLenis: () => lenis }));
vi.mock("next/navigation", () => ({ usePathname: () => "/" }));

import { ClientLayout } from "./ClientLayout";

let frames: FrameRequestCallback[] = [];
const runFrames = () => {
  const due = frames;
  frames = [];
  due.forEach((cb) => cb(16));
};

beforeEach(() => {
  frames = [];
  lenis.isScrolling = false;
  lenis.time = 1234;
  lenis.raf = vi.fn();
  lenis.scrollTo = vi.fn(() => {
    lenis.isScrolling = "smooth";
  });
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => frames.push(cb));
  vi.stubGlobal("cancelAnimationFrame", () => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ClientLayout on the home page", () => {
  it("drives Lenis only while a glide runs", () => {
    render(<ClientLayout projectCount={28}>page</ClientLayout>);
    const raf = lenis.raf as ReturnType<typeof vi.fn>;

    runFrames();
    runFrames();
    expect(raf).not.toHaveBeenCalled();

    lenis.scrollTo(400);
    // A glide after a rest starts its clock fresh instead of jumping to the end.
    expect(lenis.time).toBe(0);
    runFrames();
    runFrames();
    expect(raf).toHaveBeenCalledTimes(2);

    lenis.isScrolling = false;
    runFrames();
    runFrames();
    runFrames();
    expect(raf).toHaveBeenCalledTimes(3);
  });
});
