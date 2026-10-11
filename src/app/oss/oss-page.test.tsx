import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MERGED_PRS, MERGED_PRS_SEARCH } from "@/data/home";
// The header's shell button reads the shell context, as under ClientLayout.
import { TerminalProvider } from "@/context/TerminalContext";

vi.mock("next/navigation", () => ({ usePathname: () => "/oss" }));

import OssPage from "./page";

describe("OssPage", () => {
  it("links every merged pull request, each landed commit, and the search that checks them", () => {
    render(<OssPage />, { wrapper: TerminalProvider });
    const hrefs = new Set([...document.querySelectorAll("main a")].map((a) => a.getAttribute("href")));

    for (const pr of MERGED_PRS) {
      expect(hrefs.has(pr.href), pr.href).toBe(true);
      if (pr.landed) expect(hrefs.has(pr.landed), pr.landed).toBe(true);
    }
    expect(hrefs.has(MERGED_PRS_SEARCH)).toBe(true);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("counts a repo whose PRs all landed as commits as landed, not merged", () => {
    render(<OssPage />, { wrapper: TerminalProvider });
    const repo = screen.getByText("modular/modular").closest("li")!;
    expect(repo.textContent).toMatch(/\d+ landed/);
  });
});
