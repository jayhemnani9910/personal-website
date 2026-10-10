"use client";

import { useState } from "react";
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
import { CARD_HOVER, HAND, LABEL } from "@/components/desk";

// A card at radius 14, the size down from CARD's 18 that small tiles use.
const TILE = "rounded-[var(--tr-r-lg)] border-[1.5px] border-tr-hairline bg-tr-surface-1";

// Fixed ink pill, not a surface token: it sits over arbitrary YouTube
// thumbnail imagery, so it carries its own contrast.
function DurationPill({ sec }: { sec: number }) {
  if (sec <= 0) return null;
  return (
    <span className="absolute bottom-1.5 right-1.5 rounded-[6px] bg-tr-text px-1.5 py-[1px] font-mono text-[10px] text-tr-on-ink">
      {formatDuration(sec)}
    </span>
  );
}

// What differs between a Short (9:16, six to a row) and a video (16:9, four to a row).
const CARD_VARIANTS = {
  short: {
    aspect: "aspect-[9/16]",
    sizes: "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw",
    body: "p-2.5",
    title: "text-[13px]",
  },
  video: {
    aspect: "aspect-video",
    sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw",
    body: "p-3.5",
    title: "text-[14.5px]",
  },
};

function ItemCard({ item, variant }: { item: YouTubeItem; variant: keyof typeof CARD_VARIANTS }) {
  const v = CARD_VARIANTS[variant];
  return (
    <a
      href={`https://www.youtube.com/watch?v=${item.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`${TILE} ${CARD_HOVER} block overflow-hidden hover:text-tr-text`}
    >
      <div className={`relative ${v.aspect} border-b-[1.5px] border-tr-hairline bg-tr-surface-2`}>
        <Image src={item.thumb} alt="" fill sizes={v.sizes} className="object-cover" />
        <DurationPill sec={item.durationSec} />
      </div>
      <div className={v.body}>
        <p className={`line-clamp-2 ${v.title} font-semibold leading-[var(--tr-lh-card)]`}>{item.title}</p>
        <p className="mt-1.5 font-mono text-[11px] text-tr-text-faint">
          {formatViews(item.views)} views · {formatDate(item.publishedAt)}
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
      className={`desk-press flex min-w-[220px] cursor-pointer flex-col gap-1 rounded-[var(--tr-r-lg)] border-[1.5px] border-tr-hairline px-4 py-3 text-left ${
        selected ? "bg-tr-butter shadow-[var(--tr-shadow-btn)]" : "bg-tr-surface-1 hover:bg-tr-surface-2"
      }`}
    >
      <span className="text-[17px] font-bold tracking-[-0.01em]">{channel.title}</span>
      <span className="font-mono text-[12px] text-tr-text-mute">
        {channel.handle} · {formatViews(channel.stats.subscribers)} subs · {formatViews(channel.stats.views)} views
      </span>
    </button>
  );
}

export function YouTubeShowcase({ data }: { data: YouTubeData }) {
  const [channelIdx, setChannelIdx] = useState(0);
  const channel = data.channels[channelIdx];
  // Guarded: a missing entry drops the tagline and about copy instead of
  // throwing mid-render. youtube.test.ts is what keeps the entry from going
  // missing in the first place.
  const copy = CHANNEL_COPY[channel.id];

  return (
    <div>
      <div role="group" aria-label="Channel" className="flex flex-wrap gap-2">
        {data.channels.map((c, i) => (
          <ChannelButton key={c.id} channel={c} selected={channelIdx === i} onSelect={() => setChannelIdx(i)} />
        ))}
      </div>

      <div className="mb-8 mt-10 grid gap-[clamp(2rem,5vw,5rem)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div>
          <h2 className="text-[length:var(--tr-t-h2)] font-extrabold leading-[var(--tr-lh-h2)] tracking-[-0.035em] [text-wrap:balance]">
            {copy?.tagline ?? channel.title}
          </h2>
          <p className={`${HAND} mt-3 max-w-[340px] -rotate-2 [text-wrap:balance]`}>subscribe. or don&apos;t. the algorithm&apos;s watching either way.</p>
          <a
            href={channel.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block break-all font-mono text-[13px] text-tr-text-mute underline"
          >
            {channel.url} ↗
          </a>
        </div>
        {copy ? <p className="max-w-[60ch] text-[17px] leading-[var(--tr-lh-body)] text-tr-text-mute [text-wrap:pretty]">{copy.about}</p> : null}
      </div>

      {channel.shorts.length > 0 && (
        <div className="mt-10">
          <h3 className={`${LABEL} mb-3`}>Shorts · latest</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {channel.shorts.slice(0, 6).map((item) => (
              <ItemCard key={item.id} item={item} variant="short" />
            ))}
          </div>
        </div>
      )}

      {copy?.showVideos !== false && channel.videos.length > 0 && (
        <div className="mt-10">
          <h3 className={`${LABEL} mb-3`}>Videos · latest</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {channel.videos.slice(0, 4).map((item) => (
              <ItemCard key={item.id} item={item} variant="video" />
            ))}
          </div>
        </div>
      )}

      <p className="mt-10 font-mono text-[12px] text-tr-text-faint">Stats from the YouTube API, as of {formatDate(data.fetchedAt)}.</p>
    </div>
  );
}
