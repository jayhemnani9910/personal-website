import { getAllProjects } from "@/lib/content";
import { RESUME } from "@/data/resume";
import { SITE_CONFIG } from "@/../content/site";
import { LAB_EXPERIMENTS } from "@/data/lab";
import { FEATURED } from "@/data/home";
import type { SiteData } from "@/lib/webmcp";

const FEATURED_IDS = new Set(FEATURED.map((f) => f.id));

/**
 * Everything the WebMCP tools answer from, built at build time. Served as a
 * static JSON file (src/app/site-data.json) and fetched only by a browser that
 * has the WebMCP API, rather than inlined into every page's HTML.
 */
export async function buildSiteData(): Promise<SiteData> {
  const projects = await getAllProjects();

  return {
    siteUrl: SITE_CONFIG.url,
    projects: projects.map((p) => ({
      id: p.id,
      title: p.title,
      summary: p.summary,
      role: p.role,
      period: p.period,
      domain: p.domain,
      tags: p.tags,
      tech: p.tech,
      // The home page's six are the one featured list (not an MDX flag).
      featured: FEATURED_IDS.has(p.id),
      priority: p.priority,
      github: p.github,
      challenge: p.challenge,
      solution: p.solution,
      impact: p.impact,
    })),
    resume: {
      name: RESUME.name,
      tagline: RESUME.tagline,
      summary: RESUME.summary,
      location: RESUME.location,
      contact: RESUME.contact,
      coreCompetencies: RESUME.coreCompetencies,
      skills: RESUME.skills,
      experience: RESUME.experience.map((e) => ({
        name: e.name,
        location: e.location,
        roles: e.roles.map((r) => ({
          title: r.title,
          employmentType: r.employmentType,
          period: r.period ? { label: r.period.label } : undefined,
          location: r.location,
          tech: r.tech,
          bullets: r.bullets,
        })),
      })),
      education: RESUME.education.map((e) => ({
        institution: e.institution,
        degree: e.degree,
        location: e.location,
        start: e.start,
        end: e.end,
        gpa: e.gpa,
      })),
      publications: RESUME.publications.map((p) => ({
        title: p.title,
        venue: p.venue,
        year: p.year,
        description: p.description,
        link: p.link,
      })),
    },
    social: SITE_CONFIG.social,
    experiments: LAB_EXPERIMENTS,
  };
}
