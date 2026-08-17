import type { CSSProperties } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { getAllPosts, getProjectSummaries } from "@/lib/content";
import { EditorialMasthead } from "@/components/EditorialMasthead";
import { EditorialColophon } from "@/components/EditorialColophon";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = {
  title: "Writing",
  description: "Essays and long-form project writeups by Jay Hemnani.",
  alternates: { canonical: "/blog" },
};

// Mono UI chrome: section markers, statuses. Uppercase + wide tracking,
// matching EditorialHome.tsx's `.mono-label` convention.
const mono: CSSProperties = {
  fontFamily: "var(--font-jetbrains)",
  letterSpacing: ".08em",
};

// Mono machine-channel DATA: dates, counts, indices. No forced uppercase and
// no extra tracking, so natural casing (e.g. "May 23, 2026") survives instead
// of being shouted into caps. Matches EditorialHome.tsx's `.mono-data`.
const monoData: CSSProperties = {
  fontFamily: "var(--font-jetbrains)",
};

const serif: CSSProperties = {
  fontFamily: "var(--font-newsreader)",
};

const SHELL = "px-[clamp(1.25rem,5vw,2rem)]";
const WRAP = "mx-auto max-w-[1400px]";

const pad = (n: number) => String(n).padStart(2, "0");

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

// Shared row treatment for the three hairline-ruled <ol> lists below (essays,
// deep-dives). Hover moves the serif title to ember; the row itself carries
// `group` so the title span can react to it.
const rowLinkClass =
  "group flex flex-col gap-[var(--tr-s-2)] py-[var(--tr-s-5)] no-underline sm:flex-row sm:items-baseline sm:gap-[var(--tr-s-5)]";
const rowTitleClass =
  "mb-[var(--tr-s-1)] text-[length:var(--tr-t-h3)] font-light text-tr-text transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] group-hover:text-tr-ember";
const rowDeckClass = "line-clamp-1 text-[length:var(--tr-t-body)] text-tr-text-mute";

const sectionHeadClass = "mb-[var(--tr-s-6)] flex flex-wrap items-baseline justify-between gap-[var(--tr-s-2)]";
const sectionLabelClass =
  "mb-[var(--tr-s-1)] text-[length:var(--tr-t-mono-sm)] uppercase tracking-[.08em] text-tr-text-mute";
const sectionMetaClass = "text-[length:var(--tr-t-mono-sm)] uppercase text-tr-text-mute";
const sectionTitleClass = "text-[length:var(--tr-t-h2)] font-light text-tr-text";

const DRAFTS = [
  { status: "Outlined", title: "Building a five-agent system in ten days, including the parts that did not work." },
  { status: "Outlined", title: "Reading vLLM end to end: notes from landing a patch in a large codebase." },
  { status: "Outlined", title: "WebMCP, six months in: what happens when an LLM can read your site directly." },
  { status: "Thinking", title: "VDOS spectra as a learned feature for protein stability." },
  { status: "Thinking", title: "What one year of daily Cursor, Claude Code, and Codex actually changes." },
];

export default async function WritingPage() {
  const posts = await getAllPosts();
  const projects = await getProjectSummaries();

  const deepDives = [...projects].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return (a.priority ?? 99) - (b.priority ?? 99);
  });

  return (
    <main id="main-content" className="bg-tr-bg text-tr-text">
      <EditorialMasthead active="writing" />

      {/* ========== HERO ==========
          Not wrapped in Reveal: this is the LCP surface and must paint on
          first render (same rule as EditorialHome.tsx's hero). */}
      <section className={`${SHELL} pt-[6.5rem] pb-[3rem]`}>
        <div className={WRAP}>
          <div className="max-w-[46rem]">
            <p className="mb-[var(--tr-s-4)] text-[length:var(--tr-t-mono)] uppercase text-tr-text-mute" style={mono}>
              Department B / The Writing
            </p>

            <h1
              className="mb-[var(--tr-s-5)] text-[length:var(--tr-t-display)] font-light leading-[var(--tr-lh-display)] tracking-[-.02em] text-tr-text"
              style={serif}
            >
              Notes from <span className="italic">the bench.</span>
            </h1>

            <p className="max-w-[52ch] text-[length:var(--tr-t-body)] leading-[var(--tr-lh-body)] text-tr-text-mute" style={serif}>
              Long-form project post-mortems, an essay on the role I am currently targeting, and a few
              drafts left in plain sight as a form of public accountability.
            </p>
          </div>
        </div>
      </section>

      {/* ========== ESSAYS ========== */}
      {posts.length > 0 && (
        <Reveal>
          <section className={`${SHELL} py-[var(--tr-s-10)]`}>
            <div className={WRAP}>
              <div className={sectionHeadClass}>
                <div>
                  <p className={sectionLabelClass} style={mono}>
                    § 01 / essays
                  </p>
                  <h2 className={sectionTitleClass} style={serif}>
                    All essays.
                  </h2>
                </div>
                <p className={sectionMetaClass} style={mono}>
                  {posts.length} {posts.length === 1 ? "essay" : "essays"}
                </p>
              </div>

              <ol className="border-t border-tr-hairline">
                {posts.map((post) => (
                  <li key={post.slug} className="border-b border-tr-hairline">
                    <Link href={`/blog/${post.slug}`} data-cursor="OPEN" className={rowLinkClass}>
                      <span
                        className="shrink-0 text-[length:var(--tr-t-mono-sm)] text-tr-text-mute sm:w-[9rem]"
                        style={monoData}
                      >
                        {fmtDate(post.date)}
                        {post.readingTime ? ` · ${post.readingTime} min` : ""}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className={rowTitleClass} style={serif}>
                          {post.title}
                        </h3>
                        <p className={rowDeckClass} style={serif}>
                          {post.excerpt || post.summary}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        </Reveal>
      )}

      {/* ========== PROJECT DEEP-DIVES ========== */}
      <Reveal>
        <section className={`${SHELL} py-[var(--tr-s-10)]`}>
          <div className={WRAP}>
            <div className={sectionHeadClass}>
              <div>
                <p className={sectionLabelClass} style={mono}>
                  § 02 / project deep-dives
                </p>
                <h2 className={sectionTitleClass} style={serif}>
                  Project deep-dives.
                </h2>
              </div>
              <p className={sectionMetaClass} style={mono}>
                {deepDives.length} writeups
              </p>
            </div>
            <p className="mb-[var(--tr-s-6)] max-w-[60ch] text-[length:var(--tr-t-body)] text-tr-text-mute" style={serif}>
              Each project in the catalogue has a corresponding writeup: challenge, solution, impact,
              architecture, learnings. The full dossier on each one lives under{" "}
              <span className="text-[length:var(--tr-t-mono-sm)]" style={monoData}>
                /projects
              </span>
              .
            </p>

            <ol className="border-t border-tr-hairline">
              {deepDives.map((p, i) => (
                <li key={p.id} className="border-b border-tr-hairline">
                  <Link href={`/projects/${p.id}`} data-cursor="OPEN" className={rowLinkClass}>
                    <span
                      className="shrink-0 text-[length:var(--tr-t-mono-sm)] text-tr-text-mute sm:w-[3rem]"
                      style={monoData}
                    >
                      {pad(i + 1)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className={rowTitleClass} style={serif}>
                        {p.title}.
                      </h3>
                      <p className={rowDeckClass} style={serif}>
                        {p.summary}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </Reveal>

      {/* ========== DRAFTS ========== */}
      <Reveal>
        <section className={`${SHELL} py-[var(--tr-s-10)]`}>
          <div className={WRAP}>
            <div className={sectionHeadClass}>
              <div>
                <p className={sectionLabelClass} style={mono}>
                  § 03 / in the pipeline
                </p>
                <h2 className={sectionTitleClass} style={serif}>
                  In the pipeline.
                </h2>
              </div>
              <p className={sectionMetaClass} style={mono}>
                {DRAFTS.length} drafts · not yet published
              </p>
            </div>

            <ul className="border-t border-tr-hairline">
              {DRAFTS.map((d) => (
                <li
                  key={d.title}
                  className="flex flex-col gap-[var(--tr-s-1)] border-b border-tr-hairline py-[var(--tr-s-4)] sm:flex-row sm:items-baseline sm:gap-[var(--tr-s-5)]"
                >
                  <span
                    className="shrink-0 text-[length:var(--tr-t-mono-sm)] uppercase text-tr-text-faint sm:w-[7rem]"
                    style={mono}
                  >
                    {d.status}
                  </span>
                  <span className="text-[length:var(--tr-t-body)] text-tr-text-mute" style={serif}>
                    {d.title}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </Reveal>

      <EditorialColophon />
    </main>
  );
}
