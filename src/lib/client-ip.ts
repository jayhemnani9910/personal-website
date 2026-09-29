/**
 * The client IP the platform vouches for: x-real-ip, or the right-most (last
 * hop) x-forwarded-for value. The left-most x-forwarded-for entry is supplied
 * by the caller, so keying a rate limit or a dedup on it would let anyone mint
 * unlimited fresh identities. Every API route reads the IP through here.
 */
export function clientIp(headers: Headers): string {
    return (
        headers.get("x-real-ip")?.trim() ||
        headers.get("x-forwarded-for")?.split(",").pop()?.trim() ||
        "anon"
    );
}
