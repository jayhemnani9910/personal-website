import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";

// The security headers live in one array in next.config.ts. A typo or a lost
// line there drops a header from every response without failing anything else.
describe("security headers", () => {
  it("sends the full set on every path", async () => {
    const rules = (await nextConfig.headers?.()) ?? [];
    const all = rules.find((r) => r.source === "/:path*");
    const byKey = Object.fromEntries((all?.headers ?? []).map((h) => [h.key, h.value]));
    expect(byKey["X-Frame-Options"]).toBe("DENY");
    expect(byKey["X-Content-Type-Options"]).toBe("nosniff");
    expect(byKey["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(byKey["Strict-Transport-Security"]).toMatch(/max-age=\d{8,}/);
    expect(byKey["Permissions-Policy"]).toContain("camera=()");
    expect(byKey["Content-Security-Policy-Report-Only"]).toContain("frame-ancestors 'none'");
    expect(byKey["Reporting-Endpoints"]).toContain("/api/csp-report");
  });
});
