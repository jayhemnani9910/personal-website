# /youtube Channel Showcase Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a `/youtube` page showcasing Jay's two YouTube channels (channel switcher, about + stats, Videos/Shorts/Live tabs) fed by committed JSON that a fetch script regenerates.

**Architecture:** A zero-dependency Node script fetches public channel data via the existing OAuth refresh token and writes `src/data/youtube.json`. A Zod-validated fs loader (`src/lib/youtube.ts`) feeds a server page that renders a client showcase component in the TWO READERS design language. Spec: `docs/superpowers/specs/2026-07-19-youtube-page-design.md`.

**Tech Stack:** Next.js 16 App Router, TypeScript, Tailwind v4 + `--tr-*` tokens, Zod 4, Vitest, `next/image`.

## Global Constraints

- No git commits by task workers. Jay approves commits at the end. NEVER `git add -A` (branch has unrelated WIP).
- No new npm dependencies.
- Writing style in all copy: no em-dashes, no AI ban-words, no SJSU (full rules in `~/.claude/CLAUDE.md`).
- Design: `--tr-*` tokens only; ember (`--tr-accent` family) ONLY on the active tab underline and LIVE/UPCOMING badges; depth = surface + top hairline, never shadows/glows; serif = Newsreader (`var(--font-newsreader)`), mono = JetBrains (`var(--font-jetbrains)`).
- Tailwind traps: font-size tokens need `text-[length:var(--tr-t-*)]`; wide content needs a `min-w-0` ancestor chain or `overflow-x-auto`.
- A11y: one `h1`, sequential `h2 → h3`, `<main id="main-content">`, Lighthouse a11y must stay 100.
- Do not run `npm run build` while a dev/start server is running; workers do not run `npm run build` at all (orchestrator does final verification) — single-file lint/vitest is fine.
- Data contract is frozen: see `src/lib/youtube.ts` (Task 0). Do not rename fields.

---

### Task 0 (orchestrator, already done before workers start): shared contract `src/lib/youtube.ts`

**Files:**
- Create: `src/lib/youtube.ts`

**Interfaces (produced — all later tasks consume these exact exports):**

```ts
export type YouTubeItem = {
  id: string; title: string; publishedAt: string; durationSec: number;
  views: number; thumb: string; status?: "live" | "upcoming";
};
export type YouTubeChannel = {
  id: string; title: string; handle: string; url: string;
  stats: { subscribers: number; views: number; videos: number };
  videos: YouTubeItem[]; shorts: YouTubeItem[]; live: YouTubeItem[];
};
export type YouTubeData = { fetchedAt: string; channels: YouTubeChannel[] };
export function getYouTubeData(): YouTubeData; // fs-reads src/data/youtube.json, Zod-parses, throws on mismatch
export function formatViews(n: number): string;    // 0→"0", 5790→"5.8K", 54110→"54K", 1200000→"1.2M"
export function formatDuration(sec: number): string; // 0→"0:00", 75→"1:15", 3725→"1:02:05"
export function formatDate(iso: string): string;   // "2026-07-16T..." → "Jul 16, 2026" (en-US, UTC, hydration-safe)
```

Implementation (complete, written by orchestrator):

```ts
import fs from "fs";
import path from "path";
import { z } from "zod";

const YouTubeItemSchema = z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    publishedAt: z.string().min(1),
    durationSec: z.number().int().min(0),
    views: z.number().int().min(0),
    thumb: z.string().startsWith("https://i.ytimg.com/"),
    status: z.enum(["live", "upcoming"]).optional(),
});

const YouTubeChannelSchema = z.object({
    id: z.string().startsWith("UC"),
    title: z.string().min(1),
    handle: z.string().startsWith("@"),
    url: z.string().startsWith("https://www.youtube.com/"),
    stats: z.object({
        subscribers: z.number().int().min(0),
        views: z.number().int().min(0),
        videos: z.number().int().min(0),
    }),
    videos: z.array(YouTubeItemSchema).max(12),
    shorts: z.array(YouTubeItemSchema).max(12),
    live: z.array(YouTubeItemSchema).max(12),
});

const YouTubeDataSchema = z.object({
    fetchedAt: z.string().min(1),
    channels: z.array(YouTubeChannelSchema).length(2),
});

export type YouTubeItem = z.infer<typeof YouTubeItemSchema>;
export type YouTubeChannel = z.infer<typeof YouTubeChannelSchema>;
export type YouTubeData = z.infer<typeof YouTubeDataSchema>;

const DATA_PATH = path.join(process.cwd(), "src", "data", "youtube.json");

// fs read (not a JSON import) so the module can be loaded before the data
// file exists; only calling the loader requires the file. Matches content.ts.
export function getYouTubeData(): YouTubeData {
    const raw = fs.readFileSync(DATA_PATH, "utf8");
    return YouTubeDataSchema.parse(JSON.parse(raw));
}

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

export function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
    });
}
```

---

### Task A: Fetch script + seed data + data test (worker: yt-data)

**Files:**
- Create: `scripts/fetch-youtube.mjs`
- Create (generated): `src/data/youtube.json`
- Test: `src/lib/youtube.test.ts`

**Interfaces:**
- Consumes: `getYouTubeData`, `formatViews`, `formatDuration` from `@/lib/youtube` (Task 0).
- Produces: `src/data/youtube.json` matching the frozen contract; channel order `[@jhanalytics2.0, @jhanalytics]`.

- [ ] **Step A1: Write `src/lib/youtube.test.ts` (failing until JSON exists)**

```ts
import { describe, expect, it } from "vitest";
import { formatDuration, formatViews, getYouTubeData } from "./youtube";

describe("youtube.json contract", () => {
    const data = getYouTubeData(); // throws (failing the suite) if file missing or schema-invalid

    it("has exactly two channels, AI channel first", () => {
        expect(data.channels).toHaveLength(2);
        expect(data.channels[0].handle).toBe("@jhanalytics2.0");
        expect(data.channels[1].handle).toBe("@jhanalytics");
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
```

- [ ] **Step A2: Run it, confirm it fails on the missing JSON**

Run: `npm run test:run src/lib/youtube.test.ts`
Expected: FAIL (ENOENT reading `src/data/youtube.json`); formatter tests may pass.

- [ ] **Step A3: Write `scripts/fetch-youtube.mjs`**

Complete implementation:

```js
#!/usr/bin/env node
// Regenerates src/data/youtube.json from the YouTube Data API v3.
// Auth: OAuth refresh token from the jh-analytics streaming setup; only
// public data is fetched (channels, auto-playlists, video stats).
// Run from the repo root: node scripts/fetch-youtube.mjs
// Quota cost: ~12 units per run.

import { readFileSync, writeFileSync, renameSync } from "node:fs";
import path from "node:path";

const SECRETS_DIR = "/home/po/projects/personal/jh-analytics/stream/secrets";
const OUT = path.join(process.cwd(), "src", "data", "youtube.json");
const API = "https://www.googleapis.com/youtube/v3";
const MAX_ITEMS = 12;

// Page order is part of the site contract: AI channel first.
const CHANNEL_IDS = ["UCSf0pNIEkJgXhH7WzIsFnpw", "UCRAV0VDSxngptEo5SY4nKcw"];

async function accessToken() {
    const secret = JSON.parse(
        readFileSync(path.join(SECRETS_DIR, "client_secret.json"), "utf8"),
    ).installed;
    const token = JSON.parse(
        readFileSync(path.join(SECRETS_DIR, "token.json"), "utf8"),
    );
    const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: secret.client_id,
            client_secret: secret.client_secret,
            refresh_token: token.refresh_token,
            grant_type: "refresh_token",
        }),
    });
    if (!res.ok) {
        throw new Error(`OAuth token refresh failed (${res.status}): ${await res.text()}`);
    }
    return (await res.json()).access_token;
}

async function api(tok, resource, params) {
    const url = new URL(`${API}/${resource}`);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    const res = await fetch(url, { headers: { authorization: `Bearer ${tok}` } });
    if (res.status === 404) return null; // empty auto-playlists 404
    if (!res.ok) {
        throw new Error(`${resource} failed (${res.status}): ${await res.text()}`);
    }
    return res.json();
}

// "PT1H2M5S" / "P1DT2H" / "P0D" -> seconds
function parseDuration(iso) {
    const m = iso?.match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/);
    if (!m) return 0;
    const [, d, h, min, s] = m.map((x) => Number(x) || 0);
    return d * 86400 + h * 3600 + min * 60 + s;
}

async function playlistIds(tok, playlistId) {
    const data = await api(tok, "playlistItems", {
        part: "snippet",
        playlistId,
        maxResults: String(MAX_ITEMS),
    });
    if (!data) return [];
    return data.items
        .map((i) => i.snippet?.resourceId?.videoId)
        .filter(Boolean);
}

// Shorts get a vertical thumb when YouTube has one; fall back to hqdefault.
async function shortThumb(id) {
    const oar = `https://i.ytimg.com/vi/${id}/oardefault.jpg`;
    try {
        const res = await fetch(oar, { method: "HEAD" });
        if (res.ok) return oar;
    } catch {
        // network hiccup on a thumb is not fatal; use the standard thumb
    }
    return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

async function buildChannel(tok, channelId) {
    const ch = await api(tok, "channels", {
        part: "snippet,statistics",
        id: channelId,
    });
    const c = ch?.items?.[0];
    if (!c) throw new Error(`channel ${channelId} not found`);
    if (c.statistics.hiddenSubscriberCount) {
        throw new Error(`channel ${channelId} hides subscriber count; page contract needs it`);
    }

    const suffix = channelId.slice(2);
    const [videoIds, shortIds, liveIds] = await Promise.all([
        playlistIds(tok, `UULF${suffix}`),
        playlistIds(tok, `UUSH${suffix}`),
        playlistIds(tok, `UULV${suffix}`),
    ]);

    const allIds = [...new Set([...videoIds, ...shortIds, ...liveIds])];
    const details = new Map();
    for (let i = 0; i < allIds.length; i += 50) {
        const batch = allIds.slice(i, i + 50);
        const res = await api(tok, "videos", {
            part: "snippet,contentDetails,statistics,liveStreamingDetails",
            id: batch.join(","),
            maxResults: "50",
        });
        for (const v of res?.items ?? []) details.set(v.id, v);
    }

    const toItem = async (id, { short = false } = {}) => {
        const v = details.get(id);
        if (!v) return null; // deleted/private since the playlist was read
        const broadcast = v.snippet.liveBroadcastContent; // "live" | "upcoming" | "none"
        return {
            id,
            title: v.snippet.title,
            publishedAt: v.snippet.publishedAt,
            durationSec: parseDuration(v.contentDetails?.duration),
            views: Number(v.statistics?.viewCount ?? 0),
            thumb: short
                ? await shortThumb(id)
                : `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
            ...(broadcast !== "none" ? { status: broadcast } : {}),
        };
    };

    const collect = async (ids, opts) =>
        (await Promise.all(ids.map((id) => toItem(id, opts)))).filter(Boolean);

    const live = await collect(liveIds);
    const rank = (s) => (s === "live" ? 0 : s === "upcoming" ? 1 : 2);
    live.sort(
        (a, b) =>
            rank(a.status) - rank(b.status) ||
            b.publishedAt.localeCompare(a.publishedAt),
    );

    return {
        id: channelId,
        title: c.snippet.title,
        handle: c.snippet.customUrl,
        url: `https://www.youtube.com/${c.snippet.customUrl}`,
        stats: {
            subscribers: Number(c.statistics.subscriberCount),
            views: Number(c.statistics.viewCount),
            videos: Number(c.statistics.videoCount),
        },
        videos: await collect(videoIds),
        shorts: await collect(shortIds, { short: true }),
        live,
    };
}

const tok = await accessToken();
const channels = [];
for (const id of CHANNEL_IDS) channels.push(await buildChannel(tok, id));
const out = { fetchedAt: new Date().toISOString(), channels };

// Atomic write: never leave a half-written data file behind.
const tmp = `${OUT}.tmp`;
writeFileSync(tmp, `${JSON.stringify(out, null, 2)}\n`);
renameSync(tmp, OUT);
console.log(
    `wrote ${OUT}: ${channels
        .map((c) => `${c.handle} v${c.videos.length}/s${c.shorts.length}/l${c.live.length}`)
        .join(", ")}`,
);
```

- [ ] **Step A4: Run the script to seed the data**

Run: `node scripts/fetch-youtube.mjs`
Expected: `wrote .../src/data/youtube.json: @jhanalytics2.0 v.../s.../l..., @jhanalytics v.../s.../l...`
Then eyeball `src/data/youtube.json`: two channels, correct order, plausible titles/stats.

- [ ] **Step A5: Run the test, confirm it passes**

Run: `npm run test:run src/lib/youtube.test.ts`
Expected: PASS (all contract + formatter tests).

- [ ] **Step A6: Lint the new files**

Run: `npx eslint scripts/fetch-youtube.mjs src/lib/youtube.test.ts`
Expected: clean. Do NOT commit.

---

### Task B: Showcase UI + page + nav + config (worker: yt-ui)

**Files:**
- Create: `src/components/YouTubeShowcase.tsx`
- Create: `src/app/youtube/page.tsx`
- Modify: `src/components/EditorialMasthead.tsx` (NAV_LINKS, ~line 15-19)
- Modify: `next.config.ts` (images.remotePatterns, ~line 38-40)
- Modify: `src/app/sitemap.ts` (add `/youtube` entry, follow the file's existing shape)

**Interfaces:**
- Consumes: `getYouTubeData`, `formatViews`, `formatDuration`, `formatDate`, types `YouTubeData`/`YouTubeChannel`/`YouTubeItem` from `@/lib/youtube` (Task 0; the file exists before you start).
- Produces: `YouTubeShowcase({ data }: { data: YouTubeData })` client component; `/youtube` route.

- [ ] **Step B1: Read the reference implementations first**

Read fully before writing code: `src/app/lab/page.tsx` (tablist keyboard pattern, mono/serif style objects, SHELL/WRAP layout constants, section headers), `src/components/EditorialMasthead.tsx`, `src/app/globals.css` (the `--tr-*` token block), `src/app/resume/page.tsx` (server page + metadata + section rhythm), `src/app/sitemap.ts`.

- [ ] **Step B2: Write `src/components/YouTubeShowcase.tsx`**

`'use client'`. Structure (follow /lab's idioms exactly — same `mono`/`monoData`/`serif` CSSProperties objects, same tablist a11y):

```tsx
"use client";

// State: const [channelIdx, setChannelIdx] = useState(0);
//        const [tab, setTab] = useState<"videos" | "shorts" | "live">("videos");
// const channel = data.channels[channelIdx];

// 1. Channel switcher: <div role="group" aria-label="Channel"> with one
//    <button> per channel, aria-pressed={channelIdx === i}, showing the
//    channel title (serif) + handle (mono). Selected button gets the raised
//    surface treatment: bg-tr-surface + top hairline (border-t). No ember.
//    Switching resets nothing except the visible channel (keep the active tab).
//
// 2. Stat row (mono machine channel): SUBSCRIBERS / VIEWS / UPLOADS using
//    formatViews for the numbers, plus `DATA AS OF {formatDate(data.fetchedAt)}`
//    in tr-muted. Numbers large: text-[length:var(--tr-t-display)] or the
//    size /lab uses for its biggest mono figures.
//
// 3. Tablist: role="tablist" with three role="tab" buttons (VIDEOS / SHORTS /
//    LIVE, mono uppercase), roving tabindex + ArrowLeft/ArrowRight exactly like
//    /lab's onKeyDown handler, aria-selected, aria-controls -> the tabpanel id,
//    counts next to labels (e.g. "SHORTS 12"). Active tab underline = ember
//    (border-b-2 with the accent token) — the page's only at-rest ember.
//
// 4. Tabpanel: role="tabpanel" per active tab.
//    - videos/live: grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap; card =
//      <a href={`https://www.youtube.com/watch?v=${item.id}`} target="_blank"
//      rel="noopener noreferrer">, next/image thumb (aspect-video, sizes
//      "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"),
//      serif title (h3, clamp to 2 lines), mono meta row:
//      `${formatViews(item.views)} views · ${formatDate(item.publishedAt)} · ${formatDuration(item.durationSec)}`
//      (omit the duration segment when durationSec === 0).
//    - shorts: grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap; href
//      `https://www.youtube.com/shorts/${item.id}`; thumb aspect-[9/16],
//      object-cover; title + views only (no duration).
//    - live items with item.status: mono badge "LIVE" / "UPCOMING" in the
//      accent (ember) colour on the card; past streams get no badge.
//    - empty array: <p> in mono tr-muted: "No uploads here yet."
// 5. Footer link per channel: mono external link "OPEN CHANNEL ->" to
//    channel.url (target _blank, rel noopener noreferrer).
//
// Images: next/image with fill inside a relative overflow-hidden container
// (or width/height 480x360 for hq / 405x720 for oar), alt = item.title.
// Grid children need min-w-0. No drop shadows; hover = surface lightens
// (bg-tr-surface) + hairline, respecting the depth rule.
```

Authored copy per channel lives here in a `CHANNEL_COPY` record keyed by handle (taglines + about paragraphs verbatim from the spec §"Authored copy"). Render tagline as a serif lede, about as serif body (`text-tr-text`), 2-3 sentences.

- [ ] **Step B3: Write `src/app/youtube/page.tsx`**

Server component:

```tsx
import type { Metadata } from "next";
import { EditorialMasthead } from "@/components/EditorialMasthead";
import { EditorialColophon } from "@/components/EditorialColophon";
import { YouTubeShowcase } from "@/components/YouTubeShowcase";
import { getYouTubeData } from "@/lib/youtube";

export const metadata: Metadata = {
    title: "Channel",
    description:
        "Jay Hemnani on YouTube: AI news translated for data people on JH-Analytics 2.0, plus FC gaming lives on the original JH-Analytics.",
};

export default function YouTubePage() {
    const data = getYouTubeData();
    return (
        // Same shell as /lab: bg-tr-bg text-tr-text root, EditorialMasthead,
        // <main id="main-content"> with the page kicker (mono, e.g. "04 /
        // CHANNEL"), one h1 (serif, e.g. "Two channels, one camera shy
        // operator."), then <YouTubeShowcase data={data} />, then
        // <EditorialColophon />.
        ...
    );
}
```

Match the exact wrapper classes/spacing of `/lab`'s page shell (masthead offset, SHELL/WRAP paddings). h1 copy must pass the style filter (no em-dash, no banned phrasing).

- [ ] **Step B4: Nav entry**

In `src/components/EditorialMasthead.tsx` NAV_LINKS, append after FDE:

```ts
  { href: "/youtube", label: "Channel", section: "channel" },
```

Check both desktop and mobile overlay render from NAV_LINKS (they do; no other change needed). If the section string feeds a type union elsewhere, extend it.

- [ ] **Step B5: next.config.ts remotePatterns**

```ts
        remotePatterns: [
            { protocol: "https", hostname: "avatars.githubusercontent.com" },
            { protocol: "https", hostname: "i.ytimg.com" },
        ],
```

- [ ] **Step B6: sitemap**

Add a `/youtube` entry to `src/app/sitemap.ts` mirroring the existing entries' shape (same lastModified/changeFrequency/priority conventions as other top-level routes).

- [ ] **Step B7: Lint the touched files**

Run: `npx eslint src/components/YouTubeShowcase.tsx src/app/youtube/page.tsx src/components/EditorialMasthead.tsx next.config.ts src/app/sitemap.ts`
Expected: clean. Do NOT run `npm run build` (orchestrator does). Do NOT commit.

---

### Post-implementation note (2026-07-19)

Task 0 as originally written failed `npm run build`: the client component
imports formatters from the same module as the fs-backed loader, which pulled
`fs` into the client bundle. Final layout: `src/lib/youtube.ts` = hand-written
types + formatters (client-safe, no fs/zod); `src/lib/youtube-data.ts` = zod
schema + `getYouTubeData()` (server only; its `YouTubeData` return annotation
is the schema-vs-types drift guard). Import sites updated accordingly.

### Task C (orchestrator): integration verification

- [ ] `npm run test:run` — full suite green (tokens, content, definitions, showcase, youtube).
- [ ] `npm run lint` — clean.
- [ ] `npm run build` — succeeds with no running server; `/youtube` in the route list.
- [ ] Visual check both themes + mobile width; keyboard tab navigation; no horizontal scroll.
- [ ] Present diff to Jay for commit approval.
