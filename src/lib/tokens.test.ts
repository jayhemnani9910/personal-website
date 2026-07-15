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

const REQUIRED = ["bg", "surface-1", "surface-2", "text", "text-mute", "text-faint", "ember", "on-ember"] as const;
const SURFACES = ["bg", "surface-1", "surface-2"] as const;
const TEXT_TOKENS = ["text", "text-mute", "text-faint", "ember"] as const;
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
    for (const [theme, palette] of [["dark", DARK], ["light", LIGHT]] as const) {
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
}

describe("Two Readers token contrast (WCAG AA, 4.5:1 minimum)", () => {
  it.each(cases)("$theme: $fg on $bg clears 4.5:1", ({ theme, fg, bg, palette }) => {
    const ratio = contrastRatio(palette[fg], palette[bg]);
    expect(
      ratio,
      `${theme} ${fg} (${palette[fg]}) on ${bg} (${palette[bg]}) measured ${ratio.toFixed(2)}:1, below the ${AA_MIN}:1 AA minimum`,
    ).toBeGreaterThanOrEqual(AA_MIN);
  });
});
