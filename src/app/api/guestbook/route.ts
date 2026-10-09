import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/kv";
import { clientIp } from "@/lib/client-ip";
import { rateLimit } from "@/lib/ratelimit";
import { GUESTBOOK_KEY, KEPT, SHOWN, parseNote, visible, type Note } from "@/lib/guestbook";

// Fallback for local dev without a store, newest first like the Redis list, so
// the wall behaves locally the way it does in production.
const localNotes: Note[] = [];

const storeUnavailable = () => NextResponse.json({ error: "store-unavailable" }, { status: 503 });

export async function GET() {
    const redis = getRedis();
    if (!redis) return NextResponse.json({ notes: visible(localNotes.slice(0, SHOWN)) });
    try {
        const notes = await redis.lrange<Note>(GUESTBOOK_KEY, 0, SHOWN - 1);
        return NextResponse.json({ notes: visible(notes) });
    } catch {
        return storeUnavailable();
    }
}

export async function POST(request: NextRequest) {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "invalid" }, { status: 400 });
    }

    const parsed = parseNote(body);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

    // Three notes per ten minutes is plenty for a person and dull for a script.
    const ip = clientIp(request.headers);
    if ((await rateLimit(getRedis(), "guestbook", ip, { limit: 3, windowSeconds: 600 })) === "limited") {
        return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }

    const note: Note = { name: parsed.name, msg: parsed.msg, at: Date.now() };
    const redis = getRedis();
    if (!redis) {
        localNotes.unshift(note);
        localNotes.length = Math.min(localNotes.length, KEPT);
        return NextResponse.json({ note }, { status: 201 });
    }
    try {
        await redis.lpush(GUESTBOOK_KEY, note);
        await redis.ltrim(GUESTBOOK_KEY, 0, KEPT - 1);
        return NextResponse.json({ note }, { status: 201 });
    } catch {
        return storeUnavailable();
    }
}
