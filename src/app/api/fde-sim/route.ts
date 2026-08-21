import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/kv";
import { PROMPT_LEAK_MARKERS, buildGeminiBody, simCacheKey } from "@/lib/fde-prompt";
import { classifyStatus, readSimMetrics, recordSim, type SimFailure } from "@/lib/fde-metrics";
import { JsonSectionExtractor } from "@/lib/json-sections";
import { SseDecoder, encodeSse, geminiChunkText, geminiChunkUsage, type SimStreamEvent } from "@/lib/fde-stream";

export const runtime = "nodejs";

/** Named once: the cache fingerprint has to see the same value the calls use. */
const GEMINI_MODEL = "gemini-2.5-flash";

interface ArchComponent {
    id: string;
    name: string;
    kind: "ui" | "service" | "agent" | "data" | "external";
    col?: number;
    row?: number;
    sub: string;
    x?: number;
    y?: number;
}

interface ArchEdge {
    from: string;
    to: string;
    label: string;
    dashed: boolean;
}

interface SimPayload {
    scope: { q: string; why: string }[];
    decomposition: { id: string; title: string; why: string }[];
    architecture: { components: ArchComponent[]; edges: ArchEdge[] };
    sprint: { day: string; title: string; deliv: string }[];
    risks: { risk: string; mitigation: string }[];
}

// Guards against a malformed model response (valid JSON, wrong shape) reaching
// normalizeCoords and throwing an unhandled error. Only checks the fields the
// route touches before returning.
function isSimPayload(p: unknown): p is SimPayload {
    if (!p || typeof p !== "object") return false;
    const arch = (p as { architecture?: unknown }).architecture;
    if (!arch || typeof arch !== "object") return false;
    return Array.isArray((arch as { components?: unknown }).components);
}

// Extracted so the streaming path can normalise the architecture section on its
// own, as it arrives, rather than only once the whole payload exists.
// FdeArchDiagram reads c.x/c.y, so a section emitted without them draws nothing.
function normalizeArchitecture(arch: SimPayload["architecture"]): SimPayload["architecture"] {
    return {
        ...arch,
        components: arch.components.map((c: ArchComponent) => ({
            ...c,
            x: 60 + (c.col ?? 0) * 220,
            y: 50 + (c.row ?? 0) * 140,
        })),
    };
}

function normalizeCoords(payload: SimPayload): SimPayload {
    payload.architecture = normalizeArchitecture(payload.architecture);
    return payload;
}

function extractJson(raw: string): SimPayload {
    // Try direct parse first
    try {
        return JSON.parse(raw) as SimPayload;
    } catch {
        // Try stripping a fenced ```json ... ``` block
        const fenced = raw.match(/```json\s*([\s\S]*?)```/);
        if (fenced) {
            try {
                return JSON.parse(fenced[1].trim()) as SimPayload;
            } catch {
                // fall through
            }
        }

        // Try extracting the first { ... } substring
        const start = raw.indexOf("{");
        const end = raw.lastIndexOf("}");
        if (start !== -1 && end !== -1 && end > start) {
            try {
                return JSON.parse(raw.slice(start, end + 1)) as SimPayload;
            } catch {
                // fall through
            }
        }

        throw new Error("unparseable");
    }
}

const RATE_LIMIT = 8;            // max requests
const RATE_WINDOW_SECONDS = 60;  // per IP, per minute

async function isRateLimited(ip: string): Promise<boolean> {
    const redis = getRedis();
    if (!redis) return false; // no store configured -> skip
    try {
        const key = `ratelimit:fde-sim:${ip}`;
        const count = await redis.incr(key);
        if (count === 1) await redis.expire(key, RATE_WINDOW_SECONDS);
        return count > RATE_LIMIT;
    } catch (err) {
        // Fail open: a store outage should not take the feature down. Log it,
        // because while this is firing the route has no rate limit at all.
        console.error("[fde-sim] rate-limit store unavailable, failing open:", err instanceof Error ? err.message : err);
        return false;
    }
}

// Level-1 exact-match cache. A Gemini call is the slowest and only metered part
// of this route, and the same brief gets submitted more than once: Jay demoing
// the page, a recruiter pasting the same scenario, anyone hitting retry. Redis
// is already wired up on the line above for rate limiting.
//
// Normalised so trivial differences (case, padding, internal whitespace) share
// an entry. The key is a hash rather than the brief itself, both to bound the
// key length and to keep visitor text out of the keyspace.
const CACHE_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

/**
 * The recipe this instance is running: model, prompt, schema, generation config.
 * Built once with an empty brief, so it captures the configuration and nothing
 * about any visitor. See simCacheKey for why it is part of the key.
 */
const RECIPE = { model: GEMINI_MODEL, body: buildGeminiBody("") };

const cacheKey = (brief: string) => simCacheKey(brief, RECIPE);

async function readCache(key: string): Promise<SimPayload | null> {
    const redis = getRedis();
    if (!redis) return null;
    try {
        const hit = await redis.get<SimPayload>(key);
        return hit && isSimPayload(hit) ? hit : null;
    } catch (err) {
        // A cache miss and a cache outage are the same thing to the caller.
        console.error("[fde-sim] cache read failed:", err instanceof Error ? err.message : err);
        return null;
    }
}

async function writeCache(key: string, payload: SimPayload): Promise<void> {
    const redis = getRedis();
    if (!redis) return;
    try {
        await redis.set(key, payload, { ex: CACHE_TTL_SECONDS });
    } catch (err) {
        console.error("[fde-sim] cache write failed:", err instanceof Error ? err.message : err);
    }
}

/** The order SIM_RESPONSE_SCHEMA declares, which is the order they complete in. */
const SECTION_ORDER = ["scope", "decomposition", "architecture", "sprint", "risks"] as const;

/**
 * Wrap a producer in a server-sent-events response.
 *
 * no-transform matters as much as no-cache: without it a proxy is free to buffer
 * the body, which would deliver every section at the end and undo the point.
 */
function sseResponse(
    produce: (send: (e: SimStreamEvent) => void) => void | Promise<void>,
    cacheState?: string,
): Response {
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
            const send = (e: SimStreamEvent) => controller.enqueue(encoder.encode(encodeSse(e)));
            try {
                await produce(send);
            } catch (err) {
                console.error(`[fde-sim] stream producer threw: ${err instanceof Error ? err.message : String(err)}`);
                send({ type: "error", error: "parse" });
            } finally {
                controller.close();
            }
        },
    });

    return new Response(stream, {
        headers: {
            "content-type": "text/event-stream; charset=utf-8",
            "cache-control": "no-cache, no-transform",
            connection: "keep-alive",
            ...(cacheState ? { "x-sim-cache": cacheState } : {}),
        },
    });
}

/**
 * Stream one generation, emitting each section as it closes.
 *
 * Same prompt, same schema, same model as the buffered path: the only
 * difference is `streamGenerateContent?alt=sse` and reading the body as it
 * arrives. Returns the assembled payload, or null if anything failed, matching
 * generate()'s contract so callers treat both the same.
 *
 * `onSection` is called before the payload is complete, so anything that must
 * not reach a visitor has to be checked here rather than at the end. The leak
 * filter therefore runs per section, on the serialized value, before emit.
 */
async function streamGenerate(
    apiKey: string,
    brief: string,
    onSection: (key: string, value: unknown) => void,
    failures: SimFailure[],
): Promise<{ payload: SimPayload | null; promptTokens: number; outputTokens: number }> {
    let promptTokens = 0;
    let outputTokens = 0;

    try {
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
                body: JSON.stringify(buildGeminiBody(brief)),
            },
        );

        if (!res.ok || !res.body) {
            console.error(`[fde-sim] gemini stream http ${res.status} ${res.statusText}`);
            failures.push(classifyStatus(res.status));
            return { payload: null, promptTokens, outputTokens };
        }

        const decoder = new SseDecoder();
        const sections = new JsonSectionExtractor();
        const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();

        for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            for (const payload of decoder.push(value)) {
                const usage = geminiChunkUsage(payload);
                if (usage) {
                    promptTokens = usage.prompt;
                    outputTokens = usage.output;
                }
                for (const section of sections.push(geminiChunkText(payload))) {
                    // Fails closed, per section, because by the time the whole
                    // object exists this content has already been sent.
                    if (PROMPT_LEAK_MARKERS.some((m) => JSON.stringify(section.value).includes(m))) {
                        console.error(`[fde-sim] stream section echoed prompt text (${section.key})`);
                        failures.push("leak");
                        return { payload: null, promptTokens, outputTokens };
                    }
                    if (section.key === "architecture") {
                        const arch = section.value as SimPayload["architecture"];
                        if (!arch || !Array.isArray(arch.components)) {
                            failures.push("shape");
                            return { payload: null, promptTokens, outputTokens };
                        }
                        onSection(section.key, normalizeArchitecture(arch));
                    } else {
                        onSection(section.key, section.value);
                    }
                }
            }
        }

        const parsed = extractJson(sections.text);
        if (!isSimPayload(parsed)) {
            console.error(`[fde-sim] streamed response failed shape check (${sections.text.length} chars)`);
            failures.push("shape");
            return { payload: null, promptTokens, outputTokens };
        }
        return { payload: normalizeCoords(parsed), promptTokens, outputTokens };
    } catch (err) {
        const detail = err instanceof Error ? err.message : String(err);
        console.error(`[fde-sim] stream failed: ${detail}`);
        failures.push(detail === "unparseable" ? "unparseable" : "network");
        return { payload: null, promptTokens, outputTokens };
    }
}

export async function POST(request: NextRequest) {
    // Validate input
    let brief: string;
    try {
        const body = await request.json();
        brief = typeof body?.brief === "string" ? body.brief.trim() : "";
    } catch {
        return NextResponse.json({ error: "bad-input" }, { status: 400 });
    }

    if (!brief || brief.length > 2000) {
        return NextResponse.json({ error: "bad-input" }, { status: 400 });
    }

    // Opt-in, so the buffered response stays the default. The eval harness, and
    // anything else that just wants the object, is unaffected by this existing.
    const wantsStream = request.nextUrl.searchParams.get("stream") === "1";

    // Best-effort per-IP rate limit (requires KV; skipped when unconfigured).
    // Trust the platform-set client IP: x-real-ip, or the right-most (last hop)
    // x-forwarded-for value. The left-most value is client-supplied and spoofable,
    // so using it would let an attacker rotate fake IPs to bypass the limit.
    const ip =
        request.headers.get("x-real-ip")?.trim() ||
        request.headers.get("x-forwarded-for")?.split(",").pop()?.trim() ||
        "anon";
    if (await isRateLimited(ip)) {
        await recordSim(getRedis(), { outcome: "rate_limited" });
        return NextResponse.json({ error: "rate-limited" }, { status: 429 });
    }

    // Cache lookup sits after the rate limit (a cheap response is still a
    // response worth bounding) but before the key check, so a previously
    // answered brief still resolves even if the model is unreachable.
    const key = await cacheKey(brief);
    const cached = await readCache(key);
    if (cached) {
        await recordSim(getRedis(), { outcome: "cache_hit" });
        if (wantsStream) {
            // A cache hit still speaks the streaming protocol, so the client has
            // one code path rather than two. It simply arrives all at once.
            return sseResponse((send) => {
                for (const key of SECTION_ORDER) {
                    send({ type: "section", key, value: cached[key] });
                }
                send({ type: "done" });
            }, "hit");
        }
        return NextResponse.json(cached, { headers: { "x-sim-cache": "hit" } });
    }

    // Check for API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("[fde-sim] GEMINI_API_KEY is not set; live simulation is disabled");
        await recordSim(getRedis(), { outcome: "no_runtime" });
        if (wantsStream) {
            return sseResponse((send) => send({ type: "error", error: "no-runtime" }));
        }
        return NextResponse.json({ error: "no-runtime" }, { status: 503 });
    }

    const geminiUrl =
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

    // Filled in as attempts run, then written once at whichever exit is reached.
    const failures: SimFailure[] = [];
    let promptTokens = 0;
    let outputTokens = 0;

    // One call attempt: returns a normalized payload, or null on any failure
    // (non-200, empty body, unparseable text, or wrong shape). Each failure logs
    // its own cause to stderr, which Vercel collects as runtime logs: without it
    // every one of these surfaces to the caller as an indistinguishable 502 and
    // there is no way to tell an expired key from a model that rambled.
    // Never log the prompt, the brief, or the key.
    async function generate(attempt: number): Promise<SimPayload | null> {
        try {
            const res = await fetch(geminiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey! },
                body: JSON.stringify(buildGeminiBody(brief)),
            });
            if (!res.ok) {
                console.error(`[fde-sim] gemini http ${res.status} ${res.statusText} (attempt ${attempt})`);
                failures.push(classifyStatus(res.status));
                return null;
            }
            const data = await res.json();
            // Reported by Gemini on every answered call, including ones whose
            // body we then reject: those cost tokens too.
            promptTokens += Number(data?.usageMetadata?.promptTokenCount ?? 0);
            outputTokens += Number(data?.usageMetadata?.candidatesTokenCount ?? 0);
            const candidate = data?.candidates?.[0];
            const raw: string = candidate?.content?.parts?.[0]?.text ?? "";
            if (!raw) {
                console.error(
                    `[fde-sim] gemini returned no text (attempt ${attempt}, finishReason=${candidate?.finishReason ?? "none"})`
                );
                failures.push("empty");
                return null;
            }
            // Output filtering. The schema already makes a leak unlikely, but a
            // response carrying the instructions back is the one symptom worth
            // failing closed on rather than rendering into the diagram.
            const leaked = PROMPT_LEAK_MARKERS.find((m) => raw.includes(m));
            if (leaked) {
                console.error(`[fde-sim] response echoed prompt text (attempt ${attempt}, marker=${leaked})`);
                failures.push("leak");
                return null;
            }

            const parsed = extractJson(raw);
            if (!isSimPayload(parsed)) {
                console.error(`[fde-sim] response failed shape check (attempt ${attempt}, ${raw.length} chars)`);
                failures.push("shape");
                return null;
            }
            return normalizeCoords(parsed);
        } catch (err) {
            const detail = err instanceof Error ? err.message : String(err);
            const what = detail === "unparseable" ? "could not extract JSON from response" : "request failed";
            console.error(`[fde-sim] ${what} (attempt ${attempt}): ${detail}`);
            failures.push(detail === "unparseable" ? "unparseable" : "network");
            return null;
        }
    }

    // Retry once: the model occasionally returns unparseable JSON; a second pass
    // almost always succeeds before we give up with a 502.
    if (wantsStream) {
        const startedAt = Date.now();
        let firstSectionAt = 0;

        return sseResponse(async (send) => {
            const result = await streamGenerate(
                apiKey,
                brief,
                (key, value) => {
                    if (!firstSectionAt) firstSectionAt = Date.now();
                    send({ type: "section", key, value });
                },
                failures,
            );

            const latencyMs = Date.now() - startedAt;
            const ttfsMs = firstSectionAt ? firstSectionAt - startedAt : undefined;

            if (!result.payload) {
                send({ type: "error", error: "parse" });
                await recordSim(getRedis(), {
                    outcome: "gave_up",
                    failures,
                    latencyMs,
                    ttfsMs,
                    promptTokens: result.promptTokens,
                    outputTokens: result.outputTokens,
                });
                return;
            }

            send({ type: "done" });
            await writeCache(key, result.payload);
            await recordSim(getRedis(), {
                outcome: "ok",
                failures,
                latencyMs,
                ttfsMs,
                promptTokens: result.promptTokens,
                outputTokens: result.outputTokens,
            });
        }, "miss");
    }

    let payload: SimPayload | null = null;
    // Measured across every attempt, because a retry is latency the visitor
    // waited through. Timing only the successful call would report the fast half.
    const startedAt = Date.now();
    for (let attempt = 1; attempt <= 2 && !payload; attempt++) {
        payload = await generate(attempt);
    }
    const latencyMs = Date.now() - startedAt;

    if (!payload) {
        console.error(`[fde-sim] giving up after 2 attempts (brief ${brief.length} chars)`);
        await recordSim(getRedis(), { outcome: "gave_up", failures, latencyMs, promptTokens, outputTokens });
        return NextResponse.json({ error: "parse" }, { status: 502 });
    }

    await writeCache(key, payload);
    await recordSim(getRedis(), { outcome: "ok", failures, latencyMs, promptTokens, outputTokens });
    return NextResponse.json(payload, { headers: { "x-sim-cache": "miss" } });
}

/**
 * Operational counters for this route. Aggregates only: no briefs, no IPs, no
 * keys, nothing about an individual visitor. Public on purpose, on a site whose
 * own copy says it publishes load-bearing numbers rather than vanity ones, and
 * because a counter nobody can read is not observability. Returns 503 when no
 * store is configured, which is also the local-dev answer.
 */
export async function GET() {
    const metrics = await readSimMetrics(getRedis());
    if (!metrics) {
        return NextResponse.json({ error: "no-store" }, { status: 503 });
    }
    // Ten seconds, and both directions were wrong first. At 60 the CDN served a
    // minute-old body, which is exactly the wrong answer when the question is
    // "did the call I just made get counted": it cost a debugging session that
    // concluded the writes were broken when they were not. At 0, an
    // unauthenticated GET doing four Redis reads has nothing bounding how often
    // it can be asked. Ten is fresh enough to answer that question and caps the
    // read rate at six a minute per region.
    return NextResponse.json(metrics, {
        headers: { "cache-control": "public, max-age=10" },
    });
}
