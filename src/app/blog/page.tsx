import { getAllPosts } from "@/lib/content";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "Articles on data engineering, web development, and technology.",
};

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <main id="main-content" className="min-h-screen bg-[var(--bg-void)]">
      <Navbar />

      <section className="pt-32 pb-20 section-shell">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <h1 className="title-xl mb-4">Blog</h1>
            <p className="body-base text-[var(--text-secondary)]">
              Thoughts on data engineering, web development, and building things.
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-20 glass-panel rounded-2xl">
              <p className="text-[var(--text-muted)] mb-4">No posts yet.</p>
              <p className="text-sm text-[var(--text-muted)]">
                Check back soon for articles on data engineering and web development.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="block group"
                >
                  <article className="glass-panel glass-panel-hover p-6 rounded-2xl transition-all">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                        <time dateTime={post.date}>
                          {new Date(post.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </time>
                        {post.readingTime && (
                          <>
                            <span>•</span>
                            <span>{post.readingTime} min read</span>
                          </>
                        )}
                      </div>
                      {post.featured && (
                        <span className="chip text-[var(--neon-cyan)]">
                          Featured
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl font-bold mb-2 group-hover:text-[var(--neon-cyan)] transition-colors">
                      {post.title}
                    </h2>

                    <p className="text-[var(--text-secondary)] text-sm mb-4">
                      {post.excerpt || post.summary}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs font-mono rounded bg-[var(--bg-abyss)] text-[var(--text-muted)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

