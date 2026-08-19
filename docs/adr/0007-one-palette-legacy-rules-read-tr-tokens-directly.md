# 0007. One palette: the legacy rules read `--tr-*` directly

- **Status:** Accepted
- **Date:** 2026-08-19
- **Supersedes:** [ADR 0002](0002-keep-the-legacy-editorial-css-behind-a-token-override.md)
- **Related:** ADR 0001 (the palette), ADR 0006 (the coverage that made this safe)

## Context

ADR 0002 kept a second palette alive. The pre-redesign rules on `/projects/[id]`
and `/fde` read editorial custom properties (`--ink`, `--paper`, `--accent`,
`--rule`), and each of those routes carried a wrapper class that redefined them
in terms of `--tr-*`. The retirement condition was visual regression coverage,
which arrived the same day as ADR 0006.

Investigating the port turned up something ADR 0002 had wrong. It described the
legacy palette as confined to two routes. It was not:

- The six featured figures on the home page draw their SVG with `var(--accent)`,
  `var(--ink)` and `var(--paper)` inline. The home page has no wrapper, so 102
  fill and stroke attributes resolved to `#b5471f`, the old editorial rust, in
  both themes. Fixed separately, before this record.
- `:root` declared aliases like `--border: var(--rule)` and
  `--bg-tertiary: var(--rule-soft)`, and `CodeBlock` consumes them as
  `border-[var(--border)]`. A custom property resolves `var()` at the element
  where it is **declared**, so declaring these at `:root` froze the warm value
  there. Descendants inherited an already-resolved warm colour, and the wrapper's
  override could not reach it. Every code block on every project page rendered
  warm `#332e25` borders and a warm `#1d1a14` panel inside a cold page.

That second one is the argument against the whole arrangement. A wrapper that
remaps inherited properties looks like it covers a subtree, and silently does not
cover any property that was resolved higher up.

## Decision

Delete the second palette. The legacy rules now reference `--tr-*` directly:
368 `var()` references retargeted, 51 declarations removed, none left. Both
wrapper blocks shrink to the page ground (`background`, `color`, and `min-height`
on `/fde`).

**The `.editorial` and `.fde` selectors stay.** This is narrower than "port to
token classes", which is what ADR 0002 said would happen, and the narrowing is
deliberate. Rewriting 392 rules as utility classes would touch every line of
`ProjectDetail`, `ProjectShowcase` and the FDE components, and utilities cannot
express what several of these rules do: `.sw-flow li::before` sets
`content: counter(flow, decimal-leading-zero)`. Removing the `.editorial` prefix
would also drop every one of those rules from specificity (0,2,0) to (0,1,0),
which is 392 chances to change a cascade outcome for no gain. The problem ADR
0002 created was two palettes, not two syntaxes. `.editorial` and `.fde` are now
namespaces for component CSS that reads the one token layer.

The `--ff-*` font tokens also stay, declared once at `:root`. They were never
duplicated in the way the colours were, and Tailwind's `font-mono` utility
resolves through `--font-mono: var(--ff-mono)`, so deleting them would have
silently moved six usages onto the system mono stack.

## Consequences

**One palette.** No legacy colour token is defined or referenced anywhere in
`src/`, asserted by a scan over `globals.css` and every `.ts`/`.tsx` file.

One literal survived that scan and was caught later, from the deployed CSS
rather than the source: `.editorial .feat .ph.alt` had the rust written as
`rgba(181,71,31,0.10)` inside a gradient. The migration looked for `var()`
references and hex literals, and an rgba literal is neither. The rule is
unreachable (no markup uses `.feat`), so nothing rendered wrong, but the sweep
was incomplete and a sweep that reports zero while missing a case is the thing
worth recording. A colour-space-aware scan over every `rgb()`/`rgba()` literal
found exactly one warm value left, now `color-mix` on `--tr-ember`.

**A class of bug is gone rather than fixed.** The `:root` freeze was invisible,
survived a redesign and an audit, and would have recurred with any new alias.
There is no longer an inherited-property override for it to defeat.

**Two intended visual changes**, both baselined:

- Code blocks on `/projects/[id]` and in the showcase Code tabs turned from warm
  to cold. That is the freeze bug being corrected, and it is most of the 310,000
  changed pixels on the dossier page.
- The `/fde` phase strip shifted by a few pixels. `.fde-page` had been setting
  `--ff-mono: var(--font-jetbrains)` with no fallbacks; it now uses the `:root`
  stack like every other page. The `→` glyph is not in JetBrains Mono, so it had
  been falling to next/font's synthetic fallback at 11.45px and now reaches a
  real monospace face at 7.08px. Both were checked by eye; the narrower arrow
  reads better, and the page now degrades the same way as the rest of the site
  if the webfont fails.

**Everything else is pixel-identical.** 20 of 28 baselines were untouched,
including all five token routes, which is the evidence that this did not leak.

**`globals.css` is 2256 lines**, from 2331. The saving is small because this
removed duplicated declarations rather than rules. 224 `.editorial` and 168
`.fde` rules remain, and they are all live.

## Compliance

`npm run test:visual` (ADR 0006) is the guard, and it is what made this
reviewable: every change had to be explained before its baseline was updated.

No test asserts that a new alias will not reintroduce the `:root` freeze. The
scan that proves the legacy palette is gone was run once, by hand, and is not
wired into the suite. That is the obvious next fitness function.

## Notes

Found while doing this and deliberately left alone, since none of it is palette
duplication:

- `.glass-panel`, `.card-interactive`, `.btn-primary`, `.btn-secondary` and
  `.title-link` have rules but appear in no markup.
- `--shadow-sm/md/lg` still exist and `.card:hover` uses `--shadow-md`, which
  contradicts ADR 0001's rule that depth is a lighter surface plus a hairline
  and never a drop shadow. That is a design decision, not a cleanup.
- `--orb-opacity-1/2`, `--space-2/6/8/16`, `--t-h1/h2/h3` and `--gutter` are
  declared and referenced nowhere.
