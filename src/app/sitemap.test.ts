import { readdirSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { describe, expect, it } from "vitest";
import sitemap from "./sitemap";
import { getAllPosts, getAllProjects } from "@/lib/content";
import { SITE_CONFIG } from "@/../content/site";

// The static routes in sitemap.ts are listed by hand, so a new page is easy to
// leave out. This walks src/app for every page.tsx outside a dynamic segment
// and checks each one is listed, along with every project and post.
function staticPageRoutes(dir: string, root = dir): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.isDirectory()) return e.name.startsWith("[") ? [] : staticPageRoutes(join(dir, e.name), root);
    if (e.name !== "page.tsx") return [];
    const route = relative(root, dir).split(sep).join("/");
    return [route ? `/${route}` : ""];
  });
}

describe("sitemap", () => {
  it("lists every static page, project and post, and nothing twice", async () => {
    const urls = (await sitemap()).map((e) => e.url);
    const expected = [
      ...staticPageRoutes(join(process.cwd(), "src/app")),
      ...(await getAllProjects()).map((p) => `/projects/${p.id}`),
      ...(await getAllPosts()).map((p) => `/blog/${p.slug}`),
    ].map((path) => `${SITE_CONFIG.url}${path}`);
    expect([...urls].sort()).toEqual([...expected].sort());
    expect(new Set(urls).size).toBe(urls.length);
  });
});
