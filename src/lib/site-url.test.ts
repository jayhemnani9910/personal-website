import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { describe, expect, it } from "vitest";
// Relative, not "@/...": vitest.config.mts defines no path aliases.
import { SITE_CONFIG } from "../../content/site";

// jayhemnani.me 307-redirects to www.jayhemnani.me, so the apex is never the
// host that serves a page. Every apex URL we emit is a redirect: canonical tags
// pointing at a URL that bounces, sitemap <loc> entries that all bounce, and
// agent-facing URLs in the WebMCP payloads. This drifted across 13 call sites
// before it was caught, so it is asserted rather than remembered.
const CANONICAL_HOST = "https://www.jayhemnani.me";

function walk(dir: string, out: string[] = []): string[] {
    for (const entry of readdirSync(dir)) {
        const p = join(dir, entry);
        if (statSync(p).isDirectory()) {
            if (entry === "node_modules" || entry === ".next") continue;
            walk(p, out);
        } else if ([".ts", ".tsx", ".mdx", ".txt"].includes(extname(p))) {
            out.push(p);
        }
    }
    return out;
}

describe("canonical host", () => {
    it("SITE_CONFIG.url is the www host that actually serves the site", () => {
        expect(SITE_CONFIG.url).toBe(CANONICAL_HOST);
    });

    it("no source or content file emits a bare apex URL", () => {
        const roots = ["src", "content", "public"].map((d) => join(process.cwd(), d));
        const offenders: string[] = [];

        for (const root of roots) {
            for (const file of walk(root)) {
                // This test file necessarily contains the string it forbids.
                if (file.endsWith("site-url.test.ts")) continue;
                const text = readFileSync(file, "utf8");
                for (const [i, line] of text.split("\n").entries()) {
                    // An apex URL is https://jayhemnani.me not preceded by "www.".
                    if (/https:\/\/jayhemnani\.me/.test(line)) {
                        offenders.push(`${file.replace(process.cwd() + "/", "")}:${i + 1}`);
                    }
                }
            }
        }

        expect(offenders).toEqual([]);
    });
});
