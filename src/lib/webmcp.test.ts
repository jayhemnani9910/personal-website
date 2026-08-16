import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { WEBMCP_TOOL_COUNT, WEBMCP_TOOL_NAMES } from "./webmcp";

// Parses the real webmcp.ts, in the same spirit as tokens.test.ts parsing the
// real globals.css. WEBMCP_TOOL_NAMES is hand-written but drives unregistration
// and every tool count shown in the UI, so it has to match the registerTool
// calls it claims to describe. Without this the array can drift and the only
// symptom is tools that never get cleaned up.
const source = readFileSync(join(process.cwd(), "src/lib/webmcp.ts"), "utf8");

describe("WebMCP tool registry", () => {
    it("lists exactly as many tools as it registers", () => {
        const calls = source.match(/mc\.registerTool\(\{/g) ?? [];
        expect(calls).toHaveLength(WEBMCP_TOOL_COUNT);
    });

    it("lists the same tool names it registers, in order", () => {
        // The `name:` immediately following each registerTool call.
        const registered = [...source.matchAll(/mc\.registerTool\(\{\s*name:\s*"([^"]+)"/g)].map(
            (m) => m[1]
        );
        expect(registered).toEqual([...WEBMCP_TOOL_NAMES]);
    });

    it("has no duplicate names", () => {
        expect(new Set(WEBMCP_TOOL_NAMES).size).toBe(WEBMCP_TOOL_COUNT);
    });

    // The MDX is content, not code, so it cannot import the constant. It still
    // states a tool count in prose, and a wrong number there is as visible to a
    // reader as a wrong number in the masthead. Catch it here instead.
    it("keeps the project MDX's stated tool count in step", () => {
        const mdx = readFileSync(
            join(process.cwd(), "content/projects/webmcp-portfolio.mdx"),
            "utf8"
        );
        const counts = [...mdx.matchAll(/(\d+) tools\b/g)].map((m) => Number(m[1]));
        expect(counts.length).toBeGreaterThan(0);
        for (const n of counts) expect(n).toBe(WEBMCP_TOOL_COUNT);
    });
});
