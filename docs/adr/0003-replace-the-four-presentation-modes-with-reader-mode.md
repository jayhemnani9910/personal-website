# 0003. Replace the four presentation modes with reader mode

- **Status:** Accepted
- **Date:** 2026-07-16
- **Commit:** `60cc059`
- **Related:** ADR 0001

## Context

The WebMCP tool surface (`src/lib/webmcp.ts`) exposed a `switch_mode` tool
described as switching "the site's presentation mode between portfolio, brand,
product, and blog views", with those four values in its enum and a description
for each:

- `portfolio`: recruiter-focused, resume-heavy view
- `brand`: personal brand showcase with motion effects
- `product`: landing page, conversion-focused view
- `blog`: writing hub, content-focused view

The handler wrote `site-mode` to `localStorage`, dispatched a synthetic
`StorageEvent`, and returned a confirmation naming the mode.

Nothing read it. A search of the pre-rebuild tree for `site-mode` returns
exactly one file, `webmcp.ts` itself, the file that writes it. No component, no
layout, no stylesheet consumed the value. All four modes rendered the identical
page.

This mattered more than an ordinary unused feature would, because the tool was
being advertised to agents. An agent calling `switch_mode` received a success
response describing a change that had not happened. The site was reporting
capability it did not have to the one audience that cannot check.

## Decision

Delete the four modes. Keep the tool, give it two real values, and make it drive
something that already exists.

`switch_mode` now takes `["reader", "default"]`. Reader mode sets
`data-reader="on"` on `<html>`, persists to `localStorage`, and dispatches a
`readermodechange` event.

The important half is that reader mode does not get its own code path. The
shared hook `usePrefersReducedMotion()` returns true when the OS reports
`prefers-reduced-motion: reduce` **or** when `data-reader="on"` is set:

```ts
function getSnapshot() {
  return (
    window.matchMedia(QUERY).matches ||
    document.documentElement.dataset.reader === "on"
  );
}
```

Every motion primitive in `src/components/motion/` already reads that hook, and
so does the Lenis smooth-scroll wrapper. Reader mode therefore reuses the entire
reduced-motion path: preloader, cursor reticle, magnetic hover, reveals,
staggers, parallax and smooth scroll all drop to their static branch, because
they were already written to do that for accessibility reasons.

`src/components/ReaderMode.tsx` applies the persisted state on load and syncs it
across tabs via the `storage` event. It renders nothing.

## Consequences

**The tool does what it says.** An agent that calls `switch_mode` with `reader`
produces a visibly different page, and the confirmation it gets back is true.

**Reader mode cost close to nothing to build.** The static rendering already
existed and was already tested by the reduced-motion work. Adding a second way
to turn it on was an attribute and one boolean in one hook.

**One signal, not two.** A future motion primitive that reads
`usePrefersReducedMotion()` supports reader mode automatically. There is no way
to support reduced motion and forget reader mode, because they are the same
branch.

**The WebMCP tool count changed**, and that count is interpolated into the
masthead, the showcase note, `WebMCPFigure` and `fdeData`. See Compliance.

**Three modes of intent were dropped and not replaced.** If a recruiter-focused
view is ever wanted, it is a new decision and a new record, built as a real
route rather than a `localStorage` key nothing reads.

## Compliance

`src/lib/webmcp.test.ts` is the guard. It asserts that `WEBMCP_TOOL_NAMES`
matches the actual `registerTool` calls in names and order, that the count
matches, that there are no duplicates, and that `content/projects/webmcp-portfolio.mdx`
quotes the same number the code registers.

`WEBMCP_TOOL_NAMES` and `WEBMCP_TOOL_COUNT` are the single source of truth for
the count. Every place the number appears in the UI interpolates
`WEBMCP_TOOL_COUNT` rather than writing a literal. Two hardcoded literals were
found on the home page on 2026-08-17 and replaced; the test now covers the MDX
copy as well.

Reader mode's effect on motion is not asserted by a test. It is enforced
structurally instead, by there being only one hook to read.

## Notes

The description in `content/projects/webmcp-portfolio.mdx` still refers to the
"presentation-mode switch" as one of the two side-effecting tools. That phrasing
predates this decision and describes reader mode correctly enough, since the
tool name did not change.
