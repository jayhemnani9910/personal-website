import { afterEach, describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";
import { Preloader } from "./Preloader";

const scrim = () => document.querySelector<HTMLElement>(".fixed.inset-0");
const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

afterEach(() => {
  sessionStorage.clear();
  vi.useRealTimers();
});

describe("Preloader", () => {
  it("fades out before it unmounts, and only then marks the intro as seen", () => {
    vi.useFakeTimers();
    render(<Preloader />);
    expect(scrim()).not.toBeNull();

    // Typing (~16 ms a character) plus the 300 ms hold, well under the watchdog.
    advance(1000);
    const leaving = scrim();
    expect(leaving).not.toBeNull();
    expect(leaving!.style.opacity).toBe("0");
    expect(sessionStorage.getItem("tr-intro-seen")).toBeNull();

    advance(600);
    expect(scrim()).toBeNull();
    expect(sessionStorage.getItem("tr-intro-seen")).toBe("1");
  });

  it("does not play again once the intro has been seen", () => {
    sessionStorage.setItem("tr-intro-seen", "1");
    render(<Preloader />);
    expect(scrim()).toBeNull();
  });
});
