"use client";

import { useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { CARD, CARD_HOVER, PILL, PILL_ACTIVE } from "@/components/desk";

/** What one /oss card needs: the full write-ups stay on the server. */
export type OssCard = {
  slug: string;
  repo: string;
  about: string;
  stars: number;
  count: number;
  countLabel: string;
  picks: { number: number; title: string }[];
  /** The newest and the oldest merge date, as ISO days. */
  newest: string;
  oldest: string;
};

// "most" is the order the cards arrive in (getOssRepos): the busiest first.
const SORTS = [
  { key: "most", label: "Most PRs", sort: (_a: OssCard, _b: OssCard) => 0 },
  { key: "recent", label: "Most recent", sort: (a: OssCard, b: OssCard) => b.newest.localeCompare(a.newest) },
  { key: "earliest", label: "Earliest", sort: (a: OssCard, b: OssCard) => a.oldest.localeCompare(b.oldest) },
  { key: "best", label: "Best", sort: (a: OssCard, b: OssCard) => b.stars - a.stars },
] as const;

const formatStars = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : `${n}`);

export function OssCards({ cards }: { cards: OssCard[] }) {
  const [sortKey, setSortKey] = useState<(typeof SORTS)[number]["key"]>("most");
  const sorted = cards.toSorted(SORTS.find((s) => s.key === sortKey)!.sort);

  return (
    <>
      <div role="group" aria-label="Sort projects" className="mb-5 flex flex-wrap gap-2">
        {SORTS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setSortKey(s.key)}
            aria-pressed={sortKey === s.key}
            className={`cursor-pointer ${PILL} ${sortKey === s.key ? PILL_ACTIVE : ""}`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((r) => (
          <li key={r.slug} className="flex">
            <Link
              href={`/oss/${r.slug}` as Route}
              className={`${CARD} ${CARD_HOVER} flex w-full min-w-0 flex-col p-5 text-tr-text hover:text-tr-text`}
            >
              <span className="flex items-baseline justify-between gap-3">
                <span className="min-w-0 font-mono text-[14px] font-semibold [overflow-wrap:anywhere]">{r.repo}</span>
                <span className="shrink-0 font-mono text-[12px] text-tr-text-faint">{r.countLabel}</span>
              </span>
              <span className="mt-1 block font-mono text-[12px] text-tr-text-faint">
                <span aria-hidden="true">★</span> {formatStars(r.stars)}
                <span className="sr-only"> stars on GitHub</span>
              </span>
              <span className="mt-2 block text-[14px] leading-[var(--tr-lh-body)] text-tr-text-mute">{r.about}</span>
              <span className="mt-4 block border-t border-dashed border-tr-rule-soft pt-3">
                {r.picks.map((pr) => (
                  <span key={pr.number} className="grid grid-cols-[1rem_1fr] gap-1.5 py-1 text-[14px] leading-snug">
                    <span aria-hidden="true" className="font-mono">✓</span>
                    <span>{pr.title}</span>
                  </span>
                ))}
              </span>
              <span className="mt-auto pt-4 font-mono text-[12px] underline">
                {r.count === 1 ? "read the story →" : `read all ${r.count} →`}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
