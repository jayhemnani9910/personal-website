/**
 * WebMCP Integration
 *
 * Exposes structured tools via the W3C WebMCP API (navigator.modelContext)
 * so AI agents can query portfolio data, search projects, and interact
 * with the site programmatically.
 *
 * Chrome 146+ with WebMCP flag enabled required.
 * @see https://webmcp.dev
 */

// Extend Navigator for WebMCP API (Chrome 146 Canary)
declare global {
  interface Navigator {
    modelContext?: {
      registerTool(config: {
        name: string;
        description: string;
        inputSchema: Record<string, unknown>;
        handler: (args: Record<string, unknown>) => Promise<unknown>;
      }): void;
      unregisterTool(name: string): void;
      provideContext(config: {
        name: string;
        description: string;
        content: string;
      }): void;
      clearContext(name: string): void;
    };
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
}

export interface SiteData {
  projects: ProjectData[];
  resume: ResumeData;
  social: Record<string, string>;
  experiments: { id: string; title: string; description: string; tags: string[]; progress?: number }[];
}

/** Check if WebMCP is available in the browser */
export function isWebMCPAvailable(): boolean {
  return typeof navigator !== "undefined" && "modelContext" in navigator && navigator.modelContext !== undefined;
}

/** Register all portfolio tools with WebMCP */
export function registerWebMCPTools(data: SiteData): void {
  const mc = navigator.modelContext;
  if (!mc) return;

  // Provide site context
  mc.provideContext({
    name: "site_info",
    description: "Jay Hemnani's portfolio website — a Data Engineer's personal site",
    content: `This is Jay Hemnani's portfolio at jayhemnani.me. Jay is a Data Engineer with experience in ML/AI, full-stack development, and data pipelines. The site showcases ${data.projects.length} projects across domains like sports analytics, computer vision, distributed systems, and more.`,
  });

  // Tool 1: Search projects
  mc.registerTool({
    name: "search_projects",
    description: "Search Jay's projects by query text, technology, tags, or domain. Returns matching projects with summaries.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Free-text search across title, summary, and tech stack" },
        tech: { type: "string", description: "Filter by technology (e.g. 'Python', 'React', 'FAISS')" },
        tag: { type: "string", description: "Filter by tag (e.g. 'analytics', 'ml', 'sports')" },
        domain: { type: "string", description: "Filter by domain (e.g. 'Sports analytics', 'Computer vision')" },
        featured_only: { type: "boolean", description: "Only return featured projects" },
      },
    },
    handler: async (args) => {
      let results = [...data.projects];
      const q = (args.query as string)?.toLowerCase();
      const tech = (args.tech as string)?.toLowerCase();
      const tag = (args.tag as string)?.toLowerCase();
      const domain = (args.domain as string)?.toLowerCase();

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
          url: `https://jayhemnani.me/projects/${p.id}`,
        })),
      };
    },
  });

  // Tool 2: Get project details
  mc.registerTool({
    name: "get_project",
    description: "Get full details of a specific project by its ID, including challenge, solution, impact, and tech stack.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Project ID (slug), e.g. 'barcabrain', 'laliga-live'" },
      },
      required: ["id"],
    },
    handler: async (args) => {
      const project = data.projects.find((p) => p.id === args.id);
      if (!project) {
        return { error: `Project '${args.id}' not found. Use search_projects to find available projects.` };
      }
      return {
        ...project,
        url: `https://jayhemnani.me/projects/${project.id}`,
        github: project.github || null,
      };
    },
  });

  // Tool 3: Get resume
  mc.registerTool({
    name: "get_resume",
    description: "Get Jay's resume data: experience, education, skills, and core competencies.",
    inputSchema: {
      type: "object",
      properties: {
        section: {
          type: "string",
          enum: ["all", "experience", "education", "skills", "competencies", "contact"],
          description: "Which section to return (default: all)",
        },
      },
    },
    handler: async (args) => {
      const section = (args.section as string) || "all";
      const r = data.resume;

      switch (section) {
        case "experience":
          return { experience: r.experience };
        case "education":
          return { education: r.education };
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
            competencies: r.coreCompetencies,
          };
      }
    },
  });

  // Tool 4: Search skills
  mc.registerTool({
    name: "search_skills",
    description: "Search Jay's technical skills by category or keyword.",
    inputSchema: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "Skill category: Languages, Data, ML/AI, MLOps, Cloud, Visualization",
        },
        query: { type: "string", description: "Search for a specific skill by name" },
      },
    },
    handler: async (args) => {
      const cat = (args.category as string)?.toLowerCase();
      const q = (args.query as string)?.toLowerCase();
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
  mc.registerTool({
    name: "get_contact",
    description: "Get Jay's contact information and social links.",
    inputSchema: { type: "object", properties: {} },
    handler: async () => {
      return {
        name: data.resume.name,
        email: data.resume.contact.email,
        social: data.social,
        website: "https://jayhemnani.me",
      };
    },
  });

  // Tool 6: List experiments
  mc.registerTool({
    name: "list_experiments",
    description: "List what Jay is currently building, exploring, or watching in the lab.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search experiments by title or tags" },
      },
    },
    handler: async (args) => {
      let experiments = [...data.experiments];
      const q = (args.query as string)?.toLowerCase();

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

  // Tool 7: Toggle theme
  mc.registerTool({
    name: "toggle_theme",
    description: "Toggle the site between light and dark theme, or set a specific theme.",
    inputSchema: {
      type: "object",
      properties: {
        theme: { type: "string", enum: ["light", "dark", "toggle"], description: "Theme to set (default: toggle)" },
      },
    },
    handler: async (args) => {
      const current = document.documentElement.getAttribute("data-theme") || "dark";
      const requested = args.theme as string;
      let newTheme: string;

      if (requested === "light" || requested === "dark") {
        newTheme = requested;
      } else {
        newTheme = current === "dark" ? "light" : "dark";
      }

      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);

      // Dispatch storage event so ThemeContext picks it up
      window.dispatchEvent(new StorageEvent("storage", { key: "theme", newValue: newTheme }));

      return { previous: current, current: newTheme };
    },
  });

  // Tool 8: Switch site mode
  mc.registerTool({
    name: "switch_mode",
    description: "Switch the site's presentation mode between portfolio, brand, product, and blog views.",
    inputSchema: {
      type: "object",
      properties: {
        mode: {
          type: "string",
          enum: ["portfolio", "brand", "product", "blog"],
          description: "Site mode to switch to",
        },
      },
      required: ["mode"],
    },
    handler: async (args) => {
      const mode = args.mode as string;
      const descriptions: Record<string, string> = {
        portfolio: "Recruiter-focused, resume-heavy view",
        brand: "Personal brand showcase with motion effects",
        product: "Landing page, conversion-focused view",
        blog: "Writing hub, content-focused view",
      };

      localStorage.setItem("site-mode", mode);
      window.dispatchEvent(new StorageEvent("storage", { key: "site-mode", newValue: mode }));

      return {
        mode,
        description: descriptions[mode] || "Unknown mode",
        note: "Reload the page to see the full mode change take effect.",
      };
    },
  });
}

/** Unregister all tools */
export function unregisterWebMCPTools(): void {
  const mc = navigator.modelContext;
  if (!mc) return;

  const toolNames = [
    "search_projects",
    "get_project",
    "get_resume",
    "search_skills",
    "get_contact",
    "list_experiments",
    "toggle_theme",
    "switch_mode",
  ];

  toolNames.forEach((name) => mc.unregisterTool(name));
  mc.clearContext("site_info");
}
