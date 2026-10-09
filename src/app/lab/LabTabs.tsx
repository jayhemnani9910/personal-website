"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import type { Route } from "next";
import { LAB_ITEMS, type LabItem } from "@/data/lab";
import { SITE_CONFIG } from "@/../content/site";
import { CARD, CARD_HOVER, CHIP, LABEL, PILL, PILL_ACTIVE, SHELL, WRAP } from "@/components/desk";

type TabKey = keyof typeof LAB_ITEMS;

const TABS: { key: TabKey; label: string }[] = [
  { key: "building", label: "Building" },
  { key: "exploring", label: "Exploring" },
  { key: "radar", label: "On the radar" },
];

const LINK = "font-mono text-[12px] text-tr-text-mute hover:text-tr-accent-ink";
const TAB_ON = `${PILL} ${PILL_ACTIVE}`;

// Calm mono status derived from the tab plus (for Building) the progress value.
// Never the accent: the active tab is the page's single at-rest accent, so a status
// here stays in the machine channel.
function statusFor(tab: TabKey, progress?: number): string {
  if (tab === "exploring") return "Exploring";
  if (tab === "radar") return "On the radar";
  return progress === 100 ? "Shipped" : "In progress";
}

function LabCard({ item, tab }: { item: LabItem; tab: TabKey }) {
  const { progress } = item;
  const status = statusFor(tab, progress);
  // A link on this site (the data keeps it absolute for WebMCP) opens its
  // page in place; any other link is a GitHub repo.
  const sitePath = item.link?.startsWith(`${SITE_CONFIG.url}/`) ? item.link.slice(SITE_CONFIG.url.length) : null;
  const showBar = progress !== undefined && progress < 100;

  return (
    <article className={`${CARD} ${CARD_HOVER} flex h-full flex-col p-6`}>
      <div className="mb-3 flex h-5 items-center justify-between gap-3">
        <span className={LABEL}>{status}</span>
        {sitePath ? (
          <Link
            href={sitePath as Route}
            aria-label={`${item.title}: project page`}
            className={LINK}
          >
            <span aria-hidden="true" className="text-[16px] leading-none">→</span>
          </Link>
        ) : item.link ? (
          <a
            href={item.link}
            target="_blank"
            rel="noreferrer"
            aria-label={`${item.title} on GitHub`}
            className={LINK}
          >
            <span aria-hidden="true">github ↗</span>
          </a>
        ) : null}
      </div>

      {/* A plain paragraph, not a heading: these cards sit inside a tabpanel
          ahead of the page's only <h2> (the collaborate card), so a heading
          here would read as a skip in the outline. Same call as the project
          row titles in src/app/projects/ProjectsClient.tsx. */}
      <p className="mb-2 text-[22px] font-extrabold leading-[var(--tr-lh-h3)] tracking-[-0.025em]">{item.title}</p>

      <p className="text-[15px] leading-normal text-tr-text-mute">{item.description}</p>

      {showBar && (
        <div className="mt-4">
          <div className="mb-2 flex items-baseline justify-between">
            <span className={LABEL}>Progress</span>
            <span className="font-mono text-[12px] text-tr-text-mute">{progress}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full border-[1.5px] border-tr-hairline bg-tr-surface-2">
            <div className="h-full bg-tr-butter" style={{ width: `${progress}%` }} aria-hidden="true" />
          </div>
        </div>
      )}

      {item.tags.length > 0 && (
        <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
          {item.tags.map((tag) => (
            <span key={tag} className={CHIP}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

// The only stateful part of /lab: the tablist and its panels. The rest of the
// page renders on the server.
export function LabTabs() {
  const [activeTab, setActiveTab] = useState<TabKey>("building");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Tablist keyboard model (WAI-ARIA): Left/Right move focus AND selection with
  // wraparound; Home/End jump to the ends. Up/Down are deliberately left alone
  // so vertical page scrolling is never hijacked on a horizontal tablist.
  function onTabKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number | null = null;
    if (e.key === "ArrowRight") next = (index + 1) % TABS.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TABS.length - 1;
    if (next === null) return;
    e.preventDefault();
    setActiveTab(TABS[next].key);
    tabRefs.current[next]?.focus();
  }

  return (
    <section className={`${WRAP} ${SHELL} pb-[clamp(3rem,6vw,5rem)]`}>
      <div
        role="tablist"
        aria-label="Lab sections"
        aria-orientation="horizontal"
        className="flex flex-wrap gap-2"
      >
        {TABS.map((tab, i) => {
          const selected = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              id={`lab-tab-${tab.key}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`lab-panel-${tab.key}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveTab(tab.key)}
              onKeyDown={(e) => onTabKeyDown(e, i)}
              className={`${selected ? TAB_ON : PILL} cursor-pointer`}
            >
              {tab.label}
              <span className="text-tr-text-mute">
                {LAB_ITEMS[tab.key].length}
              </span>
            </button>
          );
        })}
      </div>

      {TABS.map((tab) => {
        const items = LAB_ITEMS[tab.key];
        const isActive = activeTab === tab.key;
        // WAI-ARIA: a tabpanel with no focusable content gets tabIndex 0 so
        // keyboard users can still reach it; when it already holds links
        // (the Building panel), the attribute is omitted.
        const hasFocusable = items.some((it) => it.link);
        return (
          <div
            key={tab.key}
            id={`lab-panel-${tab.key}`}
            role="tabpanel"
            aria-labelledby={`lab-tab-${tab.key}`}
            tabIndex={hasFocusable ? undefined : 0}
            // `hidden` (display:none) instead of unmounting keeps every
            // tab's aria-controls target in the DOM. It replaces `grid`
            // rather than sitting beside it, because a `grid` utility would
            // override the hidden display and re-show the panel.
            className={`mt-8 grid-cols-[repeat(auto-fill,minmax(min(100%,330px),1fr))] gap-5 ${
              isActive ? "grid" : "hidden"
            }`}
          >
            {items.map((item) => (
              <LabCard key={item.id} item={item} tab={tab.key} />
            ))}
          </div>
        );
      })}
    </section>
  );
}
