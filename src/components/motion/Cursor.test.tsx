import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Cursor, KINDS, LABEL_CHIP } from "./Cursor";

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

  it("keeps the label chip light background, dark text, not inverted", () => {
    expect(LABEL_CHIP).toEqual({ background: "var(--tr-text)", color: "var(--tr-bg)" });
  });
});
