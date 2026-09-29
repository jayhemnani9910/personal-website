import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import path from "node:path";
import { SHOWCASE_PROJECTS } from "@/lib/showcase";
import { WEBMCP_TOOLS } from "@/lib/webmcp-tools";

// Every image path the project pages render: each architecture diagram
// (ProjectDetail) and each compare pair's before and after frames
// (ComparisonSlider). A wrong path is a request for a 404 on a live page, and
// nothing in the build complains about it.
function renderedImages(): string[] {
    return Object.values(SHOWCASE_PROJECTS).flatMap((config) => [
        ...(config.arch ? [config.arch] : []),
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
