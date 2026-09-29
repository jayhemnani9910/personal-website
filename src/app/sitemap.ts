import { MetadataRoute } from "next";
import { getAllProjects, getAllPosts } from "@/lib/content";
import { SITE_CONFIG } from "@/../content/site";

// Built once at build time rather than per request. This is not a static
// export (the app has live API routes); the sitemap simply has no reason to be
// recomputed on demand.
export const dynamic = "force-static";

/**
 * Dynamic sitemap generation for SEO
 *
 * Only posts carry a real date (their frontmatter `date`), so only posts and
 * the blog index say when they changed. File mtimes are no substitute: git
 * keeps none, so on a Vercel build every file is as new as the checkout and
 * every URL would claim to have changed at the last deploy.
 * https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url;
  const projects = await getAllProjects();
  const posts = await getAllPosts();
  const newestPost = posts.map((p) => p.date).sort().at(-1);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "monthly", priority: 1 },
    { url: `${baseUrl}/projects`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/fde`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/resume`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/lab`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/youtube`, changeFrequency: "weekly", priority: 0.6 },
  ];

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${baseUrl}/projects/${project.id}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const blogRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/blog`,
      lastModified: newestPost ? new Date(newestPost) : undefined,
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
