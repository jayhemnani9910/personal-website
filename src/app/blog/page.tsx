import { getAllPosts, getProjectSummaries } from "@/lib/content";
import { EditorialMasthead } from "@/components/EditorialMasthead";
import { EditorialColophon } from "@/components/EditorialColophon";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Writing",
  description: "Essays and long-form project writeups by Jay Hemnani.",
};

const pad = (n: number) => String(n).padStart(2, "0");

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

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

  const featured = posts.find((p) => p.featured) ?? posts[0];
  const others = posts.filter((p) => p.slug !== featured?.slug);

  const deepDives = [...projects].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return (a.priority ?? 99) - (b.priority ?? 99);
  });

  return (
    <main id="main-content" className="editorial min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <EditorialMasthead active="writing" />

      {/* Hero */}
      <section className="writing-hero shell">
        <div className="writing-hero-grid">
          <div>
            <div className="eyebrow"><span className="dot" /><span>Department B · The Writing</span></div>
            <h1 className="display writing-title">Notes from <span className="italic">the bench.</span></h1>
          </div>
          <p className="deck writing-deck">
            Long-form project post-mortems, an essay on the role I am currently targeting, and a few drafts left in plain sight as a form of public accountability.
          </p>
        </div>
      </section>

      <hr className="rule thick shell" style={{ marginInline: "var(--margin)" }} />

      {/* Featured essay */}
      {featured && (
        <section className="featured-essay shell">
          <div className="section-head">
            <span className="num">Part I</span>
            <span className="title">Editor&apos;s pick.</span>
            <span className="meta">{featured.readingTime ? `long read · ${featured.readingTime} min` : "long read"}</span>
          </div>

          <article>
            <Link href={`/blog/${featured.slug}`} className="feature-essay-link">
              <div className="fe-meta">
                <span className="mono xs upper accent-text">Essay · {featured.category ?? "Thoughts"}</span>
                <span className="mono xs upper muted">{fmtDate(featured.date)}</span>
              </div>
              <h2 className="fe-title">{featured.title}</h2>
              <p className="fe-deck">{featured.excerpt || featured.summary}</p>
              <div className="fe-foot">
                <span className="mono xs upper muted">Topics</span>
                {featured.tags?.length > 0 && (
                  <span className="essay-tags">
                    {featured.tags.slice(0, 4).map((t) => <span key={t}>{t}</span>)}
                  </span>
                )}
                <span className="go" style={{ marginLeft: "auto" }}>Read the essay</span>
              </div>
            </Link>
          </article>
        </section>
      )}

      {/* Other essays */}
      {others.length > 0 && (
        <section className="essays shell">
          <div className="section-head">
            <span className="num">Part II</span>
            <span className="title">Other essays.</span>
            <span className="meta">{others.length} more</span>
          </div>
          <ul className="essay-list">
            {others.map((post) => (
              <li key={post.slug}>
                <Link href={`/blog/${post.slug}`}>
                  <div className="el-date mono xs">{fmtDate(post.date)}</div>
                  <div className="el-body">
                    <h3>{post.title}</h3>
                    <p>{post.excerpt || post.summary}</p>
                    {post.tags?.length > 0 && (
                      <span className="el-tags mono xs">{post.tags.join(" · ")}</span>
                    )}
                  </div>
                  <div className="el-arrow mono">→</div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Project deep-dives */}
      <section className="deepdives shell">
        <div className="section-head">
          <span className="num">Part III</span>
          <span className="title">Project deep-dives.</span>
          <span className="meta">{deepDives.length} writeups</span>
        </div>
        <p className="deepdives-intro lede">
          Each project in the catalogue has a corresponding writeup: challenge, solution, impact, architecture, learnings. Below is the index. The full dossier on each one lives under <span className="mono small">/projects</span>.
        </p>
        <ol className="dd-list">
          {deepDives.map((p, i) => (
            <li key={p.id}>
              <Link href={`/projects/${p.id}`}>
                <span className="dd-num mono">{pad(i + 1)}</span>
                <span className="dd-title">{p.title}.</span>
                <span className="dd-deck">{p.summary}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {/* Drafts */}
      <section className="drafts shell">
        <div className="section-head">
          <span className="num">Part IV</span>
          <span className="title">In the pipeline.</span>
          <span className="meta">drafts · subject to change</span>
        </div>
        <ul className="draft-list">
          {DRAFTS.map((d) => (
            <li key={d.title}>
              <span className="draft-status mono xs upper">{d.status}</span>
              <span className="draft-title">{d.title}</span>
            </li>
          ))}
        </ul>
      </section>

      <EditorialColophon />
    </main>
  );
}
