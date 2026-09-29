import { fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Cursor, KINDS, LABEL_CHIP } from "./Cursor";

const defaultMatchMedia = window.matchMedia;

// matchMedia answering true for exactly the given queries.
function mediaMatching(...queries: string[]) {
  window.matchMedia = (query: string) =>
    ({
      matches: queries.includes(query),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }) as unknown as MediaQueryList;
}

afterEach(() => {
  window.matchMedia = defaultMatchMedia;
  document.body.classList.remove("has-cursor");
});

describe("Cursor", () => {
  it("renders a ring, an accent dot and an inverted label chip", () => {
    const { container } = render(<Cursor />);
    expect(container.querySelector(".tr-cursor-ring")).not.toBeNull();
    expect(container.querySelector(".tr-cursor-dot")).not.toBeNull();
    expect(container.querySelector(".tr-cursor-label")).not.toBeNull();
  });

  it("no longer renders the old crosshair reticle", () => {
    const { container } = render(<Cursor />);
    expect(container.querySelector(".tr-reticle-mark")).toBeNull();
    expect(container.querySelector("svg")).toBeNull();
  });

  // The comp's own kinds table (Portfolio Home.dc.html:404) is the spec these
  // pin down, decoupled from DOM measurement so a changed size or colour
  // fails here with the exact kind and field, not just a passing suite and a
  // wrong screenshot. it.each's %s names the kind in the test title; toEqual's
  // diff on failure names the field.
  it.each([
    ["default", { size: 22, ring: "var(--tr-text-mute)", fill: "transparent" }],
    ["run", { size: 44, ring: "var(--tr-accent)", fill: "var(--tr-accent-soft)" }],
    ["open", { size: 40, ring: "var(--tr-text)", fill: "transparent" }],
    ["proof", { size: 40, ring: "var(--tr-ok)", fill: "transparent" }],
    ["cube", { size: 56, ring: "var(--tr-accent)", fill: "transparent" }],
    ["buddy", { size: 48, ring: "var(--tr-accent)", fill: "transparent" }],
  ] as const)("kind %s matches the comp's spec", (kind, expected) => {
    expect(KINDS[kind]).toEqual(expected);
  });

  it("takes over the pointer for a fine-pointer visitor", () => {
    mediaMatching("(pointer: fine)");
    const { container } = render(<Cursor />);
    expect((container.querySelector(".tr-cursor") as HTMLElement).style.display).toBe("block");
    expect(document.body.classList.contains("has-cursor")).toBe(true);
  });

  // Decision D5: these visitors often run an enlarged or high-contrast system
  // pointer, which CSS cannot detect, so they keep it.
  it.each(["(prefers-contrast: more)", "(forced-colors: active)"])("leaves the system pointer alone under %s", (query) => {
    mediaMatching("(pointer: fine)", query);
    const { container } = render(<Cursor />);
    expect((container.querySelector(".tr-cursor") as HTMLElement).style.display).toBe("none");
    expect(document.body.classList.contains("has-cursor")).toBe(false);
  });

  it("hides the ring while the pointer is outside the window", () => {
    mediaMatching("(pointer: fine)");
    const { container } = render(<Cursor />);
    const cursor = container.querySelector(".tr-cursor") as HTMLElement;

    fireEvent.mouseMove(window, { clientX: 10, clientY: 10 });
    expect(cursor.style.visibility).toBe("");
    fireEvent.mouseOut(document.body, { relatedTarget: null });
    expect(cursor.style.visibility).toBe("hidden");
    fireEvent.mouseMove(window, { clientX: 12, clientY: 12 });
    expect(cursor.style.visibility).toBe("");
  });

  it("keeps the label chip light background, dark text, not inverted", () => {
    expect(LABEL_CHIP).toEqual({ background: "var(--tr-text)", color: "var(--tr-bg)" });
  });
});
