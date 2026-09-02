# 0014. Adopt the v4 home as a scoped island

- **Status:** Proposed
- **Date:** 2026-09-02
- **Related:** ADR 0001 (TWO READERS), ADR 0002 (the scoped-override pattern), ADR 0006 (visual baselines), ADR 0007 (one palette), ADR 0008 (performance budget)

## Context

A Claude Design project delivered six screens on 2026-09-01: Portfolio Home,
Work Index, Project Detail, Writing, About, Channel. They are saved verbatim
under `docs/design/`. Only the home screen is being built now; the other five
follow in later phases.

The home screen keeps the idea ADR 0001 named, that a page has a human reader
and a machine reader, and changes three things about how it looks:

- **Newsreader becomes Instrument Sans.** ADR 0001 wrote the rule as "serif is
  what Jay says, mono is what the machine sees". The v4 screens say the same
  thing with a sans family against Geist Mono. The pairing carries the split;
  the serif was one way of drawing it.
- **Ember becomes yellow.** `#FF5C2B` on near-black becomes `#F4D53A`. The
  ember-only rule survives intact: one saturated colour, used on live or
  actionable things and nowhere else.
- **Floating cards may carry a soft drop shadow.** ADR 0001 banned shadows and
  glows outright, on the grounds that a shadow is invisible on near-black and
  elevation should read as a lighter surface plus a top hairline. Two elements
  in the v4 design contradict that: the decomposer card and the shell modal,
  both of which float above a page that scrolls under them.

ADR 0007 ended a period where two palettes shipped at once and called that the
cost worth removing. Building the v4 home restarts it. The question this record
answers is how to restart it in a way that has a stated end.

The alternative was to move the new values into `:root` immediately. That
restyles `/projects`, `/projects/[id]`, `/blog`, `/blog/[slug]`, `/resume`,
`/lab`, `/fde`, `/youtube` and `not-found` in one commit, before any of those
screens have been redesigned, and invalidates every visual baseline from ADR
0006 at a point where nobody can say which diffs are intended.

## Decision

Ship the v4 home as an island.

**One scope class.** The page root carries `className="home-v4"`. A
`.home-v4` block in `globals.css` redeclares the `--tr-*` values, and
`[data-theme="light"] .home-v4` does the same for light. Custom-property
inheritance carries the new palette down the subtree. No other route changes,
and no rule outside the block is edited. This is the mechanism ADR 0002 built
for the legacy editorial routes, pointed the other way: there, old rules read
new tokens; here, new markup reads old token names holding new values.

**The slot names stay.** `--tr-ember` keeps its name while holding yellow.
Renaming it to `--tr-accent` touches fourteen files that render the masthead and
buys nothing until the promotion below. Inside `src/components/home/` the token
is referred to as the accent in comments; the name is a slot, not a colour.

**Shadows are allowed inside the scope.** Two tokens, `--tr-shadow-card` and
`--tr-shadow-modal`, exist only in `.home-v4`. The ban in ADR 0001 was written
for a page whose surfaces sit flat in the document, and it still holds there.
A card that floats over scrolling content is a different case, and the design is
Jay's.

**Four colour values in the design were changed to clear WCAG AA.** The design's
`--fa` (`#5F6673`) measures 3.4:1 on the dark background, and light mode's
`--ac`, `--ok` and `--fa` all fall below 4.5:1. The shipped values are lifted:
dark faint to `#7E8694`, light faint to `#5F6671`, light accent to `#7A6200`,
light ok to `#17703F`. Accessibility at 100 is a constraint the design does not
get to override.

## Consequences

**Two palettes ship at once again, and this is the thing that ends it.** Every
visitor downloads both blocks for every route. The block is about seventy
declarations, so the byte cost is small, but the conceptual cost is the one that
matters: a reader of `globals.css` has to know which palette a given page is in
before any token tells them anything.

**Promotion criterion.** When every route renders inside the v4 palette, three
things happen in one commit: the values move to `:root` and
`:root[data-theme="light"]`, the `.home-v4` scope is deleted, and `--tr-ember`
is renamed to `--tr-accent` across the fourteen files that read it. Not before
all six screens are built, and not one route at a time.

**The visual baselines split.** The home snapshots (dark and light) are
regenerated on purpose as part of this work. The other four routes must not
change, and a diff on any of them means the scope leaked.

**Two font families are added.** Instrument Sans and Geist Mono load alongside
Newsreader and JetBrains Mono. A browser only downloads a face when a glyph
renders in it, so a visitor who never opens the home page pays nothing, but the
performance budget's exact `fontFiles` count changes and is re-measured.

**A no-JS visitor with a light system preference is a special case.** The
existing `@media (prefers-color-scheme: light) { :root:not([data-theme]) }`
fallback has higher specificity than `.home-v4`, so without a matching
`:root:not([data-theme]) .home-v4` block inside the same media query, that
visitor would get v4 typography over the editorial palette. The block is
therefore part of this decision rather than an afterthought.

## Compliance

`src/lib/tokens.test.ts` parses `globals.css` and now reads four palettes rather
than two: `:root`, `:root[data-theme="light"]`, `.home-v4`, and
`[data-theme="light"] .home-v4`. Every text token against every surface token
must clear 4.5:1 in all four, and the parsing guard fails loudly if a selector
stops matching, so the contrast assertions cannot go vacuous.

`src/data/home.test.ts` asserts the copy rules on the shipped data: no em-dashes
or en-dashes, no AI ban-words, no mention of SJSU, every featured project id
backed by a file in `content/projects/`, every receipt link resolving to an
absolute URL or a known site route.

`tests/visual/token-routes.spec.ts` holds the other four routes at
`maxDiffPixels: 0`, which is what catches a leak out of the scope.

`tests/perf/budget.spec.ts` holds the home page's script and stylesheet bytes
and the exact font-file count.

## Notes

`--tr-ok` is declared only inside the scope. The `@theme inline` block exposes
`--color-tr-ok` so Tailwind emits `text-tr-ok` and `bg-tr-ok`, and those
utilities resolve to nothing outside `.home-v4`. That is deliberate for now and
becomes a plain root token at promotion.
