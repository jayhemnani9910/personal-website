import { NextRequest } from "next/server";
import { getRedis } from "@/lib/kv";
import { clientKey } from "@/lib/client-ip";
import { rateLimit } from "@/lib/ratelimit";
import { OPS_CSP, clean, keep } from "@/lib/ops-log";

// Receives the report-only CSP's violation reports (next.config.ts), writes one
// line per violation to the function logs and keeps the latest in Redis
// (ops-log.ts), because the logs are gone long before anyone reads them. Two
// clean weeks in `npm run ops` is what "reports are clean" means before the
// policy is enforced.

const MAX_BYTES = 16_384;
const MAX_REPORTS = 10;

type Violation = { directive: string; blocked: string; page: string };

/** Both wire formats: report-uri sends one {"csp-report": {...}}, report-to
 * sends an array of {type, body: {...}}. */
function parseViolations(data: unknown): Violation[] {
  if (Array.isArray(data)) {
    return data
      .filter((r) => r?.type === "csp-violation" && r.body)
      .slice(0, MAX_REPORTS)
      .map((r) => ({
        directive: clean(r.body.effectiveDirective),
        blocked: clean(r.body.blockedURL),
        page: clean(r.body.documentURL ?? r.url),
      }));
  }
  const r = (data as { "csp-report"?: Record<string, unknown> } | null)?.["csp-report"];
  if (!r) return [];
  return [
    {
      directive: clean(r["effective-directive"] ?? r["violated-directive"]),
      blocked: clean(r["blocked-uri"]),
      page: clean(r["document-uri"]),
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

  const violations = parseViolations(data);
  for (const v of violations) {
    console.warn(`[csp] ${v.directive} blocked ${v.blocked || "(inline)"} on ${v.page}`);
  }

  // One browser can send a burst for one bad page; twenty a minute per visitor
  // is enough to see it and too few to flood the list.
  const redis = getRedis();
  if (redis && violations.length) {
    if ((await rateLimit(redis, "csp", clientKey(request.headers), { limit: 20, windowSeconds: 60 })) !== "limited") {
      const at = Date.now();
      await keep(redis, OPS_CSP, violations.map((v) => ({ ...v, at })));
    }
  }
  return new Response(null, { status: 204 });
}
