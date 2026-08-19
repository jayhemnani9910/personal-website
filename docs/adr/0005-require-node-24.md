# 0005. Require Node 24

- **Status:** Accepted
- **Date:** 2026-08-16
- **Commit:** `eb30ecb` Pin Node to 24 for local and Vercel

## Context

Nothing pinned the runtime. `package.json` had no `engines` field, `vercel.json`
set no Node version, so Vercel picked its own default while local development
ran v20.20.0. Code was written and tested on one version and deployed on
another, and nothing anywhere recorded which version was intended.

`CLAUDE.md` did claim a floor of 20.9.0, but that was prose in a file nothing
reads at build time, and it was wrong by then: Node 20 reached end of life in
April 2026.

## Decision

Require Node 24, and state it in the two places that are read by the two sides.

- `package.json` → `"engines": { "node": ">=24.0.0" }` pins the deploy side.
- `.nvmrc` → `24` pins the local side, so `nvm use` in the repo picks it up.

Node 24 was chosen over writing down the old floor because it is the current LTS
and was already Vercel's default. Making both sides agree therefore did not move
production; it recorded where production already was.

`package-lock.json` is untouched by this. `engines` is metadata and does not
affect dependency resolution.

## Consequences

**Local, CI and Vercel now run the same major.** A behaviour difference between
`npm run build` on a laptop and a Vercel build is now a real bug rather than an
expected consequence of an unpinned runtime.

**A contributor on Node 20 gets a clear failure** from `npm ci` rather than a
subtle one later.

**`@types/node` is tied to this decision.** It was moved to 24.13.3 and
deliberately not to 26 (`d806d20`), because that package's major tracks the Node
major. Typing against 26 while running 24 would let code compile against APIs
the runtime does not have. Raising the Node floor in future means raising
`@types/node` with it, and not before.

**The floor will go stale the same way the last one did.** Node 24 leaves LTS
eventually and this record will be the thing that has to be superseded. That is
the intended mechanism: a numbered record with a date is visible when it ages,
where a line in a prose file was not.

## Compliance

Three places enforce it, and one of them is the reason this is more than a
comment:

- `package.json` `engines` makes `npm ci` fail on an older Node.
- `.github/workflows/ci.yml` uses `node-version-file: .nvmrc`, so CI reads the
  same file a developer's `nvm use` reads. There is no second place to update.
- Vercel reads `engines` for the build image.

## Notes

Verified at the time on Node 24.13.0: clean `npm ci`, zero npm advisories,
typecheck clean, lint clean, and a full build of all 44 pages.

Related dependency decisions taken in the same window, recorded here rather than
as separate ADRs because they are pins rather than architecture:

- **TypeScript stays on 6**, not 7. `typescript-eslint` refuses to load against
  TS 7.0 and tracks support for >=7.1 in its issue 10940. TS 7 built and tested
  fine, but it takes lint down.
- **ESLint stays on 9.** ESLint 10 crashes loading `react/display-name`, because
  the `eslint-plugin-react` bundled inside `eslint-config-next` calls
  `contextOrFilename.getFilename`, which ESLint 10 removed. Upstream.
- **`lucide-react` stays on 0.554.0.** v1 removed brand icons, leaving no GitHub
  mark, only a generic `GitBranch` and `GitFork`. That icon is the repo link on
  every `/lab` card, so Jay chose no visual change over a stable major.
