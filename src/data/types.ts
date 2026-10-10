/**
 * Shared types for strongly typed, data-driven content files.
 * These support nested roles per company, rich project metadata,
 * and extra artifacts/metrics as the resume grows.
 */

export type EmploymentType = "full-time" | "contract" | "internship" | "part-time" | "freelance";

export interface TimelineRange {
    start?: string; // ISO or human label, e.g. "2023-06"
    end?: string;   // allow null for "present" by omitting
    label?: string; // optional preformatted string, e.g. "2022-2024"
    location?: string;
}

export interface LinkItem {
    label: string;
    href: string;
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
    coreCompetencies: string[];
    experience: ExperienceCompany[];
    skills: SkillCategory[];
    education: EducationItem[];
    publications: PublicationItem[];
}
