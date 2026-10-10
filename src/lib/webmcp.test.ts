import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WEBMCP_TOOLS, WEBMCP_TOOL_COUNT } from "./webmcp-tools";
import { buildTools, registerWebMCPTools, type ModelContextTool, type SiteData } from "./webmcp";
import { READER_KEY } from "./storage";
import { FEATURED } from "@/data/home";

const DATA: SiteData = {
    siteUrl: "https://example.test",
    projects: [
        { id: "alpha", title: "Alpha Pipeline", summary: "Streams on Kafka.", role: "Builder", tags: ["data"], tech: ["Kafka", "Python"], featured: true, challenge: "c", solution: ["s"], impact: ["i"] },
        { id: "beta", title: "Beta Vision", summary: "Detects players.", role: "Builder", domain: "Computer Vision", tags: ["cv"], tech: ["YOLO"], featured: false, challenge: "c", solution: ["s"], impact: ["i"] },
    ],
    resume: {
        name: "Jay",
        tagline: "Engineer",
        summary: "Builds things.",
        contact: { email: "a@b.test", github: "https://github.com/x" },
        coreCompetencies: ["pipelines"],
        skills: [
            { category: "Languages", items: [{ name: "Python" }, { name: "Go" }] },
            { category: "Backend & APIs", items: [{ name: "FastAPI" }] },
        ],
        experience: [],
        education: [],
    },
    social: { github: "https://github.com/x" },
    experiments: [{ id: "e1", title: "Voice agent", description: "Talks back", tags: ["audio"] }],
};

const tools = buildTools(DATA);
const tool = (name: string) => tools.find((t) => t.name === name) as ModelContextTool;

afterEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.reader;
    delete (document as { modelContext?: unknown }).modelContext;
});

describe("WebMCP tool registry", () => {
    it("builds exactly the registry's tools, in order", () => {
        expect(tools.map((t) => t.name)).toEqual(WEBMCP_TOOLS.map((t) => t.name));
        expect(tools).toHaveLength(WEBMCP_TOOL_COUNT);
    });

    it("gives every tool the shape the browser API requires", () => {
        for (const t of tools) {
            expect(t.name).toMatch(/^[a-z_]+$/);
            expect(t.description.length).toBeGreaterThan(10);
            expect(typeof t.execute).toBe("function");
        }
    });

    it("marks exactly the read tools read-only", () => {
        for (const t of WEBMCP_TOOLS) {
            expect(tool(t.name).annotations?.readOnlyHint === true).toBe(t.kind === "read");
        }
    });

    // The MDX is content, not code, so it cannot import the constant. It still
    // states tool counts in prose, as digits or words ("8 structured tools",
    // "eight tools", "6 read · 2 write"), and a wrong number there is as
    // visible to a reader as a wrong number in the masthead. Catch it here.
    it("keeps the project MDX's stated tool counts in step", () => {
        const mdx = readFileSync(
            join(process.cwd(), "content/projects/webmcp-portfolio.mdx"),
            "utf8"
        );
        const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
            "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty"];
        const N = `(\\d+|${WORDS.join("|")})`;
        const value = (n: string) => (/^\d+$/.test(n) ? Number(n) : WORDS.indexOf(n.toLowerCase()));

        const totals = [...mdx.matchAll(new RegExp(`\\b${N}\\s+(?:structured\\s+)?tools\\b`, "gi"))].map((m) => value(m[1]));
        expect(totals.length).toBeGreaterThan(0);
        for (const n of totals) expect(n).toBe(WEBMCP_TOOL_COUNT);

        const perKind = [...mdx.matchAll(new RegExp(`\\b${N}\\s+(read|write)\\b`, "gi"))];
        expect(perKind.length).toBeGreaterThan(0);
        for (const [, n, kind] of perKind) {
            expect(value(n)).toBe(WEBMCP_TOOLS.filter((t) => t.kind === kind.toLowerCase()).length);
        }
    });

    // Other posts mention the integration in passing. Only their WebMCP lines are
    // checked, so an unrelated "3 tools" elsewhere in a post is left alone. The
    // theme tool went with the dark theme (ADR 0018), so no line may offer it.
    it("keeps every other mention of WebMCP in step", () => {
        const dir = join(process.cwd(), "content/blog");
        const lines = readdirSync(dir)
            .filter((f) => f.endsWith(".mdx"))
            .flatMap((f) => readFileSync(join(dir, f), "utf8").split("\n"))
            .concat(FEATURED.find((f) => f.id === "webmcp-portfolio")?.did ?? "")
            .filter((l) => /webmcp/i.test(l));
        expect(lines.length).toBeGreaterThan(0);
        for (const line of lines) {
            for (const m of line.matchAll(/\b(\d+) tools\b/g)) expect(Number(m[1])).toBe(WEBMCP_TOOL_COUNT);
            expect(line).not.toMatch(/\btheme\b/i);
        }
    });
});

describe("WebMCP tools", () => {
    it("search_projects filters and builds URLs from siteUrl", async () => {
        const byQuery = (await tool("search_projects").execute({ query: "kafka" })) as { count: number; projects: { id: string; url: string }[] };
        expect(byQuery.projects.map((p) => p.id)).toEqual(["alpha"]);
        expect(byQuery.projects[0].url).toBe("https://example.test/projects/alpha");

        const featured = (await tool("search_projects").execute({ featured_only: true })) as { projects: { id: string }[] };
        expect(featured.projects.map((p) => p.id)).toEqual(["alpha"]);

        const byDomain = (await tool("search_projects").execute({ domain: "vision" })) as { projects: { id: string }[] };
        expect(byDomain.projects.map((p) => p.id)).toEqual(["beta"]);
    });

    it("get_project returns one project, or a helpful error", async () => {
        const hit = (await tool("get_project").execute({ id: "beta" })) as { title: string; url: string };
        expect(hit.title).toBe("Beta Vision");
        expect(hit.url).toBe("https://example.test/projects/beta");
        const miss = (await tool("get_project").execute({ id: "nope" })) as { error: string };
        expect(miss.error).toMatch(/not found/);
    });

    it("get_resume returns the requested section", async () => {
        const skills = (await tool("get_resume").execute({ section: "skills" })) as { skills: unknown[] };
        expect(skills.skills).toHaveLength(2);
    });

    it("search_skills lists the resume's real categories and filters by them", async () => {
        const schema = tool("search_skills").inputSchema as { properties: { category: { description: string } } };
        expect(schema.properties.category.description).toContain("Backend & APIs");
        const res = (await tool("search_skills").execute({ query: "fast" })) as { skills: { category: string }[] };
        expect(res.skills.map((s) => s.category)).toEqual(["Backend & APIs"]);
    });

    it("get_contact points at the site origin", async () => {
        const res = (await tool("get_contact").execute({})) as { website: string };
        expect(res.website).toBe("https://example.test");
    });

    it("switch_mode turns reader mode on and announces it", async () => {
        const heard = vi.fn();
        window.addEventListener("readermodechange", heard);
        await tool("switch_mode").execute({ mode: "reader" });
        window.removeEventListener("readermodechange", heard);
        expect(document.documentElement.dataset.reader).toBe("on");
        expect(localStorage.getItem(READER_KEY)).toBe("on");
        expect(heard).toHaveBeenCalledOnce();
    });
});

describe("registerWebMCPTools", () => {
    it("registers every tool with the signal, and one failure drops only that tool", async () => {
        const registered: string[] = [];
        const signals: (AbortSignal | undefined)[] = [];
        (document as { modelContext?: unknown }).modelContext = {
            registerTool: async (t: ModelContextTool, opts?: { signal?: AbortSignal }) => {
                if (typeof t.execute !== "function") throw new TypeError("execute is required");
                if (t.name === "get_contact") throw new Error("refused");
                registered.push(t.name);
                signals.push(opts?.signal);
            },
        };
        const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
        const controller = new AbortController();
        await expect(registerWebMCPTools(DATA, controller.signal)).resolves.toBeUndefined();
        expect(registered).toEqual(WEBMCP_TOOLS.map((t) => t.name).filter((n) => n !== "get_contact"));
        expect(signals.every((s) => s === controller.signal)).toBe(true);
        expect(warn).toHaveBeenCalledOnce();
        warn.mockRestore();
    });

    it("does nothing when the browser has no WebMCP API", async () => {
        await expect(registerWebMCPTools(DATA, new AbortController().signal)).resolves.toBeUndefined();
    });
});
