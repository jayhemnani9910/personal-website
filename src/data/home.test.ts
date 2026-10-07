import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  FEATURED,
  PRESETS,
  buildReceipts,
  METHOD,
  LOG_NOTES,
  SECTIONS,
  HERO,
  ROLES,
  COPY,
  buildNav,
  MERGED_PRS,
  MERGED_PRS_SEARCH,
  MERGED_PRS_SEARCH_LABEL,
} from "./home";
import { RESUME, companyAnchor, parsePublishedVsReproduced } from "./resume";

const PROJECTS_DIR = join(process.cwd(), "content/projects");
const FEATURED_IDS = new Set(FEATURED.map((p) => p.id));
const RECEIPTS = buildReceipts({ projectCount: 41, toolCount: 13 });

const ALL_TEXT = JSON.stringify({
  FEATURED,
  PRESETS,
  receipts: RECEIPTS,
  METHOD,
  LOG_NOTES,
  SECTIONS,
  HERO,
  COPY: { ...COPY, workMore: COPY.workMore(21) },
  nav: buildNav({ projectCount: 27, essayCount: 2 }),
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

  it("every preset has 3 lines per section and matches real projects", () => {
    for (const preset of PRESETS) {
      expect(preset.out.scope).toHaveLength(3);
      expect(preset.out.architecture).toHaveLength(3);
      expect(preset.out.plan).toHaveLength(3);
      expect(preset.out.risks).toHaveLength(3);
      expect(preset.out.match.length).toBeGreaterThan(0);
      for (const id of preset.out.match) {
        expect(FEATURED_IDS.has(id)).toBe(true);
      }
    }
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

  it("reads the paper receipt, the published gap and the role count from resume.ts", () => {
    const papers = RECEIPTS.find((r) => r.title.startsWith("IEEE"))!;
    expect(papers.n).toBe(String(RESUME.publications.length));
    expect(papers.lines.map((l) => l.text)).toEqual(RESUME.publications.map((p) => p.title));
    expect(papers.lines.map((l) => l.href)).toEqual(RESUME.publications.map((p) => p.link));

    const gap = RESUME.publications.map((p) => parsePublishedVsReproduced(p.description)).find(Boolean)!;
    expect(METHOD[3].why).toContain(`${gap.published}% in the paper`);
    expect(METHOD[3].why).toContain(`${gap.reproduced}% in the committed notebook`);

    const roles = RESUME.experience.flatMap((c) => c.roles).length;
    expect(COPY.logDeck.startsWith(`${roles} roles`)).toBe(true);
  });

  it("searches only the listed repos, and says how many of them it finds", () => {
    const url = new URL(MERGED_PRS_SEARCH);
    expect(url.origin + url.pathname).toBe("https://github.com/search");
    expect(url.searchParams.get("type")).toBe("pullrequests");
    const q = url.searchParams.get("q")!;
    for (const pr of MERGED_PRS) expect(q).toContain(`repo:${pr.repo}`);
    // #6954 and #6967 landed through Copybara, so GitHub shows them closed and
    // the search cannot find them: the label must not claim them all.
    expect(MERGED_PRS_SEARCH_LABEL).toBe("22 of 24");
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

  it("every METHOD href and internal /projects/ receipt href points at a real file", () => {
    const projectHrefs = [
      ...METHOD.map((m) => m.href),
      ...RECEIPTS.flatMap((r) => r.lines.map((l) => l.href)),
    ].filter((href) => href.startsWith("/projects/"));
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

  it("SECTIONS covers brief, proof, work, method, contact in order", () => {
    expect(SECTIONS.map((s) => s.id)).toEqual(["brief", "proof", "work", "method", "contact"]);
  });

  it("buildNav interpolates its arguments", () => {
    const nav = buildNav({ projectCount: 27, essayCount: 2 });
    expect(nav[0].alt).toBe("27 shipped");
    expect(nav[1].alt).toBe("2 essays");
  });

  // The status line used to carry a relocation arrow and a computed years count.
  // Both are gone on purpose, and both are the kind of thing that creeps back in
  // when someone reaches for something to fill the line with.
  it("keeps the status line to place and availability", () => {
    expect(HERO.status).toEqual(["GUJARAT, IN", "OPEN TO WORK"]);
    const joined = HERO.status.join(" ");
    expect(joined).not.toMatch(/RELOCAT/i);
    expect(joined).not.toMatch(/\d+\s*YRS/i);
  });

  it("carries the role titles the hero cycles through, most specific first", () => {
    // Exactly eight: the tr-role-cycle keyframes in globals.css give each title
    // a 1/8 slot (visible 1.5-10.5%, gone by 12.5%). Seven would leave blank
    // gaps and nine would overlap two titles; change the keyframes with it.
    expect(ROLES.length).toBe(8);
    expect(ROLES[0]).toBe("FORWARD DEPLOYED ENGINEER");
    expect(new Set(ROLES).size).toBe(ROLES.length);
    // Every title renders into one fixed-width slot, so a stray lowercase entry
    // would show up mid-rotation as the only one that looks different.
    for (const r of ROLES) expect(r).toBe(r.toUpperCase());
  });

  // These lines are the page's own voice, and the mono `//` styling they used to
  // carry measured 3.39:1. Prose replaced it; the marker should not come back.
  it("has no // asides left in the copy", () => {
    const strings = Object.values(COPY).filter((v): v is string => typeof v === "string");
    for (const v of strings) expect(v.startsWith("//"), v).toBe(false);
  });
});
