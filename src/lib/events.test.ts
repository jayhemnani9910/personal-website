import { describe, expect, it } from "vitest";
import { EVENT_NAMES, eventForHref, eventsKey, isEventName } from "./events";

describe("eventForHref", () => {
  it("names each résumé variant, and nothing for an unknown one", () => {
    expect(eventForHref("/resume/jay-hemnani-fde.pdf")).toBe("resume:fde");
    expect(eventForHref("https://jayhemnani.in/resume/jay-hemnani-analyst.pdf")).toBe("resume:analyst");
    expect(eventForHref("/resume/jay-hemnani-ceo.pdf")).toBeNull();
    expect(eventForHref("/resume")).toBeNull();
  });

  it("tells a pull request apart from the rest of GitHub", () => {
    expect(eventForHref("https://github.com/vllm-project/vllm/pull/31513")).toBe("out:pr");
    expect(eventForHref("https://github.com/jayhemnani9910")).toBe("out:github");
    expect(eventForHref("https://www.linkedin.com/in/someone")).toBe("out:linkedin");
    expect(eventForHref("https://youtu.be/abc")).toBe("out:youtube");
    expect(eventForHref("mailto:someone@example.com")).toBe("email:mailto");
  });

  it("ignores internal pages and other sites", () => {
    expect(eventForHref("/projects/voxt")).toBeNull();
    expect(eventForHref("https://vercel.com/docs")).toBeNull();
    expect(eventForHref("#main-content")).toBeNull();
  });

  it("only ever returns names the API accepts", () => {
    for (const href of ["/resume/jay-hemnani-swe.pdf", "https://github.com/x/y/pull/1", "mailto:a@b.c"]) {
      expect(isEventName(eventForHref(href))).toBe(true);
    }
    expect(EVENT_NAMES).toContain("email:copy");
  });
});

describe("eventsKey", () => {
  it("is one key per UTC day", () => {
    expect(eventsKey(new Date("2026-10-20T23:59:00Z"))).toBe("events:2026-10-20");
  });
});
