/**
 * Shared types for strongly typed, data-driven content files.
 * These support nested roles per company, rich project metadata,
 * and extra artifacts/metrics as the resume grows.
 */

export type EmploymentType = "full-time" | "contract" | "internship" | "part-time" | "freelance";

export interface TimelineRange {
    start?: string; // ISO or human label, e.g. "2023-06"
    end?: string;   // allow null for "present" by omitting
    label?: string; // optional preformatted string, e.g. "2022–2024"
    location?: string;
}

export interface LinkItem {
    label: string;
    href: string;
}

export interface Metric {
    label: string;
    value: string;
    context?: string;
}

export interface Achievement {
    text: string;
    metrics?: string[];           // quick numeric callouts
    links?: LinkItem[];           // related artifacts
}

export interface Role {
    title: string;
    period?: TimelineRange;
    summary?: string;
    employmentType?: EmploymentType;
    location?: string;
    tech?: string[];
    bullets: Achievement[];
}

export interface ExperienceCompany {
    name: string;
    industry?: string;
    website?: string;
    location?: string;
    roles: Role[];
}

export interface EducationItem {
    institution: string;
    degree: string;
    location?: string;
    meta?: string;
    start?: string;
    end?: string;
    gpa?: string;
    courses?: string[];
    achievements?: string[];        // Dean's list, scholarships, awards
    thesis?: string;                // Thesis/capstone project title
    thesisDescription?: string;     // Brief description of thesis work
}

export interface PublicationItem {
    title: string;
    venue?: string;
    year?: string;
    description?: string;
    abstract?: string;              // Extended summary/abstract
    link?: string;                  // Paper link (arxiv, journal, etc.)
    github?: string;                // GitHub repository link
    coAuthors?: string[];           // List of co-authors
}

export interface CertificationItem {
    name: string;
    authority: string;
    year?: string;
    url?: string;
}

export interface SkillItem {
    name: string;
    level?: "working" | "proficient" | "expert";
    keywords?: string[];
}

export interface SkillCategory {
    category: string;
    items: SkillItem[];
}

export interface Resume {
    name: string;
    tagline: string;
    location?: string;
    contact: {
        email: string;
        github: string;
        linkedin?: string;
        website?: string;
    };
    summary: string;
    headlineBullets?: string[];
    coreCompetencies: string[];
    experience: ExperienceCompany[];
    skills: SkillCategory[];
    education: EducationItem[];
    publications: PublicationItem[];
    certifications?: CertificationItem[];
    spotlightProjects?: string[]; // project ids for quick linking
}

export interface StatHighlight {
    label: string;
    value: string;
    accent?: string;
}

export interface Cta {
    label: string;
    href: string;
    variant?: "primary" | "secondary";
}

export interface HeroContent {
    name: string;
    role: string;
    pitch: string;
    accentLine: string;
    stats: StatHighlight[];
    ctaPrimary: Cta;
    ctaSecondary: Cta;
}

export interface AboutContent {
    title: string;
    summary: string[];
    bullets: string[];
    highlights?: string[];
}

export interface ProfileContent {
    hero: HeroContent;
    about: AboutContent;
}

export interface ProjectMedia {
    kind: "image" | "video" | "diagram";
    src: string;
    alt?: string;
    caption?: string;
    poster?: string;
}

export interface ProjectLinks {
    code?: string;
    demo?: string;
    paper?: string;
    deck?: string;
    writeup?: string;
    dataset?: string;
}

export interface Project {
    id: string;
    title: string;
    summary: string;              // short, card-friendly synopsis
    headline?: string;            // optional longline; falls back to summary
    role: string;
    period?: string;              // school/employer/timeframe label
    dates?: TimelineRange;
    domain?: string;
    tags: string[];               // topical tags for filtering
    tech: string[];               // primary tech stack
    challenge: string;            // concise problem framing
    solution: string[];           // bullet solution narrative
    impact: string[];             // bullet impact/results
    metrics?: Metric[];
    diagram?: string;             // legacy textual diagram; prefer architecture
    media?: ProjectMedia[];
    links?: ProjectLinks;
    featured?: boolean;           // Show in Selected Works
    priority?: number;            // Lower = higher on the grid
    architecture?: ArchitectureData;
}

export interface ArchitectureNode {
    id: string;
    label: string;
    type: "service" | "database" | "stream" | "client" | "cache" | "queue" | "ml" | "other" | "search";
    x?: number; // Optional relative grid position (0-100)
    y?: number; // Optional relative grid position (0-100)
}

export interface ArchitectureEdge {
    source: string;
    target: string;
    label?: string;
    animated?: boolean;
}

export interface ArchitectureData {
    nodes: ArchitectureNode[];
    edges: ArchitectureEdge[];
    description?: string;
    legend?: { type: ArchitectureNode["type"]; label: string }[];
}
