"use client";

import { useMemo, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { ProjectSummary } from "@/lib/content";
import { EditorialMasthead } from "@/components/EditorialMasthead";
import { EditorialColophon } from "@/components/EditorialColophon";

// Mono UI chrome: labels, kickers, buttons. Uppercase + wide tracking,
// matching the section eyebrows and nav links elsewhere (see
// EditorialMasthead.tsx for the same split).
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

// `hero` is resolved from SHOWCASE_PROJECTS on the server (see page.tsx) so the
// client bundle does not pull in the showcase module and its dependencies.
type CatalogueProject = ProjectSummary & { hero?: string };

interface ProjectsClientProps {
  projects: CatalogueProject[];
}

function TagRow({ tags }: { tags?: string[] }) {
  const visible = tags?.slice(0, MAX_VISIBLE_TAGS) ?? [];
  const overflow = (tags?.length ?? 0) - visible.length;
  if (visible.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-[.4em]">
      {visible.map((t) => (
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
  );
}

/** Top-shelf presentation: hero art, deck, tags. */
function ProjectCard({ project: p }: { project: CatalogueProject }) {
  return (
    <Link
      href={`/projects/${p.id}`}
      data-cursor="OPEN"
      className="group relative flex min-w-0 flex-col border border-tr-hairline bg-tr-surface-1 no-underline"
    >
      {/* Depth rule: a lit top edge on hover instead of a shadow
          (shadows are invisible on a near-black surface). */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 z-[var(--tr-z-sticky)] h-px bg-transparent transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] group-hover:bg-tr-ember"
      />

      {/* Every card reserves the same media box so the grid stays even. The
          selected set all carry hero art; the placeholder is here for the case
          where one does not, rather than leaving a ragged frame. */}
      <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-tr-hairline bg-tr-surface-2">
        {p.hero ? (
          <Image
            src={p.hero}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="absolute inset-0 grid place-items-center px-[var(--tr-s-4)] text-center text-[length:var(--tr-t-mono-sm)] uppercase text-tr-text-faint"
            style={mono}
          >
            {p.domain ?? "Project"}
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-[var(--tr-s-3)] p-[var(--tr-s-5)]">
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

        {/* The summary was already loaded and used for search matching, but
            never rendered. A card exists to help someone decide what to open,
            and a title plus tags is not enough to decide on. */}
        <p
          className="line-clamp-3 text-[length:var(--tr-t-body)] leading-[var(--tr-lh-body)] text-tr-text-mute"
          style={serif}
        >
          {p.summary}
        </p>

        <div className="mt-auto pt-[var(--tr-s-2)]">
          <TagRow tags={p.tags} />
        </div>
      </div>
    </Link>
  );
}

/** Archive presentation: one quiet rule-separated row, no media. */
function ArchiveRow({ project: p }: { project: CatalogueProject }) {
  return (
    <li className="border-b border-tr-hairline">
      <Link
        href={`/projects/${p.id}`}
        data-cursor="OPEN"
        className="group flex flex-col gap-[var(--tr-s-2)] py-[var(--tr-s-5)] no-underline lg:flex-row lg:items-baseline lg:gap-[var(--tr-s-6)]"
      >
        <span
          className="w-[11rem] shrink-0 text-[length:var(--tr-t-mono-sm)] text-tr-text-faint"
          style={monoData}
        >
          {p.domain ?? "—"}
        </span>

        <div className="min-w-0 flex-1">
          <h3
            className="text-[length:var(--tr-t-h3)] font-light text-tr-text transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] group-hover:text-tr-ember"
            style={serif}
          >
            {p.title}
          </h3>
          <p
            className="mt-[var(--tr-s-1)] line-clamp-2 max-w-[60ch] text-[length:var(--tr-t-body)] leading-[var(--tr-lh-body)] text-tr-text-mute"
            style={serif}
          >
            {p.summary}
          </p>
        </div>

        <span
          className="shrink-0 text-[length:var(--tr-t-mono-sm)] text-tr-text-faint"
          style={monoData}
        >
          {p.period ?? ""}
        </span>
      </Link>
    </li>
  );
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

  // Two bands, not one flat grid. A catalogue of 28 equal-looking entries means
  // a reader with 30 seconds can easily land on the weakest thing in it, so the
  // selected work gets the media treatment and everything else drops to a quiet
  // list. Both bands stay filterable; an empty one just does not render.
  const selected = visible.filter((p) => p.featured);
  const archive = visible.filter((p) => !p.featured);

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
              className="mb-[var(--tr-s-5)] text-[length:var(--tr-t-display)] font-light leading-[var(--tr-lh-display)] tracking-[-.02em] text-tr-text"
              style={serif}
            >
              The work,
              <br />
              <span className="italic">sorted.</span>
            </h1>

            <p
              className="mb-[var(--tr-s-6)] max-w-[52ch] text-[length:var(--tr-t-body)] leading-[var(--tr-lh-body)] text-tr-text-mute"
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
              <span>{featuredCount} SELECTED</span>
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
              // min-h-[44px] + vertical padding: these were bare text buttons,
              // so the hit area was roughly the 12px glyph. 44px is the WCAG /
              // platform minimum for a touch target. The visual weight is
              // unchanged, only the box around it.
              <button
                key={c.key}
                type="button"
                onClick={() => setFilter(c.key)}
                aria-pressed={filter === c.key}
                className={`inline-flex min-h-[44px] items-center py-[var(--tr-s-2)] text-[length:var(--tr-t-mono)] uppercase transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] ${
                  filter === c.key ? "text-tr-ember" : "text-tr-text-mute hover:text-tr-text"
                }`}
                style={mono}
              >
                {c.label} <span className="ml-[.4em] text-tr-text-faint">{count(c.key)}</span>
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
            className="mb-[var(--tr-s-8)] text-[length:var(--tr-t-mono-sm)] text-tr-text-faint"
            style={monoData}
            aria-live="polite"
          >
            {visible.length} {visible.length === 1 ? "entry" : "entries"} showing
          </p>

          {visible.length === 0 && (
            <p className="py-[var(--tr-s-8)] text-[length:var(--tr-t-mono)] text-tr-text-faint" style={monoData}>
              {query ? <>no projects match &quot;{query}&quot;</> : "no projects match this filter"}
            </p>
          )}

          {selected.length > 0 && (
            <div className="mb-[var(--tr-s-12)]">
              <div className="mb-[var(--tr-s-6)] flex flex-wrap items-baseline justify-between gap-[var(--tr-s-2)] border-b border-tr-hairline pb-[var(--tr-s-3)]">
                <h2
                  className="text-[length:var(--tr-t-h2)] font-light leading-[var(--tr-lh-h2)] text-tr-text"
                  style={serif}
                >
                  Selected work.
                </h2>
                <span className="text-[length:var(--tr-t-mono-sm)] uppercase text-tr-text-faint" style={mono}>
                  {selected.length} {selected.length === 1 ? "entry" : "entries"}
                </span>
              </div>

              <div className="grid gap-[var(--tr-s-5)] sm:grid-cols-2 lg:grid-cols-3">
                {selected.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            </div>
          )}

          {archive.length > 0 && (
            <div>
              <div className="mb-[var(--tr-s-4)] flex flex-wrap items-baseline justify-between gap-[var(--tr-s-2)] border-b border-tr-hairline pb-[var(--tr-s-3)]">
                <h2
                  className="text-[length:var(--tr-t-h2)] font-light leading-[var(--tr-lh-h2)] text-tr-text"
                  style={serif}
                >
                  Archive.
                </h2>
                <span className="text-[length:var(--tr-t-mono-sm)] uppercase text-tr-text-faint" style={mono}>
                  {archive.length} {archive.length === 1 ? "entry" : "entries"}
                </span>
              </div>

              <p
                className="mb-[var(--tr-s-5)] max-w-[60ch] text-[length:var(--tr-t-body)] leading-[var(--tr-lh-body)] text-tr-text-mute"
                style={serif}
              >
                Everything else on file: coursework, concepts, and smaller experiments. Kept for context rather
                than pitched.
              </p>

              <ul className="list-none border-t border-tr-hairline">
                {archive.map((p) => (
                  <ArchiveRow key={p.id} project={p} />
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <EditorialColophon />
    </main>
  );
}
