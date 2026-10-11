import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { TerminalProvider, useTerminal } from "@/context/TerminalContext";

vi.mock("next/navigation", () => ({ usePathname: () => "/oss" }));

import { SiteHeader } from "./SiteHeader";

function ShellState() {
  return <p data-testid="shell">{useTerminal().isOpen ? "open" : "closed"}</p>;
}

describe("SiteHeader", () => {
  it("links every listed page, marks the current one, and opens the shell", () => {
    render(
      <TerminalProvider>
        <SiteHeader />
        <ShellState />
      </TerminalProvider>,
    );

    const nav = screen.getByRole("navigation", { name: "Main" });
    const links = within(nav).getAllByRole("link");
    expect(links.map((a) => [a.textContent, a.getAttribute("href")])).toEqual([
      ["work", "/projects"],
      ["writing", "/blog"],
      ["oss", "/oss"],
      ["about", "/resume"],
      ["channel", "/youtube"],
    ]);
    expect(links.filter((a) => a.getAttribute("aria-current") === "page").map((a) => a.textContent)).toEqual(["oss"]);

    expect(screen.getByTestId("shell").textContent).toBe("closed");
    fireEvent.click(screen.getByRole("button", { name: "shell" }));
    expect(screen.getByTestId("shell").textContent).toBe("open");
  });
});
