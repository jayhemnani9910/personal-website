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
    <main id="main-content" className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />

      <section className="pt-40 pb-20 section-shell">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <h1 className="title-xl mb-4">Blog</h1>
            <p className="body-base" style={{ color: 'var(--text-secondary)' }}>
              Thoughts on data engineering, web development, and building things.
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-20 card p-8">
              <p className="mb-4" style={{ color: 'var(--text-muted)' }}>No posts yet.</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
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
                  <article className="card card-interactive p-6 transition-all">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
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
                        <span className="chip" style={{ color: 'var(--accent)' }}>
                          Featured
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl font-bold mb-2 transition-colors" style={{ color: 'var(--text-primary)' }}>
                      <span className="group-hover:text-[var(--accent)]">{post.title}</span>
                    </h2>

                    <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                      {post.excerpt || post.summary}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="chip"
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
