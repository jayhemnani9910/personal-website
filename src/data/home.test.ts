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
  buildHero,
  COPY,
  buildNav,
} from "./home";
import { RESUME } from "./resume";

const PROJECTS_DIR = join(process.cwd(), "content/projects");
const FEATURED_IDS = new Set(FEATURED.map((p) => p.id));
const RECEIPTS = buildReceipts({ projectCount: 27, toolCount: 8 });
const HERO = buildHero({ years: 4 });

const ALL_TEXT = JSON.stringify({
  FEATURED,
  PRESETS,
  receipts: RECEIPTS,
  METHOD,
  LOG_NOTES,
  SECTIONS,
  HERO,
  COPY: { ...COPY, workMore: COPY.workMore(21), footerLine: COPY.footerLine(8) },
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
  return ALLOWED_INTERNAL_PREFIXES.some((p) => href === p || href.startsWith(`${p}/`));
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
    expect(RECEIPTS[0].n).toBe("27");
    expect(RECEIPTS[RECEIPTS.length - 1].n).toBe("8");
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

  it("wires the computed years-of-experience claim into HERO.status", () => {
    expect(HERO.status).toContain("4 YRS");
    const hero7 = buildHero({ years: 7 });
    expect(hero7.status).toContain("7 YRS");
  });
});
