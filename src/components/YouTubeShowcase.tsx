"use client";

import { useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import Image from "next/image";
import {
  formatDate,
  formatDuration,
  formatViews,
  type YouTubeChannel,
  type YouTubeData,
  type YouTubeItem,
} from "@/lib/youtube";
import { CHANNEL_COPY } from "@/lib/youtube-copy";

type TabKey = "videos" | "shorts" | "live";

const TABS: { key: TabKey; label: string }[] = [
  { key: "videos", label: "Videos" },
  { key: "shorts", label: "Shorts" },
  { key: "live", label: "Live" },
];

const GRID_CLASS: Record<TabKey, string> = {
  videos: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  live: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  shorts: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
};

// Mono UI chrome: uppercase labels + wide tracking (tabs, statuses, kickers).
const mono: CSSProperties = {
  fontFamily: "var(--font-jetbrains)",
  letterSpacing: ".08em",
};

// Mono machine-channel DATA: view counts, dates, durations. No forced casing.
const monoData: CSSProperties = {
  fontFamily: "var(--font-jetbrains)",
};

const serif: CSSProperties = {
  fontFamily: "var(--font-newsreader)",
};

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[length:var(--tr-t-mono-sm)] uppercase text-tr-text-faint" style={mono}>
        {label}
      </p>
      <p
        className="mt-[var(--tr-s-1)] text-[length:var(--tr-t-display)] font-light leading-none text-tr-text"
        style={monoData}
      >
        {value}
      </p>
    </div>
  );
}

function VideoCard({ item }: { item: YouTubeItem }) {
  const meta = [`${formatViews(item.views)} views`, formatDate(item.publishedAt)];
  if (item.durationSec > 0) meta.push(formatDuration(item.durationSec));

  return (
    <a
      href={`https://www.youtube.com/watch?v=${item.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex min-w-0 flex-col border border-tr-hairline bg-tr-surface-1 no-underline transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] hover:bg-tr-surface-2"
    >
      <div className="relative aspect-video w-full overflow-hidden border-b border-tr-hairline bg-tr-surface-2">
        <Image
          src={item.thumb}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
        {item.status ? (
          <span
            className="absolute left-[var(--tr-s-2)] top-[var(--tr-s-2)] bg-tr-ember px-[.5em] py-[.2em] text-[length:var(--tr-t-mono-sm)] uppercase text-tr-on-ember"
            style={mono}
          >
            {item.status}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-[var(--tr-s-2)] p-[var(--tr-s-4)]">
        <h3
          className="line-clamp-2 text-[length:var(--tr-t-h3)] font-light leading-[var(--tr-lh-h3)] text-tr-text"
          style={serif}
        >
          {item.title}
        </h3>
        <p className="mt-auto text-[length:var(--tr-t-mono-sm)] uppercase text-tr-text-faint" style={mono}>
          {meta.join(" · ")}
        </p>
      </div>
    </a>
  );
}

function ShortCard({ item }: { item: YouTubeItem }) {
  return (
    <a
      href={`https://www.youtube.com/shorts/${item.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex min-w-0 flex-col border border-tr-hairline bg-tr-surface-1 no-underline transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] hover:bg-tr-surface-2"
    >
      <div className="relative aspect-[9/16] w-full overflow-hidden border-b border-tr-hairline bg-tr-surface-2">
        <Image
          src={item.thumb}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col gap-[var(--tr-s-1)] p-[var(--tr-s-3)]">
        <h3
          className="line-clamp-2 text-[length:var(--tr-t-body)] leading-[var(--tr-lh-h3)] text-tr-text"
          style={serif}
        >
          {item.title}
        </h3>
        <p className="text-[length:var(--tr-t-mono-sm)] uppercase text-tr-text-faint" style={mono}>
          {formatViews(item.views)} views
        </p>
      </div>
    </a>
  );
}

function ChannelButton({
  channel,
  selected,
  onSelect,
}: {
  channel: YouTubeChannel;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`min-w-0 border-t-2 px-[var(--tr-s-5)] py-[var(--tr-s-4)] text-left transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] ${
        selected
          ? "border-tr-hairline bg-tr-surface-1"
          : "border-transparent bg-tr-bg text-tr-text-mute hover:bg-tr-surface-1"
      }`}
    >
      <span className="block text-[length:var(--tr-t-h3)] font-light leading-tight text-tr-text" style={serif}>
        {channel.title}
      </span>
      <span className="mt-[var(--tr-s-1)] block text-[length:var(--tr-t-mono-sm)] text-tr-text-mute" style={monoData}>
        {channel.handle}
      </span>
    </button>
  );
}

export function YouTubeShowcase({ data }: { data: YouTubeData }) {
  const [channelIdx, setChannelIdx] = useState(0);
  const [tab, setTab] = useState<TabKey>("videos");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const channel = data.channels[channelIdx];
  // Guarded: a missing entry now drops the tagline and blurb instead of throwing
  // mid-render. The test is what keeps the entry from going missing in the first place.
  const copy = CHANNEL_COPY[channel.id];
  const panels: Record<TabKey, YouTubeItem[]> = {
    videos: channel.videos,
    shorts: channel.shorts,
    live: channel.live,
  };

  // Tablist keyboard model (WAI-ARIA): Left/Right move focus AND selection with
  // wraparound; Home/End jump to the ends. Same pattern as /lab.
  function onTabKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number | null = null;
    if (e.key === "ArrowRight") next = (index + 1) % TABS.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TABS.length - 1;
    if (next === null) return;
    e.preventDefault();
    setTab(TABS[next].key);
    tabRefs.current[next]?.focus();
  }

  return (
    <div>
      <div role="group" aria-label="Channel" className="grid grid-cols-1 gap-px bg-tr-hairline sm:grid-cols-2">
        {data.channels.map((c, i) => (
          <ChannelButton key={c.id} channel={c} selected={channelIdx === i} onSelect={() => setChannelIdx(i)} />
        ))}
      </div>

      <div className="mt-[var(--tr-s-8)] grid gap-[var(--tr-s-6)] lg:grid-cols-[1fr_auto] lg:items-start lg:gap-[var(--tr-s-8)]">
        <div className="min-w-0 max-w-[60ch]">
          <p className="text-[length:var(--tr-t-mono-sm)] uppercase text-tr-text-mute" style={mono}>
            {channel.handle}
          </p>
          <h2
            className="mt-[var(--tr-s-3)] text-[length:var(--tr-t-h2)] font-light leading-[var(--tr-lh-h2)] text-tr-text"
            style={serif}
          >
            {copy?.tagline ?? channel.title}
          </h2>
          {copy ? (
            <p className="mt-[var(--tr-s-4)] text-[length:var(--tr-t-body)] leading-[var(--tr-lh-body)] text-tr-text-mute" style={serif}>
              {copy.about}
            </p>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-wrap gap-[var(--tr-s-6)]">
          <StatBlock label="Subscribers" value={formatViews(channel.stats.subscribers)} />
          <StatBlock label="Views" value={formatViews(channel.stats.views)} />
          <StatBlock label="Uploads" value={formatViews(channel.stats.videos)} />
        </div>
      </div>

      <p className="mt-[var(--tr-s-4)] text-[length:var(--tr-t-mono-sm)] uppercase text-tr-text-faint" style={mono}>
        Data as of {formatDate(data.fetchedAt)}
      </p>

      <div className="mt-[var(--tr-s-9)]">
        <div
          role="tablist"
          aria-label="Channel content"
          aria-orientation="horizontal"
          className="flex flex-wrap gap-x-[var(--tr-s-5)] gap-y-[var(--tr-s-2)] border-b border-tr-hairline"
        >
          {TABS.map((t, i) => {
            const selected = tab === t.key;
            return (
              <button
                key={t.key}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                id={`yt-tab-${t.key}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={`yt-panel-${t.key}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setTab(t.key)}
                onKeyDown={(e) => onTabKeyDown(e, i)}
                className={`-mb-px flex items-center gap-[var(--tr-s-2)] border-b-2 pb-[var(--tr-s-3)] text-[length:var(--tr-t-mono)] uppercase transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] ${
                  selected
                    ? "border-tr-ember text-tr-ember [text-shadow:var(--tr-glow-text)]"
                    : "border-transparent text-tr-text-mute hover:text-tr-text"
                }`}
                style={mono}
              >
                {t.label}
                <span className="text-[length:var(--tr-t-mono-sm)] text-tr-text-faint" style={monoData}>
                  {panels[t.key].length}
                </span>
              </button>
            );
          })}
        </div>

        {TABS.map((t) => {
          const items = panels[t.key];
          const isActive = tab === t.key;
          const hasItems = items.length > 0;
          return (
            <div
              key={t.key}
              id={`yt-panel-${t.key}`}
              role="tabpanel"
              aria-labelledby={`yt-tab-${t.key}`}
              tabIndex={hasItems ? undefined : 0}
              className={`mt-[var(--tr-s-6)] ${isActive ? "" : "hidden"}`}
            >
              {hasItems ? (
                <div className={`grid gap-[var(--tr-s-4)] ${GRID_CLASS[t.key]}`}>
                  {items.map((item) =>
                    t.key === "shorts" ? (
                      <ShortCard key={item.id} item={item} />
                    ) : (
                      <VideoCard key={item.id} item={item} />
                    ),
                  )}
                </div>
              ) : (
                <p className="text-[length:var(--tr-t-mono-sm)] text-tr-text-mute" style={mono}>
                  No uploads here yet.
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-[var(--tr-s-8)] border-t border-tr-hairline pt-[var(--tr-s-5)]">
        <a
          href={channel.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[length:var(--tr-t-mono-sm)] uppercase text-tr-text-mute no-underline transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] hover:text-tr-ember"
          style={mono}
        >
          Open channel →
        </a>
      </div>
    </div>
  );
}
