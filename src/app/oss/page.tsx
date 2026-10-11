import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-metadata";
import { MERGED_PRS, MERGED_PRS_SEARCH, MERGED_PRS_SEARCH_LABEL } from "@/data/home";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CARD, H1, HIGHLIGHT, KICKER, LEDE, SHELL, WRAP } from "@/components/desk";

export const metadata: Metadata = pageMetadata({
  title: "Open source",
  description: "Pull requests Jay Hemnani has had merged into other people's repositories, by repo and number.",
  path: "/oss",
});

const OUT_LINK = "inline-flex min-h-6 items-center gap-1 py-1 hover:text-tr-accent-ink";
// OUT_LINK for every link inside a repo's PR list, written once on the <ul>.
const PR_LIST_LINKS = "[&_a]:inline-flex [&_a]:min-h-6 [&_a]:items-center [&_a]:gap-1 [&_a]:py-1 [&_a]:hover:text-tr-accent-ink";

// One card per repo, the busiest first. Within a repo, PRs read in number
// order however MERGED_PRS was appended to.
const prNumber = (n: string) => Number(n.replace(/\D/g, ""));
const repos = [...Map.groupBy(MERGED_PRS, (pr) => pr.repo)]
  .map(([repo, prs]) => ({ repo, prs: prs.toSorted((a, b) => prNumber(a.number) - prNumber(b.number)) }))
  .sort((a, b) => b.prs.length - a.prs.length || a.repo.localeCompare(b.repo));

export default function OssPage() {
  return (
    <div className="flex min-h-screen flex-col bg-tr-bg text-tr-text">
      <SiteHeader meta={`${MERGED_PRS.length} merged · ${repos.length} repos`} />
      <main id="main-content" className="flex-1">
        <section className={`${WRAP} ${SHELL} grid items-end gap-[clamp(2rem,5vw,5rem)] pb-8 pt-[clamp(40px,6vw,72px)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]`}>
          <div>
            <p className={`${KICKER} mb-4`}>
              /oss · {MERGED_PRS.length} pull requests · {repos.length} repos
            </p>
            <h1 className={H1}>
              Merged into code <span className={HIGHLIGHT}>I don&apos;t own.</span>
            </h1>
          </div>
          <div>
            <p className={`${LEDE} max-w-[56ch]`}>
              Every pull request here was reviewed and merged by the people who maintain the repo. Each
              number opens the diff on GitHub, so none of it has to be taken on trust.
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
          {/* Said once, not on every link. */}
          <p className="sr-only">Each number opens the pull request on GitHub in a new tab.</p>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {repos.map(({ repo, prs }) => (
              <li key={repo} className={`${CARD} min-w-0 p-5`}>
                <div className="flex items-baseline justify-between gap-3">
                  <a
                    href={`https://github.com/${repo}`}
                    target="_blank"
                    rel="noreferrer"
                    className="min-w-0 break-words font-mono text-[14px] font-semibold text-tr-text hover:text-tr-accent-ink"
                  >
                    {repo}
                    <span className="sr-only"> on GitHub (opens in a new tab)</span>
                  </a>
                  <span className="shrink-0 font-mono text-[12px] text-tr-text-faint">
                    {prs.length} {prs.every((pr) => pr.landed) ? "landed" : "merged"}
                  </span>
                </div>
                <ul className={`${PR_LIST_LINKS} mt-3 flex flex-wrap gap-x-3 border-t border-dashed border-tr-rule-soft pt-2 font-mono text-[12px] text-tr-text-mute`}>
                  {prs.map((pr) => (
                    <li key={pr.href} className="flex flex-wrap gap-x-3">
                      <a href={pr.href} target="_blank" rel="noreferrer">
                        {pr.number} <span aria-hidden="true">↗</span>
                      </a>
                      {/* Closed on GitHub, not merged: Modular lands outside PRs
                          with Copybara, so the commit is the proof it went in. */}
                      {pr.landed && (
                        <a href={pr.landed} target="_blank" rel="noreferrer">
                          (closed, landed as a commit<span aria-hidden="true"> ↗</span>)
                          <span className="sr-only"> for {pr.repo} {pr.number} (opens in a new tab)</span>
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
