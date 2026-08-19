# Architecture decision records

Each file here records one decision that shaped this site, why it was made, and
what it cost. The format follows Richards and Ford, *Fundamentals of Software
Architecture*, chapter 21: Title, Status, Context, Decision, Consequences,
Compliance, Notes.

## Why these exist

The decisions were already written down, in prose, in `CLAUDE.md`. That file is
not tracked in this repo any more, it has no dates, nothing in it can be marked
superseded, and it had already drifted: it listed four test files by name and
three of them no longer existed. Undated prose in one growing file is the
failure mode ADRs were invented for.

`CLAUDE.md` now describes how to work on the code. Decisions and their
reasoning live here.

## Status values

- **Proposed**: written down, not yet acted on.
- **Accepted**: in force. The code matches it.
- **Superseded**: replaced. The record links forward to whatever replaced it,
  and that record links back.

A record is never edited to say something different from what was decided. If
the decision changes, write a new record and mark the old one superseded.

## Compliance

Where a decision can be checked by a machine, the Compliance section names the
test that checks it. Those tests are fitness functions in Richards and Ford's
sense: they fail the build when the architecture drifts, rather than waiting for
someone to notice in review. Where a decision cannot be checked automatically,
the Compliance section says so plainly instead of implying a guard that is not
there.

## Index

| # | Title | Status | Date |
|---|-------|--------|------|
| [0001](0001-two-readers-as-the-single-design-concept.md) | TWO READERS as the single design concept | Accepted | 2026-07-16 |
| [0002](0002-keep-the-legacy-editorial-css-behind-a-token-override.md) | Keep the legacy editorial CSS behind a scoped token override | Accepted | 2026-07-16 |
| [0003](0003-replace-the-four-presentation-modes-with-reader-mode.md) | Replace the four presentation modes with reader mode | Accepted | 2026-07-16 |
| [0004](0004-retire-the-reactflow-architecture-visualiser.md) | Retire the ReactFlow architecture visualiser | Accepted | 2026-08-16 |
| [0005](0005-require-node-24.md) | Require Node 24 | Accepted | 2026-08-16 |
| [0006](0006-pixel-exact-visual-regression-for-the-legacy-routes.md) | Pixel-exact visual regression for the legacy routes | Accepted | 2026-08-19 |

## Adding one

Copy the structure of any existing record. Number it with the next integer,
name the file `NNNN-kebab-case-title.md`, and add a row to the table above.
