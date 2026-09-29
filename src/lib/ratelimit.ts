/**
 * The one fixed-window limiter every API route uses. "unavailable" is kept
 * distinct from "ok" (rather than folding a missing or broken store into "ok")
 * so a caller can log or count it separately. Either way the caller must fail
 * open: treat "unavailable" exactly like "ok", never as a denial.
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

interface CounterLike {
    incr(key: string): Promise<number>;
    expire(key: string, seconds: number): Promise<unknown>;
}

/**
 * A ceiling on model calls per UTC day, across all visitors. The per-IP limit
 * above only slows one caller; this bounds the bill when many IPs arrive at
 * once. Counted only for calls that actually go to the model (cache hits are
 * free). Same fail-open rule: a missing or broken store never blocks a visitor.
 */
export async function dailyBudget(
    redis: CounterLike | null,
    name: string,
    limit: number,
    now: Date = new Date(),
): Promise<"ok" | "exhausted" | "unavailable"> {
    if (!redis) return "unavailable";
    const key = `budget:${name}:${now.toISOString().slice(0, 10)}`;
    try {
        const count = await redis.incr(key);
        // Two days, so a key never outlives its day by much even if the clock
        // and the TTL disagree near midnight.
        if (count === 1) await redis.expire(key, 60 * 60 * 48);
        return count > limit ? "exhausted" : "ok";
    } catch (err) {
        console.error(`[ratelimit] "${name}" budget store unavailable, failing open:`, err instanceof Error ? err.message : err);
        return "unavailable";
    }
}
