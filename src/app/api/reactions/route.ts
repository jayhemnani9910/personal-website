import { NextRequest, NextResponse } from "next/server";

type Emoji = "fire" | "rocket" | "heart" | "mind_blown";
const VALID_EMOJIS: Emoji[] = ["fire", "rocket", "heart", "mind_blown"];

// In-memory store (resets on cold start — good enough for MVP)
const reactions = new Map<string, Record<Emoji, number>>();

function getReactions(slug: string): Record<Emoji, number> {
    if (!reactions.has(slug)) {
        reactions.set(slug, { fire: 0, rocket: 0, heart: 0, mind_blown: 0 });
    }
    return reactions.get(slug)!;
}

export async function GET(request: NextRequest) {
    const slug = request.nextUrl.searchParams.get("slug");
    if (!slug) return NextResponse.json({ fire: 0, rocket: 0, heart: 0, mind_blown: 0 });
    return NextResponse.json(getReactions(slug));
}

export async function POST(request: NextRequest) {
    try {
        const { slug, emoji } = await request.json();
        if (!slug || !emoji || !VALID_EMOJIS.includes(emoji)) {
            return NextResponse.json({ error: "invalid slug or emoji" }, { status: 400 });
        }
        const data = getReactions(slug);
        data[emoji as Emoji]++;
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: "invalid body" }, { status: 400 });
    }
}
