import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { getAllProjects, getProject } from "./content";

const PROJECTS_DIR = join(process.cwd(), "content", "projects");
const files = readdirSync(PROJECTS_DIR).filter((f) => f.endsWith(".mdx"));

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
});
