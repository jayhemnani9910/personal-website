import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/kv";

// Slugs are content ids/kebab-case; cap charset and length so the value can't
// be used to create arbitrary KV keys.
const isValidSlug = (s: unknown): s is string =>
    typeof s === "string" && /^[a-z0-9-]{1,80}$/.test(s);

// Fallback for local dev without a store configured. It mirrors the Redis
// semantics below, including the dedup, so behaviour observed locally is the
// behaviour that ships. A fallback that counts differently from production is a
// fallback that makes local testing lie.
const localViews = new Map<string, number>();
const localSeen = new Map<string, number>(); // dedup key -> expiry epoch ms

// One view per visitor per project per day. Without this the counter measured
// endpoint hits rather than readers: a reload incremented it, client-side
// navigation back to a project incremented it, and curl incremented it as fast
// as it was called. The number is displayed publicly on project pages, on a site
// whose own copy says it publishes load-bearing numbers rather than vanity ones.
const DEDUP_WINDOW_SECONDS = 60 * 60 * 24;

// Platform-set client IP only. The left-most x-forwarded-for entry is supplied
// by the caller, so keying on it would let anyone mint unlimited fresh identities
// and defeat the dedup entirely. Same reasoning as the fde-sim rate limiter.
function clientIp(request: NextRequest): string {
    return (
        request.headers.get("x-real-ip")?.trim() ||
        request.headers.get("x-forwarded-for")?.split(",").pop()?.trim() ||
        "anon"
    );
}

export async function GET(request: NextRequest) {
    const slug = request.nextUrl.searchParams.get("slug");
    if (!isValidSlug(slug)) return NextResponse.json({ count: 0 });

    const redis = getRedis();
    if (redis) {
        try {
            const count = (await redis.get<number>(`views:${slug}`)) || 0;
            return NextResponse.json({ count });
        } catch {
            return NextResponse.json({ count: 0 });
        }
    }
    return NextResponse.json({ count: localViews.get(slug) || 0 });
}

export async function POST(request: NextRequest) {
    try {
        const { slug } = await request.json();
        if (!isValidSlug(slug)) {
            return NextResponse.json({ error: "slug required" }, { status: 400 });
        }

        const redis = getRedis();
        if (redis) {
            try {
                // SET NX on the dedup key is the whole guard: it succeeds once per
                // visitor per slug per day, and only that first success increments.
                // Repeat callers get the current total back, so the UI still renders.
                const seenKey = `viewed:${slug}:${clientIp(request)}`;
                const first = await redis.set(seenKey, 1, { nx: true, ex: DEDUP_WINDOW_SECONDS });

                if (!first) {
                    const count = (await redis.get<number>(`views:${slug}`)) || 0;
                    return NextResponse.json({ count, counted: false });
                }

                const count = await redis.incr(`views:${slug}`);
                return NextResponse.json({ count, counted: true });
            } catch {
                return NextResponse.json({ count: 0 });
            }
        }

        const seenKey = `viewed:${slug}:${clientIp(request)}`;
        const now = Date.now();
        const expiry = localSeen.get(seenKey);

        if (expiry !== undefined && expiry > now) {
            return NextResponse.json({ count: localViews.get(slug) || 0, counted: false });
        }

        localSeen.set(seenKey, now + DEDUP_WINDOW_SECONDS * 1000);
        const current = localViews.get(slug) || 0;
        localViews.set(slug, current + 1);
        return NextResponse.json({ count: current + 1, counted: true });
    } catch {
        return NextResponse.json({ error: "invalid body" }, { status: 400 });
    }
}
