import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { FdeArchDiagram } from "./FdeArchDiagram";
import type { Architecture } from "./fdeData";

const box = (id: string, name: string, x: number, y: number, sub = "caption") =>
  ({ id, name, kind: "service" as const, x, y, sub });

describe("FdeArchDiagram", () => {
  it("draws no canvas for an architecture with no components", () => {
    const { container } = render(<FdeArchDiagram architecture={{ components: [], edges: [] }} />);
    // An empty list used to give a -Infinity viewBox.
    expect(container.querySelector("svg")).toBeNull();
    expect(container.textContent).toMatch(/no components/i);
  });

  it("clips a long name and caption to the box, keeping the full text in a title", () => {
    const name = "Customer Identity Resolution Service";
    const sub = "resolves customers across every CRM we own";
    const { container } = render(
      <FdeArchDiagram architecture={{ components: [box("a", name, 60, 50, sub)], edges: [] }} />,
    );
    const texts = [...container.querySelectorAll("svg text")].map((t) => t.textContent ?? "");
    expect(texts).not.toContain(name);
    expect(texts.some((t) => t.endsWith("…") && name.startsWith(t.slice(0, -1)))).toBe(true);
    expect(texts.some((t) => t.endsWith("…") && sub.startsWith(t.slice(0, -1)))).toBe(true);
    expect(container.querySelector("svg title")?.textContent).toBe(`${name}: ${sub}`);
  });

  it("leaves a name that fits alone", () => {
    const { container } = render(
      <FdeArchDiagram architecture={{ components: [box("a", "Research orchestrator", 60, 50)], edges: [] }} />,
    );
    expect([...container.querySelectorAll("svg text")].map((t) => t.textContent)).toContain("Research orchestrator");
  });

  it("gives opposite edges their own label positions", () => {
    const arch: Architecture = {
      components: [box("a", "Search API", 60, 50), box("b", "Index", 280, 50)],
      edges: [
        { from: "a", to: "b", label: "query" },
        { from: "b", to: "a", label: "results" },
      ],
    };
    const { container } = render(<FdeArchDiagram architecture={arch} />);
    const labelY = (label: string) =>
      [...container.querySelectorAll("svg text")].find((t) => t.textContent === label)?.getAttribute("y");
    expect(labelY("query")).not.toBe(labelY("results"));
  });

  it("moves a label off a third box it would land on", () => {
    // a -> c runs straight through b, and its midpoint is b's centre.
    const arch: Architecture = {
      components: [box("a", "Left", 60, 50), box("b", "Middle", 280, 50), box("c", "Right", 500, 50)],
      edges: [{ from: "a", to: "c", label: "skip" }],
    };
    const { container } = render(<FdeArchDiagram architecture={arch} />);
    const label = [...container.querySelectorAll("svg text")].find((t) => t.textContent === "skip")!;
    const y = Number(label.getAttribute("y"));
    expect(y < 50 || y > 50 + 78).toBe(true);
  });

  it("lists components and flows for screen readers", () => {
    const arch: Architecture = {
      components: [box("a", "Search API", 60, 50), box("b", "Index", 280, 50)],
      edges: [{ from: "b", to: "a", label: "retrieve", dashed: true }],
    };
    const { getByRole } = render(<FdeArchDiagram architecture={arch} />);
    expect(getByRole("list", { name: "Components" }).textContent).toMatch(/Search API \(service\)/);
    expect(getByRole("list", { name: "Flows" }).textContent).toMatch(/Index → Search API: retrieve/);
  });
});
