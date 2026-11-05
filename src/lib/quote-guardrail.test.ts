import { describe, expect, it } from "vitest";
import { quoteSupported } from "./quote-guardrail";

const pages = { 1: "Impression:  Acute\n gastroenteritis.", 2: "Scan suggestive of pyelonephritis." };

describe("quoteSupported", () => {
  it("accepts a quote on the cited page, ignoring case and spacing", () => {
    expect(quoteSupported(pages, 1, "acute GASTROENTERITIS").ok).toBe(true);
  });

  it("refuses a real quote cited to the wrong page", () => {
    expect(quoteSupported(pages, 1, "suggestive of pyelonephritis")).toEqual({
      ok: false,
      reason: "quote not found verbatim on page 1",
    });
  });

  it("refuses a stronger claim than the page makes", () => {
    expect(quoteSupported(pages, 2, "confirmed pyelonephritis").ok).toBe(false);
  });

  it("refuses a quote too short to check, and a page that does not exist", () => {
    expect(quoteSupported(pages, 1, "gas").reason).toMatch(/too short/);
    expect(quoteSupported(pages, 9, "acute").reason).toBe("page 9 is not in the record");
  });
});
