import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MERGED_PRS_SEARCH } from "@/data/home";
import { cardPrs, getOssRepos } from "@/lib/oss";
// The header's shell button reads the shell context, as under ClientLayout.
import { TerminalProvider } from "@/context/TerminalContext";

vi.mock("next/navigation", () => ({ usePathname: () => "/oss", notFound: () => { throw new Error("notFound"); } }));

import OssPage from "./page";
import OssRepoPage from "./[slug]/page";

describe("OssPage", () => {
  it("sends each repo's card to its own page, with its picks, and nothing straight to GitHub but the search", () => {
    render(<OssPage />, { wrapper: TerminalProvider });
    const hrefs = [...document.querySelectorAll("main a")].map((a) => a.getAttribute("href"));

    for (const repo of getOssRepos()) {
      const card = document.querySelector(`main a[href="/oss/${repo.slug}"]`);
      expect(card, repo.repo).not.toBeNull();
      for (const pr of cardPrs(repo)) expect(card!.textContent).toContain(pr.title);
    }
    expect(hrefs.filter((h) => h?.startsWith("https://"))).toEqual([MERGED_PRS_SEARCH]);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });
});

describe("OssRepoPage", () => {
  it("tells every pull request of a repo, with its proof link and, for a landed one, the commit", async () => {
    for (const repo of getOssRepos()) {
      const { unmount } = render(await OssRepoPage({ params: Promise.resolve({ slug: repo.slug }) }), { wrapper: TerminalProvider });
      expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual(repo.prs.map((pr) => pr.title));
      const hrefs = new Set([...document.querySelectorAll("main a")].map((a) => a.getAttribute("href")));
      for (const pr of repo.prs) {
        expect(hrefs.has(pr.href), pr.href).toBe(true);
        if (pr.landed) expect(hrefs.has(pr.landed), pr.landed).toBe(true);
      }
      unmount();
    }
  });

  it("calls a repo that takes work in as commits landed, not merged", async () => {
    render(await OssRepoPage({ params: Promise.resolve({ slug: "modular-modular" }) }), { wrapper: TerminalProvider });
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("modular/modular");
    expect(document.querySelector("main")!.textContent).toMatch(/\d+ landed/);
  });
});
