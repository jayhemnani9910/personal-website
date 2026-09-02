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

const MONO =
  "font-[family-name:var(--ff-mono)] text-[length:var(--tr-t-mono-sm)] tracking-[.1em] text-tr-text-faint";

const CARD =
  "block border border-tr-hairline rounded-[var(--tr-r-md)] overflow-hidden bg-tr-surface-1 hover:border-tr-ember transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)]";

// Fixed dark scrim, independent of theme: it sits over arbitrary YouTube
// thumbnail imagery, so a theme token could land on a light frame and vanish.
const SCRIM = { background: "rgba(0,0,0,.7)" };

function DurationPill({ sec }: { sec: number }) {
  if (sec <= 0) return null;
  return (
    <span
      className="absolute bottom-1.5 right-1.5 rounded-[3px] px-1 py-[1px] font-[family-name:var(--ff-mono)] text-[10px] text-white"
      style={SCRIM}
    >
      {formatDuration(sec)}
    </span>
  );
}

function ShortCard({ item }: { item: YouTubeItem }) {
  return (
    <a href={`https://www.youtube.com/watch?v=${item.id}`} target="_blank" rel="noopener noreferrer" className={CARD}>
      <div className="relative aspect-[9/16] bg-tr-surface-2">
        <Image
          src={item.thumb}
          alt=""
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
          className="object-cover"
        />
        <DurationPill sec={item.durationSec} />
      </div>
      <div className="p-2">
        <p className="line-clamp-2 text-[12.5px] leading-[var(--tr-lh-h3)]">{item.title}</p>
        <p className={`${MONO} mt-1 tracking-normal`}>
          {formatViews(item.views)} views · {formatDate(item.publishedAt)}
        </p>
      </div>
    </a>
  );
}

function VideoCard({ item }: { item: YouTubeItem }) {
  return (
    <a href={`https://www.youtube.com/watch?v=${item.id}`} target="_blank" rel="noopener noreferrer" className={CARD}>
      <div className="relative aspect-video bg-tr-surface-2">
        <Image
          src={item.thumb}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover"
        />
        <DurationPill sec={item.durationSec} />
      </div>
      <div className="p-3">
        <p className="line-clamp-2 text-[13.5px] leading-[var(--tr-lh-h3)]">{item.title}</p>
        <p className={`${MONO} mt-1 tracking-normal`}>
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
      className={`min-w-[220px] text-left flex flex-col gap-[.15rem] px-4 py-[.7rem] rounded-[var(--tr-r-md)] border transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)] ${
        selected ? "border-tr-ember bg-tr-surface-1" : "border-tr-hairline bg-transparent hover:border-tr-ember"
      }`}
    >
      <span className="font-medium tracking-[-.01em]">{channel.title}</span>
      <span className={`${MONO} tracking-normal text-tr-text-mute`}>
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

      <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-[clamp(2rem,5vw,5rem)] mt-8 mb-8">
        <div>
          <h2 className={`${MONO} text-tr-ember`}>{copy?.tagline ?? channel.title}</h2>
          <a
            href={channel.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 text-tr-text-mute border-b border-tr-hairline hover:text-tr-ember hover:border-tr-ember transition-colors duration-[var(--tr-dur-base)] ease-[var(--tr-ease)]"
          >
            {channel.url} ↗
          </a>
        </div>
        {copy ? <p className="max-w-[60ch] text-tr-text-mute [text-wrap:pretty]">{copy.about}</p> : null}
      </div>

      {channel.shorts.length > 0 && (
        <div className="mt-10">
          <h3 className={`${MONO} mb-3`}>SHORTS · LATEST</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {channel.shorts.slice(0, 6).map((item) => (
              <ShortCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {channel.videos.length > 0 && (
        <div className="mt-10">
          <h3 className={`${MONO} mb-3`}>VIDEOS · LATEST</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {channel.videos.slice(0, 4).map((item) => (
              <VideoCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      <p className={`${MONO} mt-10`}>Stats refresh daily via the YouTube API.</p>
    </div>
  );
}
