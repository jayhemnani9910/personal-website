import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// Contrast guard for the palette (ADR 0017: every text token clears AA).
//
// This test parses the REAL stylesheet. An earlier version mirrored the hexes
// as literals in this file, which made it vacuous: setting --tr-accent to a
// 2:1 value in globals.css left all 26 assertions green, because they were
// checking a copy of the palette rather than the palette. A test that cannot
// fail is worse than no test.
//
// WCAG 2.x relative luminance: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
// WCAG 2.x contrast ratio:     https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio

const CSS = readFileSync(
  resolve(dirname(fileURLToPath(import.meta.url)), "../app/globals.css"),
  "utf8",
).replace(/\/\*[\s\S]*?\*\//g, ""); // strip comments: they can contain braces

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Every .ts/.tsx source file under src/. */
function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return walk(p);
    // Skip test files: this one documents the broken forms in its comments,
    // and would otherwise flag itself.
    if (/\.test\.tsx?$/.test(e.name)) return [];
    return /\.tsx?$/.test(e.name) ? [p] : [];
  });
}

/**
 * Pull the --tr-* declarations out of one rule block.
 *
 * globals.css has more than one `:root` block (fonts, tokens, print). Only the
 * token layer declares `--tr-` hex values outside @media print, hence the
 * guard on the body and the exact selector match.
 */
function paletteFor(selector: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [, sel, body] of CSS.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (sel.trim() !== selector) continue;
    if (!body.includes("--tr-")) continue;
    for (const [, name, hex] of body.matchAll(/--tr-([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
      out[name] = hex;
    }
  }
  return out;
}

// Paper is the only palette (ADR 0018).
const PAPER = paletteFor(":root");

const REQUIRED = [
  "bg", "surface-1", "surface-2", "text", "text-mute", "text-faint", "accent", "accent-ink", "accent-hand",
  "accent-hover", "on-accent", "ok", "warn", "butter", "on-ink", "on-ink-mute", "on-ink-faint",
] as const;
const SURFACES = ["bg", "surface-1", "surface-2"] as const;
// Every token that colours words. `accent` is not one of them: it is the fill
// colour (buttons, borders, rules), and words in the accent use `accent-ink`
// (ADR 0016), which a test below enforces across src/.
const TEXT_TOKENS = ["text", "text-mute", "text-faint", "accent-ink", "ok", "warn"] as const;
const AA_MIN = 4.5;

function channelLuminance(channel8bit: number): number {
  const c = channel8bit / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(clean.slice(i, i + 2), 16));
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

function contrastRatio(a: string, b: string): number {
  const [lighter, darker] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
}

// These run first. If the regex ever stops matching, the contrast assertions
// below would silently iterate an empty set and "pass", which is exactly the
// hole this file used to have. Fail loudly instead.
describe("token parsing (guards the contrast suite against going vacuous)", () => {
  it(`parsed all ${REQUIRED.length} --tr- tokens out of globals.css`, () => {
    const missing = REQUIRED.filter((k) => !PAPER[k]);
    expect(missing, `could not parse ${missing.join(", ")} from globals.css`).toEqual([]);
  });

  it("every parsed value is a 6-digit hex", () => {
    for (const [name, value] of Object.entries(PAPER)) {
      expect(value, `--tr-${name} is not a hex colour`).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("no theme blocks are left behind", () => {
    expect(CSS).not.toMatch(/data-theme/);
  });
});

// Tailwind's `text-*` utility means BOTH font-size and colour. Given a bare CSS
// variable it cannot tell which you meant, so it silently emits nothing:
//
//     text-[ var(--tr-t-display) ]          -> dropped, element falls back to 16px
//     text-[ length:var(--tr-t-display) ]   -> font-size: var(--tr-t-display)
//
// This shipped once already. Every heading on the pilot page rendered at 16px
// while the token itself resolved correctly, so it looked like a design choice
// rather than a bug. Nothing failed: not lint, not the build, not the type
// checker. Only measuring the computed style in a browser caught it.
describe("type scale is actually applied (Tailwind silently drops the un-hinted form)", () => {
  it("no file uses the un-hinted font-size form without `length:`", () => {
    const offenders: string[] = [];
    for (const file of walk(SRC)) {
      const src = readFileSync(file, "utf8");
      src.split("\n").forEach((line, i) => {
        if (/text-\[var\(--tr-t-/.test(line)) {
          offenders.push(`${file.replace(SRC, "src")}:${i + 1}`);
        }
      });
    }
    expect(
      offenders,
      `These use the un-hinted form, which Tailwind drops. Add the "length:" hint:\n  ${offenders.join("\n  ")}`,
    ).toEqual([]);
  });

  // The type scale shipped with sizes but no line heights, so leading was
  // written inline and drifted into 14 distinct raw values across 44 call
  // sites: body prose at 1.5 in one component and 1.6 in another, h2 at 1.02,
  // 1.05 and 1.1. Nothing catches that, because every one of them is valid CSS.
  // Named Tailwind steps (leading-none/tight/relaxed) are still allowed; this
  // only forbids the arbitrary numeric form.
  // Tailwind v4's automatic source detection skips anything .gitignore matches,
  // and a .gitignore pattern without a leading slash matches at ANY depth. A
  // bare `resume/` (for the private folder at the repo root) therefore also
  // matched src/app/resume/, so that route was never scanned and every utility
  // used only by the About page was missing from the compiled CSS in production.
  // The build, lint and type check were all green throughout.
  //
  // Fails when a directory under src/ is caught by such a pattern unless
  // globals.css explicitly re-includes it with @source. A leading `**/` matches
  // at any depth too, so `**/resume/` counts as bare.
  it("no source directory is hidden from Tailwind by a bare .gitignore pattern", () => {
    const ROOT = resolve(SRC, "..");
    const ignoreFile = join(ROOT, ".gitignore");

    const bareDirPatterns = readFileSync(ignoreFile, "utf8")
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#") && !l.startsWith("!") && !l.startsWith("/"))
      .map((l) => l.replace(/^\*\*\//, "").replace(/\/$/, ""))
      .filter((l) => !l.includes("/") && !l.includes("*"));

    function dirsUnder(dir: string): string[] {
      return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
        e.isDirectory() ? [join(dir, e.name), ...dirsUnder(join(dir, e.name))] : [],
      );
    }

    // `CSS` has comments stripped, so this only sees real @source directives.
    // Their paths are relative to globals.css, so resolve them from src/app.
    const reIncluded = [...CSS.matchAll(/@source\s+(["'])(.+?)\1/g)].map((m) => resolve(SRC, "app", m[2]));

    const offenders = dirsUnder(SRC)
      .filter((d) => bareDirPatterns.includes(d.split("/").pop()!))
      .filter((d) => !reIncluded.some((p) => d === p || d.startsWith(p + "/")))
      .map((d) => d.replace(ROOT, "."));

    expect(
      offenders,
      `These are excluded from Tailwind's scan by a bare .gitignore pattern, so their\n` +
        `classes will be missing from the CSS. Add an @source re-include in globals.css:\n  ${offenders.join("\n  ")}`,
    ).toEqual([]);
  });

  it("no file hardcodes a numeric line height instead of using a --tr-lh-* token", () => {
    const offenders: string[] = [];
    for (const file of walk(SRC)) {
      const src = readFileSync(file, "utf8");
      src.split("\n").forEach((line, i) => {
        const hit = line.match(/leading-\[[0-9.]+\]/);
        if (hit) offenders.push(`${file.replace(SRC, "src")}:${i + 1}  ${hit[0]}`);
      });
    }
    expect(
      offenders,
      `Use a --tr-lh-* token (numeral/display/h2/h3/body/prose) rather than a raw value:\n  ${offenders.join("\n  ")}`,
    ).toEqual([]);
  });
});

interface Case {
  fg: string;
  bg: string;
}

const cases: Case[] = [];
for (const fg of TEXT_TOKENS) {
  for (const bg of SURFACES) cases.push({ fg, bg });
}
// Butter is a surface (the fact card, the secrets chip, highlights): only ink
// and ink-2 go on it. Faint measures 4.28 there and is not allowed.
cases.push({ fg: "text", bg: "butter" }, { fg: "text-mute", bg: "butter" });
// Ink panels: today's pick, the contact band, footers, code, the terminal.
for (const fg of ["on-ink", "on-ink-mute", "on-ink-faint", "butter", "accent", "mint"]) cases.push({ fg, bg: "text" });
// The primary button's label on its fill, at rest and under the pointer. This
// is why --tr-on-accent is ink: card-white on tomato is 3.57:1.
cases.push({ fg: "on-accent", bg: "accent" }, { fg: "on-accent", bg: "accent-hover" });

describe("Desk token contrast (ADR 0017: WCAG AA everywhere)", () => {
  it.each(cases)("$fg on $bg clears AA", ({ fg, bg }) => {
    const ratio = contrastRatio(PAPER[fg], PAPER[bg]);
    expect(ratio, `${fg} on ${bg} is ${ratio.toFixed(2)}:1, under ${AA_MIN}:1`).toBeGreaterThanOrEqual(AA_MIN);
  });

  // WCAG 1.4.11: a focus indicator needs 3:1 against what it sits on. The ring
  // is accent-ink on paper surfaces and butter inside ink panels (globals.css).
  it("the focus ring clears 3:1 on every surface it is drawn on", () => {
    for (const bg of [...SURFACES, "butter"]) {
      expect(contrastRatio(PAPER["accent-ink"], PAPER[bg]), `ring on ${bg}`).toBeGreaterThanOrEqual(3);
    }
    expect(contrastRatio(PAPER.butter, PAPER.text), "ring on ink").toBeGreaterThanOrEqual(3);
  });

  // Pure tomato as words is only for Caveat at 24px and up: large text, 3:1.
  it("the handwritten accent clears the large-text bar on paper and card", () => {
    for (const bg of ["bg", "surface-1"]) {
      expect(contrastRatio(PAPER["accent-hand"], PAPER[bg])).toBeGreaterThanOrEqual(3);
    }
  });
});

// `text-tr-accent` is the fill token used as a text colour: tomato measures
// 3.11:1 on paper. Words and glyphs take `text-tr-accent-ink` (ADR 0016).
describe("accent-coloured text uses accent-ink", () => {
  it("no component colours text with the fill accent", () => {
    const offenders = walk(SRC).flatMap((file) =>
      readFileSync(file, "utf8")
        .split("\n")
        .map((line, i) => (/text-tr-accent(?![-\w])/.test(line) ? `${file.replace(SRC, "src")}:${i + 1}` : null))
        .filter((x): x is string => x !== null),
    );
    expect(offenders, `use text-tr-accent-ink:\n  ${offenders.join("\n  ")}`).toEqual([]);
  });
});

// `text-tr-accent-hand` is pure tomato, which only clears the large-text bar.
// It is for the Caveat asides (24px and up) and decorative marks hidden from
// assistive tech, such as the logo's dot.
describe("the handwritten accent stays handwritten", () => {
  it("every text-tr-accent-hand sits on Caveat or an aria-hidden mark", () => {
    const offenders = walk(SRC).flatMap((file) =>
      readFileSync(file, "utf8")
        .split("\n")
        .map((line, i) =>
          /text-tr-accent-hand/.test(line) && !/font-hand|aria-hidden|HAND\b|const HAND =/.test(line)
            ? `${file.replace(SRC, "src")}:${i + 1}`
            : null,
        )
        .filter((x): x is string => x !== null),
    );
    expect(offenders, `pair text-tr-accent-hand with font-hand at 24px+:\n  ${offenders.join("\n  ")}`).toEqual([]);
  });
});
