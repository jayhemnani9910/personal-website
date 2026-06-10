import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/kv";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are Jay Hemnani, an engineer auditioning for Forward Deployed Engineer (FDE) roles at AI labs (OpenAI, Anthropic, Palantir). A potential customer or recruiter has given you an ambiguous problem statement. You will perform the famous FDE "decomposition" interview live, but on their real problem.

Your output MUST be valid JSON matching this exact shape:

{
  "scope": [ { "q": "a sharp clarifying question (one sentence)", "why": "a one-sentence justification for asking it" }, ... exactly 3 entries ... ],
  "decomposition": [ { "id": "D1", "title": "short subproblem title", "why": "one-sentence justification of why this exists as its own piece" }, ... 4 to 6 entries ... ],
  "architecture": { "components": [ { "id": "short_id", "name": "Component name", "kind": "ui" | "service" | "agent" | "data" | "external", "col": 0..3, "row": 0..2, "sub": "one-line caption" }, ... 6 to 10 entries ... ], "edges": [ { "from": "id", "to": "id", "label": "short edge label", "dashed": true | false }, ... 6 to 14 entries ... ] },
  "sprint": [ { "day": "Day 1-2", "title": "what we're building", "deliv": "concrete deliverable, measurable" }, ... 5 to 7 entries, totaling 14 days ... ],
  "risks": [ { "risk": "a specific concrete risk, not generic", "mitigation": "the actual mitigation plan, also concrete" }, ... 4 entries ... ]
}

STYLE RULES:
- Speak as Jay would: direct, no hype, no fluff, candid about uncertainty.
- Questions in "scope" must be HARD questions that surface what the customer hasn't thought through. Not "what's your budget."
- "decomposition" must be the actual sub-problems, named like real engineers name things.
- "architecture" components must use distinct ids. Place them with col (0=left, 3=right) and row (0=top, 2=bottom) so they form a readable left-to-right flow. The "kind" must be one of: ui, service, agent, data, external.
- "sprint" must cover ~14 days end-to-end. Each row's deliv must be something a human could observe was done.
- "risks" must be specific to THIS problem, not "AI might be inaccurate."

CRITICAL: Output ONLY the JSON object. No prose before or after. No markdown fences. Just the JSON.`;

// Constrains Gemini's JSON output to the shape the route expects, which makes the
// occasional unparseable response far rarer. Mirrors SimPayload loosely (kept
// permissive on enums so the model is not over-constrained).
const SIM_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    scope: {
      type: "array",
      items: {
        type: "object",
        properties: { q: { type: "string" }, why: { type: "string" } },
        required: ["q", "why"],
      },
    },
    decomposition: {
      type: "array",
      items: {
        type: "object",
        properties: { id: { type: "string" }, title: { type: "string" }, why: { type: "string" } },
        required: ["id", "title", "why"],
      },
    },
    architecture: {
      type: "object",
      properties: {
        components: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              kind: { type: "string" },
              col: { type: "integer" },
              row: { type: "integer" },
              sub: { type: "string" },
            },
            required: ["id", "name", "kind", "sub"],
          },
        },
        edges: {
          type: "array",
          items: {
            type: "object",
            properties: {
              from: { type: "string" },
              to: { type: "string" },
              label: { type: "string" },
              dashed: { type: "boolean" },
            },
            required: ["from", "to", "label"],
          },
        },
      },
      required: ["components", "edges"],
    },
    sprint: {
      type: "array",
      items: {
        type: "object",
        properties: { day: { type: "string" }, title: { type: "string" }, deliv: { type: "string" } },
        required: ["day", "title", "deliv"],
      },
    },
    risks: {
      type: "array",
      items: {
        type: "object",
        properties: { risk: { type: "string" }, mitigation: { type: "string" } },
        required: ["risk", "mitigation"],
      },
    },
  },
  required: ["scope", "decomposition", "architecture", "sprint", "risks"],
};

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

function normalizeCoords(payload: SimPayload): SimPayload {
    payload.architecture.components = payload.architecture.components.map(
        (c: ArchComponent) => ({
            ...c,
            x: 60 + (c.col ?? 0) * 220,
            y: 50 + (c.row ?? 0) * 140,
        })
    );
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
    } catch {
        return false; // fail open on store errors
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

    // Best-effort per-IP rate limit (requires KV; skipped when unconfigured).
    // Trust the platform-set client IP: x-real-ip, or the right-most (last hop)
    // x-forwarded-for value. The left-most value is client-supplied and spoofable,
    // so using it would let an attacker rotate fake IPs to bypass the limit.
    const ip =
        request.headers.get("x-real-ip")?.trim() ||
        request.headers.get("x-forwarded-for")?.split(",").pop()?.trim() ||
        "anon";
    if (await isRateLimited(ip)) {
        return NextResponse.json({ error: "rate-limited" }, { status: 429 });
    }

    // Check for API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: "no-runtime" }, { status: 503 });
    }

    const fullPrompt =
        SYSTEM_PROMPT + "\n\nCUSTOMER BRIEF:\n" + brief + "\n\nReturn the JSON now.";

    const geminiUrl =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    // One call attempt: returns a normalized payload, or null on any failure
    // (non-200, empty body, unparseable text, or wrong shape).
    async function generate(): Promise<SimPayload | null> {
        try {
            const res = await fetch(geminiUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey! },
                body: JSON.stringify({
                    contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                        responseMimeType: "application/json",
                        responseSchema: SIM_RESPONSE_SCHEMA,
                    },
                }),
            });
            if (!res.ok) return null;
            const data = await res.json();
            const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
            const parsed = extractJson(raw);
            return isSimPayload(parsed) ? normalizeCoords(parsed) : null;
        } catch {
            return null;
        }
    }

    // Retry once: the model occasionally returns unparseable JSON; a second pass
    // almost always succeeds before we give up with a 502.
    let payload: SimPayload | null = null;
    for (let attempt = 0; attempt < 2 && !payload; attempt++) {
        payload = await generate();
    }

    if (!payload) {
        return NextResponse.json({ error: "parse" }, { status: 502 });
    }

    return NextResponse.json(payload);
}
