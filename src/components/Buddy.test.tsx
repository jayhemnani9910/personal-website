import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render } from "@testing-library/react";

const mockReduced = vi.fn(() => false);
vi.mock("@/hooks/usePrefersReducedMotion", () => ({
  usePrefersReducedMotion: () => mockReduced(),
}));

import { Buddy } from "./Buddy";

afterEach(() => {
  mockReduced.mockReturnValue(false);
  vi.useRealTimers();
});

const sprite = (container: HTMLElement) => container.querySelector(".buddy") as HTMLElement;
const bubble = (container: HTMLElement) => container.querySelector(".buddy-art")?.textContent ?? "";
const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

describe("Buddy", () => {
  it("lets a second click's reaction run its full length", () => {
    vi.useFakeTimers();
    const { container } = render(<Buddy />);

    fireEvent.click(sprite(container));
    advance(500);
    fireEvent.click(sprite(container));
    advance(620); // 1120 ms: the first click's reset would have fired at 1020
    expect(bubble(container)).toContain("press me");

    advance(400); // 1520 ms: the second click's own reset
    expect(bubble(container)).not.toContain("press me");
  });

  it("returns to rest after a click under reduced motion", () => {
    mockReduced.mockReturnValue(true);
    vi.useFakeTimers();
    const { container } = render(<Buddy />);

    fireEvent.click(sprite(container));
    expect(bubble(container)).toContain("hi there");
    expect(container.querySelector(".buddy-eye--reacting")).not.toBeNull();

    advance(1000);
    expect(bubble(container)).not.toContain("hi there");
    expect(container.querySelector(".buddy-eye--reacting")).toBeNull();
  });

  it("keeps the bounce class until the bounce animation ends", () => {
    vi.useFakeTimers();
    const { container } = render(<Buddy />);

    fireEvent.click(sprite(container));
    advance(200);
    expect(sprite(container).classList.contains("buddy--bounce")).toBe(true);

    // jsdom has no AnimationEvent, so React listens for the webkit-prefixed
    // name there, and the animation name is set on a plain event.
    const end = Object.assign(new Event("webkitAnimationEnd", { bubbles: true }), { animationName: "buddy-bounce" });
    act(() => {
      sprite(container).dispatchEvent(end);
    });
    expect(sprite(container).classList.contains("buddy--bounce")).toBe(false);
  });

  it("fires no reaction step after unmount", () => {
    vi.useFakeTimers();
    const { container, unmount } = render(<Buddy />);
    fireEvent.click(sprite(container));
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
