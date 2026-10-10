import Link from "next/link";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-metadata";
import { formatPostDate, getAllPosts, getAllProjects } from "@/lib/content";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CARD, CARD_HOVER, CHIP, DOT, DOTS, H1, H2, HAND, HIGHLIGHT, KICKER, LABEL, LEDE, SHELL, WRAP } from "@/components/desk";

export const metadata: Metadata = pageMetadata({
  title: "Writing",
  description: "Essays by Jay Hemnani on forward-deployed engineering: what the role is, how the interviews run, and where the work actually happens.",
  path: "/blog",
});

// The write-up cards: the essay card's smaller sibling (radius 14, padding 18).
const SMALL_CARD = `${CARD_HOVER} flex flex-col gap-2 rounded-[var(--tr-r-lg)] border-[1.5px] border-tr-hairline bg-tr-surface-1 p-[18px] hover:text-tr-text`;

export default async function WritingPage() {
  const posts = await getAllPosts();
  const projects = await getAllProjects();

  // The write-ups section: the first three projects with a deep dive, in
  // catalogue order, plus a fourth card pointing at the index.
  const deepDives = projects.filter((p) => p.deepDive).slice(0, 3);

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="bg-tr-bg text-tr-text">
        {/* ========== INTRO ========== */}
        <section className={`${WRAP} ${SHELL} pb-10 pt-[clamp(40px,6vw,72px)]`}>
          <p className={KICKER}>
            /writing · {posts.length} {posts.length === 1 ? "essay" : "essays"} · {projects.length} write-ups
          </p>
          <h1 className={`${H1} mt-3 max-w-[20ch]`}>
            Written down so I can be <span className={HIGHLIGHT}>checked later.</span>
          </h1>
          <p className={`${LEDE} mt-6 max-w-[56ch]`}>
            Essays on the Forward Deployed Engineer role. Unflattering details left in. Every project also
            has a write-up, most with their decisions and trade-offs, and those live under Work.
          </p>
        </section>

        {/* ========== ESSAYS ========== */}
        <section aria-label="Essays" className={`${WRAP} ${SHELL} pb-[60px]`}>
          <ol className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,330px),1fr))] gap-5">
            {posts.map((post, i) => (
              <li key={post.slug} className="flex">
                <Link href={`/blog/${post.slug}`} className={`${CARD} ${CARD_HOVER} flex w-full flex-col gap-3.5 p-6 hover:text-tr-text`}>
                  <span className="flex items-center justify-between">
                    <span className="font-mono text-[12px] text-tr-text-faint">{formatPostDate(post.date)}</span>
                    <span aria-hidden="true" className={DOT} style={{ background: DOTS[i % DOTS.length] }} />
                  </span>
                  <span className="text-[26px] font-extrabold leading-[var(--tr-lh-h3)] tracking-[-0.025em]">{post.title}</span>
                  <span className="text-[15px] leading-normal text-tr-text-mute">{post.excerpt ?? post.summary}</span>
                  <span className="mt-auto flex flex-col gap-3 pt-1">
                    {post.readingTime && <span className={HAND}>~{post.readingTime} min, with chai</span>}
                    {post.tags.length > 0 && (
                      <span className="flex flex-wrap gap-1.5">
                        {post.tags.map((tag) => (
                          <span key={tag} className={CHIP}>
                            {tag}
                          </span>
                        ))}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        {/* ========== PROJECT WRITE-UPS ========== */}
        <section className={`${WRAP} ${SHELL} pb-[60px]`}>
          <div className="border-t-[1.5px] border-tr-hairline pt-10">
            <h2 className={H2}>Project write-ups.</h2>
            <p className={`${LEDE} mt-3 max-w-[56ch]`}>
              {projects.length}, each with the same skeleton: arrived as, what I did, what changed. The
              deep dives add the decisions and their cost.
            </p>

            <div className="mt-7 grid grid-cols-[repeat(auto-fill,minmax(min(100%,240px),1fr))] gap-5">
              {deepDives.map((p) => (
                <Link key={p.id} href={`/projects/${p.id}`} className={SMALL_CARD}>
                  <span className={LABEL}>Deep dive</span>
                  <span className="text-[20px] font-bold leading-[var(--tr-lh-h2)] tracking-[-0.02em]">{p.title}</span>
                  <span className="line-clamp-2 text-[14px] leading-normal text-tr-text-mute">{p.summary}</span>
                </Link>
              ))}

              <Link href="/projects" className={SMALL_CARD}>
                <span className={LABEL}>All {projects.length}</span>
                <span className="text-[20px] font-bold leading-[var(--tr-lh-h2)] tracking-[-0.02em]">The index →</span>
                <span className="line-clamp-3 text-[14px] leading-normal text-tr-text-mute">
                  Filter by stack or domain. Student work is labelled, not hidden.
                </span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
