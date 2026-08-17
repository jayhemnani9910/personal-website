// Authored copy for the /youtube channel page. Lives here rather than in the
// generated src/data/youtube.json so the daily refresh script can never
// overwrite Jay's words.
//
// Keyed by channel ID, NOT by handle. A handle is a display name the owner can
// change at any time, and when @jhanalytics became @jodnaniplays a handle-keyed
// lookup silently missed and the page threw on render. The channel ID is the
// identity scripts/fetch-youtube.mjs already pins in CHANNEL_IDS, so it is the
// only key here that cannot drift out from under the copy.
//
// Plain module (no "use client") so both the client component and the test can
// import it, same reasoning as src/lib/showcase.ts.
//
// src/lib/youtube.test.ts asserts every channel in the JSON has an entry here.

export type ChannelCopy = { tagline: string; about: string };

export const CHANNEL_COPY: Record<string, ChannelCopy> = {
  // JH-Analytics | 2.0 — @jhanalytics2.0
  UCSf0pNIEkJgXhH7WzIsFnpw: {
    tagline: "AI news, translated for data people.",
    about:
      "A faceless shorts channel that takes what just happened in AI and pulls out the one mechanism that matters: the failure mode, the cost math, the benchmark that holds up. One claim per video, under 90 seconds, no hype. The current run is the Failure Report series: what broke, why, and the fix.",
  },
  // JodnaniPlays — @jodnaniplays (formerly @jhanalytics)
  UCRAV0VDSxngptEo5SY4nKcw: {
    tagline: "Analytics, football, and the grind in between.",
    about:
      "The original channel: FC Ultimate Team lives and match clips next to analytics experiments. Two hundred uploads of figuring out what works on camera before the second channel got serious about AI.",
  },
};
