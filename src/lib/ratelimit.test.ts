import { describe, it, expect, vi, afterEach } from "vitest";
import { dailyBudget, rateLimit } from "./ratelimit";

function fakeRedis(opts: { ttl?: number; throwOnIncr?: boolean } = {}) {
    const counts = new Map<string, number>();
    const expires: { key: string; seconds: number }[] = [];
    return {
        expires,
        counts,
        async incr(key: string) {
            if (opts.throwOnIncr) throw new Error("store down");
            const next = (counts.get(key) ?? 0) + 1;
            counts.set(key, next);
            return next;
        },
        async expire(key: string, seconds: number) {
            expires.push({ key, seconds });
            return 1;
        },
        async ttl() {
            return opts.ttl ?? 42;
        },
    };
}

describe("rateLimit", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("returns ok on the first call and sets the expiry exactly once", async () => {
        const redis = fakeRedis();
        const result = await rateLimit(redis, "test", "1.2.3.4");
        expect(result).toBe("ok");
        expect(redis.expires).toEqual([{ key: "ratelimit:test:1.2.3.4", seconds: 60 }]);
    });

    it("allows calls 2 through 8 (limit 8) without adding another expire", async () => {
        const redis = fakeRedis();
        for (let i = 0; i < 8; i++) {
            const result = await rateLimit(redis, "test", "1.2.3.4");
            expect(result).toBe("ok");
        }
        expect(redis.expires).toHaveLength(1);
    });

    it("returns limited on the 9th call", async () => {
        const redis = fakeRedis();
        for (let i = 0; i < 8; i++) {
            await rateLimit(redis, "test", "1.2.3.4");
        }
        const result = await rateLimit(redis, "test", "1.2.3.4");
        expect(result).toBe("limited");
    });

    it("repairs a stranded key (ttl -1) over the limit: returns ok, re-expires, and logs", async () => {
        const redis = fakeRedis({ ttl: -1 });
        for (let i = 0; i < 8; i++) {
            await rateLimit(redis, "test", "1.2.3.4");
        }
        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        const result = await rateLimit(redis, "test", "1.2.3.4");
        expect(result).toBe("ok");
        expect(redis.expires).toHaveLength(2);
        expect(errorSpy).toHaveBeenCalled();
    });

    it("returns unavailable and logs when incr throws", async () => {
        const redis = fakeRedis({ throwOnIncr: true });
        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        const result = await rateLimit(redis, "test", "1.2.3.4");
        expect(result).toBe("unavailable");
        expect(errorSpy).toHaveBeenCalled();
    });

    it("returns unavailable without logging when redis is null", async () => {
        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
        const result = await rateLimit(null, "test", "1.2.3.4");
        expect(result).toBe("unavailable");
        expect(errorSpy).not.toHaveBeenCalled();
    });

    it("honours a custom limit and windowSeconds", async () => {
        const redis = fakeRedis();
        await rateLimit(redis, "test", "1.2.3.4", { limit: 2, windowSeconds: 10 });
        await rateLimit(redis, "test", "1.2.3.4", { limit: 2, windowSeconds: 10 });
        const result = await rateLimit(redis, "test", "1.2.3.4", { limit: 2, windowSeconds: 10 });
        expect(result).toBe("limited");
        expect(redis.expires).toEqual([{ key: "ratelimit:test:1.2.3.4", seconds: 10 }]);
    });

    it("does not share a counter across different name or ip values", async () => {
        const redis = fakeRedis();
        for (let i = 0; i < 8; i++) {
            await rateLimit(redis, "test", "1.2.3.4");
        }
        const otherName = await rateLimit(redis, "other", "1.2.3.4");
        const otherIp = await rateLimit(redis, "test", "5.6.7.8");
        expect(otherName).toBe("ok");
        expect(otherIp).toBe("ok");
    });
});

describe("dailyBudget", () => {
    const counter = () => {
        const counts = new Map<string, number>();
        return {
            counts,
            incr: vi.fn(async (k: string) => {
                const n = (counts.get(k) ?? 0) + 1;
                counts.set(k, n);
                return n;
            }),
            expire: vi.fn(async () => 1),
        };
    };

    it("allows calls up to the limit, then reports the day as spent", async () => {
        const redis = counter();
        const day = new Date("2026-09-29T10:00:00Z");
        for (let i = 0; i < 3; i++) expect(await dailyBudget(redis, "t", 3, day)).toBe("ok");
        expect(await dailyBudget(redis, "t", 3, day)).toBe("exhausted");
        expect(redis.expire).toHaveBeenCalledOnce();
    });

    it("starts a fresh count on the next UTC day", async () => {
        const redis = counter();
        for (let i = 0; i < 4; i++) await dailyBudget(redis, "t", 3, new Date("2026-09-29T23:00:00Z"));
        expect(await dailyBudget(redis, "t", 3, new Date("2026-09-30T00:01:00Z"))).toBe("ok");
    });

    it("fails open without a store or when the store throws", async () => {
        expect(await dailyBudget(null, "t", 3)).toBe("unavailable");
        const broken = { incr: vi.fn().mockRejectedValue(new Error("down")), expire: vi.fn() };
        vi.spyOn(console, "error").mockImplementation(() => {});
        expect(await dailyBudget(broken, "t", 3)).toBe("unavailable");
    });
});
