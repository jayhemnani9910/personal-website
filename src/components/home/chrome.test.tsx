import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import type { NavItem } from "@/data/home";
import { SECTIONS } from "@/data/home";

// jsdom has no IntersectionObserver; useSectionSpy (used by SectionRail) needs
// one to exist before any render. vitest.setup.ts is shared across the repo,
// so this stub lives here instead.
class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
globalThis.IntersectionObserver = IntersectionObserverStub as unknown as typeof IntersectionObserver;

// useTerminal throws without a TerminalProvider, and HomeHeader only needs to
// call toggleTerminal, so the module is mocked instead of wiring a provider.
const mockToggleTerminal = vi.fn();
vi.mock("@/context/TerminalContext", () => ({
  useTerminal: () => ({ isOpen: false, toggleTerminal: mockToggleTerminal, closeTerminal: vi.fn() }),
}));

// RevealSection's reduced-motion branch needs to be exercised directly rather
// than through matchMedia plumbing.
const mockReducedMotion = vi.fn(() => false);
vi.mock("@/hooks/usePrefersReducedMotion", () => ({
  usePrefersReducedMotion: () => mockReducedMotion(),
}));

import { HomeHeader } from "./HomeHeader";
import { SectionRail } from "./SectionRail";
import { RevealSection } from "./RevealSection";
import { useScrollState } from "./useScrollState";

afterEach(() => {
  mockToggleTerminal.mockClear();
  mockReducedMotion.mockReturnValue(false);
});

const NAV_FIXTURE: NavItem[] = [
  { label: "Work", alt: "27 shipped", href: "/projects" },
  { label: "Writing", alt: "3 essays", href: "/blog" },
  { label: "About", alt: "the log", href: "/resume" },
  { label: "Channel", alt: "on video", href: "/youtube" },
];

describe("HomeHeader", () => {
  it("renders the four nav links, each carrying its alt text", () => {
    render(<HomeHeader nav={NAV_FIXTURE} />);
    for (const item of NAV_FIXTURE) {
      const link = screen.getByRole("link", { name: new RegExp(item.label) });
      expect(link.getAttribute("href")).toBe(item.href);
    }
    for (const item of NAV_FIXTURE) {
      expect(screen.getByText(item.alt)).toBeDefined();
    }
  });

  it("renders the theme toggle and the shell button", () => {
    render(<HomeHeader nav={NAV_FIXTURE} />);
    expect(screen.getByRole("button", { name: "Toggle theme" })).toBeDefined();
    expect(screen.getByRole("button", { name: /shell/i })).toBeDefined();
  });

  it("calls toggleTerminal when the shell button is clicked", () => {
    render(<HomeHeader nav={NAV_FIXTURE} />);
    fireEvent.click(screen.getByRole("button", { name: /shell/i }));
    expect(mockToggleTerminal).toHaveBeenCalledTimes(1);
  });
});

describe("SectionRail", () => {
  it("renders an ol named Sections with five anchors matching the SECTIONS hashes", () => {
    render(<SectionRail steps={SECTIONS} />);
    const list = screen.getByRole("list", { name: "Sections" });
    const links = within(list).getAllByRole("link");
    expect(links.length).toBe(SECTIONS.length);
    expect(links.map((l) => l.getAttribute("href"))).toEqual(SECTIONS.map((s) => s.href));
  });
});

describe("RevealSection", () => {
  // It wraps components that already render their own <section id>. If this
  // rendered a section too the page would nest one inside the other, so the
  // wrapper stays a plain div and owns no semantics.
  it("renders a div, not a section, and leaves the child's semantics alone", () => {
    render(
      <RevealSection className="marker-class">
        <section id="brief" aria-labelledby="brief-h">
          <p>hello there</p>
        </section>
      </RevealSection>
    );
    expect(document.querySelector(".marker-class")?.tagName.toLowerCase()).toBe("div");
    expect(screen.getByText("hello there")).toBeDefined();
    expect(document.querySelectorAll("section")).toHaveLength(1);
    expect(document.getElementById("brief")?.getAttribute("aria-labelledby")).toBe("brief-h");
  });

  it("renders a plain div under reduced motion, children still present", () => {
    mockReducedMotion.mockReturnValue(true);
    render(
      <RevealSection className="reduced-marker">
        <p>reduced content</p>
      </RevealSection>
    );
    expect(document.querySelector(".reduced-marker")?.tagName.toLowerCase()).toBe("div");
    expect(screen.getByText("reduced content")).toBeDefined();
  });
});

describe("useScrollState", () => {
  function Probe() {
    const { scrolled, progress } = useScrollState();
    return <div data-testid="probe">{String(scrolled)}:{progress}</div>;
  }

  it("returns a stable snapshot across renders with no intervening scroll event", () => {
    expect(() =>
      render(
        <>
          <Probe />
          <Probe />
        </>
      )
    ).not.toThrow();
    const probes = screen.getAllByTestId("probe");
    expect(probes[0].textContent).toBe(probes[1].textContent);
  });
});
