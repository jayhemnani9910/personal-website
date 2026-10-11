import { describe, expect, it } from "vitest";
import { jsonLd } from "./json-ld";

// The JSON-LD goes into an inline <script> through dangerouslySetInnerHTML, so
// this escape is the only thing between a post title and the page's markup.
describe("jsonLd", () => {
  it("escapes every '<', so no string can close the script tag", () => {
    const out = jsonLd({ headline: "</script><script>alert(1)</script>", nested: { a: ["<!--"] } });
    expect(out).not.toContain("<");
    expect(out).toContain("\\u003c/script>");
  });

  it("still parses back to the same data", () => {
    const data = { headline: "a < b </script>", n: 1 };
    expect(JSON.parse(jsonLd(data))).toEqual(data);
  });
});
