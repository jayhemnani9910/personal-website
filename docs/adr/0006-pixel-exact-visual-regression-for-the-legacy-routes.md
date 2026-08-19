# 0006. Pixel-exact visual regression for the legacy routes

- **Status:** Accepted
- **Date:** 2026-08-19
- **Related:** ADR 0002 (this satisfies its retirement condition)

## Context

ADR 0002 left several hundred pre-redesign CSS rules alive on `/projects/[id]`
and `/fde`, and said they would be ported to token classes once visual coverage
existed. Porting them means rewriting `ProjectDetail`, `ProjectShowcase` and the
FDE components along with their markup.

The verification available before this was reading the pages in a browser. That
was adequate for the 2026-08-19 prune, which only deleted rules that could not
match any element, and it is not adequate for a rewrite. A dossier, a four-tab
showcase, four comparison sliders and a simulation console, in two themes, is
more surface than a person checks reliably, and a spacing or colour regression on
the two most detailed pages on the site is exactly what eyes skip.

Nothing in the existing suite could substitute. Vitest runs in jsdom, which
computes no layout and paints nothing, so it cannot observe a visual regression
even in principle.

## Decision

Add `@playwright/test` as a dev dependency and baseline the two legacy routes.

Scope started deliberately narrow: six routes plus a tab sweep, each naming in a
comment which legacy rules it protects.

It was widened on the same day, in `tests/visual/token-routes.spec.ts`, and the
original reasoning is why. Retiring the legacy palette means deleting custom
properties declared at `:root`, and every page inherits from there. A change
meant to be invisible outside `/projects/[id]` and `/fde` needs the pages outside
them under test before it can be called invisible. The home page earns its place
twice over: its six featured figures are SVG drawn with custom properties inline
rather than with classes, which makes them the part most likely to move and the
least likely to be noticed.

Three coverage choices are load-bearing:

- `revolu-idea` is the only project whose showcase config has `findings`, and
  `webmcp-portfolio` the only one with `tools`. They are therefore the only
  possible coverage for `v-verified`, `v-contested`, `v-unverified`, `k-read` and
  `k-write`, the five class names composed at runtime from `v-${verdict}` and
  `k-${kind}`. The tab sweep asserts those selectors are present in the DOM, so
  the suite fails if a port renames them rather than silently baselining their
  absence.
- The comparison sliders get an explicit wait on every image reporting `complete`
  and a non-zero `naturalWidth`. They render blank until their images load, which
  reads as an empty tab rather than as a failure.
- Both themes run as separate Playwright projects, because the legacy routes get
  their palette by custom-property inheritance through a wrapper class, and that
  is the precise mechanism a port would disturb.

**The two sensitivity numbers are `threshold: 0` and `maxDiffPixels: 20`**, and
both are measured. Each was wrong once first, in opposite directions.

`maxDiffPixelRatio: 0.001` was the first attempt and was worse than nothing. A
ratio scales with page height, so the 6489px-tall dossier was granted about 8300
pixels of slack while a real regression stays a fixed size. Moving one legacy
rule's padding by 2px changed roughly 1000 pixels and the entire suite passed.

Leaving `threshold` at its default of 0.2 was the second mistake, and a worse one
given what this suite is for. That number is per-pixel colour sensitivity in YIQ
space, and a palette migration is exactly the change it hides: the stale
editorial rust `#b5471f` sits close enough to ember `#FF5C2B` that recolouring
every figure on the home page registered as 41 changed pixels. The same recolour
measured at `threshold: 0` is about 52,000 pixels.

At `threshold: 0` the run-to-run noise floor is 4 pixels, on light theme only.
`maxDiffPixels: 20` sits five times above that floor and roughly fifty times
below the smallest real regression tested.

Determinism comes from four things: `reducedMotion: "reduce"` (which turns off
the preloader, the reticle cursor, every reveal and stagger, and Lenis, because
all of them read one hook, see ADR 0003), the theme written to `localStorage`
before first paint rather than clicked, a stubbed `/api/views`, and a fixed
viewport with `deviceScaleFactor: 1`.

## Consequences

**The rest of ADR 0002 is unblocked.** That is the point of this record.

**Baselines are committed binaries.** 26 PNGs, about 8MB. Full-page shots of
long pages are large, and they will be rewritten wholesale whenever the design
legitimately changes. This is the cost of the approach and it is accepted.

**`/api/views` is stubbed, and not only for determinism.** An unstubbed run would
POST to the real counter on every mount of every project page. An automated loop
took `views:webcrawler` from 3 to 14 once already. No test in this suite is
allowed to reach that route.

**A zero threshold means environment changes fail everything at once.** A
different Chromium build or different font rendering turns all 18 red. That is a
loud, obvious signal rather than slow erosion, and one command regenerates the
set.

**Vitest was rescoped to `src/`** so it stops collecting these Playwright specs,
whose `test` export is a different one. That surfaced a separate problem: it had
also been collecting `.claude/skills/sync-projects/core.test.mjs`, which is
gitignored, so local runs reported 129 tests while CI ran 116. Local and CI now
agree. The `/sync-projects` skill's own tests are no longer run by this repo's
test command, which is correct, since that skill is not part of the website.

**Runs cost a production build.** `test:visual` is `next build && playwright
test`, because the port changes compiled CSS and `next dev` output is not what
visitors get.

## Compliance

`npm run test:visual` is the check. `npm run test:visual:update` regenerates
baselines after an intended visual change.

This is not wired into CI, deliberately. The baselines are pixel-exact against
one machine's Chromium build and font rendering, so a GitHub runner would fail
all 18 on differences that are not regressions. Doing it properly means running
in the official Playwright container and generating the baselines in that same
container. Worth doing, not done. Wiring it up half-way would produce a red build
that everyone learns to ignore, which is worse than the current honest gap.

## Notes

Two things the harness does not cover, stated so they are not assumed:

- Anything outside the two legacy routes. The token-class pages have no visual
  coverage. They are also not about to be rewritten.
- Interaction and animation. Motion is switched off on purpose to make the shots
  deterministic, so nothing here checks that a transition looks right.
