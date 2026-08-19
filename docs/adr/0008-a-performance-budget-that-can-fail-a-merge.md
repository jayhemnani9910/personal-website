# 0008. A performance budget that can fail a merge

- **Status:** Accepted
- **Date:** 2026-08-19
- **Related:** ADR 0006 (the harness this reuses)

## Context

`@vercel/speed-insights` and `@vercel/analytics` were already wired into
`layout.tsx`. Both report. Neither fails anything, and both report after a deploy
has already happened.

So there was no number written down anywhere that a change could violate.
Frontend Architecture for Design Systems, chapter 12, is direct about the gap:
"The key to performance testing is to set a proper budget and stick to it...
continually testing those metrics before each code merge or deployment. If any
of the tests fail, the new feature will need to be adjusted, or some other
feature may need to be removed."

Next 16 no longer prints a First Load JS column in its build output, so the
easy source of a number is gone. Parsing `.next` manifests would work and would
also be a private format that can change under us.

## Decision

Measure what a browser actually downloads, using the Playwright harness that
already exists for ADR 0006, and assert on it.

`tests/perf/budget.spec.ts` loads `/` in a cold context at a fixed viewport
against the production build, sums response bodies by resource type, and counts
font files. It runs as its own Playwright project, `perf`, because bytes do not
have a theme and running it under both would double the wall clock to assert the
same numbers twice.

Four numbers, measured on 2026-08-19:

| Metric | Measured | Budget |
|---|---|---|
| JS on first load of `/` | 765.7 KB | 850 KB |
| CSS | 84.3 KB | 95 KB |
| Font files | 5 | exactly 5 |
| LCP | 160 to 224 ms | 500 ms |

**The byte counts gate CI.** They are exact: five consecutive runs returned
1,620,494 bytes every time. The same build serves the same bytes on any machine,
so nothing about a shared runner makes them less true.

**The font count is an equality, not a ceiling**, and it is the one number here
with a specific bug behind it. Newsreader and JetBrains Mono are variable fonts,
and a `weight` array in a `next/font` call pins them to static instances and
emits a file per weight per style. That had happened. Equality also fails
downward, which is the case worth catching: fewer files means a family stopped
loading.

**CSS is budgeted because of this repo's history.** It shipped two stylesheets at
once for a month (ADR 0002, superseded by 0007). This is the number that notices
a third.

**LCP is asserted locally and skipped in CI.** Against a localhost server on a
shared runner it measures the runner. Real-user LCP is what Speed Insights is
for, and this does not pretend to replace it. The value is printed on every run
including CI, so the number is visible even where it is not enforced.

Current values are printed on pass as well as on failure. A budget whose current
value nobody sees is a budget that gets raised on its first failure without
anyone thinking about it.

## Consequences

**A dependency that costs 100 KB now fails a merge**, and the failure names the
number rather than saying a test failed.

**CI grew a Chromium install**, roughly 40 seconds. `playwright install chromium`
without `--with-deps`: the runner image already has the libraries, and
`--with-deps` spends an apt update to discover that.

**The budgets will need raising**, legitimately, when the site gains something
worth the bytes. The record of what the numbers were and when they were measured
is this file and the comment above the constants, so raising one is a decision
rather than a reflex.

**Only `/` is covered.** It is the heaviest route and the first one most visitors
load, and every route shares the framework chunks, so it catches most of what
matters. A per-route table would catch more.

**Headroom is roughly 10 percent** on the byte ceilings. A budget that fails on
rounding gets raised until it means nothing; one with no headroom is the same
thing with extra steps.

## Compliance

`npm run test:perf` locally, `npm run test:perf:ci` in the CI workflow after the
build step. Both fail the run when a budget is exceeded.

Each of the four assertions was verified by making it fail before being trusted:
the JS ceiling tightened to 700 KB, CSS to 80 KB, the font count to 4, and LCP to
50 ms. All four produced the intended message. The suite was then restored and
re-run green.

## Notes

The measurement counts what the local server sends, which is uncompressed. Vercel
serves these compressed, so the numbers are larger than what a visitor downloads.
That is fine for a budget, whose job is to notice a change rather than to
describe a user's experience, and an uncompressed number is the more stable of
the two to compare against.

`fetch` accounts for 346 KB of the load, which is Next prefetching RSC payloads
for linked routes. It is not budgeted here, and it is the obvious next number if
one is wanted.

An earlier draft of the LCP budget cited 84 ms, taken from a warm server hit
repeatedly in a measurement loop. The test's own conditions include a cold
`next start` that compiles on the first request, where the range is 160 to 224 ms.
The budget uses the number the test actually produces.
