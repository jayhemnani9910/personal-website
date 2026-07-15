"use client";

import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { ProjectSummary } from "@/lib/content";
import { EditorialMasthead } from "@/components/EditorialMasthead";
import { EditorialColophon } from "@/components/EditorialColophon";

// Mono UI chrome: labels, kickers, buttons. Uppercase + wide tracking,
// matching the section eyebrows and nav links elsewhere (see
// EditorialHome.tsx / EditorialMasthead.tsx for the same split).
const mono: CSSProperties = {
  fontFamily: "var(--font-jetbrains)",
  letterSpacing: ".08em",
};

// Mono machine-channel DATA: stats, tags, domain labels. No forced uppercase
// and no extra tracking, so proper-noun / mixed casing (TypeScript, Next.js
// 16, On-device AI) survives instead of being shouted into caps.
const monoData: CSSProperties = {
  fontFamily: "var(--font-jetbrains)",
};

const serif: CSSProperties = {
  fontFamily: "var(--font-newsreader)",
};

const SHELL = "px-[clamp(1.25rem,5vw,2rem)]";
const WRAP = "mx-auto max-w-[1400px]";

// Cards stay uniform even when a project carries a long tag list: show the
// first few and fold the rest into a "+N" indicator.
const MAX_VISIBLE_TAGS = 4;

interface ProjectsClientProps {
  projects: ProjectSummary[];
}

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
    <main id="main-content" className="bg-tr-bg text-tr-text">
      <EditorialMasthead active="work" />

      {/* Hero */}
      <section className={`${SHELL} pt-[6.5rem] pb-[var(--tr-s-10)]`}>
        <div className={WRAP}>
          <div className="max-w-[46rem]">
            <p
              className="mb-[var(--tr-s-4)] text-[length:var(--tr-t-mono)] uppercase text-tr-text-mute"
              style={mono}
            >
              § 01 / the work
            </p>

            <h1
              className="mb-[var(--tr-s-5)] text-[length:var(--tr-t-display)] font-light leading-[.95] tracking-[-.02em] text-tr-text"
              style={serif}
            >
              The work,
              <br />
              <span className="italic">sorted.</span>
            </h1>

            <p
              className="mb-[var(--tr-s-6)] max-w-[52ch] text-[length:var(--tr-t-body)] leading-[1.5] text-tr-text-mute"
              style={serif}
            >
              A working catalogue. Each entry is a real, shipped thing: production systems, research prototypes,
              and a few honest experiments left in for context.
            </p>

            <div
              className="flex flex-wrap items-center gap-x-[.75em] text-[length:var(--tr-t-mono-sm)] text-tr-text-mute"
              style={monoData}
            >
              <span>{sorted.length} PROJECTS ON FILE</span>
              <span aria-hidden="true" className="mx-[.25em] inline-block h-[.9em] w-px bg-tr-hairline" />
              <span>{featuredCount} FEATURED</span>
            </div>
          </div>
        </div>
      </section>

      {/* Filters + search */}
      <section className={`${SHELL} border-y border-tr-hairline py-[var(--tr-s-5)]`}>
        <div
          className={`${WRAP} flex flex-col gap-[var(--tr-s-4)] lg:flex-row lg:items-center lg:justify-between`}
        >
          <div className="flex flex-wrap items-center gap-x-[var(--tr-s-4)] gap-y-[var(--tr-s-2)]">
            <span className="text-[length:var(--tr-t-mono-sm)] uppercase text-tr-text-faint" style={mono}>
              Filter
            </span>
            {chips.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setFilter(c.key)}
                aria-pressed={filter === c.key}
                className={`text-[length:var(--tr-t-mono)] uppercase transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] ${
                  filter === c.key ? "text-tr-ember" : "text-tr-text-mute hover:text-tr-text"
                }`}
                style={mono}
              >
                {c.label} <span className="text-tr-text-faint">{count(c.key)}</span>
              </button>
            ))}
          </div>

          <div className="w-full lg:max-w-[20rem]">
            <label htmlFor="project-search" className="sr-only">
              Search projects
            </label>
            <input
              id="project-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, summary, or stack"
              className="w-full border border-tr-hairline bg-tr-surface-1 px-[var(--tr-s-4)] py-[.625em] text-[length:var(--tr-t-mono)] text-tr-text placeholder:text-tr-text-faint caret-tr-ember outline-none transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] focus:border-tr-ember"
              style={mono}
            />
          </div>
        </div>
      </section>

      {/* Catalogue */}
      <section className={`${SHELL} py-[var(--tr-s-10)]`}>
        <div className={WRAP}>
          <p
            className="mb-[var(--tr-s-6)] text-[length:var(--tr-t-mono-sm)] text-tr-text-faint"
            style={monoData}
            aria-live="polite"
          >
            {visible.length} {visible.length === 1 ? "entry" : "entries"} showing
          </p>

          {visible.length === 0 ? (
            <p className="py-[var(--tr-s-8)] text-[length:var(--tr-t-mono)] text-tr-text-faint" style={monoData}>
              {query ? <>no projects match &quot;{query}&quot;</> : "no projects match this filter"}
            </p>
          ) : (
            <div className="grid gap-[var(--tr-s-5)] sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((p) => {
                const visibleTags = p.tags?.slice(0, MAX_VISIBLE_TAGS) ?? [];
                const overflow = (p.tags?.length ?? 0) - visibleTags.length;
                return (
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}`}
                    data-cursor="OPEN"
                    className="group relative flex min-w-0 flex-col gap-[var(--tr-s-3)] border border-tr-hairline bg-tr-surface-1 p-[var(--tr-s-5)] no-underline"
                  >
                    {/* Depth rule: a lit top edge on hover instead of a shadow
                        (shadows are invisible on a near-black surface). */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 top-0 h-px bg-transparent transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] group-hover:bg-tr-ember"
                    />

                    {p.domain && (
                      <span className="text-[length:var(--tr-t-mono-sm)] text-tr-text-mute" style={monoData}>
                        {p.domain}
                      </span>
                    )}

                    <h3
                      className="text-[length:var(--tr-t-h3)] font-light text-tr-text transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] group-hover:text-tr-ember"
                      style={serif}
                    >
                      {p.title}
                    </h3>

                    {visibleTags.length > 0 && (
                      <div className="mt-auto flex flex-wrap gap-[.4em] pt-[var(--tr-s-2)]">
                        {visibleTags.map((t) => (
                          <span
                            key={t}
                            className="border border-tr-hairline px-[.6em] py-[.25em] text-[length:var(--tr-t-mono-sm)] text-tr-text-faint"
                            style={monoData}
                          >
                            {t}
                          </span>
                        ))}
                        {overflow > 0 && (
                          <span
                            className="px-[.6em] py-[.25em] text-[length:var(--tr-t-mono-sm)] text-tr-text-faint"
                            style={monoData}
                          >
                            +{overflow}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <EditorialColophon />
    </main>
  );
}
