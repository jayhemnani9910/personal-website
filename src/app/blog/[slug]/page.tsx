import type { JSX, ReactNode } from "react";
import { formatPostDate, getPost, getAllPosts } from "@/lib/content";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-metadata";
import { blogPosting, jsonLd } from "@/lib/json-ld";
import { MDXRemote } from "next-mdx-remote/rsc";

const MONO = "font-[family-name:var(--ff-mono)]";

const backLinkClass = `group inline-flex items-center gap-2 ${MONO} text-[length:var(--tr-t-mono)] uppercase tracking-[.04em] text-tr-text-mute no-underline transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] hover:text-tr-accent-ink`;

// Vertical hairline divider between meta chips, matching the stat rows the
// other token routes use (PROJECTS · OSS PRS · PAPERS).
function Divider() {
  return <span aria-hidden="true" className="mx-3 inline-block h-[.9em] w-px bg-tr-hairline align-middle" />;
}

// A guard, not a fix for current content: no post body opens with a `# Title`
// line today, but one that did would repeat the frontmatter title. Sizing it
// at h2 scale, one step below the page's own <h1>, keeps that from reading as
// two stacked hero headlines.
const mdxComponents = {
  // A markdown `#` in the body maps through this key regardless of which HTML
  // tag it renders, so this emits an actual <h2>, not a second <h1>: the page
  // already has one <h1> (the frontmatter title above), and a duplicate <h1>
  // here would break the one-<h1>-per-page rule even though it was already
  // sized down to look like a subordinate heading.
  h1: (props: JSX.IntrinsicElements["h1"]) => (
    <h2
      {...props}
      className="mt-[var(--tr-s-10)] mb-[var(--tr-s-4)] text-[length:var(--tr-t-h2)] leading-[var(--tr-lh-h2)] tracking-[-.02em] font-medium text-tr-text"
    />
  ),
  h2: (props: JSX.IntrinsicElements["h2"]) => (
    <h2
      {...props}
      className="mt-[var(--tr-s-8)] mb-[var(--tr-s-3)] text-[length:var(--tr-t-h3)] leading-[var(--tr-lh-h3)] tracking-[-.015em] font-medium text-tr-text"
    />
  ),
  h3: (props: JSX.IntrinsicElements["h3"]) => (
    <h3
      {...props}
      className="mt-[var(--tr-s-6)] mb-[var(--tr-s-2)] text-[length:var(--tr-t-body)] font-medium text-tr-text"
    />
  ),
  p: (props: JSX.IntrinsicElements["p"]) => (
    <p {...props} className="mb-[var(--tr-s-5)] text-[length:var(--tr-t-body)] leading-[var(--tr-lh-prose)] text-tr-text" />
  ),
  ul: (props: JSX.IntrinsicElements["ul"]) => (
    <ul
      {...props}
      className="mb-[var(--tr-s-5)] list-disc space-y-[var(--tr-s-2)] pl-[var(--tr-s-6)] text-[length:var(--tr-t-body)] text-tr-text"
    />
  ),
  ol: (props: JSX.IntrinsicElements["ol"]) => (
    <ol
      {...props}
      className="mb-[var(--tr-s-5)] list-decimal space-y-[var(--tr-s-2)] pl-[var(--tr-s-6)] text-[length:var(--tr-t-body)] text-tr-text"
    />
  ),
  li: (props: JSX.IntrinsicElements["li"]) => <li {...props} className="leading-[var(--tr-lh-prose)]" />,
  a: (props: JSX.IntrinsicElements["a"]) => (
    <a
      {...props}
      className="text-tr-text underline decoration-transparent underline-offset-[3px] transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] hover:text-tr-accent-ink hover:decoration-tr-accent"
    />
  ),
  strong: (props: JSX.IntrinsicElements["strong"]) => <strong {...props} className="font-semibold text-tr-text" />,
  em: (props: JSX.IntrinsicElements["em"]) => <em {...props} className="italic text-tr-text" />,
  code: (props: JSX.IntrinsicElements["code"]) => {
    // Fenced blocks: MDX puts a `language-xxx` class on the <code> nested
    // inside <pre>. Leave that one bare: `pre` below already owns the
    // block's surface, border and mono styling, so decorating both would
    // double up (a chip-looking <code> inside its own bordered box).
    const isFenced = typeof props.className === "string" && props.className.includes("language-");
    if (isFenced) {
      return <code {...props} />;
    }
    return (
      <code
        {...props}
        className={`${MONO} rounded-[var(--tr-r-sm)] bg-tr-surface-2 px-[.4em] py-[.15em] text-[length:var(--tr-t-mono-sm)] text-tr-text ${props.className ?? ""}`}
      />
    );
  },
  pre: (props: JSX.IntrinsicElements["pre"]) => (
    <pre
      {...props}
      className={`mb-[var(--tr-s-5)] min-w-0 overflow-x-auto border border-tr-hairline bg-tr-surface-1 p-[var(--tr-s-5)] ${MONO} text-[length:var(--tr-t-mono)] leading-[var(--tr-lh-body)] text-tr-text-mute`}
    />
  ),
  blockquote: (props: JSX.IntrinsicElements["blockquote"]) => (
    <blockquote
      {...props}
      className="mb-[var(--tr-s-5)] border-l border-tr-hairline pl-[var(--tr-s-5)] text-[length:var(--tr-t-body)] leading-[var(--tr-lh-prose)] text-tr-text-mute"
    />
  ),
  hr: (props: JSX.IntrinsicElements["hr"]) => (
    <hr {...props} className="my-[var(--tr-s-8)] border-0 border-t border-tr-hairline" />
  ),
  img: (props: JSX.IntrinsicElements["img"]) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      alt={props.alt ?? ""}
      className="my-[var(--tr-s-5)] max-w-full border border-tr-hairline rounded-[var(--tr-r-sm)]"
    />
  ),
  // Wraps an inline <svg> diagram in a post. At width 100% a 700-unit diagram
  // shrinks its labels to about 5px on a phone, so the svg keeps a minimum
  // width and this box scrolls sideways instead. Capitalised because MDX only
  // routes literal lowercase tags like <svg> through components when they come
  // from markdown syntax, never when written as JSX. tabIndex lets a keyboard
  // user scroll it.
  Diagram: ({ children }: { children?: ReactNode }) => (
    <div tabIndex={0} className="mb-[var(--tr-s-5)] overflow-x-auto [&>svg]:min-w-[640px]">
      {children}
    </div>
  ),
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return { title: "Post Not Found", robots: { index: false } };
  }

  return pageMetadata({
    title: post.title,
    description: post.summary,
    path: `/blog/${slug}`,
    type: "article",
    article: { publishedTime: post.date, tags: post.tags },
  });
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

  const categoryLabel = post.category.charAt(0).toUpperCase() + post.category.slice(1);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(blogPosting(post)) }} />
      <SiteHeader />
      <main id="main-content" className="bg-tr-bg text-tr-text">
        <article className="px-[clamp(1rem,4vw,2rem)] pt-[clamp(2.5rem,5vw,4rem)] pb-[var(--tr-s-12)]">
          <div className="mx-auto max-w-[68ch]">
            <Link href="/blog" data-cursor="OPEN" className={`${backLinkClass} mb-[var(--tr-s-8)]`}>
              <ArrowLeft className="h-3 w-3" />
              Back to writing
            </Link>

            <header className="mb-[var(--tr-s-8)] border-b border-tr-hairline pb-[var(--tr-s-6)]">
              <p className={`mb-[var(--tr-s-3)] ${MONO} text-[length:var(--tr-t-mono)] tracking-[.1em] text-tr-text-faint`}>
                /WRITING · {categoryLabel.toUpperCase()}
              </p>

              <h1 className="mb-[var(--tr-s-4)] text-[length:var(--tr-t-display-sm)] leading-[var(--tr-lh-display)] tracking-[-.035em] font-medium text-tr-text">
                {post.title}
              </h1>

              <div className={`flex flex-wrap items-center ${MONO} text-[length:var(--tr-t-mono-sm)] text-tr-text-mute`}>
                <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                {post.readingTime && (
                  <>
                    <Divider />
                    <span>{post.readingTime} min read</span>
                  </>
                )}
              </div>

              {post.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`rounded-[var(--tr-r-sm)] border border-tr-hairline px-1.5 py-0.5 ${MONO} text-[length:var(--tr-t-mono-sm)] text-tr-text-mute`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            <div>
              <MDXRemote source={post.content} components={mdxComponents} />
            </div>

            <footer className="mt-[var(--tr-s-10)] border-t border-tr-hairline pt-[var(--tr-s-6)]">
              <Link href="/blog" data-cursor="OPEN" className={backLinkClass}>
                <ArrowLeft className="h-3 w-3" />
                More writing
              </Link>
            </footer>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
