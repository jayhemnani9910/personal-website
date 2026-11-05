import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { GuardrailDemo } from "./GuardrailDemo";
import { AgentConsole } from "./AgentConsole";
import { buildSiteData } from "@/lib/site-data";

afterEach(() => vi.unstubAllGlobals());

describe("GuardrailDemo", () => {
  it("records a real quote and refuses the three bad attempts", () => {
    render(<GuardrailDemo />);
    fireEvent.click(screen.getByRole("button", { name: "A real quote" }));
    expect(screen.getByText("recorded.")).toBeDefined();
    for (const name of ["A confident upgrade", "The wrong page", "A result that isn't back"]) {
      fireEvent.click(screen.getByRole("button", { name }));
      expect(screen.getByText("refused:")).toBeDefined();
    }
  });

  it("checks what a visitor types against the page they pick", () => {
    render(<GuardrailDemo />);
    fireEvent.change(screen.getByLabelText(/Your quote/), { target: { value: "glucose 443 MG/DL" } });
    fireEvent.click(screen.getByRole("button", { name: "page 2" }));
    fireEvent.click(screen.getByRole("button", { name: "Run the check" }));
    expect(screen.getByText("recorded.")).toBeDefined();
  });
});

describe("AgentConsole", () => {
  it("loads nothing until a call, then runs the real tool on the site's data", async () => {
    const data = await buildSiteData();
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(data), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    render(<AgentConsole />);
    expect(fetchMock).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /get_contact/ }));
    await waitFor(() => expect(screen.getByLabelText("Tool result").textContent).toContain(data.resume.contact.email));
    expect(fetchMock).toHaveBeenCalledWith("/site-data.json");
  });

  it("every preset names a tool that exists and returns no error", async () => {
    const data = await buildSiteData();
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify(data), { status: 200 })));
    render(<AgentConsole />);
    for (const name of [/search_projects/, /get_project/]) {
      fireEvent.click(screen.getByRole("button", { name }));
      await waitFor(() => expect(screen.getByLabelText("Tool result").textContent).toMatch(/^\{/));
      expect(screen.getByLabelText("Tool result").textContent).not.toMatch(/"error"|"count": 0/);
    }
  });

  it("says so when the data will not load", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 500 })));
    render(<AgentConsole />);
    fireEvent.click(screen.getByRole("button", { name: /get_contact/ }));
    await waitFor(() => expect(screen.getByLabelText("Tool result").textContent).toContain("The call failed"));
  });
});
