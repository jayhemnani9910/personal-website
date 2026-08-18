import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ProjectsClient } from "./ProjectsClient";
import type { ProjectSummary } from "@/lib/content";

type P = ProjectSummary & { hero?: string };

const base: Omit<P, "id" | "title" | "summary" | "featured"> = {
  role: "Builder",
  period: "2026",
  domain: "AI/ML",
  tags: ["agents"],
  tech: ["Python"],
  priority: 1,
  github: undefined,
  links: {},
};

const PROJECTS: P[] = [
  { ...base, id: "flagship", title: "Flagship Pipeline", summary: "A streaming warehouse built on Kafka.", featured: true, hero: "/projects/stock/dashboard.png" },
  { ...base, id: "second", title: "Second Featured", summary: "Vision models over broadcast video.", featured: true },
  { ...base, id: "old-thing", title: "Old Coursework", summary: "A Java desktop guessing game.", featured: false, domain: "Web / Frontend", tech: ["Java"] },
  { ...base, id: "other-old", title: "Another Archive Piece", summary: "Some PHP from a long time ago.", featured: false, domain: "Web / Frontend", tech: ["PHP"] },
];

describe("ProjectsClient: selected work and archive", () => {
  it("splits featured work into Selected and the rest into Archive", () => {
    render(<ProjectsClient projects={PROJECTS} />);

    expect(screen.getByRole("heading", { name: /selected work/i, level: 2 })).toBeDefined();
    expect(screen.getByRole("heading", { name: /archive/i, level: 2 })).toBeDefined();

    // Every project is present exactly once, in one band or the other.
    for (const p of PROJECTS) {
      expect(screen.getAllByRole("heading", { name: p.title, level: 3 })).toHaveLength(1);
    }
  });

  it("renders each project's summary, which the cards previously dropped", () => {
    render(<ProjectsClient projects={PROJECTS} />);
    for (const p of PROJECTS) {
      expect(screen.getByText(p.summary)).toBeDefined();
    }
  });

  it("hides the Selected band when a filter matches only archive entries", () => {
    render(<ProjectsClient projects={PROJECTS} />);

    fireEvent.click(screen.getByRole("button", { name: /web \/ frontend/i }));

    expect(screen.queryByRole("heading", { name: /selected work/i, level: 2 })).toBeNull();
    expect(screen.getByRole("heading", { name: /archive/i, level: 2 })).toBeDefined();
    expect(screen.queryByRole("heading", { name: "Flagship Pipeline", level: 3 })).toBeNull();
  });

  it("hides the Archive band when the Featured filter is active", () => {
    render(<ProjectsClient projects={PROJECTS} />);

    fireEvent.click(screen.getByRole("button", { name: /^featured/i }));

    expect(screen.getByRole("heading", { name: /selected work/i, level: 2 })).toBeDefined();
    expect(screen.queryByRole("heading", { name: /archive/i, level: 2 })).toBeNull();
  });

  it("searches across title, summary and stack", () => {
    render(<ProjectsClient projects={PROJECTS} />);
    const box = screen.getByLabelText(/search projects/i);

    fireEvent.change(box, { target: { value: "kafka" } }); // summary only
    expect(screen.getByRole("heading", { name: "Flagship Pipeline", level: 3 })).toBeDefined();
    expect(screen.queryByRole("heading", { name: "Old Coursework", level: 3 })).toBeNull();

    fireEvent.change(box, { target: { value: "php" } }); // tech only
    expect(screen.getByRole("heading", { name: "Another Archive Piece", level: 3 })).toBeDefined();
    expect(screen.queryByRole("heading", { name: "Flagship Pipeline", level: 3 })).toBeNull();
  });

  it("reports an empty result rather than rendering empty bands", () => {
    render(<ProjectsClient projects={PROJECTS} />);

    fireEvent.change(screen.getByLabelText(/search projects/i), { target: { value: "zzzznotathing" } });

    expect(screen.getByText(/no projects match/i)).toBeDefined();
    expect(screen.queryByRole("heading", { name: /selected work/i, level: 2 })).toBeNull();
    expect(screen.queryByRole("heading", { name: /archive/i, level: 2 })).toBeNull();
  });

  it("marks the active filter with aria-pressed", () => {
    render(<ProjectsClient projects={PROJECTS} />);

    const all = screen.getByRole("button", { name: /^all/i });
    expect(all.getAttribute("aria-pressed")).toBe("true");

    const featured = screen.getByRole("button", { name: /^featured/i });
    fireEvent.click(featured);
    expect(featured.getAttribute("aria-pressed")).toBe("true");
    expect(all.getAttribute("aria-pressed")).toBe("false");
  });
});
