import { createHmac, randomBytes } from "node:crypto";

/**
 * The client IP the platform vouches for: x-real-ip, or the right-most (last
 * hop) x-forwarded-for value. The left-most x-forwarded-for entry is supplied
 * by the caller, so keying a rate limit or a dedup on it would let anyone mint
 * unlimited fresh identities. Routes use clientKey below, never the raw IP.
 */
export function clientIp(headers: Headers): string {
    return (
        headers.get("x-real-ip")?.trim() ||
        headers.get("x-forwarded-for")?.split(",").pop()?.trim() ||
        "anon"
    );
}

// Keyed so a leaked Redis dump can't be turned back into addresses by hashing
// every IPv4 address. Without the env var (local dev), a key made per process:
// dedup still works within one instance, and a raw IP is never stored.
const secret = process.env.IP_HASH_SECRET || randomBytes(32).toString("hex");
if (!process.env.IP_HASH_SECRET && process.env.VERCEL_ENV === "production") {
    console.error("[client-ip] IP_HASH_SECRET is not set; visitor keys reset with each instance");
}

/**
 * Who is calling, for rate limits and view dedup: a keyed hash of clientIp,
 * so Redis holds no IP addresses. Every API route identifies callers through here.
 */
export function clientKey(headers: Headers): string {
    return createHmac("sha256", secret).update(clientIp(headers)).digest("base64url").slice(0, 22);
}
