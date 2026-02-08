import { getPost, getAllPosts } from "@/lib/content";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: "article",
      publishedTime: post.date,
      tags: post.tags,
    },
  };
}

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <main id="main-content" className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />

      <article className="pt-40 pb-20 section-shell">
        <div className="max-w-3xl mx-auto">
          {/* Back Link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 transition-colors mb-8 hover:text-[var(--accent)]"
            style={{ color: 'var(--text-muted)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to blog
          </Link>

          {/* Header */}
          <header className="mb-12">
            <div className="flex flex-wrap items-center gap-4 text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </div>
              {post.readingTime && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{post.readingTime} min read</span>
                </div>
              )}
            </div>

            <h1 className="title-xl mb-6">{post.title}</h1>

            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="chip inline-flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Content */}
          <div className="card p-8 space-y-4">
            {post.content.split(/\n\s*\n/).map((block, idx) => (
              <p key={idx} className="whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                {block.trim()}
              </p>
            ))}
          </div>

          {/* Post Footer */}
          <footer className="mt-16 pt-8" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="flex justify-between items-center">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 transition-colors hover:opacity-80"
                style={{ color: 'var(--accent)' }}
              >
                <ArrowLeft className="w-4 h-4" />
                More posts
              </Link>
            </div>
          </footer>
        </div>
      </article>

      <Footer />
    </main>
  );
}
