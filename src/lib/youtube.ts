// Types + formatters for the /youtube page. Client-safe on purpose: no fs and
// no zod, because YouTubeShowcase (a client component) imports from here. The
// fs-backed loader + schema live in youtube-data.ts (server only).

export type YouTubeItem = {
    id: string;
    title: string;
    publishedAt: string;
    durationSec: number;
    views: number;
    thumb: string;
    status?: "live" | "upcoming";
};

export type YouTubeChannel = {
    id: string;
    title: string;
    handle: string;
    url: string;
    stats: { subscribers: number; views: number; videos: number };
    videos: YouTubeItem[];
    shorts: YouTubeItem[];
    live: YouTubeItem[];
};

export type YouTubeData = {
    fetchedAt: string;
    channels: YouTubeChannel[];
};

const compact = (x: number): string =>
    x < 10 ? x.toFixed(1).replace(/\.0$/, "") : String(Math.round(x));

export function formatViews(n: number): string {
    if (n < 1000) return String(n);
    if (n < 1_000_000) return `${compact(n / 1000)}K`;
    return `${compact(n / 1_000_000)}M`;
}

export function formatDuration(sec: number): string {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
}

// Fixed locale + UTC so server and client render identical strings
// (the showcase is a client component; a locale drift would be a hydration bug).
export function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
    });
}
