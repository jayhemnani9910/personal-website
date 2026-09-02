import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { getAllPosts, getAllProjects } from "@/lib/content";
import WritingPage from "./page";

// WritingPage is an async Server Component: it must be awaited to get the
// element before render(), same as any other async function that returns JSX.
describe("WritingPage", () => {
  it("renders exactly one h1 with the page title", async () => {
    render(await WritingPage());

    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toBe("Written down so I can be checked later.");
  });

  it("renders one row for every published post", async () => {
    const posts = await getAllPosts();
    render(await WritingPage());

    const postLinks = screen
      .getAllByRole("link")
      .filter((a) => a.getAttribute("href")?.startsWith("/blog/"));
    expect(postLinks).toHaveLength(posts.length);
  });

  it("renders the deep-dive cards plus the index card", async () => {
    const projects = await getAllProjects();
    const expectedDeepDives = Math.min(projects.filter((p) => p.deepDive).length, 3);
    render(await WritingPage());

    // Scoped to the write-ups section: SiteHeader's own nav also links to
    // /projects ("Work"), which would otherwise be double-counted here.
    const section = screen.getByRole("heading", { name: /project write-ups/i }).closest("section")!;
    const cardLinks = within(section)
      .getAllByRole("link")
      .filter((a) => {
        const href = a.getAttribute("href") ?? "";
        return href === "/projects" || /^\/projects\/[^/]+$/.test(href);
      });
    expect(cardLinks).toHaveLength(expectedDeepDives + 1);
    expect(within(section).getByRole("link", { name: /the index/i }).getAttribute("href")).toBe("/projects");
  });
});
