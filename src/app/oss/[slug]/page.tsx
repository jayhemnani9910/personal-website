import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pageMetadata } from "@/lib/page-metadata";
import { countLabel, getOssRepo, getOssRepos } from "@/lib/oss";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { H1, KICKER, LABEL, LEDE, SHELL, WRAP } from "@/components/desk";

export const dynamicParams = false;

export function generateStaticParams() {
  return getOssRepos().map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const repo = getOssRepo((await params).slug);
  if (!repo) return { title: "Not found", robots: { index: false } };
  return pageMetadata({
    title: `${repo.repo} · Open source`,
    description: `${countLabel(repo.prs)} into ${repo.repo}, each told in plain words. ${repo.about}`,
    path: `/oss/${repo.slug}`,
  });
}

const OUT_LINK = "inline-flex min-h-6 items-center gap-1 py-1 hover:text-tr-accent-ink";

const formatDay = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

const PARTS = [
  { key: "broken", label: "What was broken" },
  { key: "changed", label: "What I changed" },
  { key: "matters", label: "Why it matters" },
] as const;

export default async function OssRepoPage({ params }: { params: Promise<{ slug: string }> }) {
  const repo = getOssRepo((await params).slug);
  if (!repo) notFound();

  return (
    <div className="flex min-h-screen flex-col bg-tr-bg text-tr-text">
      <SiteHeader meta={countLabel(repo.prs)} />
      <main id="main-content" className="flex-1">
        <section className={`${WRAP} ${SHELL} pb-6 pt-[clamp(40px,6vw,72px)]`}>
          <p className={KICKER}>
            <Link href="/oss" className="underline hover:text-tr-accent-ink">
              /oss
            </Link>{" "}
            · {countLabel(repo.prs)}
          </p>
          <h1 className={`${H1} mt-3 break-words`}>{repo.repo}</h1>
          <p className={`${LEDE} mt-5 max-w-[56ch]`}>{repo.about}</p>
          <a
            href={`https://github.com/${repo.repo}`}
            target="_blank"
            rel="noreferrer"
            className={`${OUT_LINK} mt-2 font-mono text-[13px] text-tr-text-mute underline`}
          >
            the project on GitHub <span aria-hidden="true">↗</span>
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </section>

        <section className={`${WRAP} ${SHELL} pb-[clamp(3rem,6vw,5rem)]`}>
          <ol>
            {repo.prs.map((pr) => (
              <li key={pr.number} className="grid gap-1 border-t-[1.5px] border-tr-hairline py-6 sm:grid-cols-[minmax(110px,160px)_minmax(0,1fr)] sm:gap-5">
                <p className="pt-1 font-mono text-[13px] text-tr-text-faint">{formatDay(pr.merged)}</p>
                <article className="min-w-0">
                  <h2 className="text-[21px] font-bold leading-snug tracking-[-0.02em]">{pr.title}</h2>
                  <dl className="mt-3 grid max-w-[72ch] gap-3">
                    {PARTS.map((part) => (
                      <div key={part.key}>
                        <dt className={LABEL}>{part.label}</dt>
                        <dd className="mt-1 text-[15px] leading-[var(--tr-lh-body)] text-tr-text-mute">{pr[part.key]}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="mt-3 flex flex-wrap gap-x-4 font-mono text-[12px] text-tr-text-mute">
                    <a href={pr.href} target="_blank" rel="noreferrer" className={`${OUT_LINK} underline`}>
                      see the code, #{pr.number} <span aria-hidden="true">↗</span>
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                    {/* Closed on GitHub, not merged: Modular lands outside work
                        with Copybara, so the commit is the proof it went in. */}
                    {pr.landed && (
                      <a href={pr.landed} target="_blank" rel="noreferrer" className={`${OUT_LINK} underline`}>
                        closed on GitHub, landed as a commit <span aria-hidden="true">↗</span>
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    )}
                  </p>
                </article>
              </li>
            ))}
          </ol>
          <Link href="/oss" className={`${OUT_LINK} mt-4 font-mono text-[13px] underline`}>
            ← every project
          </Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
