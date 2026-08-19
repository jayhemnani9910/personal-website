# 0004. Retire the ReactFlow architecture visualiser

- **Status:** Accepted
- **Date:** 2026-08-16
- **Commits:** `76ffec2` (components deleted), `b41e5e4` (dependency dropped)

## Context

`ProjectSchema` carried an optional `architecture` field holding a structured
graph: an array of typed nodes, an array of edges, an optional description and
an optional legend. `src/components/ArchitectureVisualizer.tsx` rendered it with
ReactFlow, and `src/components/architectureColors.ts` assigned each node type a
hue.

The idea was that any project could describe its own architecture in frontmatter
and get an interactive diagram.

Two things were true about it by August 2026.

No project ever supplied the field. Not one of the twenty-seven MDX files under
`content/projects/` contained an `architecture` block, across roughly six months
and three redesigns. The component had rendered for a real project zero times.

And the colour scheme contradicted ADR 0001. `architectureColors.ts` encoded
node type as hue, which is the opposite of the ember-only rule: a diagram in
which six things are six different saturated colours has no way to say which one
is live.

ReactFlow itself was a substantial dependency, pulled in for a component with no
callers.

Meanwhile `/fde` did have a real architecture diagram, `FdeArchDiagram`, drawn
by hand in about 250 lines of SVG and JSX. It encodes node type by neutral
surface tier plus a mono label, and spends ember on the single live node, which
is what ADR 0001 asks for. It reads well on both themes and needs no runtime
graph library.

## Decision

Delete the visualiser, the colour module and the structured schema field.

Architecture prose stays. `deepDive.architecture` remains on `ProjectSchema` as
a plain string, which is what projects actually use, and it renders as MDX prose
like the rest of the deep dive.

Where a project does need a diagram, draw it by hand as a component, the
way `FdeArchDiagram` is drawn. A hand-drawn diagram is more work per diagram and
produces a better one: it can be composed for the specific idea being explained
rather than laid out by a generic graph engine, and it obeys the design system
because a person applied the design system to it.

Removing ReactFlow took 51 packages out of the tree.

## Consequences

**Every project that wants a diagram now costs a component.** This is the real
downside. The visualiser promised that a diagram was a frontmatter block, and
nothing replaces that promise. The counter-argument is that the promise went
unused for six months, so it was not costing anyone a diagram they would
otherwise have made.

**Node colour is no longer a per-project decision.** ADR 0001's ember rule
applies to diagrams the same as to anything else, because there is no longer a
module handing out hues.

**The dependency tree got smaller and the audit got cleaner.** Dropping
ReactFlow was the trigger for an `npm audit fix` pass in the same commit that
took the tree from ten advisories, one critical and seven high, to zero.

**Removing the schema field is a breaking change to the content format that
broke nothing**, because nothing used it. If a future project supplies an
`architecture` frontmatter block, Zod will reject the unknown key at build time
rather than silently ignoring it, which is the correct failure.

## Compliance

`src/lib/definitions.ts` is the enforcement: the field is not in the schema, so
supplying it fails the content parse at build time.

Nothing prevents a new graph-rendering dependency being added later. That is a
review-time judgment, and this record exists to inform it.

## Notes

`src/components/Parallax.tsx` was deleted in the same commit for the same reason
(no importers). The motion kit's parallax lives in `src/components/motion/`
and is unaffected.

`src/lib/motion.ts` and `src/lib/cn.ts` were removed earlier on the same
grounds. None of these should be reintroduced by reference: components import
`framer-motion` directly, and class names are composed inline.
