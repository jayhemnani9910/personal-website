import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { RESUME } from "@/data/resume";
import AboutPage from "./page";

const roleCount = RESUME.experience.reduce((n, c) => n + c.roles.length, 0);

describe("AboutPage", () => {
  it("renders exactly one h1", () => {
    render(<AboutPage />);
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toBe("Came from design. Stayed for the mess.");
  });

  it("renders one Experience row per role in resume.ts", () => {
    render(<AboutPage />);
    const section = screen.getByRole("heading", { name: "Experience" }).closest("section")!;
    expect(section.querySelectorAll("ol > li")).toHaveLength(roleCount);
  });

  it("switches the shown skill chips when a different stack pill is clicked", () => {
    render(<AboutPage />);
    const [firstCategory, secondCategory] = RESUME.skills;
    // Scoped to the Stack section: several skill names (e.g. "Python") also
    // appear as tech chips under Experience, which would otherwise make
    // getByText ambiguous.
    const section = screen.getByRole("heading", { name: "Stack" }).closest("section")!;

    // The first category's items are shown by default.
    expect(within(section).getByText(firstCategory.items[0].name)).toBeDefined();
    expect(within(section).queryByText(secondCategory.items[0].name)).toBeNull();

    fireEvent.click(within(section).getByRole("button", { name: secondCategory.category }));

    expect(within(section).getByText(secondCategory.items[0].name)).toBeDefined();
    expect(within(section).queryByText(firstCategory.items[0].name)).toBeNull();
  });
});
