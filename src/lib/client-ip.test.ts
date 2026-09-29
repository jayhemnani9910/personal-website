import { describe, expect, it } from "vitest";
import { clientIp } from "./client-ip";

describe("clientIp", () => {
    it("prefers the platform-set x-real-ip", () => {
        expect(clientIp(new Headers({ "x-real-ip": "9.9.9.9", "x-forwarded-for": "1.1.1.1" }))).toBe("9.9.9.9");
    });

    it("ignores a spoofed left-most x-forwarded-for and takes the last hop", () => {
        expect(clientIp(new Headers({ "x-forwarded-for": "6.6.6.6, 10.0.0.1, 203.0.113.7" }))).toBe("203.0.113.7");
    });

    it("falls back to a shared bucket when no header is present", () => {
        expect(clientIp(new Headers())).toBe("anon");
    });
});
