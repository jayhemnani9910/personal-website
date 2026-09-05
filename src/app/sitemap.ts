import fs from "node:fs";
import path from "node:path";
import { MetadataRoute } from "next";
import { getAllProjects, getAllPosts } from "@/lib/content";

// Built once at build time rather than per request. This is not a static
// export (the app has live API routes); the sitemap simply has no reason to be
// recomputed on demand.
export const dynamic = "force-static";

const CONTENT_DIR = path.join(process.cwd(), "content");

/**
 * Last modification time of the file behind a route.
 *
 * Every entry used to carry `new Date()`, so a deploy that changed one blog post
 * told crawlers all thirty-odd URLs had just changed. Repeated often enough that
 * is a reason to stop trusting the field.
 */
function mtime(...segments: string[]): Date | undefined {
  try {
    return fs.statSync(path.join(CONTENT_DIR, ...segments)).mtime;
  } catch {
    return undefined;
  }
}

/** Newest content change, for the index pages whose content is the collection. */
function newestMtime(dir: string): Date | undefined {
  try {
    const times = fs
      .readdirSync(path.join(CONTENT_DIR, dir))
      .filter((f) => f.endsWith(".mdx"))
      .map((f) => fs.statSync(path.join(CONTENT_DIR, dir, f)).mtime.getTime());
    return times.length ? new Date(Math.max(...times)) : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Dynamic sitemap generation for SEO
 * 
 * Generates sitemap.xml at build time with all routes.
 * https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://jayhemnani.in";
  const newestProject = newestMtime("projects");
  const newestPost = newestMtime("blog");
  const newestAny = [newestProject, newestPost]
    .filter((d): d is Date => d instanceof Date)
    .sort((a, b) => b.getTime() - a.getTime())[0];
  
  // Get all projects for dynamic routes
  const projects = await getAllProjects();
  
  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: newestAny,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: newestProject,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/fde`,
      lastModified: newestAny,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/resume`,
      lastModified: newestAny,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/lab`,
      lastModified: newestAny,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/youtube`,
      lastModified: newestAny,
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];
  
  // Project pages
  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${baseUrl}/projects/${project.id}`,
    lastModified: mtime("projects", `${project.id}.mdx`),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));
  
  // Get all blog posts
  const posts = await getAllPosts();
  
  // Blog pages
  const blogRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/blog`,
      lastModified: newestPost,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
  
  return [...staticRoutes, ...projectRoutes, ...blogRoutes];
}

