import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { ProjectSchema, PostSchema, Project, Post, calculateReadingTime } from "./definitions";

// Only the fields the /projects list reads: this is its whole client payload.
export type ProjectSummary = Pick<Project, "id" | "title" | "summary" | "period" | "domain" | "tech">;

const CONTENT_DIR = path.join(process.cwd(), "content");

// Content slugs are kebab-case filenames. Reject anything else so a slug can
// never be used to build a path outside the content dir (e.g. via "../").
const isSafeSlug = (slug: string): boolean => /^[a-z0-9-]+$/.test(slug);

/**
 * Every .mdx in a content dir, loaded, with the body dropped. List views never
 * render the body, and carrying it would ship every item's prose into the
 * payload of every list page.
 */
async function loadAllWithoutContent<T extends { content: string }>(
    dir: string,
    load: (slug: string) => Promise<T | null>,
): Promise<Omit<T, "content">[]> {
    if (!fs.existsSync(dir)) {
        return [];
    }

    const filenames = fs.readdirSync(dir);
    const items: (Omit<T, "content"> | null)[] = await Promise.all(
        filenames
            .filter((name) => name.endsWith(".mdx"))
            .map(async (name): Promise<Omit<T, "content"> | null> => {
                const item = await load(name.replace(/\.mdx$/, ""));
                if (!item) return null;
                const { content, ...meta } = item;
                void content; // explicit omit to satisfy lint
                return meta;
            })
    );
    return items.filter((i): i is Omit<T, "content"> => i !== null);
}

// ============================================================================
// PROJECT CONTENT
// ============================================================================

export interface ProjectWithContent extends Project {
    /**
     * The MDX body: a short overview of the project in prose.
     *
     * This used to be read and thrown away. `matter()` was destructured as
     * `{ data }` only, so twenty-eight files' worth of overview text was
     * written, reviewed and maintained without ever reaching a page. It is
     * rendered now, by the project route, above the numbered sections.
     */
    content: string;
}

let projectIds: ReadonlySet<string> | null = null;

/**
 * The ids of every project page, from the file names alone (no parsing), read
 * once per server instance. /api/views uses it so only real projects can get a
 * counter: any other well-formed slug used to create a permanent Redis key.
 */
export function getProjectIds(): ReadonlySet<string> {
    projectIds ??= new Set(
        fs
            .readdirSync(path.join(CONTENT_DIR, "projects"))
            .filter((f) => f.endsWith(".mdx"))
            .map((f) => f.replace(/\.mdx$/, "")),
    );
    return projectIds;
}

export async function getProject(slug: string): Promise<ProjectWithContent | null> {
    if (!isSafeSlug(slug)) return null;
    const fullPath = path.join(CONTENT_DIR, "projects", `${slug}.mdx`);

    if (!fs.existsSync(fullPath)) {
        return null;
    }

    const fileContents = await fs.promises.readFile(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    // Invalid frontmatter throws, so the build fails on it. Returning null
    // would drop the project from every list and 404 its page, quietly.
    const result = ProjectSchema.safeParse({ ...data, id: slug });

    if (!result.success) {
        throw new Error(`Invalid frontmatter for project ${slug}: ${result.error.message}`);
    }

    return { ...result.data, content };
}

export async function getAllProjects(): Promise<Project[]> {
    const projects = await loadAllWithoutContent(path.join(CONTENT_DIR, "projects"), getProject);

    // Sorted by priority, then by id. Most projects declare no priority, so
    // without the tiebreak they all compare equal and Array.sort leaves them in
    // readdirSync order, which the filesystem does not promise to keep stable.
    // The grid could therefore come out in a different order on a different
    // machine, or after an unrelated file was touched.
    return projects.sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99) || a.id.localeCompare(b.id));
}

export async function getProjectSummaries(): Promise<ProjectSummary[]> {
    const projects = await getAllProjects();
    return projects.map((p) => ({
        id: p.id,
        title: p.title,
        summary: p.summary,
        period: p.period,
        domain: p.domain,
        tech: p.tech,
    }));
}

// ============================================================================
// BLOG POST CONTENT
// ============================================================================

export interface PostWithContent extends Post {
    content: string;
}

export async function getPost(slug: string): Promise<PostWithContent | null> {
    if (!isSafeSlug(slug)) return null;
    const fullPath = path.join(CONTENT_DIR, "blog", `${slug}.mdx`);

    if (!fs.existsSync(fullPath)) {
        return null;
    }

    const fileContents = await fs.promises.readFile(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    // Calculate reading time if not provided
    const readingTime = data.readingTime ?? calculateReadingTime(content);

    // Throws for the same reason as getProject: a post that fails the schema
    // must fail the build, not disappear from /blog and the sitemap.
    const result = PostSchema.safeParse({ ...data, slug, readingTime });

    if (!result.success) {
        throw new Error(`Invalid frontmatter for post ${slug}: ${result.error.message}`);
    }

    // Drafts are previewable in dev but not publicly reachable in production.
    if (result.data.draft && process.env.NODE_ENV === "production") {
        return null;
    }

    return { ...result.data, content };
}

export async function getAllPosts(): Promise<Post[]> {
    const posts = await loadAllWithoutContent(path.join(CONTENT_DIR, "blog"), getPost);

    // Newest first; the slug tiebreak keeps same-day posts in a fixed order
    // (see the project sort above).
    return posts
        .filter((p) => !p.draft)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || a.slug.localeCompare(b.slug));
}

/** A post's YYYY-MM-DD date for display. UTC, so a build machine west of UTC
 * cannot print the day before. */
export function formatPostDate(date: string): string {
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
    });
}
