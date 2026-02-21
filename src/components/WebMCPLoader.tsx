import { getAllProjects } from "@/lib/content";
import { RESUME } from "@/data/resume";
import { SITE_CONFIG } from "@/../content/site";
import { LAB_EXPERIMENTS } from "@/data/lab";
import { WebMCPProvider } from "./WebMCPProvider";
import type { SiteData } from "@/lib/webmcp";

/**
 * Server component that loads site data at build time
 * and passes it to the WebMCPProvider client component.
 */
export async function WebMCPLoader() {
  const projects = await getAllProjects();

  const data: SiteData = {
    projects: projects.map((p) => ({
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
    },
    social: SITE_CONFIG.social,
    experiments: LAB_EXPERIMENTS,
  };

  return <WebMCPProvider data={data} />;
}
