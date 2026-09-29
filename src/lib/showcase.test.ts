import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

// A showcase hero is rendered through next/image with
// `priority`, so a wrong path is an eager request for a 404 in the LCP slot and
// nothing in the build complains.
//
// This reads src/lib/showcase.ts as text rather than importing it, for two
// reasons: showcase.ts imports "@/lib/webmcp" and vitest has no "@" alias
// configured, and reading the file is the pattern tokens.test.ts already uses
// against the real globals.css. Text parsing also gives the property this test
// needs: a commented-out `// hero:` line is genuinely disabled and must not be
// asserted, which is exactly the distinction a naive grep gets wrong.
const SRC = path.join(process.cwd(), "src", "lib", "showcase.ts");

function enabledHeroes(): string[] {
    return readFileSync(SRC, "utf8")
        .split("\n")
        .map((line) => line.match(/^\s*hero:\s*"([^"]+)"/)?.[1])
        .filter((p): p is string => Boolean(p));
}

describe("showcase hero assets", () => {
    const heroes = enabledHeroes();

    it("finds the enabled hero paths", () => {
        expect(heroes.length).toBeGreaterThan(0);
    });

    it.each(heroes)("%s resolves to a file in public/", (hero) => {
        expect(existsSync(path.join(process.cwd(), "public", hero.replace(/^\//, "")))).toBe(true);
    });
});

describe("showcase WebMCP tools table", () => {
    it("lists exactly the tools the site registers, in order, with the same kinds", async () => {
        const { SHOWCASE_PROJECTS } = await import("@/lib/showcase");
        const { WEBMCP_TOOLS } = await import("@/lib/webmcp-tools");
        const demo = SHOWCASE_PROJECTS["webmcp-portfolio"]?.demo;
        expect(demo?.kind).toBe("tools");
        const rows = demo && demo.kind === "tools" ? demo.tools : [];
        expect(rows.map((r) => [r.name, r.kind])).toEqual(WEBMCP_TOOLS.map((t) => [t.name, t.kind]));
    });
});
