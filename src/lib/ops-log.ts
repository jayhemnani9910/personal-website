// Function logs on Vercel are kept for a short while, so a CSP report or a
// crash logged there is gone before anyone looks. These capped Redis lists keep
// the latest of each until `npm run ops` reads them.

export const OPS_CSP = "ops:csp";
export const OPS_ERRORS = "ops:errors";
export const OPS_KEPT = 200;

interface ListStore {
  lpush(key: string, ...values: unknown[]): Promise<number>;
  ltrim(key: string, start: number, stop: number): Promise<unknown>;
}

/** Newest first, never more than OPS_KEPT. A store failure is logged, not thrown. */
export async function keep(redis: ListStore, key: string, entries: object[]) {
  if (!entries.length) return;
  try {
    await redis.lpush(key, ...entries);
    await redis.ltrim(key, 0, OPS_KEPT - 1);
  } catch (err) {
    console.error(`[ops] could not keep ${key}:`, err instanceof Error ? err.message : err);
  }
}

/** Strip control characters and cap the length, so a stored line stays one line. */
export const clean = (v: unknown, max = 200) =>
  typeof v === "string" ? v.replace(/[\x00-\x1f\x7f]/g, " ").slice(0, max) : "";
