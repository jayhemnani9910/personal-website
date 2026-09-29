import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-metadata";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { YouTubeShowcase } from "@/components/YouTubeShowcase";
import { getYouTubeData } from "@/lib/youtube-data";
import { formatDate, formatViews } from "@/lib/youtube";

export const metadata: Metadata = pageMetadata({
  title: "Channel",
  description:
    "Jay Hemnani on YouTube: AI news translated for data people on JH-Analytics 2.0, plus FC gaming on JodnaniPlays.",
  path: "/youtube",
});

const MONO =
  "font-[family-name:var(--ff-mono)] text-[length:var(--tr-t-mono-sm)] tracking-[.1em] text-tr-text-faint";

// YouTubeShowcase shows at most 6 shorts and 4 videos per channel. Trimming
// here keeps the rest out of the client component's payload.
const SHOWN = { shorts: 6, videos: 4 };

export default function YouTubePage() {
  const full = getYouTubeData();
  const data = {
    ...full,
    channels: full.channels.map((c) => ({
      ...c,
      shorts: c.shorts.slice(0, SHOWN.shorts),
      videos: c.videos.slice(0, SHOWN.videos),
    })),
  };
  const channelCount = data.channels.length;
  const totalUploads = data.channels.reduce((sum, c) => sum + c.stats.videos, 0);

  return (
    <div className="flex min-h-screen flex-col bg-tr-bg text-tr-text">
      <SiteHeader meta={`data · ${formatDate(data.fetchedAt)}`} />
      <main id="main-content" className="flex flex-1 flex-col">
        <div className="flex-1">
          <section className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-[clamp(2rem,5vw,5rem)] items-end max-w-[1280px] mx-auto px-[clamp(1rem,4vw,2rem)] pt-[clamp(2.5rem,5vw,4rem)] pb-8">
            <div>
              <p className={`${MONO} mb-4`}>
                /CHANNEL · {channelCount} CHANNELS · {formatViews(totalUploads)} UPLOADS
              </p>
              <h1 className="text-[length:var(--tr-t-display-sm)] leading-[var(--tr-lh-display)] tracking-[-.035em] font-medium">
                Small numbers, shown anyway.
              </h1>
            </div>
            <p className="max-w-[56ch] text-tr-text-mute [text-wrap:pretty]">
              Subscriber counts are pulled from the YouTube API, not typed in. They are small. The point of the
              AI channel is the reps: one claim per video, under 90 seconds, no hype, the same discipline as
              the write-ups.
            </p>
          </section>

          <section className="max-w-[1280px] mx-auto px-[clamp(1rem,4vw,2rem)] pb-[clamp(3rem,6vw,5rem)]">
            <YouTubeShowcase data={data} />
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
