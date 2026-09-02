import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// Contrast guard for the "Two Readers" palette (see redesign/TOKENS.md).
//
// This test parses the REAL stylesheet. An earlier version mirrored the hexes
// as literals in this file, which made it vacuous: setting --tr-ember to a
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

/**
 * Pull the --tr-* declarations out of one rule block.
 *
 * globals.css contains TWO design systems while the redesign is in flight, so
 * there are several `:root` blocks. Only the Two Readers ones declare `--tr-`
 * tokens, hence the guard on the body.
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

const DARK = paletteFor(":root"); // dark is canonical, so it is the base
const LIGHT = paletteFor(':root[data-theme="light"]');

const REQUIRED = ["bg", "surface-1", "surface-2", "text", "text-mute", "text-faint", "ember", "ember-hover", "on-ember", "ok", "warn"] as const;
const SURFACES = ["bg", "surface-1", "surface-2"] as const;
// `ok` joined this list when the v4 system was promoted to :root (ADR 0014):
// it is the live/verified green, and it carries text on all three surfaces.
const TEXT_TOKENS = ["text", "text-mute", "text-faint", "ember", "ok", "warn"] as const;
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
  it.each([
    ["dark", DARK],
    ["light", LIGHT],
  ])("%s: parsed all 8 --tr- tokens out of globals.css", (theme, palette) => {
    const missing = REQUIRED.filter((k) => !palette[k]);
    expect(missing, `${theme}: could not parse ${missing.join(", ")} from globals.css`).toEqual([]);
  });

  it("every parsed value is a 6-digit hex", () => {
    for (const [theme, palette] of [
      ["dark", DARK],
      ["light", LIGHT],
    ] as const) {
      for (const [name, value] of Object.entries(palette)) {
        expect(value, `${theme} --tr-${name} is not a hex colour`).toMatch(/^#[0-9A-Fa-f]{6}$/);
      }
    }
  });

  it("dark and light are actually different palettes", () => {
    // Catches parsing the same block twice and testing dark against dark.
    expect(DARK.bg).not.toBe(LIGHT.bg);
    expect(DARK.text).not.toBe(LIGHT.text);
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
  const SRC = resolve(dirname(fileURLToPath(import.meta.url)), "..");

  function walk(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
      const p = join(dir, e.name);
      if (e.isDirectory()) return walk(p);
      // Skip test files: this one documents the broken form in a comment above,
      // and would otherwise flag itself.
      if (/\.test\.tsx?$/.test(e.name)) return [];
      return /\.tsx?$/.test(e.name) ? [p] : [];
    });
  }

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
  // globals.css explicitly re-includes it with @source.
  it("no source directory is hidden from Tailwind by a bare .gitignore pattern", () => {
    const ROOT = resolve(SRC, "..");
    const ignoreFile = join(ROOT, ".gitignore");

    const bareDirPatterns = readFileSync(ignoreFile, "utf8")
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#") && !l.startsWith("!") && !l.startsWith("/"))
      .map((l) => l.replace(/\/$/, ""))
      .filter((l) => !l.includes("/") && !l.includes("*"));

    function dirsUnder(dir: string): string[] {
      return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
        e.isDirectory() ? [join(dir, e.name), ...dirsUnder(join(dir, e.name))] : [],
      );
    }

    // `CSS` has comments stripped, so this only sees real @source directives.
    const reIncluded = CSS.match(/@source\s+"[^"]+"/g) ?? [];

    const offenders = dirsUnder(SRC)
      .filter((d) => bareDirPatterns.includes(d.split("/").pop()!))
      .filter((d) => {
        const rel = d.slice(SRC.length + 1); // e.g. "app/resume"
        return !reIncluded.some((s) => s.includes(rel));
      })
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
  theme: string;
  fg: string;
  bg: string;
  palette: Record<string, string>;
}

const cases: Case[] = [];
for (const [theme, palette] of [["dark", DARK], ["light", LIGHT]] as const) {
  for (const fg of TEXT_TOKENS) {
    for (const bg of SURFACES) cases.push({ theme, fg, bg, palette });
  }
  // The primary CTA's label on its own ember fill. This is the single most
  // important pair on the site: white on the dark ember measures 3.08:1 and
  // fails, which is why --tr-on-ember is near-black rather than white.
  cases.push({ theme, fg: "on-ember", bg: "ember", palette });
  // The same label once the cursor is on it. A hover fill is still a surface
  // carrying text, so it has to clear AA too, in both directions: dark hover
  // lightens the ember, light hover darkens it.
  cases.push({ theme, fg: "on-ember", bg: "ember-hover", palette });
}

// The v4 home (ADR 0014) adds one foreground not present in the base
// palettes: --tr-ok, a status colour used nowhere else. It is deliberately
// NOT added to TEXT_TOKENS above: :root and :root[data-theme="light"] don't
// declare --tr-ok, so contrastRatio would receive undefined and return NaN.

describe("Two Readers token contrast (WCAG AA, 4.5:1 minimum)", () => {
  it.each(cases)("$theme: $fg on $bg clears 4.5:1", ({ theme, fg, bg, palette }) => {
    const ratio = contrastRatio(palette[fg], palette[bg]);
    expect(
      ratio,
      `${theme} ${fg} (${palette[fg]}) on ${bg} (${palette[bg]}) measured ${ratio.toFixed(2)}:1, below the ${AA_MIN}:1 AA minimum`,
    ).toBeGreaterThanOrEqual(AA_MIN);
  });
});
