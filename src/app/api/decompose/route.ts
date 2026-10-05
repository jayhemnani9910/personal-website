import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/kv";
import { dailyBudget, rateLimit } from "@/lib/ratelimit";
import { clientIp } from "@/lib/client-ip";
import { FEATURED } from "@/data/home";
import type { DecomposeOutput } from "@/data/home";
import {
    BRIEF_MAX,
    DecomposeOutputSchema,
    buildDecomposeBody,
    decomposeCacheKey,
    findPreset,
} from "@/lib/decompose";

export const runtime = "nodejs";
export const maxDuration = 30;

/** Named once: the cache fingerprint has to see the same value the calls use. */
const MODEL = "gemini-2.5-flash";

// Model calls allowed per UTC day across every visitor (decision D11). Past it
// the answer is "unavailable", which the page meets with its saved examples.
const DAILY_MODEL_CALLS = 200;

const FEATURED_IDS = new Set(FEATURED.map((p) => p.id));

/**
 * The recipe this instance is running: model, prompt, schema, generation
 * config. Built once with an empty brief, so it captures the configuration
 * and nothing about any visitor. See decomposeCacheKey for why it is part of
 * the key.
 */
const RECIPE = { model: MODEL, body: buildDecomposeBody("") };

const CACHE_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

// Under maxDuration, so a slow upstream ends in the route's 503 rather than the
// platform's timeout.
const GEMINI_TIMEOUT_MS = 25_000;

// Every failure past validation looks the same to the page: it falls back to
// its saved examples. Each path logs its own reason first.
const unavailable = () => NextResponse.json({ error: "unavailable" }, { status: 503 });

async function readCache(key: string): Promise<DecomposeOutput | null> {
    const redis = getRedis();
    if (!redis) return null;
    try {
        const hit = await redis.get<unknown>(key);
        if (!hit) return null;
        const parsed = DecomposeOutputSchema.safeParse(hit);
        return parsed.success ? parsed.data : null;
    } catch (err) {
        // A cache miss and a cache outage are the same thing to the caller.
        console.error("[decompose] cache read failed:", err instanceof Error ? err.message : err);
        return null;
    }
}

async function writeCache(key: string, out: DecomposeOutput): Promise<void> {
    const redis = getRedis();
    if (!redis) return;
    try {
        await redis.set(key, out, { ex: CACHE_TTL_SECONDS });
    } catch (err) {
        console.error("[decompose] cache write failed:", err instanceof Error ? err.message : err);
    }
}

/** Slice the first {...} substring out of the model's text and parse it. */
function extractJson(raw: string): unknown {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
        throw new Error("unparseable");
    }
    return JSON.parse(raw.slice(start, end + 1));
}

export async function POST(request: NextRequest) {
    let brief: string;
    try {
        const body = await request.json();
        brief = typeof body?.brief === "string" ? body.brief.trim() : "";
    } catch {
        brief = "";
    }

    if (!brief) {
        return NextResponse.json({ error: "empty" }, { status: 400 });
    }
    if (brief.length > BRIEF_MAX) {
        return NextResponse.json({ error: "too_long" }, { status: 400 });
    }

    // Presets are a fixed lookup table for the three worked examples on the
    // page. They are answered here, before the rate limiter or Redis are
    // touched: a visitor who submits one of those verbatim shouldn't spend a
    // model call or a rate-limit slot on an answer that already exists.
    const preset = findPreset(brief);
    if (preset) {
        return NextResponse.json({ engine: "preset", out: preset.out }, { status: 200 });
    }

    const limit = await rateLimit(getRedis(), "decompose", clientIp(request.headers));
    if (limit === "limited") {
        return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }

    const key = await decomposeCacheKey(brief, RECIPE);
    const cached = await readCache(key);
    if (cached) {
        return NextResponse.json({ engine: "model", out: cached }, { status: 200 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("[decompose] GEMINI_API_KEY is not set; live decomposition is disabled");
        return unavailable();
    }
    if ((await dailyBudget(getRedis(), "decompose", DAILY_MODEL_CALLS)) === "exhausted") {
        console.error("[decompose] daily model budget spent; serving saved examples");
        return unavailable();
    }

    let res: Response;
    try {
        // The key travels as a header, not as ?key= in the query string, which
        // is what fde-sim does and for the same reason: a query string is the
        // part of a request that proxies, access logs and error traces keep.
        res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
                body: JSON.stringify(buildDecomposeBody(brief)),
                signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
            },
        );
    } catch (err) {
        console.error("[decompose] gemini request failed:", err instanceof Error ? err.message : err);
        return unavailable();
    }

    if (!res.ok) {
        console.error(`[decompose] gemini http ${res.status} ${res.statusText}`);
        return unavailable();
    }

    let raw: string;
    try {
        const data = await res.json();
        raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    } catch (err) {
        // A 200 whose body is not JSON, or a connection dropped mid-body.
        console.error("[decompose] gemini body unreadable:", err instanceof Error ? err.message : err);
        return unavailable();
    }

    let parsed: unknown;
    try {
        parsed = extractJson(raw);
    } catch (err) {
        console.error("[decompose] could not extract JSON from response:", err instanceof Error ? err.message : err);
        return unavailable();
    }

    const result = DecomposeOutputSchema.safeParse(parsed);
    if (!result.success) {
        console.error(`[decompose] response failed schema check: ${result.error.message}`);
        return unavailable();
    }

    const out: DecomposeOutput = {
        ...result.data,
        // Deduped: the same project named twice rendered two identical links.
        match: [...new Set(result.data.match)].filter((id) => FEATURED_IDS.has(id)).slice(0, 2),
    };

    await writeCache(key, out);
    return NextResponse.json({ engine: "model", out }, { status: 200 });
}
