# 0002. Keep the legacy editorial CSS behind a scoped token override

- **Status:** Accepted
- **Date:** 2026-07-16, amended 2026-08-19 (twice: the prune, then the coverage)
- **Commits:** `60cc059` (the override), `6f49183` (deleting the dead half)
- **Related:** ADR 0001, ADR 0006

## Context

The editorial redesign of 2026-05-24 was written as hand-authored CSS in
`src/app/globals.css`, addressed through an `.editorial` wrapper class and a set
of warm-paper custom properties: `--paper`, `--ink`, `--ink-mute`, `--rule`,
`--accent`, `--ff-display`, `--ff-body`, `--ff-mono`.

The TWO READERS rebuild (ADR 0001) moved the site onto Tailwind utilities backed
by `--tr-*` tokens. Most routes were ported: home, `/blog`, `/blog/[slug]`,
`/projects`, `/resume`, `/lab`, `not-found`.

Two routes were not, because they are the two CSS-heavy ones. `/projects/[id]`
renders `ProjectDetail` and `ProjectShowcase`, which between them carry the
dossier layout, the tabbed showcase, verdict badges, tool-kind chips and the
before/after comparison sliders. `/fde` renders the console, the phase strip,
the hand-drawn architecture diagram and the simulation panel. Together they
depend on several hundred hand-written rules whose layout logic works and is not
trivially expressible as utilities.

Porting them was a week of work on a rebuild that was already large, and doing
it badly would have broken the two most detailed pages on the site.

## Decision

Leave those two routes on their existing CSS and change only what colour the
existing rules resolve to.

Each route gets a wrapper class that redefines the editorial custom properties
in terms of the `--tr-*` tokens:

- `/projects/[id]` uses `className="editorial tr-editorial-scope"`
- `/fde` uses `className="editorial fde-page"`

Both wrappers set `--paper: var(--tr-bg)`, `--ink: var(--tr-text)`,
`--accent: var(--tr-ember)`, `--rule: var(--tr-hairline)`, and the rest of the
mapping. CSS custom-property inheritance does the rest: every `var(--accent)`
and `var(--ink)` inside those subtrees resolves to a TWO READERS value, and both
routes follow the light and dark themes for free, without a single legacy rule
being rewritten.

Accepting this means accepting that two styling systems ship at once.

## Consequences

**The redesign shipped on schedule and the two hardest pages did not regress.**
That was the trade being made.

**Every visitor downloads both systems.** The legacy rules live in the same
`globals.css` as the token layer, so they are in the critical path for every
route including the ones that cannot use them.

**A large amount of it turned out to be unreachable.** The legacy rules only
apply inside an `.editorial` wrapper, and after the port only two routes have
one. Rules addressing home, blog, lab and resume markup had therefore been dead
since July while still shipping. On 2026-08-19, 257 such rules were removed with
a postcss pass (`6f49183`), taking the file from 2689 lines to 2331 and the
`.editorial` rule count from 437 to 208. That is the amendment to this record:
the decision stands, its dead half does not.

**Five class names are built at runtime and nearly went with them.**
`ProjectShowcase` composes `v-${verdict}` and `k-${kind}`, producing
`v-verified`, `v-unverified`, `v-contested`, `k-read` and `k-write`. None appear
literally in any source file, so a static reachability scan marks them dead. Any
future prune of this stylesheet must collect template-literal class prefixes
before deleting anything.

**A rule scoped `.editorial .foo` silently does nothing when `.foo` is a shared
component rendered on a token page.** This is the failure mode the split
produces, and it has already happened once: the footer ASCII mascot's
`.buddy-art` was `.editorial`-scoped and rendered garbled everywhere else until
it was rescoped to `.buddy--full .buddy-art`.

**The remaining 208 `.editorial` and 168 `.fde` rules are all live.** They are
the real cost, and they are not removable without rewriting `ProjectDetail`,
`ProjectShowcase` and the FDE components along with their markup.

## Retirement condition

This decision is not permanent, and the condition for ending it is specific
rather than a date.

The remaining rules get ported to token classes once visual regression coverage
exists for both routes in both themes. Not before. The 2026-08-19 prune was
verified by rendering three pages and looking at them, which was adequate for
deleting unreachable rules and is not adequate for rewriting 376 live ones
across a dossier, a five-tab showcase, four comparison sliders and a simulation
console. Checking that by eye does not scale, and a colour or spacing regression
on the two most detailed pages on the site is exactly the kind of thing eyes
miss.

So: visual regression snapshots first, then the port, then delete the legacy
palette and both override blocks.

**As of 2026-08-19 the snapshots exist** (ADR 0006), so the precondition is met
and the port is unblocked. This record stays Accepted until the port lands, at
which point it gets superseded rather than edited.

## Compliance

`npm run test:visual` (ADR 0006) baselines both routes in both themes at
`maxDiffPixels: 0`, and its tab sweep asserts the five runtime-composed class
names are present in the DOM. That covers the rendered result, which is what the
port puts at risk.

`src/lib/tokens.test.ts` asserts the `--tr-*` layer the override blocks read
from stays intact.

Two gaps remain, and neither is covered by anything above. No test asserts that a
new route avoids `.editorial`, and no test asserts the override blocks cover
every editorial token. `--ff-body` was omitted from both blocks originally and
fell through to the global Geist definition, which is the kind of drift a test
would catch and review did not.

## Notes

Rule counts in this record were measured on 2026-08-19 after the prune, by
parsing `globals.css` with comments stripped. They will drift; treat them as the
state at that date rather than a current figure.
