import { z } from "zod";

// ============================================================================
// PROJECT SCHEMA
// ============================================================================
export const ProjectSchema = z.object({
    id: z.string(),
    title: z.string(),
    summary: z.string(),
    role: z.string(),
    period: z.string().optional(),
    domain: z.string().optional(),
    tags: z.array(z.string()),
    tech: z.array(z.string()),
    challenge: z.string(),
    solution: z.array(z.string()),
    impact: z.array(z.string()),
    featured: z.boolean().optional(),
    priority: z.number().optional(),
    links: z.record(z.string(), z.string()).nullable().transform(v => v || undefined).optional(),
    // Architecture diagram data could be complex, keeping it optional/any for now or defining strict schema later
    architecture: z.any().optional(),
});

export type Project = z.infer<typeof ProjectSchema>;

// ============================================================================
// BLOG POST SCHEMA
// ============================================================================
export const PostSchema = z.object({
    slug: z.string(),
    title: z.string(),
    date: z.string(),
    summary: z.string(),
    excerpt: z.string().optional(),
    tags: z.array(z.string()).default([]),
    category: z.enum(["engineering", "data", "thoughts", "tutorials"]).default("thoughts"),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    readingTime: z.number().optional(), // in minutes
    coverImage: z.string().optional(),
});

export type Post = z.infer<typeof PostSchema>;

// ============================================================================
// CONTENT METADATA
// ============================================================================
export interface ContentMeta {
    wordCount: number;
    readingTime: number;
}

export function calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
}
