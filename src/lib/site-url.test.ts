import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, extname } from "node:path";
import { describe, expect, it } from "vitest";
// Relative, not "@/...": content/ sits outside src/, the only folder "@" maps.
import { SITE_CONFIG } from "../../content/site";

// www.jayhemnani.in redirects to the apex jayhemnani.in, so the www host is
// never the one that serves a page. Every www URL we emit is a redirect:
// canonical tags pointing at a URL that bounces, sitemap <loc> entries that all
// bounce, and agent-facing URLs in the WebMCP payloads. This drifted across 13
// call sites before it was caught, so it is asserted rather than remembered.
// The apex/www roles are the reverse of what they were on the old .me domain.
const CANONICAL_HOST = "https://jayhemnani.in";

// Any host but the canonical one: the www host, the http:// forms of the site,
// and the old jayhemnani.me domain, which expired on 2026-08-24, so a stray
// link to it can land on a page someone else now owns.
const STRAY_HOST = /https:\/\/www\.jayhemnani\.in|http:\/\/(?:www\.)?jayhemnani\.in|jayhemnani\.me\b/;

// Every text file the repo tracks or would track. Asking git rather than
// walking the tree leaves out everything .gitignore does: node_modules, .next,
// .claude, .audit, graphify-out and the local TODO-*.md notes.
function textFiles(): string[] {
    return execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], { encoding: "utf8" })
        .split("\n")
        .filter((f) => [".ts", ".tsx", ".mdx", ".md", ".txt", ".json", ".css"].includes(extname(f)))
        .map((f) => join(process.cwd(), f))
        .filter((f) => existsSync(f)); // a tracked file deleted but not yet staged
}

describe("canonical host", () => {
    it("SITE_CONFIG.url is the apex host that actually serves the site", () => {
        expect(SITE_CONFIG.url).toBe(CANONICAL_HOST);
    });

    it("no file links the site on any host but the canonical one", () => {
        const files = textFiles();
        const offenders: string[] = [];

        // Guards the scan itself: an empty listing would pass vacuously.
        expect(files).toContain(join(process.cwd(), "src/data/youtube.json"));

        for (const file of files) {
            // This test file necessarily contains the string it forbids.
            if (file.endsWith("site-url.test.ts")) continue;
            const text = readFileSync(file, "utf8");
            for (const [i, line] of text.split("\n").entries()) {
                if (STRAY_HOST.test(line)) {
                    offenders.push(`${file.replace(process.cwd() + "/", "")}:${i + 1}`);
                }
            }
        }

        expect(offenders).toEqual([]);
    });
});
