# 0016. Split accent-ink from accent for readable yellow

- **Status:** Accepted
- **Date:** 2026-09-06

## Context

ADR 0015 shipped the comp's palette verbatim and recorded, rather than enforced,
the contrast of every token pair. Fifteen pairs landed below AA and were signed
off. Three of them are `accent` used as text in light: `#B08F00` measures 2.84:1
on the light background. That was acceptable while the accent was only ever a
fill, carrying `--tr-on-accent` on top of it.

The home page's work table then needed the opposite. Its five column headers are
the key to reading every row beneath them, and they were set in
`--tr-text-faint` at 10.5px, which measures 3.39:1 in dark and 2.90:1 in light.
Jay's report was that the eye slid straight past them, which the numbers agree
with. The obvious fix, and the one he asked for, is to colour them with the
accent yellow. In dark that is 13.44:1 and an improvement of four times. In
light the same move would have taken them from 2.90:1 to 2.84:1, which is worse
than the problem.

One token cannot be both a fill tuned for a near-black label and text that has
to be legible on a near-white page.

## Decision

Add `--tr-accent-ink`, the accent as letterforms, alongside `--tr-accent`, the
accent as a fill.

In dark the two hold the same yellow, `#F4D53A`, because a fill that reads at
13.44:1 already works as text. In light `--tr-accent-ink` is `#7A6200`, the
darker gold this palette used before the comp lightened it, measuring 5.38:1 on
the background, 5.87:1 on surface-1 and 4.96:1 on surface-2.

Both themes clear AA, so the token does not join the sub-AA list ADR 0015 froze
at fifteen entries. `accent-ink` is added to `TEXT_TOKENS` in
`src/lib/tokens.test.ts` and its six ratios are recorded there. That is not
optional bookkeeping: the entire reason the token exists is a contrast one, so
leaving it unmeasured would make the split decorative and let a future palette
edit quietly undo it.

Use `--tr-accent` for fills, borders and rules. Use `--tr-accent-ink` anywhere
the accent has to be read as words.

## Consequences

The work table's column headers are accent-coloured in both themes and legible
in both, and the rule beneath the header row is `--tr-accent`, so the section
still reads as marked out for anyone who cannot separate the hue from the text
colour around it.

There are now two accent tokens, and picking the wrong one is a mistake the type
system cannot catch. The naming carries the whole distinction, which is why
`ink` is in the name rather than a number or a shade.

`0015`'s claim that the palette is the comp's verbatim is now narrower: the
light accent has a second value that the comp did not specify, chosen to clear
AA rather than to match.

## Compliance

`src/lib/tokens.test.ts` parses the real `globals.css`, requires `accent-ink` in
both palettes, and pins all six of its ratios. Changing either value without
updating the recorded numbers fails the suite. The same file still asserts the
sub-AA list is exactly the fifteen pairs 0015 signed off, so adding a sixteenth
by accident also fails.
