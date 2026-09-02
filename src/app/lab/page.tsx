"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { Github } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LAB_ITEMS, type LabItem } from "@/data/lab";

type TabKey = "building" | "exploring" | "radar";

const TABS: { key: TabKey; label: string }[] = [
  { key: "building", label: "Building" },
  { key: "exploring", label: "Exploring" },
  { key: "radar", label: "On the radar" },
];

const MONO = "font-[family-name:var(--ff-mono)]";
const CONTAINER = "mx-auto max-w-[1280px] px-[clamp(1rem,4vw,2rem)]";
const TWO_COL = "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]";

// Calm mono status derived from the tab plus (for Building) the progress value.
// Never ember: the active tab is the page's single at-rest ember, so a status
// here stays in the machine channel.
function statusFor(tab: TabKey, progress?: number): string {
  if (tab === "exploring") return "Exploring";
  if (tab === "radar") return "On the radar";
  return progress === 100 ? "Shipped" : "In progress";
}

function LabCard({ item, tab }: { item: LabItem; tab: TabKey }) {
  const { progress } = item;
  const status = statusFor(tab, progress);
  const showBar = progress !== undefined && progress < 100;

  return (
    <article className="flex h-full flex-col bg-tr-surface-1 p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className={`${MONO} text-[length:var(--tr-t-mono-sm)] uppercase tracking-[.08em] text-tr-text-mute`}>
          {status}
        </span>
        {item.link && (
          <a
            href={item.link}
            target="_blank"
            rel="noreferrer"
            aria-label={`${item.title} on GitHub`}
            data-cursor="OPEN"
            className="text-tr-text-mute transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] hover:text-tr-ember"
          >
            <Github aria-hidden="true" className="h-4 w-4" />
          </a>
        )}
      </div>

      {/* A plain paragraph, not a heading: these cards sit inside a tabpanel
          ahead of the page's only <h2> ("Want to collaborate?"), so a heading
          here would read as a skip in the outline. Same call as the project
          row titles in src/app/projects/ProjectsClient.tsx. */}
      <p className="mb-2 text-[length:var(--tr-t-h3)] leading-[var(--tr-lh-h3)] tracking-[-.01em] font-medium text-tr-text">
        {item.title}
      </p>

      <p className="text-tr-text-mute">{item.description}</p>

      {showBar && (
        <div className="mt-4">
          <div className={`mb-2 flex items-baseline justify-between ${MONO} text-[length:var(--tr-t-mono-sm)]`}>
            <span className="uppercase tracking-[.08em] text-tr-text-faint">Progress</span>
            <span className="text-tr-text-mute">{progress}%</span>
          </div>
          <div className="h-[3px] w-full bg-tr-hairline">
            <div className="h-full bg-tr-text-mute" style={{ width: `${progress}%` }} aria-hidden="true" />
          </div>
        </div>
      )}

      {item.tags.length > 0 && (
        <div
          className={`mt-auto flex flex-wrap gap-x-3 gap-y-1.5 border-t border-tr-hairline pt-4 ${MONO} text-[length:var(--tr-t-mono-sm)] text-tr-text-faint`}
        >
          {item.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      )}
    </article>
  );
}

export default function LabPage() {
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
    <main id="main-content" className="bg-tr-bg text-tr-text">
      <SiteHeader />

      {/* ========== INTRO ========== */}
      <section className={`${CONTAINER} grid items-end gap-[clamp(2rem,5vw,5rem)] pt-[clamp(2.5rem,5vw,4rem)] pb-8 ${TWO_COL}`}>
        <div>
          <p className={`${MONO} mb-3 text-[length:var(--tr-t-mono)] tracking-[.1em] text-tr-text-faint`}>
            /LAB · EXPERIMENTS
          </p>
          <h1 className="text-[length:var(--tr-t-display-sm)] leading-[var(--tr-lh-display)] tracking-[-.035em] font-medium">
            Half-finished, on purpose.
          </h1>
        </div>
        <p className="max-w-[56ch] text-tr-text-mute [text-wrap:pretty]">
          Things I am building, exploring, and keeping an eye on. Shown as they actually stand, not
          cleaned up for the visit.
        </p>
      </section>

      {/* ========== TABS + PANELS ========== */}
      <section className={`${CONTAINER} pb-[var(--tr-s-10)]`}>
        <div
          role="tablist"
          aria-label="Lab sections"
          aria-orientation="horizontal"
          className={`flex flex-wrap gap-x-6 gap-y-2 border-b border-tr-hairline ${MONO}`}
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
                className={`-mb-px flex items-center gap-2 border-b-2 pb-3 text-[length:var(--tr-t-mono)] uppercase tracking-[.04em] transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] ${
                  selected
                    ? "border-tr-ember text-tr-ember"
                    : "border-transparent text-tr-text-mute hover:text-tr-text"
                }`}
              >
                {tab.label}
                <span className="text-[length:var(--tr-t-mono-sm)] text-tr-text-faint">
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
              className={`mt-8 gap-px overflow-hidden rounded-[var(--tr-r-lg)] border border-tr-hairline bg-tr-hairline sm:grid-cols-2 lg:grid-cols-3 ${
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

      {/* ========== COLLABORATE ========== */}
      <section className="border-t border-tr-hairline bg-tr-surface-1">
        <div className={`${CONTAINER} flex flex-col gap-5 py-[clamp(3rem,6vw,5rem)] sm:flex-row sm:items-end sm:justify-between`}>
          <div>
            <h2 className="text-[length:var(--tr-t-h2)] leading-[var(--tr-lh-h2)] tracking-[-.025em] font-medium text-tr-text">
              Want to collaborate?
            </h2>
            <p className="mt-2 max-w-[46ch] text-tr-text-mute">
              Always open to interesting projects and ideas.
            </p>
          </div>
          <a
            href="mailto:jayhemnani992000@gmail.com"
            data-cursor="OPEN"
            className="flex flex-col border border-tr-hairline bg-tr-bg px-5 py-4 no-underline transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] hover:border-tr-ember"
          >
            <span className={`${MONO} text-[length:var(--tr-t-mono-sm)] uppercase tracking-[.08em] text-tr-text-mute`}>
              Open the line
            </span>
            <span className="text-[length:var(--tr-t-h3)] font-medium text-tr-text">
              jayhemnani992000@gmail.com
            </span>
          </a>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
