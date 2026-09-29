import { NextRequest } from "next/server";

// Receives the report-only CSP's violation reports (next.config.ts) and writes
// one line per violation to the function logs. That log is what "reports are
// clean" means before the policy is enforced.

const MAX_BYTES = 16_384;
const MAX_REPORTS = 10;

type Violation = { directive: string; blocked: string; page: string };

const str = (v: unknown) => (typeof v === "string" ? v.slice(0, 200) : "");

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

export async function POST(request: NextRequest) {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BYTES) return new Response(null, { status: 413 });

  let data: unknown;
  try {
    const text = await request.text();
    if (text.length > MAX_BYTES) return new Response(null, { status: 413 });
    data = JSON.parse(text);
  } catch {
    return new Response(null, { status: 400 });
  }

  for (const v of parseViolations(data)) {
    console.warn(`[csp] ${v.directive} blocked ${v.blocked || "(inline)"} on ${v.page}`);
  }
  return new Response(null, { status: 204 });
}
