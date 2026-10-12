import { describe, expect, it } from "vitest";
import { clientIp, clientKey } from "./client-ip";

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

describe("clientKey", () => {
    const from = (ip: string) => clientKey(new Headers({ "x-real-ip": ip }));

    it("never contains the address", () => {
        expect(from("203.0.113.7")).not.toContain("203.0.113");
        expect(from("2001:db8::1")).not.toContain("2001");
    });

    it("is the same for one caller and different across callers", () => {
        expect(from("203.0.113.7")).toBe(from("203.0.113.7"));
        expect(from("203.0.113.7")).not.toBe(from("203.0.113.8"));
    });

    it("follows the same header rules as clientIp", () => {
        const spoofed = clientKey(new Headers({ "x-forwarded-for": "6.6.6.6, 203.0.113.7" }));
        expect(spoofed).toBe(from("203.0.113.7"));
    });
});
