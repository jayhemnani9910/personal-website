import { describe, expect, it } from "vitest";
import { formatDuration, formatViews } from "./youtube";
import { getYouTubeData } from "./youtube-data";
import { CHANNEL_COPY } from "./youtube-copy";

// Channel IDs, matching CHANNEL_IDS in scripts/fetch-youtube.mjs. Asserted here
// rather than the handles: a handle is a display name the owner can rename at
// will (@jhanalytics became @jodnaniplays), and pinning the renameable value is
// what made this suite fail while the data was correct.
const AI_CHANNEL = "UCSf0pNIEkJgXhH7WzIsFnpw";      // JH-Analytics | 2.0
const GAMING_CHANNEL = "UCRAV0VDSxngptEo5SY4nKcw";  // JodnaniPlays

describe("youtube.json contract", () => {
    const data = getYouTubeData(); // throws (failing the suite) if file missing or schema-invalid

    it("has exactly two channels, AI channel first", () => {
        expect(data.channels).toHaveLength(2);
        expect(data.channels[0].id).toBe(AI_CHANNEL);
        expect(data.channels[1].id).toBe(GAMING_CHANNEL);
    });

    it("every channel has a handle the page can print", () => {
        for (const ch of data.channels) {
            expect(ch.handle).toMatch(/^@[\w.-]+$/);
        }
    });

    // The bug this guards: CHANNEL_COPY used to be keyed by handle, so renaming a
    // channel on YouTube made the lookup miss and YouTubeShowcase threw on
    // `copy.tagline` the moment that channel was selected.
    it("every channel has authored copy", () => {
        for (const ch of data.channels) {
            expect(CHANNEL_COPY[ch.id], `no CHANNEL_COPY entry for ${ch.id} (${ch.handle})`).toBeDefined();
        }
    });

    it("uses ytimg thumbnails on every item", () => {
        for (const ch of data.channels) {
            for (const item of [...ch.videos, ...ch.shorts, ...ch.live]) {
                expect(item.thumb.startsWith("https://i.ytimg.com/")).toBe(true);
            }
        }
    });

    it("orders live tab: live, then upcoming, then past", () => {
        const rank = (s?: string) => (s === "live" ? 0 : s === "upcoming" ? 1 : 2);
        for (const ch of data.channels) {
            const ranks = ch.live.map((v) => rank(v.status));
            expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
        }
    });
});

describe("formatters", () => {
    it("formats view counts", () => {
        expect(formatViews(0)).toBe("0");
        expect(formatViews(999)).toBe("999");
        expect(formatViews(5790)).toBe("5.8K");
        expect(formatViews(54110)).toBe("54K");
        expect(formatViews(1_200_000)).toBe("1.2M");
    });
    it("formats durations", () => {
        expect(formatDuration(0)).toBe("0:00");
        expect(formatDuration(75)).toBe("1:15");
        expect(formatDuration(3725)).toBe("1:02:05");
    });
});
