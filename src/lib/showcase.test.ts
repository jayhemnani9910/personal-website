import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import { SHOWCASE_PROJECTS } from "@/lib/showcase";
import { WEBMCP_TOOLS } from "@/lib/webmcp-tools";
import { buildTools } from "@/lib/webmcp";
import { buildSiteData } from "@/lib/site-data";

// Every image path the project pages render: each compare pair's before and
// after frames (ComparisonSlider). A wrong path is a request for a 404 on a live page, and
// nothing in the build complains about it.
function renderedImages(): string[] {
    return Object.values(SHOWCASE_PROJECTS).flatMap((config) => [
        ...(config.demo?.kind === "compare" ? config.demo.pairs.flatMap((p) => [p.before, p.after]) : []),
    ]);
}

describe("showcase image assets", () => {
    const images = renderedImages();

    it("finds the rendered image paths", () => {
        expect(images.length).toBeGreaterThan(0);
    });

    it.each(images)("%s resolves to a file in public/", (image) => {
        expect(existsSync(path.join(process.cwd(), "public", image.replace(/^\//, "")))).toBe(true);
    });
});

describe("showcase WebMCP tools table", () => {
    it("lists exactly the tools the site registers, in order, with the same kinds", () => {
        const demo = SHOWCASE_PROJECTS["webmcp-portfolio"]?.demo;
        expect(demo?.kind).toBe("tools");
        const rows = demo && demo.kind === "tools" ? demo.tools : [];
        expect(rows.map((r) => [r.name, r.kind])).toEqual(WEBMCP_TOOLS.map((t) => [t.name, t.kind]));
    });
});

// The sample call on the WebMCP page claims to show what the site returns.
// Run the real tool over the real site data and hold the sample to it, so a
// new field, a retitled project or a changed tech list cannot leave it stale.
describe("showcase WebMCP sample call", () => {
    it("shows exactly what the real tool returns for the sample request", async () => {
        const demo = SHOWCASE_PROJECTS["webmcp-portfolio"]?.demo;
        if (demo?.kind !== "tools") throw new Error("webmcp-portfolio has no tools demo");
        const request = JSON.parse(demo.sample.request) as { tool: string; arguments: Record<string, unknown> };
        expect(request.tool).toBe(demo.sample.tool);
        const tool = buildTools(await buildSiteData()).find((t) => t.name === request.tool);
        expect(tool).toBeDefined();
        expect(JSON.parse(demo.sample.response)).toEqual(await tool!.execute(request.arguments));
    });
});
