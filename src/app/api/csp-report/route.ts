import { NextRequest } from "next/server";

// Receives the report-only CSP's violation reports (next.config.ts) and writes
// one line per violation to the function logs. That log is what "reports are
// clean" means before the policy is enforced.

const MAX_BYTES = 16_384;
const MAX_REPORTS = 10;

type Violation = { directive: string; blocked: string; page: string };

// Control characters are flattened so a report cannot write extra log lines.
const str = (v: unknown) =>
  typeof v === "string" ? v.replace(/[\x00-\x1f\x7f]/g, " ").slice(0, 200) : "";

/** Both wire formats: report-uri sends one {"csp-report": {...}}, report-to
 * sends an array of {type, body: {...}}. */
function parseViolations(data: unknown): Violation[] {
  if (Array.isArray(data)) {
    return data
      .filter((r) => r?.type === "csp-violation" && r.body)
      .slice(0, MAX_REPORTS)
      .map((r) => ({
        directive: str(r.body.effectiveDirective),
        blocked: str(r.body.blockedURL),
        page: str(r.body.documentURL ?? r.url),
      }));
  }
  const r = (data as { "csp-report"?: Record<string, unknown> } | null)?.["csp-report"];
  if (!r) return [];
  return [
    {
      directive: str(r["effective-directive"] ?? r["violated-directive"]),
      blocked: str(r["blocked-uri"]),
      page: str(r["document-uri"]),
    },
  ];
}

/** The body as text, or null past MAX_BYTES. Read in chunks, so a chunked
 * upload with no Content-Length is cut off at the cap, not buffered whole. */
async function readCapped(request: NextRequest): Promise<string | null> {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BYTES) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return new TextDecoder().decode(Buffer.concat(chunks));
}

export async function POST(request: NextRequest) {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BYTES) return new Response(null, { status: 413 });

  let data: unknown;
  try {
    const text = await readCapped(request);
    if (text === null) return new Response(null, { status: 413 });
    data = JSON.parse(text);
  } catch {
    return new Response(null, { status: 400 });
  }

  for (const v of parseViolations(data)) {
    console.warn(`[csp] ${v.directive} blocked ${v.blocked || "(inline)"} on ${v.page}`);
  }
  return new Response(null, { status: 204 });
}
