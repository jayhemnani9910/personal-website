import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Cursor } from "./Cursor";

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
});
