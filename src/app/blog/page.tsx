import Link from "next/link";
import type { Metadata } from "next";
import { getAllPosts, getAllProjects } from "@/lib/content";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Writing",
  description: "Essays and long-form project writeups by Jay Hemnani.",
  alternates: { canonical: "/blog" },
};

// Mono UI chrome: kickers and card labels. Matches the MONO convention used
// across the v4 home sections (see Method.tsx, Hero.tsx, Contact.tsx).
const MONO =
  "font-[family-name:var(--ff-mono)] text-[length:var(--tr-t-mono-sm)] tracking-[.1em] text-tr-text-faint";

const fmtDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

export default async function WritingPage() {
  const posts = await getAllPosts();
  const projects = await getAllProjects();

  // The right rail of the write-ups section: the first three projects with a
  // deep dive, in catalogue order, plus a fourth card pointing at the index.
  const deepDives = projects.filter((p) => p.deepDive).slice(0, 3);

  return (
    <main id="main-content" className="bg-tr-bg text-tr-text">
      <SiteHeader />

      {/* ========== INTRO ========== */}
      <section className="mx-auto grid max-w-[1280px] items-end gap-[clamp(2rem,5vw,5rem)] px-[clamp(1rem,4vw,2rem)] pt-[clamp(2.5rem,5vw,4rem)] pb-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div>
          <p className={MONO}>
            /WRITING · {posts.length} {posts.length === 1 ? "ESSAY" : "ESSAYS"} · {projects.length} WRITE-UPS
          </p>
          <h1 className="mt-[var(--tr-s-2)] text-[length:var(--tr-t-display-sm)] leading-[var(--tr-lh-display)] tracking-[-.035em] font-medium">
            Written down so I can be checked later.
          </h1>
        </div>
        <p className="max-w-[56ch] text-tr-text-mute [text-wrap:pretty]">
          Essays on the Forward Deployed Engineer role, and one on this site. Unflattering details left
          in. Every project also has a write-up with its decisions and trade-offs, and those live under
          Work.
        </p>
      </section>

      {/* ========== ESSAYS ========== */}
      <section className="mx-auto max-w-[1280px] px-[clamp(1rem,4vw,2rem)]">
        <ol className="border-t border-tr-hairline">
          {posts.map((post) => (
            <li key={post.slug} className="border-b border-tr-hairline">
              <Link
                href={`/blog/${post.slug}`}
                data-cursor="OPEN"
                className="group grid items-start gap-[clamp(1rem,3vw,2.5rem)] py-[clamp(1.5rem,3vw,2.5rem)] no-underline lg:grid-cols-[8rem_minmax(0,1fr)_5rem]"
              >
                <div className="font-[family-name:var(--ff-mono)] leading-relaxed text-tr-text-faint">
                  <span className="block">{fmtDate(post.date)}</span>
                  {post.readingTime && (
                    <span className="block text-tr-text-faint transition-colors group-hover:text-tr-accent">
                      {post.readingTime} min
                    </span>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="block text-[length:var(--tr-t-h2)] leading-[var(--tr-lh-h2)] tracking-[-.03em] font-medium transition-transform duration-300 ease-[var(--tr-ease)] group-hover:translate-x-1.5">
                    {post.title}
                  </p>
                  <p className="mt-3 max-w-[66ch] text-tr-text-mute">{post.excerpt ?? post.summary}</p>
                  {post.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-[var(--tr-r-sm)] border border-tr-hairline px-1.5 py-0.5 font-[family-name:var(--ff-mono)] text-[length:var(--tr-t-mono-sm)] text-tr-text-mute"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <span className="font-[family-name:var(--ff-mono)] text-tr-text-faint transition-colors group-hover:text-tr-accent lg:text-right">
                  read ↗
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* ========== PROJECT WRITE-UPS ========== */}
      <section className="border-t border-tr-hairline bg-tr-surface-1">
        <div className="mx-auto grid max-w-[1280px] gap-[clamp(2rem,5vw,5rem)] px-[clamp(1rem,4vw,2rem)] py-[clamp(3rem,6vw,5rem)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div>
            <h2 className="text-[length:var(--tr-t-h2)] leading-[var(--tr-lh-h2)] tracking-[-.025em] font-medium">
              Project write-ups.
            </h2>
            <p className="mt-5 max-w-[40ch] text-tr-text-mute">
              {projects.length}, each with the same skeleton: arrived as, what I did, what changed,
              decisions and their cost.
            </p>
          </div>

          <div className="grid gap-px overflow-hidden rounded-[var(--tr-r-lg)] border border-tr-hairline bg-tr-hairline sm:grid-cols-2">
            {deepDives.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                data-cursor="OPEN"
                className="flex flex-col gap-2 bg-tr-surface-1 p-5 no-underline transition-colors hover:bg-tr-surface-2"
              >
                <span className={MONO}>DEEP DIVE</span>
                <span className="font-medium tracking-[-.01em]">{p.title}</span>
                <span className="line-clamp-2 text-tr-text-mute">{p.summary}</span>
              </Link>
            ))}

            <Link
              href="/projects"
              data-cursor="OPEN"
              className="flex flex-col gap-2 bg-tr-surface-1 p-5 no-underline transition-colors hover:bg-tr-surface-2"
            >
              <span className={MONO}>ALL {projects.length}</span>
              <span className="font-medium tracking-[-.01em]">The index</span>
              <span className="line-clamp-2 text-tr-text-mute">
                Filter by stack or domain. Student work is labelled, not hidden.
              </span>
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
