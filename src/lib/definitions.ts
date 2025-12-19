import { z } from "zod";

// ============================================================================
// CODE SNIPPET SCHEMA (for technical deep dives)
// ============================================================================
const CodeSnippetSchema = z.object({
    title: z.string(),
    language: z.string(),
    code: z.string(),
    explanation: z.string().optional(),
});

// Learning can be a plain string or a structured object with insight/description
const LearningSchema = z.union([
    z.string(),
    z.object({
        insight: z.string(),
        description: z.string(),
    })
]);

// ============================================================================
// DEEP DIVE SCHEMA (progressive disclosure content)
// ============================================================================
const DeepDiveSchema = z.object({
    // Section 1: Extended problem context (why this matters)
    context: z.string().optional(),

    // Section 2: Technical architecture
    architecture: z.string().optional(),
    components: z.array(z.string()).optional(),
    dataFlow: z.string().optional(),

    // Section 3: Key decisions and trade-offs
    keyDecisions: z.array(z.object({
        decision: z.string(),
        reasoning: z.string(),
        alternatives: z.string().optional(),
    })).optional(),

    // Section 4: Code highlights
    codeSnippets: z.array(CodeSnippetSchema).optional(),

    // Section 5: Results deep dive
    metrics: z.array(z.object({
        value: z.string(),
        label: z.string(),
        context: z.string().optional(),
    })).optional(),

    // Section 6: Learnings and takeaways (can be strings or structured objects)
    learnings: z.array(LearningSchema).optional(),

    // Section 7: Future improvements (optional)
    futureWork: z.array(z.string()).optional(),
});

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
    github: z.string().url().optional(),
    links: z.record(z.string(), z.string()).nullable().transform(v => v || undefined).optional(),
    // Architecture diagram data could be complex, keeping it optional/any for now or defining strict schema later
    architecture: z.any().optional(),
    // Progressive disclosure content for technical deep dives
    deepDive: DeepDiveSchema.optional(),
});

export type DeepDive = z.infer<typeof DeepDiveSchema>;
export type CodeSnippet = z.infer<typeof CodeSnippetSchema>;
export type Learning = z.infer<typeof LearningSchema>;

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
