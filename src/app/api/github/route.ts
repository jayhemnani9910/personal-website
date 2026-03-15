import { NextResponse } from "next/server";

interface GitHubEvent {
    type: string;
    repo: { name: string };
    created_at: string;
    payload: {
        commits?: { message: string }[];
    };
}

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
    try {
        const res = await fetch(
            "https://api.github.com/users/jayhemnani9910/events?per_page=30",
            {
                headers: { Accept: "application/vnd.github.v3+json" },
                next: { revalidate: 3600 },
            }
        );

        if (!res.ok) {
            return NextResponse.json({ commits: [] }, { status: 200 });
        }

        const events: GitHubEvent[] = await res.json();

        const commits = events
            .filter((e) => e.type === "PushEvent" && e.payload.commits?.length)
            .flatMap((e) =>
                (e.payload.commits || []).map((c) => ({
                    repo: e.repo.name.split("/")[1],
                    message: c.message.split("\n")[0], // First line only
                    date: e.created_at,
                }))
            )
            .slice(0, 5);

        return NextResponse.json({ commits });
    } catch {
        return NextResponse.json({ commits: [] }, { status: 200 });
    }
}
