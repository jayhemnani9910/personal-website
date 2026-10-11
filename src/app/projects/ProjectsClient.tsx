"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ProjectSummary } from "@/lib/content";
import { CHIP, DOT, DOTS, LABEL, MONO, PILL, PILL_ACTIVE, SHELL, WRAP, pad } from "@/components/desk";

interface ProjectsClientProps {
  projects: ProjectSummary[];
}

// The table's columns from lg up: number and dot, project, one line, domain, period.
// Below lg a row stacks, with domain and period sharing its last line.
const COLS = "lg:grid-cols-[4.5rem_minmax(0,1.2fr)_minmax(0,2fr)_9rem_5rem]";

// Early coursework is kept for context rather than pitched, and is marked with
// the domain "Student work" in its frontmatter (a missing domain means only
// "not filed yet", not student work). Its domain cell is a shade fainter
// instead of dropping opacity on already-muted text.
const isStudentWork = (domain?: string) => domain === "Student work";

// The empty state's hints. One that equals the failed query is left out.
const SUGGESTIONS = ["kafka", "yolo", "langgraph"];

export function ProjectsClient({ projects }: ProjectsClientProps) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  const domains = useMemo(
    () => Array.from(new Set(projects.map((p) => p.domain).filter((d): d is string => Boolean(d)))),
    [projects]
  );

  const countFor = (domain: string) => projects.filter((p) => p.domain === domain).length;

  const chips = [
    { key: "all", label: "All", count: projects.length },
    ...domains.map((d) => ({ key: d, label: d, count: countFor(d) })),
  ];

  const q = query.trim().toLowerCase();

  // The order here is the order `projects` arrived in: priority first, then
  // id, the same order src/lib/content.ts sorts the catalogue into. Filtering
  // and searching narrow that list; nothing here re-sorts it.
  const visible = projects.filter((p) => {
    const matchFilter = filter === "all" || p.domain === filter;
    const matchQuery =
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.summary.toLowerCase().includes(q) ||
      (p.domain?.toLowerCase().includes(q) ?? false) ||
      p.tech.some((t) => t.toLowerCase().includes(q));
    return matchFilter && matchQuery;
  });

  return (
    <>
      {/* Filter bar */}
      {/* Sticky only from lg up: on a phone the search box and the wrapping
          domain chips are several rows tall, and pinned they would cover
          about half the screen. And only on a screen taller than 520px, where
          the header above it is sticky too (globals.css). */}
      <section className="z-[30] border-b-[1.5px] border-tr-hairline bg-tr-bg lg:[@media(min-height:521px)]:sticky lg:top-[58px] lg:sticky-bar">
        <div className={`${WRAP} ${SHELL} flex flex-wrap items-center gap-2 pb-5 pt-4`}>
          {/* The search box shows focus on its frame; the bare input inside keeps outline-none. */}
          <div className="flex h-9 w-full items-center gap-2 rounded-[var(--tr-r-md)] border-[1.5px] border-tr-hairline bg-tr-surface-1 px-3 focus-within:shadow-[2px_2px_0_var(--tr-text)] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-tr-accent-ink sm:w-[300px]">
            <span aria-hidden="true" className={`${MONO} text-tr-accent-ink`}>
              /
            </span>
            <label htmlFor="project-search" className="sr-only">
              Search projects by name, stack, or domain
            </label>
            <input
              id="project-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="filter by name, stack, domain"
              className={`min-w-0 flex-1 border-0 bg-transparent text-[13px] text-tr-text outline-none placeholder:text-tr-text-faint ${MONO}`}
            />
          </div>

          {chips.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setFilter(c.key)}
              aria-pressed={filter === c.key}
              className={`cursor-pointer ${PILL} ${filter === c.key ? PILL_ACTIVE : ""}`}
            >
              {c.label} <span className="text-[11px] text-tr-text-mute">{c.count}</span>
            </button>
          ))}

          <span className={`ml-auto ${MONO} text-[13px] text-tr-text-faint`} aria-live="polite">
            {visible.length} / {projects.length}
          </span>
        </div>
      </section>

      {/* Table */}
      <section className={`${WRAP} ${SHELL} pb-[60px] pt-8`}>
        <div className={`hidden gap-6 pb-2.5 ${COLS} lg:grid ${LABEL}`}>
          <span>#</span>
          <span>Project</span>
          <span>One line</span>
          <span>Domain</span>
          <span className="text-right">Period</span>
        </div>

        {visible.length === 0 ? (
          <p className={`border-t-[1.5px] border-tr-hairline py-10 text-[13px] text-tr-text-faint ${MONO}`}>
            nothing {filter === "all" ? "" : `in ${filter} `}matches &quot;{query}&quot;.{" "}
            {filter === "all" ? (
              `try a stack name like ${SUGGESTIONS.filter((s) => s !== q).join(", ")}`
            ) : (
              <button
                type="button"
                onClick={() => {
                  setFilter("all");
                  // The button goes away with the results it brings back, so
                  // focus would fall to the page; the search box is next.
                  document.getElementById("project-search")?.focus();
                }}
                className="cursor-pointer text-tr-accent-ink underline"
              >
                search every domain
              </button>
            )}
          </p>
        ) : (
          <ol className="list-none">
            {visible.map((p, i) => (
              <li key={p.id} className="border-t-[1.5px] border-tr-hairline">
                {/* From lg the filter bar is sticky under the header too, so a
                    row Tab brings into view needs room for both. */}
                <Link
                  href={`/projects/${p.id}`}
                  className={`group grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-2.5 py-5 hover:text-tr-text lg:scroll-mt-[90px] lg:gap-6 ${COLS}`}
                >
                  <span className={`col-span-2 flex items-center gap-2.5 pt-1 text-[12px] text-tr-text-faint lg:col-span-1 ${MONO}`}>
                    {pad(i + 1)}
                    <span aria-hidden="true" className={DOT} style={{ background: DOTS[i % DOTS.length] }} />
                  </span>

                  <div className="col-span-2 lg:col-span-1">
                    {/* A plain span, not a heading: this is one row of a data table, not a
                        document section, and the page carries exactly one <h1> and no <h2>s
                        for these rows to nest under. */}
                    <span className="block text-[20px] font-bold leading-[var(--tr-lh-tight)] tracking-[-0.02em] group-hover:text-tr-accent-ink">
                      {p.title}
                    </span>
                    {p.tech.length > 0 && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {p.tech.slice(0, 3).map((t) => (
                          <span key={t} className={CHIP}>
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <p className="col-span-2 text-[15px] leading-normal text-tr-text-mute lg:col-span-1">{p.summary}</p>

                  <span
                    className={`pt-1 text-[12px] ${MONO} ${
                      isStudentWork(p.domain) ? "text-tr-text-faint" : "text-tr-text-mute"
                    }`}
                  >
                    {p.domain ?? "unfiled"}
                  </span>

                  <span className={`pt-1 text-right text-[12px] text-tr-text-faint ${MONO}`}>
                    {p.period ?? "—"}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}
