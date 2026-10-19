import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { MERGED_PRS } from "@/data/home";
import { RESUME } from "@/data/resume";
import { RESUME_VARIANTS } from "@/lib/events";

// The PDFs in public/resume are built from LaTeX outside this repo, so nothing
// ties them to resume.ts. By October 2026 they had drifted: a different Elite
// Hotel location, two open-source PRs against 175 on the site, and numbers no
// project page backs. Recruiters forward the PDF, interviewers read the site,
// so the two have to agree. This reads the PDFs' text (poppler's pdftotext)
// and checks the facts that drifted before.

function pdfText(variant: string): string {
  const file = path.join(process.cwd(), "public", "resume", `jay-hemnani-${variant}.pdf`);
  try {
    return execFileSync("pdftotext", [file, "-"], { encoding: "utf8" }).replace(/\s+/g, " ");
  } catch (err) {
    throw new Error(`pdftotext could not read ${file} (install poppler-utils): ${err instanceof Error ? err.message : err}`);
  }
}

const elite = RESUME.experience.find((o) => o.name === "Elite Hotel Group");
const fraud = RESUME.experience
  .find((o) => o.name === "Amnex")
  ?.roles.flatMap((r) => r.bullets)
  .map((b) => b.text.match(/(\d+)% precision/)?.[1])
  .find(Boolean);
const repoCount = new Set(MERGED_PRS.map((pr) => pr.repo)).size;

// Claims a PDF once made that no page on the site backs. Dropped on purpose;
// this keeps them from coming back with the next LaTeX edit.
const RETIRED = ["95.2%", "70% cost", "Sub-100ms", "sub-100ms", "50+ MLflow", "San Jose"];

describe.each(RESUME_VARIANTS)("résumé PDF: %s", (variant) => {
  const text = pdfText(variant);

  it("puts Elite Hotel Group where resume.ts does", () => {
    expect(elite?.location).toBeTruthy();
    expect(text).toMatch(new RegExp(`Elite Hotel Group.{0,80}${elite!.location}|${elite!.location}.{0,80}Elite Hotel Group`));
  });

  it("does not undersell or oversell the merged pull requests", () => {
    const claimed = Number(text.match(/(\d+)\+ merged pull requests/)?.[1]);
    expect(claimed, "the PDF should say '<n>+ merged pull requests'").toBeGreaterThan(0);
    expect(claimed).toBeLessThanOrEqual(MERGED_PRS.length);
    // Fifty behind means it is time to rebuild the PDFs.
    expect(MERGED_PRS.length - claimed).toBeLessThan(50);
    const projects = Number(text.match(/across (\d+) open-source projects/)?.[1]);
    expect(projects).toBeLessThanOrEqual(repoCount);
  });

  it("states the fraud model's precision as resume.ts does, if at all", () => {
    for (const n of text.matchAll(/(\d+)% precision/g)) expect(n[1]).toBe(fraud);
  });

  it("says where the 22 FPS was measured, if it says 22 FPS", () => {
    if (/22 FPS/i.test(text)) expect(text).toMatch(/RTX 3070/);
  });

  it("makes none of the retired claims", () => {
    for (const claim of RETIRED) expect(text).not.toContain(claim);
  });
});
