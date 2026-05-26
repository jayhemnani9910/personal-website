import { NextRequest, NextResponse } from "next/server";

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

    // Check for API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: "no-runtime" }, { status: 503 });
    }

    const fullPrompt =
        SYSTEM_PROMPT + "\n\nCUSTOMER BRIEF:\n" + brief + "\n\nReturn the JSON now.";

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    let raw: string;
    try {
        const res = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    responseMimeType: "application/json",
                },
            }),
        });

        if (!res.ok) {
            return NextResponse.json({ error: "parse" }, { status: 502 });
        }

        const data = await res.json();
        raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    } catch {
        return NextResponse.json({ error: "parse" }, { status: 502 });
    }

    let payload: SimPayload;
    try {
        payload = extractJson(raw);
    } catch {
        return NextResponse.json({ error: "parse" }, { status: 502 });
    }

    payload = normalizeCoords(payload);

    return NextResponse.json(payload);
}
