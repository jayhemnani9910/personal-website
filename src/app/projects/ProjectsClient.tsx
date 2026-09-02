"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ProjectSummary } from "@/lib/content";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const MONO = "font-[family-name:var(--ff-mono)]";
const SHELL = "px-[clamp(1rem,4vw,2rem)]";
const WRAP = "mx-auto max-w-[1280px]";

interface ProjectsClientProps {
  projects: ProjectSummary[];
}

// Five of the catalogue's entries declare no domain in their frontmatter:
// early coursework kept for context rather than pitched. They, and any entry
// explicitly marked "Student work", render their domain cell a shade fainter
// instead of dropping opacity on already-muted text.
const isStudentWork = (domain?: string) => !domain || domain === "Student work";

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
    <main id="main-content" className="bg-tr-bg text-tr-text">
      <SiteHeader />

      {/* Intro */}
      <section className={`${SHELL} pt-[clamp(2.5rem,5vw,4rem)] pb-6`}>
        <div className={`${WRAP} grid gap-[clamp(2rem,5vw,5rem)] items-end lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]`}>
          <div>
            <p className={`mb-3 ${MONO} text-[length:var(--tr-t-mono)] tracking-[.1em] text-tr-text-faint`}>
              /WORK · 2019 → 2026
            </p>
            <h1 className="text-[length:var(--tr-t-display-sm)] leading-[var(--tr-lh-display)] tracking-[-.035em] font-medium">
              {projects.length}, sorted by what they&apos;d cost you to ignore.
            </h1>
          </div>
          <p className="max-w-[56ch] text-tr-text-mute [text-wrap:pretty]">
            Priority first, then alphabetical, the same order the code uses. The early entries are student
            work and are labelled as such; leaving them out would be curating, not documenting.
          </p>
        </div>
      </section>

      {/* Filter bar */}
      <section className={`sticky top-14 z-[30] bg-tr-bg border-b border-tr-hairline ${SHELL} pt-4 pb-6`}>
        <div className={`${WRAP} flex flex-wrap items-center gap-2`}>
          <div className="flex h-8 min-w-[240px] items-center gap-2 rounded-[var(--tr-r-md)] border border-tr-hairline bg-tr-surface-1 px-3">
            <span aria-hidden="true" className={`${MONO} text-tr-ember`}>
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
              className={`flex-1 border-0 bg-transparent text-[length:var(--tr-t-mono)] text-tr-text placeholder:text-tr-text-faint outline-none ${MONO}`}
            />
          </div>

          {chips.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setFilter(c.key)}
              aria-pressed={filter === c.key}
              className={`inline-flex h-8 items-center gap-1 rounded-full border px-[.8rem] text-[12.5px] transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] ${MONO} ${
                filter === c.key
                  ? "border-tr-ember bg-tr-ember text-tr-on-ember"
                  : "border-tr-hairline text-tr-text-mute hover:border-tr-ember"
              }`}
            >
              {c.label} <span className="text-[10.5px]">{c.count}</span>
            </button>
          ))}

          <span className={`ml-auto ${MONO} text-[length:var(--tr-t-mono)] text-tr-text-faint`} aria-live="polite">
            {visible.length} / {projects.length}
          </span>
        </div>
      </section>

      {/* Table */}
      <section className={`${SHELL} py-[var(--tr-s-8)]`}>
        <div className={WRAP}>
          <div
            className={`hidden lg:grid lg:grid-cols-[3rem_minmax(0,1.2fr)_minmax(0,2fr)_9rem_5rem] gap-6 pt-3 pb-[.6rem] text-[length:var(--tr-t-mono-sm)] tracking-[.1em] text-tr-text-faint ${MONO}`}
          >
            <span>#</span>
            <span>PROJECT</span>
            <span>ONE LINE</span>
            <span>DOMAIN</span>
            <span className="text-right">YEAR</span>
          </div>

          {visible.length === 0 ? (
            <p className={`py-[var(--tr-s-8)] text-[length:var(--tr-t-mono)] text-tr-text-faint ${MONO}`}>
              nothing matches &quot;{query}&quot;. try a stack name like kafka, yolo, langgraph
            </p>
          ) : (
            <ol className="list-none">
              {visible.map((p, i) => (
                <li key={p.id} className="border-t border-tr-hairline">
                  <Link
                    href={`/projects/${p.id}`}
                    data-cursor="OPEN"
                    className="group grid gap-[.6rem_1rem] py-[1.1rem] items-start lg:grid-cols-[3rem_minmax(0,1.2fr)_minmax(0,2fr)_9rem_5rem] lg:gap-6 hover:bg-[linear-gradient(90deg,var(--tr-surface-1)_0,transparent_100%)]"
                  >
                    <span className={`text-[length:var(--tr-t-mono-sm)] text-tr-text-faint ${MONO}`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    <div>
                      {/* A plain span, not a heading: this is one row of a data table, not a
                          document section, and the page carries exactly one <h1> and no <h2>s
                          for these 27 rows to nest under. WorkTable.tsx (the home page's version
                          of this same table) makes the same call. */}
                      <span className="block text-[length:var(--tr-t-h3)] leading-[var(--tr-lh-h3)] tracking-[-.015em] font-medium">
                        {p.title}
                      </span>
                      {p.tech.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {p.tech.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className={`rounded-[var(--tr-r-sm)] border border-tr-hairline px-1.5 py-0.5 text-[length:var(--tr-t-mono-sm)] text-tr-text-mute ${MONO}`}
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <p className="text-tr-text-mute">{p.summary}</p>

                    <span
                      className={`text-[length:var(--tr-t-mono-sm)] ${MONO} ${
                        isStudentWork(p.domain) ? "text-tr-text-faint" : "text-tr-text-mute"
                      }`}
                    >
                      {p.domain ?? "unfiled"}
                    </span>

                    <span className={`text-[length:var(--tr-t-mono-sm)] text-tr-text-faint lg:text-right ${MONO}`}>
                      {p.period ?? ""}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
