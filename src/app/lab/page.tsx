"use client";

import { useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
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

// Mono UI chrome: uppercase labels + wide tracking (tabs, statuses, kickers).
const mono: CSSProperties = {
  fontFamily: "var(--font-geist-mono)",
  letterSpacing: ".08em",
};

// Mono machine-channel DATA: tech tags and percentages. No forced casing or
// tracking, so proper-noun casing (Next.js 16, WebMCP, ONNX) survives.
const monoData: CSSProperties = {
  fontFamily: "var(--font-geist-mono)",
};

const serif: CSSProperties = {
  fontFamily: "var(--font-instrument)",
};

const SHELL = "px-[clamp(1.25rem,5vw,2rem)]";
const WRAP = "mx-auto max-w-[1400px]";

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
    <article className="flex h-full flex-col border border-tr-hairline bg-tr-surface-1 p-[var(--tr-s-5)]">
      <div className="mb-[var(--tr-s-3)] flex items-center justify-between gap-[var(--tr-s-3)]">
        <span className="text-[length:var(--tr-t-mono-sm)] uppercase text-tr-text-mute" style={mono}>
          {status}
        </span>
        {item.link && (
          <a
            href={item.link}
            target="_blank"
            rel="noreferrer"
            aria-label={`${item.title} on GitHub`}
            className="text-tr-text-mute transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] hover:text-tr-ember"
          >
            <Github aria-hidden="true" className="h-4 w-4" />
          </a>
        )}
      </div>

      <h3 className="mb-[var(--tr-s-2)] text-[length:var(--tr-t-h3)] font-light text-tr-text" style={serif}>
        {item.title}
      </h3>

      <p className="text-[length:var(--tr-t-body)] leading-[var(--tr-lh-body)] text-tr-text-mute" style={serif}>
        {item.description}
      </p>

      {showBar && (
        <div className="mt-[var(--tr-s-4)]">
          <div className="mb-[var(--tr-s-2)] flex items-baseline justify-between">
            <span className="text-[length:var(--tr-t-mono-sm)] uppercase text-tr-text-faint" style={mono}>
              Progress
            </span>
            <span className="text-[length:var(--tr-t-mono-sm)] text-tr-text-mute" style={monoData}>
              {progress}%
            </span>
          </div>
          <div className="h-[3px] w-full bg-tr-hairline">
            <div className="h-full bg-tr-text-mute" style={{ width: `${progress}%` }} aria-hidden="true" />
          </div>
        </div>
      )}

      {item.tags.length > 0 && (
        <div
          className="mt-auto flex flex-wrap gap-x-[.75em] gap-y-[.3em] border-t border-tr-hairline pt-[var(--tr-s-4)] text-[length:var(--tr-t-mono-sm)] text-tr-text-faint"
          style={monoData}
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
    <main id="main-content" className="flex min-h-screen flex-col bg-tr-bg text-tr-text">
      <SiteHeader />

      <div className="flex-1">
        <section className={`${SHELL} pt-[6.5rem] pb-[var(--tr-s-6)]`}>
          <div className={WRAP}>
            <div className="max-w-[46rem]">
              <p
                className="mb-[var(--tr-s-4)] text-[length:var(--tr-t-mono)] uppercase text-tr-text-mute"
                style={mono}
              >
                The Lab / Work in progress
              </p>
              <h1
                className="mb-[var(--tr-s-5)] text-[length:var(--tr-t-display)] font-light leading-[var(--tr-lh-display)] tracking-[-.02em] text-tr-text"
                style={serif}
              >
                Experiments, <em className="italic">in progress.</em>
              </h1>
              <p
                className="max-w-[52ch] text-[length:var(--tr-t-body)] leading-[var(--tr-lh-body)] text-tr-text-mute"
                style={serif}
              >
                Things I am building, exploring, and keeping an eye on. Half-finished on purpose, shown anyway.
              </p>
            </div>
          </div>
        </section>

        <section className={`${SHELL} pb-[var(--tr-s-10)]`}>
          <div className={WRAP}>
            <div
              role="tablist"
              aria-label="Lab sections"
              aria-orientation="horizontal"
              className="flex flex-wrap gap-x-[var(--tr-s-5)] gap-y-[var(--tr-s-2)] border-b border-tr-hairline"
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
                    className={`-mb-px flex items-center gap-[var(--tr-s-2)] border-b-2 pb-[var(--tr-s-3)] text-[length:var(--tr-t-mono)] uppercase transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] ${
                      selected
                        ? "border-tr-ember text-tr-ember [text-shadow:var(--tr-glow-text)]"
                        : "border-transparent text-tr-text-mute hover:text-tr-text"
                    }`}
                    style={mono}
                  >
                    {tab.label}
                    <span
                      className="text-[length:var(--tr-t-mono-sm)] text-tr-text-faint"
                      style={monoData}
                    >
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
                  className={`mt-[var(--tr-s-6)] gap-[var(--tr-s-5)] sm:grid-cols-2 lg:grid-cols-3 ${
                    isActive ? "grid" : "hidden"
                  }`}
                >
                  {items.map((item) => (
                    <LabCard key={item.id} item={item} tab={tab.key} />
                  ))}
                </div>
              );
            })}
          </div>
        </section>

        <section className={`${SHELL} pb-[var(--tr-s-12)]`}>
          <div className={WRAP}>
            <div className="flex flex-col gap-[var(--tr-s-5)] border-t border-tr-hairline pt-[var(--tr-s-8)] sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2
                  className="mb-[var(--tr-s-2)] text-[length:var(--tr-t-h2)] font-light leading-[var(--tr-lh-h2)] text-tr-text"
                  style={serif}
                >
                  Want to collaborate?
                </h2>
                <p className="max-w-[46ch] text-[length:var(--tr-t-body)] text-tr-text-mute" style={serif}>
                  Always open to interesting projects and ideas.
                </p>
              </div>
              <a
                href="mailto:jayhemnani992000@gmail.com"
                className="flex flex-col border border-tr-hairline bg-tr-surface-1 px-[var(--tr-s-5)] py-[var(--tr-s-4)] no-underline transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] hover:border-tr-ember"
              >
                <span className="text-[length:var(--tr-t-mono-sm)] uppercase text-tr-text-mute" style={mono}>
                  Open the line
                </span>
                <span className="text-[length:var(--tr-t-h3)] font-light text-tr-text" style={serif}>
                  jayhemnani992000@gmail.com
                </span>
              </a>
            </div>
          </div>
        </section>
      </div>

      <SiteFooter />
    </main>
  );
}
