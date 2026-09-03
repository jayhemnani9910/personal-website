# 0015. Match the design palette and drop below AA

- **Status:** Accepted
- **Date:** 2026-09-03
- **Supersedes (in part):** [ADR 0001](0001-two-readers-as-the-single-design-concept.md) (the theme default no longer follows `prefers-color-scheme`; dark is unconditional now, only the toggle changes it) and [ADR 0014](0014-adopt-the-v4-home-as-a-scoped-island.md) (the four lifted values this record names are reverted to the design's own, so 0014's "accessibility at 100 is a constraint the design does not get to override" no longer holds)

## Context

ADR 0001 committed the token layer to clearing WCAG AA 4.5:1 on every
text-on-surface pair, checked by `src/lib/tokens.test.ts`, and the CLAUDE.md
accessibility section commits every route to Lighthouse mobile a11y 100. The v4
design comp specifies a palette that does not clear AA on 15 of the suite's 40
pairs. Until now we shipped corrected values instead of the comp's own numbers,
which is why light theme rendered a brown-olive accent where the design draws
gold, and why faint text was lighter than the comp shows it. Jay reviewed the
measured ratios below on 2026-09-03 and chose the comp over the corrected
values.

## Decision

Ship the comp's palette verbatim, not a lifted approximation of it. Dark is the
only default: `:root` carries the dark values and there is no
`prefers-color-scheme` rule, so a first-time visitor gets dark whatever their OS
says. Light stays a first-class theme, reached only through the toggle, which
persists in `localStorage`.

`src/lib/tokens.test.ts` no longer asserts 4.5:1 on every pair. It pins the
measured ratio of every pair instead, so a future palette edit still cannot
drift silently, it just has to update the recorded ratio and this record rather
than stay above a fixed floor.

## Consequences

Measured with the palette both before and after this change (`lum`/`cr` per
WCAG 2.x relative luminance and contrast ratio):

```
DARK
  text     on bg         16.99  ok
  text     on surface-1  16.13  ok
  text     on surface-2  14.97  ok
  text-mute on bg         7.41  ok
  text-mute on surface-1  7.04  ok
  text-mute on surface-2  6.53  ok
  text-faint on bg        3.39  FAIL
  text-faint on surface-1 3.21  FAIL
  text-faint on surface-2 2.98  FAIL
  accent   on bg         13.44  ok
  accent   on surface-1  12.75  ok
  accent   on surface-2  11.84  ok
  ok       on bg         11.98  ok
  ok       on surface-1  11.37  ok
  ok       on surface-2  10.55  ok
  warn     on bg          9.40  ok
  warn     on surface-1   8.92  ok
  warn     on surface-2   8.28  ok
  on-accent on accent    13.44  ok
  on-accent on accent-hover 15.00  ok

LIGHT
  text     on bg         17.01  ok
  text     on surface-1  18.58  ok
  text     on surface-2  15.68  ok
  text-mute on bg         5.79  ok
  text-mute on surface-1  6.32  ok
  text-mute on surface-2  5.34  ok
  text-faint on bg        2.90  FAIL
  text-faint on surface-1 3.17  FAIL
  text-faint on surface-2 2.68  FAIL
  accent   on bg          2.84  FAIL
  accent   on surface-1   3.10  FAIL
  accent   on surface-2   2.62  FAIL
  ok       on bg          4.00  FAIL
  ok       on surface-1   4.37  FAIL
  ok       on surface-2   3.69  FAIL
  warn     on bg          3.91  FAIL
  warn     on surface-1   4.27  FAIL
  warn     on surface-2   3.60  FAIL
  on-accent on accent     5.99  ok
  on-accent on accent-hover 7.78  ok
```

Measured with Lighthouse 13.4.1 (mobile preset, accessibility category only)
against the production build, on the ten routes, in dark, the site's only
default now that there is no `prefers-color-scheme` rule:

```
home                              96
/projects                         96
/projects/accurate-guesser        96
/blog                             96
/blog/forward-deployed-engineer   95
/fde                               96
/resume                           96
/lab                              96
/youtube                          96
404 (not-found)                   95
```

Every one of the ten scores below 100 traces to a single audit,
`color-contrast`, and every flagged node's foreground colour is `#5f6673`,
`--tr-text-faint` in dark: the three accepted dark rows above (3.39, 3.21,
2.98:1) and nothing else. No route fails for any other reason. `text-faint`
sets the `//` asides, the hero location line, the work-table column headers,
the social handles and the footer colophon, which is why the pages with more
of that mono aside copy (`/projects`, `home`) carry more failing nodes (59 and
51) than a page with little of it (`/blog/forward-deployed-engineer`, 3), even
though the per-route score only moves between 95 and 96 either way.

One pair was deliberately kept above AA rather than left to fall out of the
comp's own values: `on-accent on accent`, the Run button's label. The design's
`--on-accent` moves with the accent (near-black `#111318` in light,
`#0B0C0F` in dark) rather than staying white, which measures 5.99:1 in light
and 13.44:1 in dark. White on the light accent would have measured 3.10:1 on
the fill and 2.39:1 on the hover fill, below AA on the site's most prominent
call to action.

The exit, if this is ever revisited: raising `--tr-text-faint` in dark back to
`#7E8694` restores AA on the three rows that reach every visitor, at no cost to
anything else, since dark's other four tokens already clear AA at the comp's
own values.

## Compliance

`src/lib/tokens.test.ts` pins the measured ratio of every pair in a `RECORDED`
map built from the real `globals.css`, rather than asserting a 4.5:1 floor. A
palette edit that is not accompanied by an update to `RECORDED` and to this
record fails the suite. A separate test in the same file names the exact 15
pairs this record accepts below AA, so the cost stays visible in output on
every run rather than only in this document.
