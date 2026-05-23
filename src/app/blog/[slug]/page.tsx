import { getPost, getAllPosts } from "@/lib/content";
import { EditorialMasthead } from "@/components/EditorialMasthead";
import { EditorialColophon } from "@/components/EditorialColophon";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { JSX } from "react";

const mdxComponents = {
  h1: (props: JSX.IntrinsicElements["h1"]) => (
    <h1
      {...props}
      style={{
        color: "var(--text-primary)",
        fontSize: "2rem",
        fontWeight: 700,
        lineHeight: 1.25,
        marginTop: "2.5rem",
        marginBottom: "1rem",
      }}
    />
  ),
  h2: (props: JSX.IntrinsicElements["h2"]) => (
    <h2
      {...props}
      style={{
        color: "var(--text-primary)",
        fontSize: "1.5rem",
        fontWeight: 600,
        lineHeight: 1.3,
        marginTop: "2.5rem",
        marginBottom: "0.75rem",
        paddingBottom: "0.4rem",
        borderBottom: "1px solid var(--border)",
      }}
    />
  ),
  h3: (props: JSX.IntrinsicElements["h3"]) => (
    <h3
      {...props}
      style={{
        color: "var(--text-primary)",
        fontSize: "1.2rem",
        fontWeight: 600,
        lineHeight: 1.4,
        marginTop: "2rem",
        marginBottom: "0.5rem",
      }}
    />
  ),
  p: (props: JSX.IntrinsicElements["p"]) => (
    <p
      {...props}
      style={{
        color: "var(--text-secondary)",
        fontSize: "1.0625rem",
        lineHeight: 1.75,
        marginBottom: "1.25rem",
      }}
    />
  ),
  ul: (props: JSX.IntrinsicElements["ul"]) => (
    <ul
      {...props}
      style={{
        color: "var(--text-secondary)",
        paddingLeft: "1.5rem",
        marginBottom: "1.25rem",
        listStyleType: "disc",
      }}
    />
  ),
  ol: (props: JSX.IntrinsicElements["ol"]) => (
    <ol
      {...props}
      style={{
        color: "var(--text-secondary)",
        paddingLeft: "1.5rem",
        marginBottom: "1.25rem",
        listStyleType: "decimal",
      }}
    />
  ),
  li: (props: JSX.IntrinsicElements["li"]) => (
    <li
      {...props}
      style={{
        color: "var(--text-secondary)",
        fontSize: "1.0625rem",
        lineHeight: 1.75,
        marginBottom: "0.35rem",
      }}
    />
  ),
  a: (props: JSX.IntrinsicElements["a"]) => (
    <a
      {...props}
      style={{
        color: "var(--accent)",
        textDecoration: "underline",
        textUnderlineOffset: "3px",
      }}
    />
  ),
  strong: (props: JSX.IntrinsicElements["strong"]) => (
    <strong
      {...props}
      style={{ color: "var(--text-primary)", fontWeight: 600 }}
    />
  ),
  em: (props: JSX.IntrinsicElements["em"]) => (
    <em {...props} style={{ color: "var(--text-secondary)", fontStyle: "italic" }} />
  ),
  code: (props: JSX.IntrinsicElements["code"]) => (
    <code
      {...props}
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.875em",
        background: "var(--bg-secondary)",
        color: "var(--accent)",
        padding: "0.15em 0.4em",
        borderRadius: "4px",
        border: "1px solid var(--border)",
      }}
    />
  ),
  pre: (props: JSX.IntrinsicElements["pre"]) => (
    <pre
      {...props}
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.875rem",
        background: "var(--bg-secondary)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "1.25rem 1.5rem",
        overflowX: "auto",
        marginBottom: "1.5rem",
        lineHeight: 1.65,
      }}
    />
  ),
  blockquote: (props: JSX.IntrinsicElements["blockquote"]) => (
    <blockquote
      {...props}
      style={{
        borderLeft: "3px solid var(--border-strong)",
        paddingLeft: "1rem",
        marginLeft: 0,
        marginBottom: "1.25rem",
        color: "var(--text-muted)",
        fontStyle: "italic",
      }}
    />
  ),
  hr: (props: JSX.IntrinsicElements["hr"]) => (
    <hr
      {...props}
      style={{
        border: "none",
        borderTop: "1px solid var(--border)",
        marginTop: "2rem",
        marginBottom: "2rem",
      }}
    />
  ),
  img: (props: JSX.IntrinsicElements["img"]) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      alt={props.alt ?? ""}
      style={{
        width: "100%",
        borderRadius: "var(--radius-md)",
        marginTop: "1rem",
        marginBottom: "1rem",
      }}
    />
  ),
};

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
    <main id="main-content" className="editorial min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <EditorialMasthead active="writing" />

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
          <div className="card p-8" style={{ maxWidth: "100%" }}>
            <MDXRemote source={post.content} components={mdxComponents} />
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

      <EditorialColophon />
    </main>
  );
}
