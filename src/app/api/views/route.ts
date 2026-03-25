import { NextRequest, NextResponse } from "next/server";

const isKvConfigured = () => !!process.env.KV_REST_API_URL;

// Fallback for local dev without KV
const localViews = new Map<string, number>();

async function getKv() {
    const { kv } = await import("@vercel/kv");
    return kv;
}

export async function GET(request: NextRequest) {
    const slug = request.nextUrl.searchParams.get("slug");
    if (!slug) return NextResponse.json({ count: 0 });

    if (isKvConfigured()) {
        try {
            const kv = await getKv();
            const count = (await kv.get<number>(`views:${slug}`)) || 0;
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
        if (!slug || typeof slug !== "string") {
            return NextResponse.json({ error: "slug required" }, { status: 400 });
        }

        if (isKvConfigured()) {
            try {
                const kv = await getKv();
                const count = await kv.incr(`views:${slug}`);
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
