"use client";

import Link from "next/link";
import type { Route } from "next";
import { useState, useSyncExternalStore } from "react";

export type PickProject = { id: string; title: string; brief: string; changed: string; tags: string[] };

const DAY_MS = 864e5;

// A one-second clock read through useSyncExternalStore: null on the server and
// at hydration, so the server HTML (day 0) never mismatches, then the real day.
function subscribeClock(callback: () => void) {
  const id = setInterval(callback, 1000);
  return () => clearInterval(id);
}
const getClock = () => Math.floor(Date.now() / 1000);
const getServerClock = () => null;

/** Day of the year in local time, 1 on 1 January. */
export function dayOfYear(d: Date): number {
  return Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / DAY_MS);
}

/** Time left until local midnight, as "5h 03m 09s". */
export function untilMidnight(d: Date): string {
  const left = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime() - d.getTime();
  const hh = Math.floor(left / 36e5);
  const mm = Math.floor(left / 6e4) % 60;
  const ss = Math.floor(left / 1000) % 60;
  return `${hh}h ${String(mm).padStart(2, "0")}m ${String(ss).padStart(2, "0")}s`;
}

const MONO_LABEL = "mb-1.5 font-desk-mono text-[11px] text-desk-muted-dark";

export function TodayPick({ projects, facts }: { projects: PickProject[]; facts: string[] }) {
  const seconds = useSyncExternalStore(subscribeClock, getClock, getServerClock);
  const [factOffset, setFactOffset] = useState(0);

  const now = seconds === null ? null : new Date(seconds * 1000);
  const day = now ? dayOfYear(now) : 0;
  const project = projects[day % projects.length];
  const factIndex = (day + factOffset) % facts.length;

  return (
    <section id="today" aria-labelledby="today-h2" className="mx-auto max-w-[1200px] px-[clamp(16px,4vw,48px)] py-[60px]">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <h2 id="today-h2" className="text-[length:clamp(32px,4.5vw,56px)] font-extrabold tracking-[-0.035em]">
          Today&apos;s pick
        </h2>
        <p className="font-desk-mono text-[13px] text-desk-muted">
          changes in{" "}
          <span className="font-semibold text-desk-ink" suppressHydrationWarning>
            {now ? untilMidnight(now) : "--h --m --s"}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-5">
        <Link
          href={`/projects/${project.id}` as Route}
          className="flex min-w-0 flex-col gap-4 rounded-[20px] bg-desk-ink p-[clamp(22px,3vw,36px)] text-desk-paper hover:text-desk-paper md:col-span-2"
        >
          <p className="font-desk-mono text-[12px] text-desk-butter">
            project of the day{now && ` · ${now.toLocaleDateString(undefined, { day: "numeric", month: "short" })}`}
          </p>
          <h3 className="text-[length:clamp(30px,3.6vw,46px)] font-extrabold leading-none tracking-[-0.03em] underline decoration-transparent decoration-2 underline-offset-4 transition-colors hover:decoration-desk-tomato">
            {project.title}
          </h3>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5">
            <div>
              <p className={MONO_LABEL}>THE BRIEF</p>
              <p className="text-[17px] leading-[var(--desk-lh-lede)]">{project.brief}</p>
            </div>
            <div>
              <p className={MONO_LABEL}>WHAT CHANGED</p>
              <p className="text-[17px] leading-[var(--desk-lh-lede)]">{project.changed}</p>
            </div>
          </div>
          <ul className="flex flex-wrap gap-2">
            {project.tags.map((t) => (
              <li key={t} className="rounded-full border border-desk-line-dark px-2.5 py-1 font-desk-mono text-[12px]">
                {t}
              </li>
            ))}
          </ul>
        </Link>

        <div className="flex rotate-[1.5deg] flex-col gap-3 rounded-[20px] border-[1.5px] border-desk-ink bg-desk-butter p-[26px]">
          <p className="font-desk-mono text-[12px]">useless fact #{factIndex + 1}</p>
          <p aria-live="polite" className="font-desk-hand text-[30px] leading-[var(--desk-lh-hand)]">
            {facts[factIndex]}
          </p>
          <button
            type="button"
            onClick={() => setFactOffset((o) => o + 1)}
            className="mt-auto cursor-pointer self-start rounded-full border-[1.5px] border-desk-ink bg-desk-card px-3 py-2 font-desk-mono text-[12px]"
          >
            one more →
          </button>
        </div>
      </div>
    </section>
  );
}
