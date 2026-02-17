"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Github, Terminal, Cpu, Globe, Zap, Code, CheckCircle2, ChevronRight } from "lucide-react";
import type { Project } from "@/lib/definitions";
import { isWebMCPAvailable } from "@/lib/webmcp";

const TOOLS = [
    { name: "search_projects", description: "Search projects by query, tech, tags, or domain", category: "Content" },
    { name: "get_project", description: "Get full project details by ID", category: "Content" },
    { name: "get_resume", description: "Get resume: experience, education, skills", category: "Professional" },
    { name: "search_skills", description: "Search skills by category or keyword", category: "Professional" },
    { name: "get_contact", description: "Get contact info and social links", category: "Professional" },
    { name: "list_experiments", description: "List lab experiments and current work", category: "Content" },
    { name: "toggle_theme", description: "Toggle light/dark theme", category: "Interactive" },
    { name: "switch_mode", description: "Switch site presentation mode", category: "Interactive" },
];

const CODE_EXAMPLE = `// How a tool is registered (simplified)
navigator.modelContext.registerTool({
  name: "search_projects",
  description: "Search Jay's projects by query, tech, or tags",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string" },
      tech: { type: "string" },
      tag: { type: "string" },
    },
  },
  handler: async ({ query, tech }) => {
    // Filter projects from pre-loaded data
    let results = projects.filter(p =>
      p.title.includes(query) ||
      p.tech.includes(tech)
    );
    return { count: results.length, projects: results };
  },
});`;

const ARCHITECTURE_STEPS = [
    { step: "Build Time", detail: "Next.js loads all project MDX, resume data, and site config via fs" },
    { step: "Server Component", detail: "WebMCPLoader.tsx serializes data and passes to client component" },
    { step: "Client Mount", detail: "WebMCPProvider detects navigator.modelContext availability" },
    { step: "Tool Registration", detail: "8 tools registered with JSON Schema input definitions" },
    { step: "Agent Interaction", detail: "AI agents call tools as structured functions, get JSON responses" },
];

function StatusBadge() {
    const [available, setAvailable] = useState<boolean | null>(() => {
        if (typeof navigator === "undefined") return null;
        return isWebMCPAvailable();
    });

    // Re-check after hydration in case SSR returned null
    useEffect(() => {
        if (available === null) {
            const check = () => setAvailable(isWebMCPAvailable());
            // Defer to next microtask to avoid sync setState in effect
            Promise.resolve().then(check);
        }
    }, [available]);

    if (available === null) return null;

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
            available
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
        }`}>
            <div className={`w-2 h-2 rounded-full ${available ? "bg-green-400 animate-pulse" : "bg-amber-400"}`} />
            {available ? "WebMCP Active" : "WebMCP not available — requires Chrome 146 Canary"}
        </div>
    );
}

function ToolCard({ tool, index }: { tool: typeof TOOLS[0]; index: number }) {
    const categoryColors: Record<string, string> = {
        Content: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        Professional: "text-purple-400 bg-purple-500/10 border-purple-500/20",
        Interactive: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    };

    return (
        <div
            className="p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--accent)] transition-colors"
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <div className="flex items-start justify-between mb-2">
                <code className="text-sm font-mono text-[var(--accent)]">{tool.name}</code>
                <span className={`px-2 py-0.5 rounded-full text-xs border ${categoryColors[tool.category]}`}>
                    {tool.category}
                </span>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">{tool.description}</p>
        </div>
    );
}

export function WebMCPPortfolioPage({ project }: { project: Project }) {
    return (
        <main className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
            {/* Header */}
            <div className="border-b border-[var(--border)]">
                <div className="max-w-5xl mx-auto px-6 py-8">
                    <Link
                        href="/projects"
                        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to projects
                    </Link>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
                                {project.title}
                            </h1>
                            <StatusBadge />
                        </div>
                        <p className="text-lg text-[var(--text-secondary)] max-w-2xl">
                            {project.summary}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {project.tech.map((t) => (
                                <span key={t} className="chip">{t}</span>
                            ))}
                        </div>
                        {project.github && (
                            <a
                                href={project.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors w-fit"
                            >
                                <Github className="w-4 h-4" />
                                View source
                            </a>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-12 space-y-16">
                {/* What is WebMCP */}
                <section>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                        <Globe className="w-6 h-6 text-[var(--accent)]" />
                        What is WebMCP?
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
                            <h3 className="font-semibold text-[var(--text-primary)] mb-2">Before WebMCP</h3>
                            <p className="text-sm text-[var(--text-secondary)] mb-3">
                                AI agents scrape the DOM, click buttons, and parse screenshots. Brittle, slow, breaks when layouts change.
                            </p>
                            <div className="text-xs font-mono text-red-400 bg-red-500/5 rounded-lg p-3 border border-red-500/10">
                                agent.click(&quot;#search-btn&quot;)  // breaks on redesign<br />
                                agent.scrape(&quot;.result-card&quot;)  // fragile selectors
                            </div>
                        </div>
                        <div className="p-6 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5">
                            <h3 className="font-semibold text-[var(--text-primary)] mb-2">With WebMCP</h3>
                            <p className="text-sm text-[var(--text-secondary)] mb-3">
                                Sites declare structured tools. Agents call them like functions. JSON in, JSON out. 89% more efficient.
                            </p>
                            <div className="text-xs font-mono text-green-400 bg-green-500/5 rounded-lg p-3 border border-green-500/10">
                                agent.call(&quot;search_projects&quot;, &#123; tech: &quot;Python&quot; &#125;)<br />
                                {"// → { count: 15, projects: [...] }"}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Registered Tools */}
                <section>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-2">
                        <Terminal className="w-6 h-6 text-[var(--accent)]" />
                        Registered Tools
                    </h2>
                    <p className="text-sm text-[var(--text-secondary)] mb-6">
                        {TOOLS.length} tools exposed via <code className="text-[var(--accent)]">navigator.modelContext</code> on every page.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3">
                        {TOOLS.map((tool, i) => (
                            <ToolCard key={tool.name} tool={tool} index={i} />
                        ))}
                    </div>
                </section>

                {/* Architecture */}
                <section>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                        <Cpu className="w-6 h-6 text-[var(--accent)]" />
                        How It Works
                    </h2>
                    <div className="space-y-3">
                        {ARCHITECTURE_STEPS.map((step, i) => (
                            <div
                                key={step.step}
                                className="flex items-start gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]"
                            >
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center text-sm font-bold">
                                    {i + 1}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-[var(--text-primary)] text-sm">{step.step}</h3>
                                    <p className="text-sm text-[var(--text-secondary)]">{step.detail}</p>
                                </div>
                                {i < ARCHITECTURE_STEPS.length - 1 && (
                                    <ChevronRight className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0 mt-2 hidden md:block" />
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Code Example */}
                <section>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                        <Code className="w-6 h-6 text-[var(--accent)]" />
                        Implementation
                    </h2>
                    <div className="rounded-xl border border-[var(--border)] overflow-hidden">
                        <div className="bg-[var(--bg-secondary)] px-4 py-2 border-b border-[var(--border)] flex items-center gap-2">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                                <div className="w-3 h-3 rounded-full bg-green-500/60" />
                            </div>
                            <span className="text-xs text-[var(--text-muted)] ml-2">src/lib/webmcp.ts</span>
                        </div>
                        <pre className="p-4 text-sm font-mono overflow-x-auto" style={{ backgroundColor: "var(--bg-tertiary, var(--bg-secondary))" }}>
                            <code className="text-[var(--text-secondary)]">{CODE_EXAMPLE}</code>
                        </pre>
                    </div>
                </section>

                {/* Try It */}
                <section>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                        <Zap className="w-6 h-6 text-[var(--accent)]" />
                        Try It Yourself
                    </h2>
                    <div className="p-6 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
                        <ol className="space-y-4">
                            {[
                                "Install Chrome 146 Canary (or later)",
                                'Navigate to chrome://flags and enable "Experimental Web Platform Features"',
                                "Visit jayhemnani.me",
                                "Open DevTools Console and run: navigator.modelContext",
                                "If it returns an object, WebMCP is active with 8 registered tools!",
                            ].map((step, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-[var(--accent)] flex-shrink-0 mt-0.5" />
                                    <span className="text-sm text-[var(--text-secondary)]">{step}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                {/* Impact Stats */}
                <section>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: "Tools Registered", value: "8" },
                            { label: "Projects Queryable", value: "25+" },
                            { label: "Token Efficiency", value: "89%" },
                            { label: "Lines of Code", value: "~280" },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
                                <div className="text-2xl font-bold text-[var(--accent)]">{stat.value}</div>
                                <div className="text-xs text-[var(--text-muted)] mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
