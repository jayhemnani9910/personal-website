import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-metadata";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { YouTubeShowcase } from "@/components/YouTubeShowcase";
import { H1, HIGHLIGHT, KICKER, LEDE, SHELL, WRAP } from "@/components/desk";
import { getYouTubeData } from "@/lib/youtube-data";
import { formatDate, formatViews } from "@/lib/youtube";
import { CHANNEL_COPY } from "@/lib/youtube-copy";

export const metadata: Metadata = pageMetadata({
  title: "Channel",
  description:
    "Jay Hemnani on YouTube: AI news translated for data people on JH-Analytics 2.0, plus FC gaming on JodnaniPlays.",
  path: "/youtube",
});

// YouTubeShowcase shows at most 6 shorts and 4 videos per channel. Trimming
// here keeps the rest out of the client component's payload.
const SHOWN = { shorts: 6, videos: 4 };

export default function YouTubePage() {
  const full = getYouTubeData();
  const data = {
    ...full,
    channels: full.channels.map((c) => ({
      ...c,
      // Hidden shorts come out before the trim, so the row stays full.
      shorts: c.shorts.filter((s) => !CHANNEL_COPY[c.id]?.hideShorts?.includes(s.id)).slice(0, SHOWN.shorts),
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
          <section className={`${WRAP} ${SHELL} grid items-end gap-[clamp(2rem,5vw,5rem)] pb-8 pt-[clamp(40px,6vw,72px)] lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]`}>
            <div>
              <p className={`${KICKER} mb-4`}>
                /channel · {channelCount} channels · {formatViews(totalUploads)} uploads
              </p>
              <h1 className={H1}>
                Small numbers, shown <span className={HIGHLIGHT}>anyway.</span>
              </h1>
            </div>
            <p className={`${LEDE} max-w-[56ch]`}>
              Subscriber counts are pulled from the YouTube API, not typed in. They are small. The point of the
              AI channel is the reps: one claim per video, under 90 seconds, no hype, the same discipline as
              the write-ups.
            </p>
          </section>

          <section className={`${WRAP} ${SHELL} pb-[clamp(3rem,6vw,5rem)]`}>
            <YouTubeShowcase data={data} />
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
