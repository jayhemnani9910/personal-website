import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { formatPostDate, getAllPosts, getAllProjects, getPost, getProject } from "./content";
import { PostSchema, ProjectSchema, calculateReadingTime } from "./definitions";

const PROJECTS_DIR = join(process.cwd(), "content", "projects");
const files = readdirSync(PROJECTS_DIR).filter((f) => f.endsWith(".mdx"));
const BLOG_DIR = join(process.cwd(), "content", "blog");
const postFiles = readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));

/** Everything after the closing frontmatter fence. */
function body(file: string): string {
  const src = readFileSync(join(PROJECTS_DIR, file), "utf8");
  const m = /^---\n[\s\S]*?\n---\n([\s\S]*)$/.exec(src);
  return m ? m[1] : "";
}

describe("project MDX bodies", () => {
  it("finds the project files", () => {
    expect(files.length).toBeGreaterThan(20);
  });

  // The route renders the body under its own section heading, and the page
  // already prints an h1 from the frontmatter title. A body that opens with a
  // level-1 heading would duplicate both. Every one of these files used to,
  // which went unnoticed because the body was parsed and thrown away.
  it.each(files)("%s does not open with a top-level heading", (file) => {
    const first = body(file).split("\n").find((l) => l.trim().length > 0) ?? "";
    expect(first.startsWith("# ")).toBe(false);
  });

  it.each(files)("%s has a non-empty body", (file) => {
    expect(body(file).trim().length).toBeGreaterThan(0);
  });
});

describe("getProject", () => {
  it("returns the body content, not just frontmatter", async () => {
    const project = await getProject("contextbox");
    expect(project).not.toBeNull();
    expect(project!.content.trim().length).toBeGreaterThan(0);
    expect(project!.title).toBeTruthy();
  });

  it("still refuses an unsafe slug", async () => {
    expect(await getProject("../../etc/passwd")).toBeNull();
    expect(await getProject("Not_Kebab")).toBeNull();
  });
});

describe("getAllProjects", () => {
  it("omits the body from list results", async () => {
    const projects = await getAllProjects();
    expect(projects.length).toBe(files.length);
    for (const p of projects) {
      expect(p).not.toHaveProperty("content");
    }
  });

  // Most projects declare no priority, so before the id tiebreak they all
  // compared equal and the order fell through to readdirSync, which is not a
  // stable contract.
  it("orders deterministically, by priority then id", async () => {
    const ids = (await getAllProjects()).map((p) => p.id);
    const again = (await getAllProjects()).map((p) => p.id);
    expect(ids).toEqual(again);

    const projects = await getAllProjects();
    const expected = [...projects].sort(
      (a, b) => (a.priority ?? 99) - (b.priority ?? 99) || a.id.localeCompare(b.id),
    );
    expect(projects.map((p) => p.id)).toEqual(expected.map((p) => p.id));
  });

  it("breaks priority ties by id", async () => {
    const projects = await getAllProjects();
    const noPriority = projects.filter((p) => p.priority === undefined).map((p) => p.id);
    expect(noPriority.length).toBeGreaterThan(1);
    expect(noPriority).toEqual([...noPriority].sort((a, b) => a.localeCompare(b)));
  });

  // A step's `component` is looked up by exact name. A typo would show the
  // stage with no component, which is the silent failure this replaced.
  it("names only components that exist on the same project", async () => {
    for (const p of await getAllProjects()) {
      const flow = p.deepDive?.dataFlow;
      const components = p.deepDive?.components;
      if (!Array.isArray(flow)) continue;
      const names = Array.isArray(components)
        ? components.map((c) => (typeof c === "string" ? c : c.name))
        : [];
      for (const step of flow) {
        if (step.component) expect(names, `${p.id}: "${step.step}"`).toContain(step.component);
      }
    }
  });
});

describe("content schemas", () => {
  const project = {
    id: "x",
    title: "X",
    summary: "s",
    role: "Builder",
    tags: [],
    tech: [],
    challenge: "c",
    solution: [],
    impact: [],
  };

  // ADR 0004: an `architecture` block (or any unknown key) must fail the parse,
  // not be dropped on the floor.
  it("rejects unknown keys at every level", () => {
    expect(ProjectSchema.safeParse(project).success).toBe(true);
    expect(ProjectSchema.safeParse({ ...project, architecture: {} }).success).toBe(false);
    expect(ProjectSchema.safeParse({ ...project, deepDive: { diagram: "x" } }).success).toBe(false);
    expect(
      ProjectSchema.safeParse({ ...project, deepDive: { components: [{ name: "a", description: "b" }] } }).success,
    ).toBe(false);
  });

  it("accepts only http(s) links", () => {
    expect(ProjectSchema.safeParse({ ...project, links: { demo: "https://example.com" } }).success).toBe(true);
    expect(ProjectSchema.safeParse({ ...project, links: { demo: "javascript:alert(1)" } }).success).toBe(false);
    expect(ProjectSchema.safeParse({ ...project, links: { demo: "example.com" } }).success).toBe(false);
  });

  // gray-matter parses an unquoted `date: 2026-10-01` into a Date.
  it("accepts a post date as a string or a Date, and normalises both", () => {
    const post = { slug: "p", title: "P", summary: "s" };
    expect(PostSchema.parse({ ...post, date: "2026-10-01" }).date).toBe("2026-10-01");
    expect(PostSchema.parse({ ...post, date: new Date("2026-10-01") }).date).toBe("2026-10-01");
    expect(PostSchema.safeParse({ ...post, date: "Oct 1" }).success).toBe(false);
  });
});

describe("blog posts", () => {
  it.each(postFiles)("%s parses", async (file) => {
    const post = await getPost(file.replace(/\.mdx$/, ""));
    expect(post?.title).toBeTruthy();
  });

  it("formats dates in UTC, whatever the build machine's zone", () => {
    expect(formatPostDate("2026-05-31")).toBe("May 31, 2026");
  });

  it("sorts newest first, same-day posts by slug", async () => {
    const posts = await getAllPosts();
    const expected = [...posts].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || a.slug.localeCompare(b.slug),
    );
    expect(posts.map((p) => p.slug)).toEqual(expected.map((p) => p.slug));
  });
});

describe("calculateReadingTime", () => {
  it("counts prose words, not markup or code", () => {
    const words = (n: number) => Array.from({ length: n }, () => "word").join(" ");
    expect(calculateReadingTime(words(200))).toBe(1);
    expect(calculateReadingTime(`\n${words(200)}\n`)).toBe(1);
    const svg = `<svg ${Array.from({ length: 300 }, (_, i) => `a${i}="1"`).join(" ")}></svg>`;
    expect(calculateReadingTime(`${words(200)}\n${svg}`)).toBe(1);
    expect(calculateReadingTime(`${words(200)}\n\`\`\`\n${words(300)}\n\`\`\``)).toBe(1);
  });
});
