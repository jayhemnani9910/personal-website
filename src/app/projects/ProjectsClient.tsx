"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ProjectSummary } from "@/lib/content";
import { EditorialMasthead } from "@/components/EditorialMasthead";
import { EditorialColophon } from "@/components/EditorialColophon";

interface ProjectsClientProps {
    projects: ProjectSummary[];
}

const pad = (n: number) => String(n).padStart(2, "0");

export function ProjectsClient({ projects }: ProjectsClientProps) {
    const [filter, setFilter] = useState("all");
    const [query, setQuery] = useState("");

    // Sort: featured first, then by priority ascending, then title.
    const sorted = useMemo(
        () =>
            [...projects].sort((a, b) => {
                if (a.featured !== b.featured) return a.featured ? -1 : 1;
                const pa = a.priority ?? 99;
                const pb = b.priority ?? 99;
                if (pa !== pb) return pa - pb;
                return a.title.localeCompare(b.title);
            }),
        [projects]
    );

    // Filter chips derived from distinct domains.
    const domains = useMemo(
        () => Array.from(new Set(sorted.map((p) => p.domain).filter(Boolean))) as string[],
        [sorted]
    );

    const count = (key: string) =>
        key === "all"
            ? sorted.length
            : key === "featured"
            ? sorted.filter((p) => p.featured).length
            : sorted.filter((p) => p.domain === key).length;

    const chips = [
        { key: "all", label: "All" },
        { key: "featured", label: "Featured" },
        ...domains.map((d) => ({ key: d, label: d })),
    ];

    const visible = sorted.filter((p) => {
        const matchFilter =
            filter === "all" ||
            (filter === "featured" ? p.featured : p.domain === filter);
        const q = query.toLowerCase();
        const matchQuery =
            !q ||
            p.title.toLowerCase().includes(q) ||
            p.summary.toLowerCase().includes(q) ||
            p.tech.some((t) => t.toLowerCase().includes(q));
        return matchFilter && matchQuery;
    });

    const featuredCount = sorted.filter((p) => p.featured).length;

    return (
        <main className="editorial min-h-screen" style={{ background: "var(--bg-primary)" }}>
            <EditorialMasthead active="work" />

            {/* Work hero */}
            <section className="work-hero shell">
                <div className="work-hero-grid">
                    <div>
                        <div className="eyebrow"><span className="dot" /><span>Department A · The Work</span></div>
                        <h1 className="display work-title"><span>The work,</span><br /><span className="italic">sorted.</span></h1>
                    </div>
                    <div className="work-hero-side">
                        <p className="deck">A working catalogue. Each entry is a real, shipped thing: production systems, research prototypes, and a few honest experiments left in for context.</p>
                        <div className="work-hero-meta">
                            <div><span className="upper mono small muted">Entries</span><br /><b>{sorted.length}</b> projects on file</div>
                            <div><span className="upper mono small muted">Featured</span><br /><b>{featuredCount}</b> headline acts</div>
                            <div><span className="upper mono small muted">Sort order</span><br />Featured, then priority</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filters + search */}
            <section className="filters shell">
                <div className="filter-bar">
                    <span className="filter-label mono xs upper muted">Filter</span>
                    <div className="filter-chips">
                        {chips.map((c) => (
                            <button
                                key={c.key}
                                className={`filter-chip${filter === c.key ? " active" : ""}`}
                                onClick={() => setFilter(c.key)}
                                type="button"
                            >
                                {c.label} <span className="filter-chip-count">{count(c.key)}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="work-search">
                    <input
                        type="text"
                        placeholder="Search title, summary, or stack"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        aria-label="Search projects"
                    />
                </div>
            </section>

            {/* Catalogue */}
            <section className="catalogue shell">
                <div className="section-head">
                    <span className="num">Part I</span>
                    <span className="title">The catalogue.</span>
                    <span className="meta">{visible.length} showing</span>
                </div>

                {visible.length === 0 ? (
                    <p className="cat-empty">No projects match that filter or search.</p>
                ) : (
                    <div className="cat-list">
                        {visible.map((p, i) => (
                            <article className="entry" key={p.id}>
                                <div className="entry-num mono">{pad(i + 1)}</div>
                                <div className="entry-year mono">{p.period || ""}</div>
                                <div className="entry-body">
                                    <header>
                                        <h3 className="entry-h">
                                            <Link href={`/projects/${p.id}`}>{p.title}.</Link>
                                        </h3>
                                        {p.tags?.length > 0 && (
                                            <span className="entry-tags">
                                                {p.tags.slice(0, 3).map((t) => (
                                                    <span key={t}>{t}</span>
                                                ))}
                                            </span>
                                        )}
                                    </header>
                                    <p className="deck">{p.summary}</p>
                                    {p.tech?.length > 0 && (
                                        <div className="entry-foot">
                                            <span className="entry-tech mono">{p.tech.join(" · ")}</span>
                                            <span className="entry-links">
                                                <Link href={`/projects/${p.id}`}>Read ↗</Link>
                                                {p.github && (
                                                    <a href={p.github} target="_blank" rel="noreferrer">Code ↗</a>
                                                )}
                                                {p.links?.demo && (
                                                    <a href={p.links.demo} target="_blank" rel="noreferrer">Demo ↗</a>
                                                )}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            <EditorialColophon />
        </main>
    );
}
