#!/usr/bin/env node
// Regenerates src/data/youtube.json from the YouTube Data API v3.
// Auth: OAuth refresh token from the jh-analytics streaming setup; only
// public data is fetched (channels, auto-playlists, video stats).
// Run from the repo root: node scripts/fetch-youtube.mjs
// Quota cost: ~12 units per run.

import { readFileSync, writeFileSync, renameSync } from "node:fs";
import path from "node:path";

const SECRETS_DIR = "/home/po/projects/personal/youtube/jh-analytics/stream/secrets";
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
