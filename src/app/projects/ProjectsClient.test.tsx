import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ProjectsClient } from "./ProjectsClient";
import type { ProjectSummary } from "@/lib/content";

const base: Omit<ProjectSummary, "id" | "title" | "summary" | "domain" | "tech"> = {
  role: "Builder",
  period: "2026",
  tags: ["agents"],
  featured: true,
  priority: 1,
  github: undefined,
  links: {},
};

const PROJECTS: ProjectSummary[] = [
  { ...base, id: "flagship", title: "Flagship Pipeline", summary: "A streaming warehouse built on Kafka.", domain: "AI/ML", tech: ["Kafka", "Python"] },
  { ...base, id: "second", title: "Second Featured", summary: "Vision models over broadcast video.", domain: "Computer Vision", tech: ["YOLO"] },
  { ...base, id: "old-thing", title: "Old Coursework", summary: "A Java desktop guessing game.", domain: undefined, tech: ["Java"] },
  { ...base, id: "other-old", title: "Another Archive Piece", summary: "Some PHP from a long time ago.", domain: undefined, tech: ["PHP"] },
];

describe("ProjectsClient: the work index table", () => {
  it("lists every project as a row, in the order it was given, each linking to its project page", () => {
    render(<ProjectsClient projects={PROJECTS} />);

    const links = screen.getAllByRole("link", { name: /Flagship Pipeline|Second Featured|Old Coursework|Another Archive Piece/ });
    expect(links.map((l) => l.getAttribute("href"))).toEqual([
      "/projects/flagship",
      "/projects/second",
      "/projects/old-thing",
      "/projects/other-old",
    ]);

    for (const p of PROJECTS) {
      expect(screen.getByText(p.title)).toBeDefined();
      expect(screen.getByText(p.summary)).toBeDefined();
    }
  });

  it("filters by domain via the pill buttons", () => {
    render(<ProjectsClient projects={PROJECTS} />);

    fireEvent.click(screen.getByRole("button", { name: /^Computer Vision/i }));

    expect(screen.getByText("Second Featured")).toBeDefined();
    expect(screen.queryByText("Flagship Pipeline")).toBeNull();
    expect(screen.queryByText("Old Coursework")).toBeNull();
  });

  it("searches across title, summary and stack", () => {
    render(<ProjectsClient projects={PROJECTS} />);
    const box = screen.getByLabelText(/search projects/i);

    fireEvent.change(box, { target: { value: "kafka" } }); // summary and tech
    expect(screen.getByText("Flagship Pipeline")).toBeDefined();
    expect(screen.queryByText("Old Coursework")).toBeNull();

    fireEvent.change(box, { target: { value: "php" } }); // tech only
    expect(screen.getByText("Another Archive Piece")).toBeDefined();
    expect(screen.queryByText("Flagship Pipeline")).toBeNull();
  });

  it("reports an empty result rather than rendering an empty table", () => {
    render(<ProjectsClient projects={PROJECTS} />);

    fireEvent.change(screen.getByLabelText(/search projects/i), { target: { value: "zzzznotathing" } });

    expect(screen.getByText(/nothing matches/i)).toBeDefined();
    expect(screen.queryByRole("link", { name: /Flagship Pipeline/ })).toBeNull();
  });

  it("marks the active filter with aria-pressed", () => {
    render(<ProjectsClient projects={PROJECTS} />);

    const all = screen.getByRole("button", { name: /^All/i });
    expect(all.getAttribute("aria-pressed")).toBe("true");

    const domainPill = screen.getByRole("button", { name: /^AI\/ML/i });
    fireEvent.click(domainPill);
    expect(domainPill.getAttribute("aria-pressed")).toBe("true");
    expect(all.getAttribute("aria-pressed")).toBe("false");
  });
});
