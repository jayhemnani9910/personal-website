import { afterEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, waitFor, within, fireEvent } from "@testing-library/react";
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
import { MotionProvider } from "@/components/motion/MotionProvider";
import { useScrollProgress, useScrolled } from "./useScrollState";

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
  it("renders a nav named Sections with five anchors matching the SECTIONS hashes", () => {
    render(<SectionRail steps={SECTIONS} />);
    const nav = screen.getByRole("navigation", { name: "Sections" });
    const links = within(within(nav).getByRole("list")).getAllByRole("link");
    expect(links.length).toBe(SECTIONS.length);
    expect(links.map((l) => l.getAttribute("href"))).toEqual(SECTIONS.map((s) => s.href));
  });

  it("keeps the hidden rail out of the tab order until the page is scrolled", () => {
    render(<SectionRail steps={SECTIONS} />);
    const nav = screen.getByRole("navigation", { name: "Sections" });
    expect(nav.hasAttribute("inert")).toBe(true);

    setScrollY(400);
    expect(nav.hasAttribute("inert")).toBe(false);
    setScrollY(0);
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

  it("renders a plain div under reduced motion, children still present", async () => {
    mockReducedMotion.mockReturnValue(true);
    render(
      <MotionProvider>
        <RevealSection className="reduced-marker">
          <p>reduced content</p>
        </RevealSection>
      </MotionProvider>
    );
    const wrapper = document.querySelector<HTMLElement>(".reduced-marker");
    expect(wrapper?.tagName.toLowerCase()).toBe("div");
    expect(screen.getByText("reduced content")).toBeDefined();
    // Shown at once, with no scroll into view (the observer stub never fires).
    await waitFor(() => expect(wrapper?.style.opacity).not.toBe("0"));
    expect(wrapper?.style.transform).not.toBe("translateY(28px)");
  });

  it("keeps the section hidden until it scrolls into view when motion is allowed", async () => {
    render(
      <MotionProvider>
        <RevealSection className="animated-marker">
          <p>animated content</p>
        </RevealSection>
      </MotionProvider>
    );
    const wrapper = document.querySelector<HTMLElement>(".animated-marker");
    // Give a wrongly started animation the same chance the reduced one gets.
    await act(() => new Promise((r) => setTimeout(r, 50)));
    expect(wrapper?.style.opacity).toBe("0");
    expect(wrapper?.style.transform).toBe("translateY(28px)");
  });
});

function setScrollY(y: number) {
  act(() => {
    Object.defineProperty(window, "scrollY", { configurable: true, value: y });
    window.dispatchEvent(new Event("scroll"));
  });
}

describe("useScrolled / useScrollProgress", () => {
  function Probe() {
    const scrolled = useScrolled();
    const progress = useScrollProgress();
    return <div data-testid="probe">{String(scrolled)}:{progress}</div>;
  }

  // The masthead shrinks 12px when `scrolled` flips, and scroll anchoring then
  // moves scrollY by the same 12px. With a single 240px threshold that bounced
  // the header forever; the band has to be wider than the 12px it causes.
  it("flips with hysteresis wider than the masthead's 12px height change", () => {
    render(<Probe />);
    const scrolled = () => screen.getByTestId("probe").textContent?.split(":")[0];

    setScrollY(245);
    expect(scrolled()).toBe("false");
    setScrollY(253);
    expect(scrolled()).toBe("true");
    setScrollY(241); // the header shrank and anchoring pulled the page up 12px
    expect(scrolled()).toBe("true");
    setScrollY(235);
    expect(scrolled()).toBe("true");
    setScrollY(227);
    expect(scrolled()).toBe("false");
    setScrollY(239); // the header grew and anchoring pushed the page down 12px
    expect(scrolled()).toBe("false");
    setScrollY(0);
  });

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
