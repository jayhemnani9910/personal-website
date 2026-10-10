# 0018. Adopt the Desk design site-wide: paper only, one palette, three type voices

- **Status:** Accepted
- **Date:** 2026-10-10
- **Amends:** [ADR 0001](0001-two-readers-as-the-single-design-concept.md) (dark canonical, no shadows, the type split), [ADR 0003](0003-replace-the-four-presentation-modes-with-reader-mode.md) (the preloader and reticle reader mode used to still), [ADR 0006](0006-pixel-exact-visual-regression-for-the-legacy-routes.md) (one theme, one Playwright project), [ADR 0017](0017-lift-the-palette-to-wcag-aa.md) (the AA rule stays, the values are Desk's), [ADR 0014](0014-adopt-the-v4-home-as-a-scoped-island.md) (Instrument Sans, Geist Mono, the yellow accent), [ADR 0016](0016-split-accent-ink-from-accent-for-readable-yellow.md) (the fill/ink split survives; the yellow rationale does not)

## Context

A Claude Design project delivered a new home page, "Desk": light paper, ink
borders, hard offset shadows, a tomato accent with butter highlights, and three
typefaces (Bricolage Grotesque, JetBrains Mono, Caveat). It is playful on
purpose: throwable tiles, a daily pick, hidden secrets, a guestbook.

The rest of the site was dark-first v4 (ADR 0014, 0015), with a light theme
behind a toggle. Shipping Desk as a home-only island would repeat what ADR 0014
learned: two looks on one site read as two sites. Desk's signature also does
not survive a dark surface: an ink shadow on near-black is invisible, butter on
black is a different design, and nobody drew a dark Desk.

## Decision

1. **Paper is the only theme.** The dark palette, the theme toggle,
   `ThemeContext`, `ThemeGlyph`, the anti-flash script, the WebMCP
   `toggle_theme` tool, the shell's `theme` command and the `light:`/`dark:`
   variants are removed. There is no dark variant planned.
2. **One palette, one prefix.** The `--tr-*` token layer keeps its names and
   takes Desk's values (`globals.css`): paper `#f3ede2`, card `#fffdf8`, ink
   `#1d1a16`, tomato `#e8553a` as the fill accent, `#ad3620` as accent-ink for
   words, butter `#ffd84d`, four pastel dot colours, and an ink-panel set
   (`on-ink`, `on-ink-mute`, `on-ink-faint`, `on-ink-line`). Shadows are hard
   offsets with no blur. Buttons carry ink labels on tomato, because card-white
   on tomato is 3.57:1.
3. **Pure tomato as words only in Caveat at 24px and up**, where 3:1 is the
   large-text bar it clears, through `--tr-accent-hand`; and for decorative
   marks hidden from assistive tech (the logo's dot). Everything else uses
   accent-ink.
4. **Three type voices site-wide**, loaded once in `src/app/fonts.ts`: Bricolage
   for the page, JetBrains Mono for labels and meta, Caveat for one handwritten
   aside per inner page. Instrument Sans and Geist Mono leave the build.
5. **The cinematic overlays go**: the preloader and the reticle cursor belonged
   to the dark concept. Reader mode, the shell (restyled as an ink panel) and
   the page transition stay.

## Consequences

- Every page shifts in the same change, because components already read
  `--tr-*`. The per-page pass is then about Desk's shapes (cards, pills,
  shadows), not colour plumbing.
- The theme-flash class of hydration bug disappears with the theme.
- WebMCP registers seven tools, one of them a write tool. The WebMCP project
  write-up says so.
- Visual baselines collapse from two projects to one (`paper`) and are
  regenerated once.
- Caveat costs one font file on every page. The perf budget's font count is
  re-measured (ADR 0008).

## Compliance

`src/lib/tokens.test.ts` parses `globals.css` and fails the build if any text
token falls under 4.5:1 on paper, card, paper-2, butter (ink and ink-2 only) or
an ink panel; if the focus ring falls under 3:1 on any surface it is drawn on;
if a `data-theme` block comes back; if `text-tr-accent` is used as a text
colour; or if `text-tr-accent-hand` appears without Caveat or `aria-hidden`.

## Notes

The decisions were taken with a design review of the handoff and the codebase.
The handoff lives in the Claude Design project; the home page implements it in
`src/components/home-desk/`.
