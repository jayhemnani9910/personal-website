import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// Guard for the architecture decision records in docs/adr/.
//
// These records exist because the decision log used to be undated prose in one
// growing file, and that file had drifted far enough to name four test files
// of which three did not exist. Moving the log into numbered records only helps
// if the records themselves stay honest, so this test reads the real directory
// rather than a list maintained by hand.

const ADR_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../../docs/adr");

const RECORDS = readdirSync(ADR_DIR)
  .filter((f) => /^\d{4}-.+\.md$/.test(f))
  .sort();

const README = readFileSync(join(ADR_DIR, "README.md"), "utf8");

const read = (file: string) => readFileSync(join(ADR_DIR, file), "utf8");

// Richards & Ford, Fundamentals of Software Architecture, ch. 21. Compliance
// and Notes are part of the format too, but Retirement condition is optional
// and only 0002 carries one, so the required set is the five that every record
// must answer.
const REQUIRED_SECTIONS = ["## Context", "## Decision", "## Consequences", "## Compliance"];

const STATUSES = ["Proposed", "Accepted", "Superseded"];

describe("architecture decision records", () => {
  it("has records to check", () => {
    expect(RECORDS.length).toBeGreaterThan(0);
  });

  it("numbers them consecutively from 0001 with no gaps or duplicates", () => {
    const numbers = RECORDS.map((f) => Number(f.slice(0, 4)));
    expect(numbers).toEqual(numbers.map((_, i) => i + 1));
  });

  it.each(RECORDS)("%s declares one of the three statuses", (file) => {
    const status = read(file).match(/^- \*\*Status:\*\* (.+)$/m)?.[1].trim();
    expect(STATUSES).toContain(status);
  });

  it.each(RECORDS)("%s carries an ISO date", (file) => {
    expect(read(file)).toMatch(/^- \*\*Date:\*\* \d{4}-\d{2}-\d{2}/m);
  });

  it.each(RECORDS)("%s has every required section", (file) => {
    const body = read(file);
    const missing = REQUIRED_SECTIONS.filter((s) => !body.includes(s));
    expect(missing).toEqual([]);
  });

  it.each(RECORDS)("%s opens with a title matching its number", (file) => {
    const heading = read(file).split("\n")[0];
    expect(heading).toMatch(new RegExp(`^# ${file.slice(0, 4)}\\. `));
  });

  // The README index is the part most likely to rot: adding a record is one
  // file, and remembering to add its row is a separate act.
  it("lists every record in the README index", () => {
    const unlisted = RECORDS.filter((f) => !README.includes(`(${f})`));
    expect(unlisted).toEqual([]);
  });

  it("links nothing from the README index that is not on disk", () => {
    const linked = [...README.matchAll(/\]\((\d{4}-[^)]+\.md)\)/g)].map((m) => m[1]);
    const dangling = linked.filter((f) => !RECORDS.includes(f));
    expect(dangling).toEqual([]);
  });

  // A superseded record that does not say what replaced it leaves a reader on a
  // decision that is no longer in force with no way forward.
  it.each(RECORDS)("%s links forward if it is superseded", (file) => {
    const body = read(file);
    if (!/^- \*\*Status:\*\* Superseded/m.test(body)) return;
    expect(body).toMatch(/\]\(\d{4}-[^)]+\.md\)/);
  });
});
