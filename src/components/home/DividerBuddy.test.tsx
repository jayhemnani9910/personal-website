import { afterEach, describe, expect, it, vi } from "vitest";
import { act, render } from "@testing-library/react";

// jsdom has no IntersectionObserver. This stub keeps every one created, so a
// test can find the provider's and say which sections are on screen.
const observers: IntersectionObserverStub[] = [];
class IntersectionObserverStub {
  targets: Element[] = [];
  constructor(private callback: IntersectionObserverCallback) {
    observers.push(this);
  }
  observe(el: Element) {
    this.targets.push(el);
  }
  unobserve() {}
  disconnect() {
    this.targets = [];
  }
  takeRecords() {
    return [];
  }
  fire(on: Record<string, boolean>) {
    const entries = Object.entries(on).map(([id, isIntersecting]) => ({
      target: this.targets.find((el) => el.id === id)!,
      isIntersecting,
    }));
    act(() => this.callback(entries as IntersectionObserverEntry[], this as unknown as IntersectionObserver));
  }
}
globalThis.IntersectionObserver = IntersectionObserverStub as unknown as typeof IntersectionObserver;

const mockReduced = vi.fn(() => false);
vi.mock("@/hooks/usePrefersReducedMotion", () => ({
  usePrefersReducedMotion: () => mockReduced(),
}));

import { DIVIDER_IDS, DividerBuddyProvider } from "./DividerBuddy";
import { RevealSection } from "./RevealSection";
import { MotionProvider } from "@/components/motion/MotionProvider";

afterEach(() => {
  mockReduced.mockReturnValue(false);
  observers.length = 0;
});

// framer-motion runs its own observers for the reveal; the provider's is the
// one watching the sections themselves.
const rules = () => observers.find((o) => o.targets.some((el) => el.tagName === "SECTION"))!;

// The five ruled sections the way HomeV4 lays them out: each RevealSection's
// `divider` is its section's index in DIVIDER_IDS.
function Page() {
  return (
    <MotionProvider>
      <DividerBuddyProvider>
        {DIVIDER_IDS.map((id, i) => (
          <RevealSection key={id} divider={i}>
            <section id={id} />
          </RevealSection>
        ))}
      </DividerBuddyProvider>
    </MotionProvider>
  );
}

// The id of the section whose rule Buddy stands on, or null if he is nowhere.
function buddyOn(container: HTMLElement) {
  const all = container.querySelectorAll(".buddy-on-rule");
  expect(all.length).toBeLessThanOrEqual(1);
  return all[0]?.closest(".tr-reveal")?.querySelector("section")?.id ?? null;
}

describe("DividerBuddy handover", () => {
  it("waits on the first rule before any section has come into view", () => {
    const { container } = render(<Page />);
    expect(rules().targets.map((el) => el.id)).toEqual([...DIVIDER_IDS]);
    expect(buddyOn(container)).toBe("proof");
  });

  it("stands on the last rule in view, and walks back on the way up", () => {
    const { container } = render(<Page />);

    rules().fire({ proof: true, work: true });
    expect(buddyOn(container)).toBe("work");

    rules().fire({ method: true });
    expect(buddyOn(container)).toBe("method");

    rules().fire({ method: false });
    expect(buddyOn(container)).toBe("work");
  });

  it("stays where he is when nothing is in view", () => {
    const { container } = render(<Page />);

    rules().fire({ log: true });
    expect(buddyOn(container)).toBe("log");

    rules().fire({ log: false });
    expect(buddyOn(container)).toBe("log");
  });

  // The switch after hydration must not swap the section nodes the observer is
  // watching, or Buddy would stop moving.
  it("keeps following the rules after a reduced-motion flip", () => {
    const { container, rerender } = render(<Page />);
    rules().fire({ work: true });
    expect(buddyOn(container)).toBe("work");

    mockReduced.mockReturnValue(true);
    rerender(<Page />);
    for (const el of rules().targets) expect(el.isConnected).toBe(true);
    expect(buddyOn(container)).toBe("work");

    rules().fire({ contact: true });
    expect(buddyOn(container)).toBe("contact");
  });
});
