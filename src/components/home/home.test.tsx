import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "./Hero";
import { WorkTable } from "./WorkTable";
import { Method } from "./Method";
import { Log } from "./Log";
import { Contact } from "./Contact";
import { HomeFooter } from "./HomeFooter";
import { FEATURED, METHOD } from "@/data/home";
import { SITE_CONFIG } from "@/../content/site";

const LOG_FIXTURE = [
  { when: "2026", role: "Freelance Data Engineer", org: "Elite Hotel Group", what: "ETL, dashboards, forecasts." },
  { when: "2023", role: "Analytics Consultant", org: "Independent", what: "A/B frameworks, reporting." },
  { when: "2022", role: "AI/ML Intern", org: "Amnex", what: "Credit-fraud ensemble." },
  { when: "2021", role: "iOS Developer", org: "Cygnus SoftTech", what: "CodeLock privacy app." },
  { when: "2020", role: "Software Intern", org: "Cactus Creatives Pvt. Ltd.", what: "Comms platform on Azure." },
];

describe("WorkTable", () => {
  it("renders a link to every featured project, numbered 01 through 06", () => {
    render(<WorkTable projects={FEATURED} total={27} />);
    for (const p of FEATURED) {
      const link = screen.getByRole("link", { name: new RegExp(p.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")) });
      expect(link.getAttribute("href")).toBe(`/projects/${p.id}`);
    }
    for (const p of FEATURED) {
      expect(screen.getByText(p.num)).toBeDefined();
    }
  });

  it("keeps the three cell labels in the DOM at every width", () => {
    render(<WorkTable projects={FEATURED} total={27} />);
    expect(screen.getAllByText("ARRIVED AS").length).toBeGreaterThan(0);
    expect(screen.getAllByText("WHAT I DID").length).toBeGreaterThan(0);
    expect(screen.getAllByText("WHAT CHANGED").length).toBeGreaterThan(0);
  });

  it("renders the heading and footer link off the given counts", () => {
    render(<WorkTable projects={FEATURED} total={27} />);
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe("6 of 27.");
    expect(screen.getByText(/The other 21, with filters/)).toBeDefined();
  });
});

describe("Log", () => {
  it("renders one row per entry", () => {
    render(<Log entries={LOG_FIXTURE} />);
    for (const e of LOG_FIXTURE) {
      expect(screen.getByText(e.when)).toBeDefined();
      expect(screen.getByText(e.what)).toBeDefined();
    }
  });
});

describe("Contact", () => {
  it("renders the mailto link and the four social links from site config", () => {
    const { container } = render(<Contact />);
    const hrefOf = (href: string) =>
      Array.from(container.querySelectorAll("a")).find((a) => a.getAttribute("href") === href);

    expect(hrefOf(`mailto:${SITE_CONFIG.social.email}`)).toBeDefined();

    const hrefs = [
      SITE_CONFIG.social.github,
      SITE_CONFIG.social.linkedin,
      SITE_CONFIG.social.twitter,
      SITE_CONFIG.social.youtube,
    ];
    for (const href of hrefs) {
      expect(hrefOf(href)).toBeDefined();
    }
  });
});

describe("HomeFooter", () => {
  it("interpolates the given tool count", () => {
    render(<HomeFooter toolCount={8} />);
    expect(screen.getByText(/8 MCP tools/)).toBeDefined();
  });
});

describe("Hero", () => {
  it("renders exactly one h1 with the hero headline", () => {
    render(<Hero years={4}>{null}</Hero>);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s.length).toBe(1);
    expect(h1s[0].textContent).toBe("Give me the vague version.");
  });
});

describe("Method", () => {
  it("renders four rules and four back-links matching METHOD hrefs", () => {
    render(<Method>{null}</Method>);
    for (const m of METHOD) {
      expect(screen.getByText(m.rule)).toBeDefined();
    }
    const backLinks = screen.getAllByText(/^← /);
    expect(backLinks.length).toBe(4);
    const hrefs = backLinks.map((el) => el.closest("a")?.getAttribute("href")).sort();
    expect(hrefs).toEqual(METHOD.map((m) => m.href).sort());
  });
});
