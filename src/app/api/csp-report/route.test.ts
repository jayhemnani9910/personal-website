import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

const post = (body: string, headers: Record<string, string> = {}) =>
  POST(new NextRequest("http://localhost/api/csp-report", { method: "POST", body, headers }));

describe("/api/csp-report", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  afterEach(() => warn.mockClear());

  it("logs a report-uri report", async () => {
    const res = await post(
      JSON.stringify({
        "csp-report": {
          "document-uri": "https://jayhemnani.in/",
          "effective-directive": "script-src-elem",
          "blocked-uri": "https://evil.example/x.js",
        },
      }),
    );
    expect(res.status).toBe(204);
    expect(warn).toHaveBeenCalledWith("[csp] script-src-elem blocked https://evil.example/x.js on https://jayhemnani.in/");
  });

  it("logs each report-to violation and ignores other report types", async () => {
    const res = await post(
      JSON.stringify([
        { type: "csp-violation", url: "https://jayhemnani.in/fde", body: { effectiveDirective: "img-src", blockedURL: "https://a.example/i.png" } },
        { type: "deprecation", body: { id: "x" } },
        { type: "csp-violation", body: { effectiveDirective: "style-src-attr", blockedURL: "", documentURL: "https://jayhemnani.in/lab" } },
      ]),
    );
    expect(res.status).toBe(204);
    expect(warn.mock.calls.map((c) => c[0])).toEqual([
      "[csp] img-src blocked https://a.example/i.png on https://jayhemnani.in/fde",
      "[csp] style-src-attr blocked (inline) on https://jayhemnani.in/lab",
    ]);
  });

  it("rejects bodies that are not JSON or are too large", async () => {
    expect((await post("not json")).status).toBe(400);
    expect((await post("x".repeat(20_000))).status).toBe(413);
    expect((await post("{}", { "content-length": "999999" })).status).toBe(413);
    expect(warn).not.toHaveBeenCalled();
  });
});
