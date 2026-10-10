import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  FEATURED,
  buildReceipts,
  HOUSE_RULES,
  DAILY_FACTS,
  CUBE_PB,
  LOG_NOTES,
  buildDeskStats,
  buildLogEntries,
  MERGED_PRS,
  MERGED_PRS_SEARCH,
  MERGED_PRS_SEARCH_LABEL,
} from "./home";
import { RESUME, CUBE_ACHIEVEMENT, companyAnchor, parsePublishedVsReproduced } from "./resume";

const PROJECTS_DIR = join(process.cwd(), "content/projects");
const RECEIPTS = buildReceipts({ projectCount: 41, toolCount: 13 });

const ALL_TEXT = JSON.stringify({
  FEATURED,
  receipts: RECEIPTS,
  HOUSE_RULES,
  DAILY_FACTS,
  LOG_NOTES,
  stats: buildDeskStats({ projectCount: 27 }),
});

// The AI ban-words this task's brief named. (The full list lives in the
// global writing-style rules; this is the subset scoped to this check.)
const BAN_WORDS = [
  "thrilled",
  "seamlessly",
  "leverage(d)?",
  "utilize",
  "cutting-edge",
  "state-of-the-art",
  "robust",
  "passionate",
  "deeply",
  "genuinely",
  "truly",
  "delighted",
  "excited",
  "innovative",
  "transformative",
  "furthermore",
  "moreover",
  "additionally",
];
const BAN_WORD_RE = new RegExp(`\\b(${BAN_WORDS.join("|")})\\b`, "i");

const ALLOWED_INTERNAL_PREFIXES = ["/projects", "/blog", "/resume", "/fde", "/youtube", "/lab"];
function isAllowedHref(href: string): boolean {
  if (href.startsWith("https://")) return true;
  return ALLOWED_INTERNAL_PREFIXES.some((p) => href === p || href.startsWith(`${p}/`) || href.startsWith(`${p}#`));
}

describe("home data", () => {
  it("every FEATURED id has a project file", () => {
    for (const p of FEATURED) {
      expect(existsSync(join(PROJECTS_DIR, `${p.id}.mdx`))).toBe(true);
    }
  });

  it("FEATURED is numbered 01 through 06 in order", () => {
    expect(FEATURED.map((p) => p.num)).toEqual(["01", "02", "03", "04", "05", "06"]);
  });

  it("every receipt href is external or an allowed internal path", () => {
    for (const r of RECEIPTS) {
      for (const line of r.lines) {
        expect(isAllowedHref(line.href)).toBe(true);
      }
    }
  });

  it("wires the project and tool counts into the receipts, not literals", () => {
    expect(RECEIPTS).toHaveLength(6);
    expect(RECEIPTS[0].n).toBe("41");
    expect(RECEIPTS[RECEIPTS.length - 1].n).toBe("13");
  });

  it("every /resume# receipt href names a company row on /resume", () => {
    const anchors = new Set(RESUME.experience.map((c) => companyAnchor(c.name)));
    const hashes = RECEIPTS.flatMap((r) => r.lines.map((l) => l.href))
      .filter((href) => href.startsWith("/resume#"))
      .map((href) => href.slice("/resume#".length));
    expect(hashes).toContain("amnex");
    for (const h of hashes) expect(anchors.has(h)).toBe(true);
  });

  it("reads the paper receipt and the published gap from resume.ts", () => {
    const papers = RECEIPTS.find((r) => r.title.startsWith("IEEE"))!;
    expect(papers.n).toBe(String(RESUME.publications.length));
    expect(papers.lines.map((l) => l.text)).toEqual(RESUME.publications.map((p) => p.title));
    expect(papers.lines.map((l) => l.href)).toEqual(RESUME.publications.map((p) => p.link));

    const gap = RESUME.publications.map((p) => parsePublishedVsReproduced(p.description)).find(Boolean)!;
    expect(HOUSE_RULES[3].why).toContain(`${gap.published}% in the paper`);
    expect(HOUSE_RULES[3].why).toContain(`${gap.reproduced}% in the notebook`);
  });

  it("derives every stat from the content, not a literal", () => {
    const stats = buildDeskStats({ projectCount: 27 });
    expect(stats.map((s) => s.n)).toEqual([
      "27",
      String(MERGED_PRS.length),
      String(RESUME.publications.length),
      "94%",
      `${CUBE_PB}s`,
    ]);
    expect(CUBE_ACHIEVEMENT).toContain(`${CUBE_PB} sec`);
  });

  it("builds one log row per employer, newest first, each with a note", () => {
    const log = buildLogEntries();
    expect(log.map((e) => e.org)).toEqual(RESUME.experience.filter((o) => o.roles[0]?.period?.label).map((o) => o.name));
    for (const e of log) expect(e.what).not.toBe("");
  });

  it("searches only the listed repos, and says how many of them it finds", () => {
    const url = new URL(MERGED_PRS_SEARCH);
    expect(url.origin + url.pathname).toBe("https://github.com/search");
    expect(url.searchParams.get("type")).toBe("pullrequests");
    const q = url.searchParams.get("q")!;
    for (const pr of MERGED_PRS) expect(q).toContain(`repo:${pr.repo}`);
    // #6954, #6967 and #7235 landed through Copybara, so GitHub shows them
    // closed and the search cannot find them: the label must not claim them all.
    expect(MERGED_PRS_SEARCH_LABEL).toBe("46 of 49");
    expect(MERGED_PRS.find((pr) => pr.number === "#6954")?.landed).toMatch(/^https:\/\/github\.com\/modular\/modular\/commit\//);
  });

  it("LOG_NOTES keys match real employers, one note each way", () => {
    const employers = new Set(RESUME.experience.map((e) => e.name));
    const noteKeys = new Set(Object.keys(LOG_NOTES));
    for (const key of noteKeys) {
      expect(employers.has(key)).toBe(true);
    }
    for (const name of employers) {
      expect(noteKeys.has(name)).toBe(true);
    }
  });

  it("every internal /projects/ receipt href points at a real file", () => {
    const projectHrefs = RECEIPTS.flatMap((r) => r.lines.map((l) => l.href)).filter((href) => href.startsWith("/projects/"));
    expect(projectHrefs.length).toBeGreaterThan(0);
    for (const href of projectHrefs) {
      const slug = href.replace("/projects/", "");
      expect(existsSync(join(PROJECTS_DIR, `${slug}.mdx`))).toBe(true);
    }
  });

  it("has no em-dashes, en-dashes, ban-words, or SJSU mentions", () => {
    // Unicode escapes, not literal em/en dash characters, so this assertion
    // doesn't itself trip a dash sweep over the file.
    expect(ALL_TEXT).not.toMatch(/[\u2014\u2013]/);
    expect(ALL_TEXT).not.toMatch(BAN_WORD_RE);
    expect(ALL_TEXT).not.toMatch(/SJSU|San Jose/i);
  });

  it("has a fact for every day of the week", () => {
    expect(DAILY_FACTS.length).toBeGreaterThanOrEqual(7);
    expect(new Set(DAILY_FACTS).size).toBe(DAILY_FACTS.length);
  });
});
