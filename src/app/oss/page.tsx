import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/page-metadata";
import { MERGED_PRS, MERGED_PRS_SEARCH, MERGED_PRS_SEARCH_LABEL } from "@/data/home";
import { cardPrs, countLabel, getOssRepos } from "@/lib/oss";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CARD, CARD_HOVER, H1, HIGHLIGHT, KICKER, LEDE, SHELL, WRAP } from "@/components/desk";

export const metadata: Metadata = pageMetadata({
  title: "Open source",
  description: "Fixes Jay Hemnani has had merged into other people's open-source projects, each told in plain words.",
  path: "/oss",
});

const OUT_LINK = "inline-flex min-h-6 items-center gap-1 py-1 hover:text-tr-accent-ink";

export default function OssPage() {
  const repos = getOssRepos();

  return (
    <div className="flex min-h-screen flex-col bg-tr-bg text-tr-text">
      <SiteHeader meta={`${MERGED_PRS.length} merged · ${repos.length} repos`} />
      <main id="main-content" className="flex-1">
        <section className={`${WRAP} ${SHELL} grid items-end gap-[clamp(2rem,5vw,5rem)] pb-8 pt-[clamp(40px,6vw,72px)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]`}>
          <div>
            <p className={`${KICKER} mb-4`}>
              /oss · {MERGED_PRS.length} fixes · {repos.length} projects
            </p>
            <h1 className={H1}>
              Merged into code <span className={HIGHLIGHT}>I don&apos;t own.</span>
            </h1>
          </div>
          <div>
            <p className={`${LEDE} max-w-[56ch]`}>
              Open-source projects are built in public by people who review every change before it goes
              in. These are the fixes they took from me, each told in plain words. Pick a project to read
              all of them.
            </p>
            <a
              href={MERGED_PRS_SEARCH}
              target="_blank"
              rel="noreferrer"
              className={`${OUT_LINK} mt-3 font-mono text-[13px] text-tr-text-mute underline`}
            >
              verify {MERGED_PRS_SEARCH_LABEL} in one GitHub search <span aria-hidden="true">↗</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </div>
        </section>

        <section className={`${WRAP} ${SHELL} pb-[clamp(3rem,6vw,5rem)]`}>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {repos.map((r) => {
              return (
                <li key={r.slug} className="flex">
                  <Link
                    href={`/oss/${r.slug}` as Route}
                    className={`${CARD} ${CARD_HOVER} flex w-full min-w-0 flex-col p-5 text-tr-text hover:text-tr-text`}
                  >
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="min-w-0 break-words font-mono text-[14px] font-semibold">{r.repo}</span>
                      <span className="shrink-0 font-mono text-[12px] text-tr-text-faint">{countLabel(r.prs)}</span>
                    </span>
                    <span className="mt-2 block text-[14px] leading-[var(--tr-lh-body)] text-tr-text-mute">{r.about}</span>
                    <span className="mt-4 block border-t border-dashed border-tr-rule-soft pt-3">
                      {cardPrs(r).map((pr) => (
                        <span key={pr.number} className="grid grid-cols-[1rem_1fr] gap-1.5 py-1 text-[14px] leading-snug">
                          <span aria-hidden="true" className="font-mono">✓</span>
                          <span>{pr.title}</span>
                        </span>
                      ))}
                    </span>
                    <span className="mt-auto pt-4 font-mono text-[12px] underline">
                      {r.prs.length === 1 ? "read the story →" : `read all ${r.prs.length} →`}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
