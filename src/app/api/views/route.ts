import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/kv";

// Slugs are content ids/kebab-case; cap charset and length so the value can't
// be used to create arbitrary KV keys.
const isValidSlug = (s: unknown): s is string =>
    typeof s === "string" && /^[a-z0-9-]{1,80}$/.test(s);

// Fallback for local dev without a store configured
const localViews = new Map<string, number>();

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
                const count = await redis.incr(`views:${slug}`);
                return NextResponse.json({ count });
            } catch {
                return NextResponse.json({ count: 0 });
            }
        }

        const current = localViews.get(slug) || 0;
        localViews.set(slug, current + 1);
        return NextResponse.json({ count: current + 1 });
    } catch {
        return NextResponse.json({ error: "invalid body" }, { status: 400 });
    }
}
