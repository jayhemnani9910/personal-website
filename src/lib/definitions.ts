import { z } from "zod";

// ============================================================================
// CODE SNIPPET SCHEMA (for technical deep dives)
// Supports various field name combinations
// ============================================================================
const CodeSnippetSchema = z.object({
    title: z.string().optional(),
    label: z.string().optional(),
    language: z.string().optional(),
    lang: z.string().optional(),
    code: z.string(),
    explanation: z.string().optional(),
    description: z.string().optional(),
});

// Learning can be a plain string or a structured object
// Supports various field name combinations from different agents
const LearningSchema = z.union([
    z.string(),
    z.object({
        insight: z.string().optional(),
        learning: z.string().optional(),
        lesson: z.string().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        detail: z.string().optional(),
    })
]);

// Component can be a string or structured object
const ComponentSchema = z.union([
    z.string(),
    z.object({
        name: z.string(),
        purpose: z.string().optional(),
        details: z.string().optional(),
    })
]);

// Key decision supports various field name variations
const KeyDecisionSchema = z.object({
    decision: z.string(),
    reasoning: z.string().optional(),
    rationale: z.string().optional(),
    alternatives: z.string().optional(),
    tradeoff: z.string().optional(),
});

// ============================================================================
// DEEP DIVE SCHEMA (progressive disclosure content)
// ============================================================================
const DeepDiveSchema = z.object({
    // Section 1: Extended problem context (why this matters)
    context: z.string().optional(),

    // Section 2: Technical architecture
    architecture: z.string().optional(),
    // components can be string, array of strings, or array of structured objects
    components: z.union([
        z.string(),
        z.array(ComponentSchema)
    ]).optional(),
    // dataFlow can be string, array of strings, or array of objects with step/detail
    dataFlow: z.union([
        z.string(),
        z.array(z.string()),
        z.array(z.object({
            step: z.string(),
            detail: z.string().optional(),
        }))
    ]).optional(),

    // Section 3: Key decisions and trade-offs (can be string or array)
    keyDecisions: z.union([
        z.string(),
        z.array(KeyDecisionSchema)
    ]).optional(),

    // Section 4: Code highlights (can be string or array)
    codeSnippets: z.union([
        z.string(),
        z.array(CodeSnippetSchema)
    ]).optional(),

    // Section 5: Results deep dive (can be string, array of strings, or array of objects)
    metrics: z.union([
        z.string(),
        z.array(z.string()),
        z.array(z.object({
            value: z.string(),
            label: z.string(),
            context: z.string().optional(),
        }))
    ]).optional(),

    // Section 6: Learnings and takeaways (can be string, or array of strings/objects)
    learnings: z.union([
        z.string(),
        z.array(LearningSchema)
    ]).optional(),

    // Section 7: Future improvements (can be string or array)
    futureWork: z.union([
        z.string(),
        z.array(z.string())
    ]).optional(),
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
export type Component = z.infer<typeof ComponentSchema>;
export type KeyDecision = z.infer<typeof KeyDecisionSchema>;

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
