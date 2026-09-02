/**
 * "unavailable" is kept distinct from "ok" (rather than folding a missing or
 * broken store into "ok", the way fde-sim's boolean does) so a caller can log
 * or count it separately. Either way the caller must fail open: treat
 * "unavailable" exactly like "ok", never as a denial.
 */
export type RateLimitResult = "ok" | "limited" | "unavailable";

interface RedisLike {
    incr(key: string): Promise<number>;
    expire(key: string, seconds: number): Promise<unknown>;
    ttl(key: string): Promise<number>;
}

export async function rateLimit(
    redis: RedisLike | null,
    name: string,
    ip: string,
    opts?: { limit?: number; windowSeconds?: number },
): Promise<RateLimitResult> {
    // A missing store is a configuration state, not an anomaly (local dev has
    // no Redis at all), so this does not log. The catch branch below is the
    // one that logs, because that path only fires on a genuine failure.
    if (!redis) return "unavailable";

    const limit = opts?.limit ?? 8;
    const windowSeconds = opts?.windowSeconds ?? 60;
    const key = `ratelimit:${name}:${ip}`;

    try {
        const count = await redis.incr(key);
        if (count === 1) {
            await redis.expire(key, windowSeconds);
            return "ok";
        }
        if (count > limit) {
            // Only the first hit of a window sets the TTL, so an `expire` that
            // failed back then leaves a key that counts up forever and never
            // resets. A missing TTL (-1) means the key is stranded: repair it
            // and let this request through instead of enforcing a window that
            // has no end.
            const ttl = await redis.ttl(key);
            if (ttl < 0) {
                await redis.expire(key, windowSeconds);
                console.error(`[ratelimit] "${name}" key had no TTL; window repaired`);
                return "ok";
            }
            return "limited";
        }
        return "ok";
    } catch (err) {
        // Fail open: a store outage must not take the feature down.
        console.error(`[ratelimit] "${name}" store unavailable, failing open:`, err instanceof Error ? err.message : err);
        return "unavailable";
    }
}
