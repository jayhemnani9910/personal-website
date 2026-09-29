# 0017. Lift the palette to WCAG AA

- **Status:** Accepted
- **Date:** 2026-09-29
- **Supersedes:** [ADR 0015](0015-match-the-design-palette-and-drop-below-aa.md) (the design palette stays, but no text pair may fall below AA any more)

## Context

ADR 0015 shipped the design export's palette exactly and recorded fifteen text
pairs below WCAG 2.x AA (4.5:1), pinning their ratios in `tokens.test.ts` so
they could not drift by accident. The 2026-09-29 audit measured what that costs
a reader:

- dark `text-faint` (#5F6673) is 3.39 / 3.21 / 2.98:1 on bg / surface-1 /
  surface-2, and it is the default theme, so every visitor reads labels, asides
  and some sentences in it;
- light `text-faint`, `ok` and `warn` were 2.68 to 4.37:1;
- the fill `accent` was used as a text colour in about 75 places against ADR
  0016, at 2.84:1 in light, including the focus ring (under the 3:1 a focus
  indicator needs).

Jay chose to lift both themes to AA (audit decisions D3 and D4).

## Decision

Every token that colours words clears 4.5:1 on all three surfaces in both
themes. The smallest change that gets there, same hue, only lightness moved:

| Token | Theme | Was | Now | On bg / surface-1 / surface-2 |
|---|---|---|---|---|
| `--tr-text-faint` | dark | #5F6673 | #7E8694 | 5.33 / 5.06 / 4.70 (0015's own named exit) |
| `--tr-text-faint` | light | #8B919B | #656B75 | 4.91 / 5.37 / 4.53 |
| `--tr-ok` | light | #1E8A50 | #1B7A47 | 4.90 / 5.36 / 4.52 |
| `--tr-warn` | light | #B8651B | #A15818 | 4.90 / 5.35 / 4.51 |

`--tr-accent` is a fill colour only (buttons, borders, rules, selection). Words
and glyphs in the accent use `--tr-accent-ink`, as ADR 0016 already said, and
the focus ring is drawn in `--tr-accent-ink` too (5.38 / 5.87 / 4.96:1 in light,
unchanged yellow in dark).

## Consequences

**Faint and mute sit closer together.** In light, faint (4.91:1) is now only a
step below mute (5.79:1), so the three-level text hierarchy leans more on size
and weight than on colour. That is the price of every label being readable.

**Light-theme yellow text is darker.** Links, headline accents and hovers in
light now use the darker gold. Dark theme is unchanged, since both accent tokens
are the same yellow there.

**Visual baselines move.** Every screenshot with faint text changes. They are
regenerated with the rest of the audit's visual changes.

## Compliance

`src/lib/tokens.test.ts` parses the real `globals.css` and fails if any text
token (`text`, `text-mute`, `text-faint`, `accent-ink`, `ok`, `warn`) is under
4.5:1 on any surface in either theme, if the accent label on its fills is under
4.5:1, or if the focus ring is under 3:1. The same file fails on any
`text-tr-accent` (the fill token as a text colour) anywhere in `src/`.

## Notes

The pinned-ratio table that ADR 0015 introduced is gone: a test that only
stops drift is not needed once the rule itself (AA) can be asserted directly.
