import { describe, expect, it } from "vitest";
import { MERGED_PRS } from "@/data/home";
import { CARD_PRS, cardPrs, getOssRepos, ossSlug } from "./oss";

const words = (s: string) => s.trim().split(/\s+/).length;

describe("content/oss", () => {
  it("tells the story of exactly the pull requests MERGED_PRS lists", () => {
    const told = getOssRepos().flatMap((r) => r.prs.map((pr) => pr.href));
    expect(new Set(told).size).toBe(told.length);
    expect(told.toSorted()).toEqual(MERGED_PRS.map((pr) => pr.href).toSorted());
  });

  it("shows three picks on the card of a repo with more than three, and all of a smaller one", () => {
    for (const repo of getOssRepos()) {
      const shown = cardPrs(repo);
      expect(shown.length, repo.repo).toBe(Math.min(repo.prs.length, CARD_PRS));
      if (repo.prs.length <= CARD_PRS) expect(repo.prs.some((pr) => pr.top), repo.repo).toBe(false);
    }
  });

  // The write-ups are for someone who does not code. These are the checks a
  // script can make; the rest is reading them.
  it("keeps every write-up short and free of code", () => {
    for (const repo of getOssRepos()) {
      expect(words(repo.about), `${repo.repo} about`).toBeLessThanOrEqual(25);
      for (const pr of repo.prs) {
        const where = `${repo.repo} #${pr.number}`;
        expect(pr.title.length, `${where} title`).toBeLessThanOrEqual(70);
        for (const text of [pr.title, pr.broken, pr.changed, pr.matters]) {
          expect(text, where).not.toMatch(/[`{}<>]|\w+\(\)|\w+\.(ts|js|go|zig|py|rs|mojo)\b/);
        }
        for (const part of [pr.broken, pr.changed, pr.matters]) {
          expect(words(part), where).toBeLessThanOrEqual(40);
        }
      }
    }
  });

  it("names each repo's page after the repo", () => {
    expect(ossSlug("lightpanda-io/browser")).toBe("lightpanda-io-browser");
    expect(ossSlug("Effect-TS/effect")).toBe("effect-ts-effect");
    expect(ossSlug("modelcontextprotocol/python-sdk")).toBe("modelcontextprotocol-python-sdk");
  });
});
