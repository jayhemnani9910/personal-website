import { z } from "zod";

// Every object schema here is strict: an unknown key fails the parse instead of
// being silently dropped, so a misspelt or retired field (ADR 0004's
// `architecture` block, a component `description`) breaks the build rather
// than vanishing from the page.

// ============================================================================
// CODE SNIPPET SCHEMA (for technical deep dives)
// Supports various field name combinations
// ============================================================================
const CodeSnippetSchema = z.strictObject({
    title: z.string().optional(),
    label: z.string().optional(),
    language: z.string().optional(),
    code: z.string(),
    explanation: z.string().optional(),
});

// Learning can be a plain string or a structured object
// Supports various field name combinations from different agents
const LearningSchema = z.union([
    z.string(),
    z.strictObject({
        insight: z.string().optional(),
        learning: z.string().optional(),
        lesson: z.string().optional(),
        description: z.string().optional(),
        detail: z.string().optional(),
    })
]);

// Component can be a string or structured object
const ComponentSchema = z.union([
    z.string(),
    z.strictObject({
        name: z.string(),
        purpose: z.string().optional(),
        details: z.string().optional(),
    })
]);

// Key decision supports various field name variations
const KeyDecisionSchema = z.strictObject({
    decision: z.string(),
    reasoning: z.string().optional(),
    rationale: z.string().optional(),
    alternatives: z.string().optional(),
    tradeoff: z.string().optional(),
});

// ============================================================================
// DEEP DIVE SCHEMA (progressive disclosure content)
// ============================================================================
const DeepDiveSchema = z.strictObject({
    // Section 1: Extended problem context (why this matters)
    context: z.string().optional(),

    // Section 2: Technical architecture
    architecture: z.string().optional(),
    // components can be string, array of strings, or array of structured objects
    components: z.union([
        z.string(),
        z.array(ComponentSchema)
    ]).optional(),
    // dataFlow can be a string or an array of objects with step/detail.
    // `component` names the entry in `components` that the step shows, by its
    // exact name (content.test.ts checks that every one resolves).
    dataFlow: z.union([
        z.string(),
        z.array(z.strictObject({
            step: z.string(),
            detail: z.string().optional(),
            component: z.string().optional(),
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

    // Section 5: Results deep dive
    metrics: z.array(z.strictObject({
        value: z.string(),
        label: z.string(),
        context: z.string().optional(),
    })).optional(),

    // Section 6: Learnings and takeaways (can be string, or array of strings/objects)
    learnings: z.union([
        z.string(),
        z.array(LearningSchema)
    ]).optional(),

    // Section 7: Future improvements
    futureWork: z.array(z.string()).optional(),
});

// ============================================================================
// PROJECT SCHEMA
// ============================================================================
export const ProjectSchema = z.strictObject({
    id: z.string(),
    title: z.string(),
    summary: z.string(),
    // The search-result snippet (meta description). Only set when the summary
    // falls outside about 70-160 characters; the page falls back to the summary.
    description: z.string().optional(),
    role: z.string(),
    period: z.string().optional(),
    domain: z.string().optional(),
    tags: z.array(z.string()),
    tech: z.array(z.string()),
    challenge: z.string(),
    solution: z.array(z.string()),
    impact: z.array(z.string()),
    priority: z.number().optional(),
    // github and links go straight into href. Only http(s): plain .url() would
    // still accept a javascript: URL.
    github: z.url({ protocol: /^https?$/ }).optional(),
    links: z.record(z.string(), z.url({ protocol: /^https?$/ })).nullable().transform(v => v || undefined).optional(),
    deepDive: DeepDiveSchema.optional(),
});

export type CodeSnippet = z.infer<typeof CodeSnippetSchema>;

export type Project = z.infer<typeof ProjectSchema>;

// ============================================================================
// BLOG POST SCHEMA
// ============================================================================
export const PostSchema = z.strictObject({
    slug: z.string(),
    title: z.string(),
    // YYYY-MM-DD. gray-matter turns an unquoted `date: 2026-10-01` into a Date,
    // so that form is accepted too and normalised to the same string.
    date: z.union([z.iso.date(), z.date().transform((d) => d.toISOString().slice(0, 10))]),
    summary: z.string(),
    excerpt: z.string().optional(),
    tags: z.array(z.string()).default([]),
    category: z.enum(["engineering", "data", "thoughts", "tutorials"]).default("thoughts"),
    draft: z.boolean().default(false),
    readingTime: z.number().optional(), // in minutes
});

export type Post = z.infer<typeof PostSchema>;

// Counts the prose only: code fences and tags (inline SVG markup included,
// whose attributes would otherwise count as words) are dropped first.
export function calculateReadingTime(content: string): number {
    const wordsPerMinute = 200;
    const prose = content
        .replace(/```[\s\S]*?```/g, " ")
        .replace(/<[^>]*>/g, " ")
        .trim();
    const wordCount = prose ? prose.split(/\s+/).length : 0;
    return Math.ceil(wordCount / wordsPerMinute);
}
