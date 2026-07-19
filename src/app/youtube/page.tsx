import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { EditorialMasthead } from "@/components/EditorialMasthead";
import { EditorialColophon } from "@/components/EditorialColophon";
import { YouTubeShowcase } from "@/components/YouTubeShowcase";
import { getYouTubeData } from "@/lib/youtube-data";

export const metadata: Metadata = {
  title: "Channel",
  description:
    "Jay Hemnani on YouTube: AI news translated for data people on JH-Analytics 2.0, plus FC gaming lives on the original JH-Analytics.",
};

const mono: CSSProperties = {
  fontFamily: "var(--font-jetbrains)",
  letterSpacing: ".08em",
};

const serif: CSSProperties = {
  fontFamily: "var(--font-newsreader)",
};

const SHELL = "px-[clamp(1.25rem,5vw,2rem)]";
const WRAP = "mx-auto max-w-[1400px]";

export default function YouTubePage() {
  const data = getYouTubeData();

  return (
    <main id="main-content" className="flex min-h-screen flex-col bg-tr-bg text-tr-text">
      <EditorialMasthead active="channel" />

      <div className="flex-1">
        <section className={`${SHELL} pt-[6.5rem] pb-[var(--tr-s-6)]`}>
          <div className={WRAP}>
            <div className="max-w-[46rem]">
              <p
                className="mb-[var(--tr-s-4)] text-[length:var(--tr-t-mono)] uppercase text-tr-text-mute"
                style={mono}
              >
                Channel / Two feeds, one operator
              </p>
              <h1
                className="mb-[var(--tr-s-5)] text-[length:var(--tr-t-display)] font-light leading-[.95] tracking-[-.02em] text-tr-text"
                style={serif}
              >
                Two channels, one camera-shy operator.
              </h1>
              <p
                className="max-w-[52ch] text-[length:var(--tr-t-body)] leading-[1.5] text-tr-text-mute"
                style={serif}
              >
                AI news broken into single claims, and the original channel where the analytics and FC gaming
                lives still happen.
              </p>
            </div>
          </div>
        </section>

        <section className={`${SHELL} pb-[var(--tr-s-12)]`}>
          <div className={WRAP}>
            <YouTubeShowcase data={data} />
          </div>
        </section>
      </div>

      <EditorialColophon />
    </main>
  );
}
