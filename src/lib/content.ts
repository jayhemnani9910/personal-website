import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { ProjectSchema, PostSchema, Project, Post, calculateReadingTime } from "./definitions";

export type ProjectSummary = Pick<Project, "id" | "title" | "summary" | "role" | "period" | "domain" | "tags" | "tech" | "featured" | "priority" | "github" | "links">;

const CONTENT_DIR = path.join(process.cwd(), "content");

// Content slugs are kebab-case filenames. Reject anything else so a slug can
// never be used to build a path outside the content dir (e.g. via "../").
const isSafeSlug = (slug: string): boolean => /^[a-z0-9-]+$/.test(slug);

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

export async function getProject(slug: string): Promise<ProjectWithContent | null> {
    if (!isSafeSlug(slug)) return null;
    const fullPath = path.join(CONTENT_DIR, "projects", `${slug}.mdx`);

    if (!fs.existsSync(fullPath)) {
        return null;
    }

    const fileContents = await fs.promises.readFile(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    // Validate frontmatter
    const result = ProjectSchema.safeParse({ ...data, id: slug });

    if (!result.success) {
        console.error(`Invalid frontmatter for project ${slug}:`, result.error);
        return null;
    }

    return { ...result.data, content };
}

export async function getAllProjects(): Promise<Project[]> {
    const projectsDir = path.join(CONTENT_DIR, "projects");

    if (!fs.existsSync(projectsDir)) {
        return [];
    }

    const filenames = fs.readdirSync(projectsDir);
    const projects = await Promise.all(
        filenames
            .filter((name) => name.endsWith(".mdx"))
            .map(async (name) => {
                const slug = name.replace(/\.mdx$/, "");
                const project = await getProject(slug);
                // List views never render the body, and carrying it would ship
                // every project's prose into the payload of every grid page.
                if (project) {
                    const { content, ...meta } = project;
                    void content; // explicit omit to satisfy lint
                    return meta;
                }
                return null;
            })
    );

    // Sorted by priority, then by id. Most projects declare no priority, so
    // without the tiebreak they all compare equal and Array.sort leaves them in
    // readdirSync order, which the filesystem does not promise to keep stable.
    // The grid could therefore come out in a different order on a different
    // machine, or after an unrelated file was touched.
    return projects
        .filter((p): p is Project => p !== null)
        .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99) || a.id.localeCompare(b.id));
}

export async function getProjectSummaries(): Promise<ProjectSummary[]> {
    const projects = await getAllProjects();
    return projects.map((p) => ({
        id: p.id,
        title: p.title,
        summary: p.summary,
        role: p.role,
        period: p.period,
        domain: p.domain,
        tags: p.tags,
        tech: p.tech,
        featured: p.featured,
        priority: p.priority,
        github: p.github,
        links: p.links,
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

    // Validate frontmatter
    const result = PostSchema.safeParse({ ...data, slug, readingTime });

    if (!result.success) {
        console.error(`Invalid frontmatter for post ${slug}:`, result.error);
        return null;
    }

    // Drafts are previewable in dev but not publicly reachable in production.
    if (result.data.draft && process.env.NODE_ENV === "production") {
        return null;
    }

    return { ...result.data, content };
}

export async function getAllPosts(): Promise<Post[]> {
    const postsDir = path.join(CONTENT_DIR, "blog");
    type PostListItem = Omit<PostWithContent, "content">;

    if (!fs.existsSync(postsDir)) {
        return [];
    }

    const filenames = fs.readdirSync(postsDir);
    const posts = await Promise.all(
        filenames
            .filter((name) => name.endsWith(".mdx"))
            .map(async (name) => {
                const slug = name.replace(/\.mdx$/, "");
                const post = await getPost(slug);
                // Return without content for list views
                if (post) {
                    const { content, ...postMeta } = post;
                    void content; // explicit omit to satisfy lint
                    return postMeta;
                }
                return null;
            })
    );

    return posts
        .filter((p): p is PostListItem => p !== null && !p.draft)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
