import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/kv";
import { clientIp } from "@/lib/client-ip";
import { rateLimit } from "@/lib/ratelimit";
import { dailyBudget } from "@/lib/ratelimit";
import { defer } from "@/lib/defer";
import { GEMINI_MODEL, buildGeminiBody, containsPromptLeak, simCacheKey } from "@/lib/fde-prompt";
import { classifyStatus, readSimMetrics, recordSim, type SimFailure } from "@/lib/fde-metrics";
import { JsonSectionExtractor } from "@/lib/json-sections";
import { SseDecoder, encodeSse, geminiChunkFinishReason, geminiChunkText, geminiChunkUsage, type SimStreamEvent } from "@/lib/fde-stream";
import { SECTION_ORDER, isSimPayload, isSimSection, type ArchComponent, type SimPayload } from "@/lib/fde-payload";

export const runtime = "nodejs";

// Both attempts share one deadline, set under maxDuration, so a stalled
// connection becomes a recorded failure instead of the platform killing the
// function mid-stream with nothing logged. A normal answer takes ~10-25s.
export const maxDuration = 60;
const DEADLINE_MS = 55_000;

// Simulation runs allowed per UTC day across every visitor (decision D11). A
// run makes at most two model calls (one retry), so this also caps calls at
// 400. Past it, a visitor gets the same answer as when no model is configured:
// the closest prepared example.
const DAILY_RUNS = 200;

const isTimeout = (err: unknown) => err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");

/** Failures a second attempt cannot fix, or should not pile onto. */
const NOT_RETRYABLE: SimFailure[] = ["http_4xx", "http_429"];

/**
 * What the visitor is told. "upstream" when every attempt failed on the
 * provider's side (throttled, down, unreachable, timed out), since rewriting
 * the brief will not help; "parse" when the model answered but badly.
 */
function failureCode(failures: SimFailure[]): "upstream" | "parse" {
    const upstream: SimFailure[] = ["http_429", "http_5xx", "http_4xx", "network", "timeout"];
    return failures.length > 0 && failures.every((f) => upstream.includes(f)) ? "upstream" : "parse";
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
            // Once the visitor navigates away, enqueue throws. That used to
            // happen inside the catch below as well, which threw a second time
            // out of start() and took the close with it, turning a normal
            // disconnect into an unhandled rejection in the logs.
            let closed = false;
            const send = (e: SimStreamEvent) => {
                if (closed) return;
                try {
                    controller.enqueue(encoder.encode(encodeSse(e)));
                } catch {
                    closed = true;
                }
            };
            try {
                await produce(send);
            } catch (err) {
                console.error(`[fde-sim] stream producer threw: ${err instanceof Error ? err.message : String(err)}`);
                send({ type: "error", error: "parse" });
            } finally {
                if (!closed) {
                    try {
                        controller.close();
                    } catch {
                        // Already closed or errored by the runtime.
                    }
                }
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
 * not reach a visitor has to be checked here rather than at the end: the leak
 * filter and the section's shape both run per section, before emit.
 */
async function streamGenerate(
    apiKey: string,
    brief: string,
    onSection: (key: string, value: unknown) => void,
    failures: SimFailure[],
    signal: AbortSignal,
): Promise<{ payload: SimPayload | null; promptTokens: number; outputTokens: number }> {
    let promptTokens = 0;
    let outputTokens = 0;
    const fail = (f: SimFailure) => {
        failures.push(f);
        return { payload: null, promptTokens, outputTokens };
    };

    let res: Response;
    try {
        res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
                body: JSON.stringify(buildGeminiBody(brief)),
                signal,
            },
        );
    } catch (err) {
        console.error(`[fde-sim] stream request failed: ${err instanceof Error ? err.message : String(err)}`);
        return fail(isTimeout(err) ? "timeout" : "network");
    }

    if (!res.ok) {
        console.error(`[fde-sim] gemini stream http ${res.status} ${res.statusText}`);
        return fail(classifyStatus(res.status));
    }
    if (!res.body) {
        console.error("[fde-sim] gemini stream answered 200 with no body");
        return fail("empty");
    }

    const decoder = new SseDecoder();
    const sections = new JsonSectionExtractor();
    const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
    let finishReason: string | null = null;

    try {
        for (;;) {
            let chunk: ReadableStreamReadResult<string>;
            try {
                chunk = await reader.read();
            } catch (err) {
                console.error(`[fde-sim] stream read failed: ${err instanceof Error ? err.message : String(err)}`);
                return fail(isTimeout(err) ? "timeout" : "network");
            }
            if (chunk.done) break;
            for (const payload of decoder.push(chunk.value)) {
                const usage = geminiChunkUsage(payload);
                if (usage) {
                    promptTokens = usage.prompt;
                    outputTokens = usage.output;
                }
                finishReason = geminiChunkFinishReason(payload) ?? finishReason;
                for (const section of sections.push(geminiChunkText(payload))) {
                    // A key the schema does not declare is dropped, not sent.
                    if (!(SECTION_ORDER as readonly string[]).includes(section.key)) continue;
                    // Fails closed, per section, because by the time the whole
                    // object exists this content has already been sent.
                    if (containsPromptLeak(section.value)) {
                        console.error(`[fde-sim] stream section echoed prompt text (${section.key})`);
                        return fail("leak");
                    }
                    if (!isSimSection(section.key, section.value)) {
                        console.error(`[fde-sim] stream section failed shape check (${section.key})`);
                        return fail("shape");
                    }
                    onSection(
                        section.key,
                        section.key === "architecture"
                            ? normalizeArchitecture(section.value as SimPayload["architecture"])
                            : section.value,
                    );
                }
            }
        }

        if (!sections.text.trim()) {
            console.error(`[fde-sim] gemini stream returned no text (finishReason=${finishReason ?? "none"})`);
            return fail("empty");
        }
        let parsed: SimPayload;
        try {
            parsed = extractJson(sections.text);
        } catch {
            console.error(`[fde-sim] could not extract JSON from stream (finishReason=${finishReason ?? "none"})`);
            return fail("unparseable");
        }
        // The section check above skips undeclared keys, but they still reach
        // the cache, so the whole object is checked before it is stored.
        if (containsPromptLeak(parsed)) {
            console.error("[fde-sim] streamed response echoed prompt text");
            return fail("leak");
        }
        if (!isSimPayload(parsed)) {
            console.error(`[fde-sim] streamed response failed shape check (${sections.text.length} chars)`);
            return fail("shape");
        }
        return { payload: normalizeCoords(parsed), promptTokens, outputTokens };
    } finally {
        // An early return (leak, bad section) would otherwise leave Gemini
        // generating a body nobody reads. Cancelling a finished reader is a no-op.
        reader.cancel().catch(() => {});
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

    // Best-effort per-IP rate limit (requires KV; fails open when unconfigured).
    if ((await rateLimit(getRedis(), "fde-sim", clientIp(request.headers))) === "limited") {
        await defer(() => recordSim(getRedis(), { outcome: "rate_limited" }));
        return NextResponse.json({ error: "rate-limited" }, { status: 429 });
    }

    // Cache lookup sits after the rate limit (a cheap response is still a
    // response worth bounding) but before the key check, so a previously
    // answered brief still resolves even if the model is unreachable.
    const key = await cacheKey(brief);
    const hit = await readCache(key);
    if (hit) {
        // Laid out again on the way out: the layout constants are not part of
        // the cache key, so a stored diagram must not keep an old layout.
        const cached = normalizeCoords(hit);
        await defer(() => recordSim(getRedis(), { outcome: "cache_hit" }));
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

    // No model configured ("no-runtime"), or today's run budget spent
    // ("over-budget"): either way the console offers the closest prepared
    // example, with copy that says which. The two are recorded separately.
    const unavailable = (error: "no-runtime" | "over-budget") =>
        wantsStream
            ? sseResponse((send) => send({ type: "error", error }))
            : NextResponse.json({ error }, { status: 503 });
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("[fde-sim] GEMINI_API_KEY is not set; live simulation is disabled");
        await defer(() => recordSim(getRedis(), { outcome: "no_runtime" }));
        return unavailable("no-runtime");
    }
    if ((await dailyBudget(getRedis(), "fde-sim", DAILY_RUNS)) === "exhausted") {
        console.error("[fde-sim] daily run budget spent; serving presets");
        await defer(() => recordSim(getRedis(), { outcome: "over_budget" }));
        return unavailable("over-budget");
    }

    const geminiUrl =
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

    // Filled in as attempts run, then written once at whichever exit is reached.
    const failures: SimFailure[] = [];
    let promptTokens = 0;
    let outputTokens = 0;

    const deadline = Date.now() + DEADLINE_MS;
    const attemptSignal = () => AbortSignal.timeout(Math.max(1_000, deadline - Date.now()));
    // A second attempt only when it can help and there is time for it.
    const shouldRetry = () =>
        !NOT_RETRYABLE.includes(failures[failures.length - 1]) && deadline - Date.now() > 5_000;

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
                signal: attemptSignal(),
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

            const parsed = extractJson(raw);
            // Output filtering. The schema already makes a leak unlikely, but a
            // response carrying the instructions back is the one symptom worth
            // failing closed on rather than rendering into the diagram. Checked
            // on the parsed value, the same way the stream path checks it.
            if (containsPromptLeak(parsed)) {
                console.error(`[fde-sim] response echoed prompt text (attempt ${attempt})`);
                failures.push("leak");
                return null;
            }
            if (!isSimPayload(parsed)) {
                console.error(`[fde-sim] response failed shape check (attempt ${attempt}, ${raw.length} chars)`);
                failures.push("shape");
                return null;
            }
            return normalizeCoords(parsed);
        } catch (err) {
            const detail = err instanceof Error ? err.message : String(err);
            const failure: SimFailure = detail === "unparseable" ? "unparseable" : isTimeout(err) ? "timeout" : "network";
            console.error(`[fde-sim] attempt ${attempt} failed (${failure}): ${detail}`);
            failures.push(failure);
            return null;
        }
    }

    if (wantsStream) {
        const startedAt = Date.now();
        let firstSectionAt = 0;

        return sseResponse(async (send) => {
            let emitted = 0;
            let result: Awaited<ReturnType<typeof streamGenerate>> = {
                payload: null,
                promptTokens: 0,
                outputTokens: 0,
            };

            // The same two attempts the buffered path gets, with one extra
            // condition. A retry is only safe while nothing has reached the
            // browser: once a section has been sent the client has merged it
            // into its payload, and a second run would interleave sections from
            // two different answers (ADR 0013).
            for (let attempt = 1; attempt <= 2; attempt++) {
                result = await streamGenerate(
                    apiKey,
                    brief,
                    (key, value) => {
                        emitted++;
                        if (!firstSectionAt) firstSectionAt = Date.now();
                        send({ type: "section", key, value });
                    },
                    failures,
                    attemptSignal(),
                );
                // Counted across attempts: a retry costs tokens the visitor paid
                // for, and reporting only the last call would undercount them.
                promptTokens += result.promptTokens;
                outputTokens += result.outputTokens;
                if (result.payload || emitted || attempt === 2 || !shouldRetry()) break;
                console.error(`[fde-sim] stream attempt ${attempt} produced nothing; retrying`);
            }

            const latencyMs = Date.now() - startedAt;
            const ttfsMs = firstSectionAt ? firstSectionAt - startedAt : undefined;

            if (!result.payload) {
                send({ type: "error", error: failureCode(failures) });
                await recordSim(getRedis(), {
                    outcome: "gave_up",
                    failures,
                    latencyMs,
                    ttfsMs,
                    promptTokens,
                    outputTokens,
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
                promptTokens,
                outputTokens,
            });
        }, "miss");
    }

    // Retry once: the model occasionally returns unparseable JSON; a second pass
    // almost always succeeds before we give up with a 502.

    let payload: SimPayload | null = null;
    // Measured across every attempt, because a retry is latency the visitor
    // waited through. Timing only the successful call would report the fast half.
    const startedAt = Date.now();
    for (let attempt = 1; attempt <= 2 && !payload; attempt++) {
        if (attempt === 2 && !shouldRetry()) break;
        payload = await generate(attempt);
    }
    const latencyMs = Date.now() - startedAt;

    if (!payload) {
        console.error(`[fde-sim] giving up (brief ${brief.length} chars, failures ${failures.join(",")})`);
        await defer(() => recordSim(getRedis(), { outcome: "gave_up", failures, latencyMs, promptTokens, outputTokens }));
        return NextResponse.json({ error: failureCode(failures) }, { status: 502 });
    }

    const answer = payload;
    await defer(async () => {
        await writeCache(key, answer);
        await recordSim(getRedis(), { outcome: "ok", failures, latencyMs, promptTokens, outputTokens });
    });
    return NextResponse.json(payload, { headers: { "x-sim-cache": "miss" } });
}

/**
 * Operational counters for this route. Aggregates only: no briefs, no IPs, no
 * keys, nothing about an individual visitor. Public on purpose, on a site whose
 * own copy says it publishes load-bearing numbers rather than vanity ones, and
 * because a counter nobody can read is not observability. Returns 503 when no
 * store is configured (also the local-dev answer) or when the store fails.
 */
export async function GET() {
    let metrics: Awaited<ReturnType<typeof readSimMetrics>>;
    try {
        metrics = await readSimMetrics(getRedis());
    } catch (err) {
        console.error("[fde-sim] metrics read failed:", err instanceof Error ? err.message : err);
        return NextResponse.json({ error: "store-unavailable" }, { status: 503 });
    }
    if (!metrics) {
        return NextResponse.json({ error: "no-store" }, { status: 503 });
    }
    // Ten seconds, and both directions were wrong first. At 60 the CDN served a
    // minute-old body, which is exactly the wrong answer when the question is
    // "did the call I just made get counted": it cost a debugging session that
    // concluded the writes were broken when they were not. At 0, an
    // unauthenticated GET doing five Redis reads has nothing bounding how often
    // it can be asked. Ten is fresh enough to answer that question and caps the
    // read rate at six a minute per region.
    return NextResponse.json(metrics, {
        headers: { "cache-control": "public, max-age=10" },
    });
}
