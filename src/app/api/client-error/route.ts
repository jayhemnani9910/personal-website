import { NextRequest } from "next/server";
import { getRedis } from "@/lib/kv";
import { clientKey } from "@/lib/client-ip";
import { rateLimit } from "@/lib/ratelimit";
import { OPS_ERRORS, clean, keep } from "@/lib/ops-log";

// error.tsx sends what broke here, so a crash in a visitor's browser reaches
// someone who can fix it. Kept in a capped Redis list, read with `npm run ops`.

const MAX_BYTES = 4_096;

export async function POST(request: NextRequest) {
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BYTES) return new Response(null, { status: 413 });

  let body: Record<string, unknown>;
  try {
    const text = await request.text();
    if (text.length > MAX_BYTES) return new Response(null, { status: 413 });
    body = JSON.parse(text);
  } catch {
    return new Response(null, { status: 400 });
  }

  const entry = {
    message: clean(body?.message, 300),
    digest: clean(body?.digest, 40),
    page: clean(body?.page),
    at: Date.now(),
  };
  if (!entry.message && !entry.digest) return new Response(null, { status: 400 });
  console.error(`[client-error] ${entry.message || "(no message)"} on ${entry.page} digest=${entry.digest}`);

  // A page that crashes in a loop reports in a loop. Five a minute per visitor
  // shows the crash without letting one tab fill the list.
  const redis = getRedis();
  if (redis && (await rateLimit(redis, "client-error", clientKey(request.headers), { limit: 5, windowSeconds: 60 })) !== "limited") {
    await keep(redis, OPS_ERRORS, [entry]);
  }
  return new Response(null, { status: 204 });
}
