# 0001. TWO READERS as the single design concept

- **Status:** Accepted
- **Date:** 2026-07-16
- **Commit:** `60cc059` Redesign v3: dark cinematic "TWO READERS" rebuild

## Context

By July 2026 the site was carrying three visual generations at once. An
Apple-minimal era from the original build. A warm-paper editorial magazine
layout shipped on 2026-05-24. And fourteen bespoke per-project pages, each with
its own theme, built over four days in March: sports broadcast for
`fifa-soccer-ds`, neon retro gaming for the Rubik's cube page, a Wall Street
terminal for `stock-data-platform`, an academic paper for
`soccer-vision-research`, and so on.

The cost of that was not ugliness. It was that every new page started from
nothing. No rule said which colour meant what, so each page invented an accent
and each accent meant something different. Adding a project meant designing a
project page. Contrast was checked by eye, per page, and only when someone
thought to look.

## Decision

One concept governs the whole site.

A page has two readers, a human and a machine, and the typography states which
one is being addressed:

- **Serif (Newsreader)** carries what Jay says. Prose, headings, argument.
- **Mono (JetBrains Mono)** carries what the machine sees. Filenames, counts,
  tool names, status strings, timestamps, anything a program produced.

Colour is almost entirely absent. The base is a cold near-black, `#0A0B0D`.
Exactly one saturated colour exists, ember (`#FF5C2B` on dark, `#B63C1A` on
light), and it is spent only on things that are live or actionable: the masthead
status dot, the active tab underline, numbered-list markers, bullet dots, the
one live node in a diagram. A page that uses ember for decoration has spent the
site's only unit of emphasis on nothing.

Depth is a lighter surface plus a hairline along its top edge. Drop shadows,
outer glows and neon are not used anywhere.

Dark is canonical rather than alternative. The dark values live on `:root`, and
`[data-theme="light"]` overrides them. Light is fully supported and
contrast-tested, it is just not the origin of the palette. Default follows
`prefers-color-scheme`; the toggle overrides and persists.

The whole system is expressed as `--tr-*` custom properties in
`src/app/globals.css`, so a page composes tokens instead of choosing values.

## Consequences

**A new page has very few design decisions left in it.** Pick the font by who is
speaking, pick surfaces from the token scale, and if nothing on the page is live
then nothing on the page is ember. This is the point of the concept and the main
thing it bought.

**The fourteen bespoke project pages were deleted.** Every project now renders
through `ProjectDetail` (the dossier) or, if listed in `SHOWCASE_PROJECTS`,
`ProjectShowcase` (the tabbed variant). Per-project visual identity is now
carried by the hero artwork alone, which is why the illustration set in
`public/projects/` is dark-native. Real screenshots and video frames are kept
bright on purpose, as lit plates against the dark page.

**Ember discipline is the part that decays.** It is a rule about meaning, and no
tool can tell that a dot is decorative rather than live. It has to be held in
review.

**Contrast became a property of the token layer rather than of each page.** Every
text and surface pair in both themes is measured once, in one file, and asserted
by a test. A page cannot fail contrast without a token failing first.

**Two routes were left behind.** `/projects/[id]` and `/fde` were not ported to
the token classes and still run on the older editorial CSS. See ADR 0002.

## Compliance

`src/lib/tokens.test.ts` parses the real `src/app/globals.css` and fails the
build when the design system regresses. It asserts that every required token is
present in both themes, that every value is a six-digit hex, that dark and light
are actually different palettes, and that each text-on-surface pair clears the
WCAG AA ratio of 4.5:1.

Two of its cases guard Tailwind traps that have each cost real debugging time:
`text-[var(--tr-t-*)]` is silently dropped by Tailwind when the token is a font
size (it must be written `text-[length:var(--tr-t-*)]`), and a hardcoded numeric
line height bypasses the `--tr-lh-*` scale. Both are caught by scanning source
files, not by inspecting rendered output.

Ember usage, the depth rule, and the serif/mono split are not machine-checkable
and are not claimed to be.

## Notes

This supersedes the editorial magazine concept of 2026-05-24 as the site's
visual language. The CSS from that era is still shipping on two routes, under a
different decision and with a stated retirement condition: ADR 0002.

Fonts are loaded through `next/font/google` with no `weight` array, because both
families are variable fonts and listing weights pins them to static instances.
Geist was removed on 2026-08-16 (`d22b929`); the concept calls for two families
and there were three.
