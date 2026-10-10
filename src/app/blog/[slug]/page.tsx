import type { JSX, ReactNode } from "react";
import { formatPostDate, getPost, getAllPosts } from "@/lib/content";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-metadata";
import { blogPosting, jsonLd } from "@/lib/json-ld";
import { MDXRemote } from "next-mdx-remote/rsc";
import { SITE_CONFIG } from "@/../content/site";
import { CHIP, H1, H2, HAND, HIGHLIGHT, KICKER, SHELL } from "@/components/desk";

const BACK_LINK = "font-mono text-[13px] text-tr-text-faint hover:text-tr-accent-ink";
const INLINE_CODE = "rounded-[var(--tr-r-sm)] bg-tr-surface-2 px-[.35em] py-[.1em] font-mono text-[13px] text-tr-text";
const BODY = "text-[17px] leading-[var(--tr-lh-prose)] text-tr-text-mute";

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
    <h2 {...props} className={`${H2} mb-4 mt-12 [hr+&]:mt-0`} />
  ),
  h2: (props: JSX.IntrinsicElements["h2"]) => (
    <h2
      {...props}
      className="mb-3 mt-12 text-[26px] [hr+&]:mt-0 font-extrabold leading-[var(--tr-lh-h2)] tracking-[-0.025em] text-tr-text"
    />
  ),
  h3: (props: JSX.IntrinsicElements["h3"]) => (
    <h3 {...props} className="mb-2 mt-8 text-[20px] font-bold leading-[var(--tr-lh-h2)] tracking-[-0.02em] text-tr-text" />
  ),
  p: (props: JSX.IntrinsicElements["p"]) => <p {...props} className={`mb-5 ${BODY}`} />,
  ul: (props: JSX.IntrinsicElements["ul"]) => (
    <ul {...props} className={`mb-5 list-disc space-y-2 pl-6 marker:text-tr-text-faint ${BODY}`} />
  ),
  ol: (props: JSX.IntrinsicElements["ol"]) => (
    <ol {...props} className={`mb-5 list-decimal space-y-2 pl-6 marker:font-mono marker:text-[14px] marker:text-tr-text-faint ${BODY}`} />
  ),
  li: (props: JSX.IntrinsicElements["li"]) => <li {...props} className="pl-1 leading-[var(--tr-lh-prose)]" />,
  // Ink words; the tomato underline and the hover colour come from globals.css.
  a: (props: JSX.IntrinsicElements["a"]) => <a {...props} className="text-tr-text underline" />,
  strong: (props: JSX.IntrinsicElements["strong"]) => <strong {...props} className="font-bold text-tr-text" />,
  // Bricolage has no italic, so emphasis sits on the butter highlight.
  em: (props: JSX.IntrinsicElements["em"]) => <em {...props} className={`not-italic text-tr-text ${HIGHLIGHT}`} />,
  code: (props: JSX.IntrinsicElements["code"]) => {
    // Fenced blocks: MDX puts a `language-xxx` class on the <code> nested
    // inside <pre>. Leave that one bare: `pre` below already owns the
    // block's surface, border and mono styling, so decorating both would
    // double up (a chip-looking <code> inside its own ink panel).
    const isFenced = typeof props.className === "string" && props.className.includes("language-");
    if (isFenced) {
      return <code {...props} />;
    }
    return <code {...props} className={`${INLINE_CODE} ${props.className ?? ""}`} />;
  },
  pre: (props: JSX.IntrinsicElements["pre"]) => (
    <pre
      {...props}
      className="ink-panel mb-5 min-w-0 overflow-x-auto rounded-[var(--tr-r-lg)] border-[1.5px] border-tr-on-ink-line bg-tr-text p-5 font-mono text-[12.5px] leading-[var(--tr-lh-body)] text-tr-on-ink"
    />
  ),
  blockquote: (props: JSX.IntrinsicElements["blockquote"]) => (
    <blockquote {...props} className={`mb-5 border-l-[3px] border-tr-accent pl-5 ${BODY}`} />
  ),
  hr: (props: JSX.IntrinsicElements["hr"]) => (
    <hr {...props} className="my-10 border-0 border-t-[1.5px] border-dashed border-tr-rule-soft" />
  ),
  img: (props: JSX.IntrinsicElements["img"]) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      alt={props.alt ?? ""}
      className="my-5 max-w-full rounded-[var(--tr-r-lg)] border-[1.5px] border-tr-hairline"
    />
  ),
  // Wraps an inline <svg> diagram in a post. At width 100% a 700-unit diagram
  // shrinks its labels to about 5px on a phone, so the svg keeps a minimum
  // width and this box scrolls sideways instead. Capitalised because MDX only
  // routes literal lowercase tags like <svg> through components when they come
  // from markdown syntax, never when written as JSX. tabIndex lets a keyboard
  // user scroll it.
  Diagram: ({ children }: { children?: ReactNode }) => (
    <div tabIndex={0} className="mb-5 overflow-x-auto text-tr-text [&>svg]:min-w-[640px]">
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(blogPosting(post)) }} />
      <SiteHeader />
      <main id="main-content" className="bg-tr-bg text-tr-text">
        <article className={`${SHELL} pb-[60px] pt-[clamp(32px,5vw,56px)]`}>
          <div className="mx-auto max-w-[68ch]">
            <Link href="/blog" className={BACK_LINK}>
              <span aria-hidden="true">←</span> back to writing
            </Link>

            <header className="mb-10 mt-8 border-b-[1.5px] border-tr-hairline pb-7">
              <p className={KICKER}>/writing · {post.category}</p>

              <h1 className={`${H1} mt-3`}>{post.title}</h1>

              <p className="mt-5 font-mono text-[13px] text-tr-text-faint">
                <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                {post.readingTime && <> · {post.readingTime} min read</>}
              </p>

              {post.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <span key={tag} className={CHIP}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            <div>
              <MDXRemote source={post.content} components={mdxComponents} />
            </div>

            <footer className="mt-12 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-4 border-t-[1.5px] border-tr-hairline pt-6">
              <a href={`mailto:${SITE_CONFIG.social.email}`} className={`${HAND} inline-block -rotate-1 hover:text-tr-accent-ink`}>
                that&apos;s the essay. argue with me →
              </a>
              <Link href="/blog" className={BACK_LINK}>
                <span aria-hidden="true">←</span> more writing
              </Link>
            </footer>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
