# jayhemnani.in

Source for [jayhemnani.in](https://jayhemnani.in), Jay Hemnani's portfolio: the
project catalogue, writing, résumé, YouTube channel page, and the `/fde` page
with its live scoping simulation.

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4. Content is MDX.
Hosted on Vercel.

## Run it

Node 24 is required (`engine-strict` is on, so npm refuses other versions).

```sh
nvm use 24
npm ci
npm run dev          # http://localhost:3000
```

The site runs with no environment variables. Without them the AI features fall
back to saved examples, and the view counter and guestbook keep what they get in memory.

## Environment

Put local values in `.env.local` (gitignored).

| Variable | Used by | Without it |
|---|---|---|
| `GEMINI_API_KEY` | `/api/fde-sim` | The route says no model is available and `/fde` keeps its presets |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (or the older `KV_REST_API_URL`, `KV_REST_API_TOKEN`) | View counts, the home page guestbook, rate limits, the daily model budget, FDE metrics | Views and guestbook notes are kept in memory; rate limits, the budget and metrics are off |
| `FDE_EVAL_ENDPOINT` | `npm run eval:fde` | Defaults to the production `/api/fde-sim` |
| `FDE_EVAL_DATE` | `npm run eval:fde:update` | The recorded baseline says `unset` |

## Check it

```sh
npm run lint         # ESLint, fails on any warning
npm run typecheck    # route types, then tsc
npm test             # unit and component tests (Vitest)
npm run build
npm run test:perf    # bundle and first-paint budgets (Playwright)
npm run test:visual  # screenshot comparison (Playwright)
npm run eval:fde     # live quality check of the simulation against the golden set
```

CI (`.github/workflows/ci.yml`) runs lint, typecheck, tests, build, the perf
budget and `npm audit` on every push and pull request. `eval:fde` calls the
model, so it only runs by hand.

## Layout

| Path | What is there |
|---|---|
| `content/projects/*.mdx` | One file per project: frontmatter for the catalogue, body for the write-up |
| `content/blog/*.mdx` | Posts |
| `content/site.ts` | Name, links and handles used across the site |
| `src/data/` | Home, résumé, lab and YouTube data |
| `src/app/` | Routes, API routes, metadata, sitemap |
| `src/components/` | UI, grouped by page (`home-desk/`, `fde/`, `project/`) |
| `src/lib/` | Content loading, schemas, the AI prompts and their guards, rate limits |
| `scripts/fetch-youtube.mjs` | Refreshes `src/data/youtube.json` (needs the owner's OAuth token) |
| `tests/` | Playwright suites (visual, perf) and the eval golden set |
| `docs/adr/` | Architecture decision records: why the site is built the way it is |

## Decisions

The reasoning behind the design, the palette, the AI routes and the test setup
is in [`docs/adr/`](docs/adr/README.md). Read the index before changing any of
them.
