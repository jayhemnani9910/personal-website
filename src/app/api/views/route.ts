import { NextRequest, NextResponse } from "next/server";

// In-memory store (resets on cold start — good enough for MVP)
const views = new Map<string, number>();

export async function GET(request: NextRequest) {
    const slug = request.nextUrl.searchParams.get("slug");
    if (!slug) return NextResponse.json({ count: 0 });
    return NextResponse.json({ count: views.get(slug) || 0 });
}

export async function POST(request: NextRequest) {
    try {
        const { slug } = await request.json();
        if (!slug || typeof slug !== "string") {
            return NextResponse.json({ error: "slug required" }, { status: 400 });
        }
        const current = views.get(slug) || 0;
        views.set(slug, current + 1);
        return NextResponse.json({ count: current + 1 });
    } catch {
        return NextResponse.json({ error: "invalid body" }, { status: 400 });
    }
}
