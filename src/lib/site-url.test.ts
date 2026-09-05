import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { describe, expect, it } from "vitest";
// Relative, not "@/...": vitest.config.mts defines no path aliases.
import { SITE_CONFIG } from "../../content/site";

// www.jayhemnani.in redirects to the apex jayhemnani.in, so the www host is
// never the one that serves a page. Every www URL we emit is a redirect:
// canonical tags pointing at a URL that bounces, sitemap <loc> entries that all
// bounce, and agent-facing URLs in the WebMCP payloads. This drifted across 13
// call sites before it was caught, so it is asserted rather than remembered.
// The apex/www roles are the reverse of what they were on the old .me domain.
const CANONICAL_HOST = "https://jayhemnani.in";

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
    it("SITE_CONFIG.url is the apex host that actually serves the site", () => {
        expect(SITE_CONFIG.url).toBe(CANONICAL_HOST);
    });

    it("no source or content file emits a www URL", () => {
        const roots = ["src", "content", "public"].map((d) => join(process.cwd(), d));
        const offenders: string[] = [];

        for (const root of roots) {
            for (const file of walk(root)) {
                // This test file necessarily contains the string it forbids.
                if (file.endsWith("site-url.test.ts")) continue;
                const text = readFileSync(file, "utf8");
                for (const [i, line] of text.split("\n").entries()) {
                    // A www URL is the redirecting host, never the canonical one.
                    if (/https:\/\/www\.jayhemnani\.in/.test(line)) {
                        offenders.push(`${file.replace(process.cwd() + "/", "")}:${i + 1}`);
                    }
                }
            }
        }

        expect(offenders).toEqual([]);
    });
});
