import { NextRequest, NextResponse } from "next/server";

type Emoji = "fire" | "rocket" | "heart" | "mind_blown";
const VALID_EMOJIS: Emoji[] = ["fire", "rocket", "heart", "mind_blown"];
const DEFAULT_REACTIONS: Record<Emoji, number> = { fire: 0, rocket: 0, heart: 0, mind_blown: 0 };

const isKvConfigured = () => !!process.env.KV_REST_API_URL;

// Fallback for local dev without KV
const localReactions = new Map<string, Record<Emoji, number>>();

function getLocalReactions(slug: string): Record<Emoji, number> {
    if (!localReactions.has(slug)) {
        localReactions.set(slug, { ...DEFAULT_REACTIONS });
    }
    return localReactions.get(slug)!;
}

async function getKv() {
    const { kv } = await import("@vercel/kv");
    return kv;
}

async function getKvReactions(slug: string): Promise<Record<Emoji, number>> {
    const kv = await getKv();
    const data = await kv.hgetall<Record<string, number>>(`reactions:${slug}`);
    if (!data) return { ...DEFAULT_REACTIONS };
    return {
        fire: data.fire || 0,
        rocket: data.rocket || 0,
        heart: data.heart || 0,
        mind_blown: data.mind_blown || 0,
    };
}

export async function GET(request: NextRequest) {
    const slug = request.nextUrl.searchParams.get("slug");
    if (!slug) return NextResponse.json(DEFAULT_REACTIONS);

    if (isKvConfigured()) {
        try {
            return NextResponse.json(await getKvReactions(slug));
        } catch {
            return NextResponse.json(DEFAULT_REACTIONS);
        }
    }
    return NextResponse.json(getLocalReactions(slug));
}

export async function POST(request: NextRequest) {
    try {
        const { slug, emoji } = await request.json();
        if (!slug || !emoji || !VALID_EMOJIS.includes(emoji)) {
            return NextResponse.json({ error: "invalid slug or emoji" }, { status: 400 });
        }

        if (isKvConfigured()) {
            try {
                const kv = await getKv();
                await kv.hincrby(`reactions:${slug}`, emoji, 1);
                return NextResponse.json(await getKvReactions(slug));
            } catch {
                return NextResponse.json(DEFAULT_REACTIONS);
            }
        }

        const data = getLocalReactions(slug);
        data[emoji as Emoji]++;
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: "invalid body" }, { status: 400 });
    }
}
