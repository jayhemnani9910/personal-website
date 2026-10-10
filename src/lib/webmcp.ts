/**
 * WebMCP integration: the tools this site offers to an AI agent running in the
 * visitor's browser, through the WebMCP API (document.modelContext).
 *
 * The API is a W3C Web Machine Learning Community Group draft, behind
 * chrome://flags/#enable-webmcp-testing in Chrome. Its shape changed while it
 * was being drafted: tools take an `execute` callback, `registerTool` returns a
 * promise, and a tool is removed by aborting the AbortSignal it was registered
 * with (provideContext, clearContext and unregisterTool are gone). This file
 * follows the current draft and the Chrome docs.
 * @see https://github.com/webmachinelearning/webmcp
 */

import { WEBMCP_TOOLS } from "@/lib/webmcp-tools";
import { setReaderMode } from "@/lib/reader-mode";

export interface ModelContextTool {
  name: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => Promise<unknown>;
  annotations?: { readOnlyHint?: boolean };
}

interface ModelContext {
  registerTool(tool: ModelContextTool, options?: { signal?: AbortSignal }): Promise<void>;
}

declare global {
  interface Document {
    modelContext?: ModelContext;
  }
}

export interface ProjectData {
  id: string;
  title: string;
  summary: string;
  role: string;
  period?: string;
  domain?: string;
  tags: string[];
  tech: string[];
  featured?: boolean;
  priority?: number;
  github?: string;
  challenge: string;
  solution: string[];
  impact: string[];
}

export interface ResumeData {
  name: string;
  tagline: string;
  summary: string;
  location?: string;
  contact: { email: string; github: string; linkedin?: string };
  coreCompetencies: string[];
  skills: { category: string; items: { name: string }[] }[];
  experience: {
    name: string;
    location?: string;
    roles: {
      title: string;
      employmentType?: string;
      period?: { label?: string };
      location?: string;
      tech?: string[];
      bullets: { text: string }[];
    }[];
  }[];
  education: {
    institution: string;
    degree: string;
    location?: string;
    start?: string;
    end?: string;
    gpa?: string;
  }[];
  publications: { title: string; venue?: string; year?: string; description?: string; link?: string }[];
}

export interface SiteData {
  /** The origin every URL handed to an agent is built from (SITE_CONFIG.url). */
  siteUrl: string;
  projects: ProjectData[];
  resume: ResumeData;
  social: Record<string, string>;
  experiments: { id: string; title: string; description: string; tags: string[]; progress?: number }[];
}


const READ_ONLY = new Set<string>(WEBMCP_TOOLS.filter((t) => t.kind === "read").map((t) => t.name));

/** A text argument, lowercased. An agent can send any type, so a non-string is ignored. */
const lower = (v: unknown) => (typeof v === "string" ? v.toLowerCase() : undefined);

/**
 * The site's tools, in the registry's order. Pure: nothing touches the browser
 * until an agent calls `execute`, so tests can build and run them directly.
 */
export function buildTools(data: SiteData): ModelContextTool[] {
  const url = (path: string) => `${data.siteUrl}${path}`;
  const tools: ModelContextTool[] = [];

  // Tool 1: Search projects
  tools.push({
    name: "search_projects",
    description: `Search the ${data.projects.length} projects on Jay Hemnani's portfolio (${data.siteUrl}) by query text, technology, tags, or domain. Returns matching projects with summaries.`,
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Free-text search across title, summary, and tech stack" },
        // Examples must be values that actually match something, or an agent
        // burns a call on a filter that returns nothing. Checked against
        // content/projects/*.mdx.
        tech: { type: "string", description: "Filter by technology (e.g. 'Python', 'Docker', 'FastAPI')" },
        tag: { type: "string", description: "Filter by tag (e.g. 'research', 'agents', 'distributed-systems')" },
        domain: { type: "string", description: "Filter by domain (e.g. 'AI/ML', 'Computer Vision')" },
        featured_only: { type: "boolean", description: "Only return featured projects" },
      },
    },
    execute: async (args) => {
      let results = [...data.projects];
      const q = lower(args.query);
      const tech = lower(args.tech);
      const tag = lower(args.tag);
      const domain = lower(args.domain);

      if (q) {
        results = results.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.summary.toLowerCase().includes(q) ||
            p.tech.some((t) => t.toLowerCase().includes(q))
        );
      }
      if (tech) {
        results = results.filter((p) => p.tech.some((t) => t.toLowerCase().includes(tech)));
      }
      if (tag) {
        results = results.filter((p) => p.tags.some((t) => t.toLowerCase().includes(tag)));
      }
      if (domain) {
        results = results.filter((p) => p.domain?.toLowerCase().includes(domain));
      }
      if (args.featured_only) {
        results = results.filter((p) => p.featured);
      }

      return {
        count: results.length,
        projects: results.map((p) => ({
          id: p.id,
          title: p.title,
          summary: p.summary,
          tech: p.tech,
          tags: p.tags,
          domain: p.domain,
          url: url(`/projects/${p.id}`),
        })),
      };
    },
  });

  // Tool 2: Get project details
  tools.push({
    name: "get_project",
    description: "Get full details of a specific project by its ID, including challenge, solution, impact, and tech stack.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Project ID (slug), e.g. 'contextbox', 'fifa-soccer-ds'" },
      },
      required: ["id"],
    },
    execute: async (args) => {
      const project = data.projects.find((p) => p.id === args.id);
      if (!project) {
        return { error: `Project '${args.id}' not found. Use search_projects to find available projects.` };
      }
      return {
        ...project,
        url: url(`/projects/${project.id}`),
        github: project.github || null,
      };
    },
  });

  // Tool 3: Get resume
  tools.push({
    name: "get_resume",
    description: "Get Jay's resume data: experience, education, publications, skills, and core competencies.",
    inputSchema: {
      type: "object",
      properties: {
        section: {
          type: "string",
          enum: ["all", "experience", "education", "publications", "skills", "competencies", "contact"],
          description: "Which section to return (default: all)",
        },
      },
    },
    execute: async (args) => {
      const section = (args.section as string) || "all";
      const r = data.resume;

      switch (section) {
        case "experience":
          return { experience: r.experience };
        case "education":
          return { education: r.education };
        case "publications":
          return { publications: r.publications };
        case "skills":
          return { skills: r.skills };
        case "competencies":
          return { competencies: r.coreCompetencies };
        case "contact":
          return { name: r.name, location: r.location, contact: r.contact };
        default:
          return {
            name: r.name,
            tagline: r.tagline,
            summary: r.summary,
            location: r.location,
            contact: r.contact,
            skills: r.skills,
            experience: r.experience,
            education: r.education,
            publications: r.publications,
            competencies: r.coreCompetencies,
          };
      }
    },
  });

  // Tool 4: Search skills
  tools.push({
    name: "search_skills",
    description: "Search Jay's technical skills by category or keyword.",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: `Skill category: ${data.resume.skills.map((s) => s.category).join(", ")}`,
        },
        query: { type: "string", description: "Search for a specific skill by name" },
      },
    },
    execute: async (args) => {
      const cat = lower(args.category);
      const q = lower(args.query);
      let skills = data.resume.skills;

      if (cat) {
        skills = skills.filter((s) => s.category.toLowerCase().includes(cat));
      }
      if (q) {
        skills = skills
          .map((s) => ({
            ...s,
            items: s.items.filter((i) => i.name.toLowerCase().includes(q)),
          }))
          .filter((s) => s.items.length > 0);
      }

      return { skills };
    },
  });

  // Tool 5: Get contact info
  tools.push({
    name: "get_contact",
    description: "Get Jay's contact information and social links.",
    inputSchema: { type: "object", properties: {} },
    execute: async () => {
      return {
        name: data.resume.name,
        email: data.resume.contact.email,
        social: data.social,
        website: data.siteUrl,
      };
    },
  });

  // Tool 6: List experiments
  tools.push({
    name: "list_experiments",
    description: "List what Jay is currently building, exploring, or watching in the lab.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search experiments by title or tags" },
      },
    },
    execute: async (args) => {
      let experiments = [...data.experiments];
      const q = lower(args.query);

      if (q) {
        experiments = experiments.filter(
          (e) =>
            e.title.toLowerCase().includes(q) ||
            e.description.toLowerCase().includes(q) ||
            e.tags.some((t) => t.toLowerCase().includes(q))
        );
      }

      return { count: experiments.length, experiments };
    },
  });

  // Tool 7: Toggle reader mode
  tools.push({
    name: "switch_mode",
    description:
      "Toggle reader mode: a calm, high-readability view that turns off the site's motion (smooth scroll, the home page's falling tiles, hover tilts). Use 'reader' for the accessible reading view, 'default' to restore the full experience. Applies immediately, no reload.",
    inputSchema: {
      type: "object",
      properties: {
        mode: {
          type: "string",
          enum: ["reader", "default"],
          description: "'reader' for the calm, motion-free reading view; 'default' for the full site",
        },
      },
      required: ["mode"],
    },
    execute: async (args) => {
      const on = (args.mode as string) === "reader";
      setReaderMode(on);

      return {
        mode: on ? "reader" : "default",
        reader: on,
        description: on
          ? "Reader mode on: motion disabled for a calm reading view."
          : "Reader mode off: the full site is restored.",
      };
    },
  });

  for (const tool of tools) {
    if (READ_ONLY.has(tool.name)) tool.annotations = { readOnlyHint: true };
  }
  return tools;
}

/**
 * Register every tool. Each registration is awaited separately and a failure
 * only drops that tool: the API is experimental, so nothing here may throw
 * into the page. Aborting `signal` unregisters them all.
 */
export async function registerWebMCPTools(data: SiteData, signal: AbortSignal): Promise<void> {
  const mc = document.modelContext;
  if (!mc) return;
  await Promise.all(
    buildTools(data).map((tool) =>
      Promise.resolve()
        .then(() => mc.registerTool(tool, { signal }))
        .catch((err) => console.warn(`[webmcp] could not register ${tool.name}:`, err instanceof Error ? err.message : err)),
    ),
  );
}
