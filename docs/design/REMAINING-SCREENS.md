# The other five v4 screens

Only `portfolio-home/` is saved locally, because it is the one being built.
The rest of the project stays remote on purpose. Fetching them is one tool call
each.

## Why they are not in this directory

`DesignSync get_file` returns the file as a JSON-escaped string in the tool
result, inline, not as a path on disk. There is no download that writes a file.
Saving one therefore means an agent retyping 15 to 25 KB of escaped HTML, and a
design spec that is 99.9% right is worse than no local copy: a later session
would build against it and trust it. So they are fetched on demand instead.

## How to fetch one

Project: `0ee106df-cea7-4359-b36f-67e113c83147`
(`https://claude.ai/design/p/0ee106df-cea7-4359-b36f-67e113c83147`)

Call `DesignSync` with `method: "get_file"`, that `projectId`, and one of these
paths:

| Path | Screen | Repo files it maps to |
|---|---|---|
| `About.dc.html` | About / Résumé | `src/data/resume.ts`, `src/app/resume/page.tsx` |
| `Channel.dc.html` | YouTube channel | `src/data/youtube.json`, `src/lib/youtube.ts`, `src/lib/youtube-copy.ts` |
| `Current Home.dc.html` | Baseline recreation of the pre-v4 home | `src/components/EditorialHome.tsx` and its neighbours |
| `Project Detail.dc.html` | One project (FIFA) | `content/projects/fifa-soccer-ds.mdx`, `src/lib/showcase.ts` |
| `Work Index.dc.html` | Filterable project index | `content/projects/*.mdx`, `src/lib/content.ts` |
| `Writing.dc.html` | Blog index | `content/blog/*.mdx`, `src/app/blog/page.tsx` |

`github.md` in this directory is the designer's own screen-to-repo map and is
already saved. `support.js` under `portfolio-home/` is the generated dc-runtime
and is reference only.

`public/projects/fifa/*.jpg` and `src/data/youtube.json` in the project are
copies of files that already exist in this repo. Do not fetch those.

## Reading a `.dc.html`

Template first, then the class. Everything between `<x-dc>` and `</x-dc>` is
markup with `{{ binding }}` slots, and `<sc-for list="{{ xs }}" as="x">` is a
loop. The `<script data-dc-script>` block holds the data arrays, the behaviour,
and `renderVals()`, which computes every binding from `state`. Read
`renderVals()` first: it carries the responsive breakpoints, the hover states
and the colours in one place.

Two things every screen shares and that the port has to change: the design's
`--fa` and its light-mode `--ac`, `--ok` and `--fa` fail WCAG AA, and the copy
uses em-dashes in roughly twenty places per screen. ADR 0014 lists the corrected
colour values.
