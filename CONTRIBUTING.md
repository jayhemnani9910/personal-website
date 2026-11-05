# Contributing

This is my personal site, so the content and design are mine to decide. Bug
reports and fixes are welcome: broken pages, layout bugs, accessibility
problems, typos, failing tests.

I try to reply to issues within a few days.

## Setup

Node 24 is required (`engine-strict` is on).

```sh
nvm use 24
npm ci
npm run dev          # http://localhost:3000
```

No environment variables are needed. `.env.example` lists the optional ones.

## Before you open a PR

```sh
npm run lint
npm run typecheck
npm test             # resume-pdf.test.ts needs pdftotext (poppler-utils)
npm run build
```

CI runs these plus `npm audit` and the performance budget. If you change how a
page looks, `npm run test:visual` compares screenshots against the committed
baselines.

Read [`docs/adr/`](docs/adr/README.md) before changing the design, the palette,
the AI routes or the test setup.

## Branches and PRs

Branch from `main`, keep one change per PR, and say what you changed and how
you checked it. Don't edit the résumé PDFs or the writing in `content/`; open
an issue instead.

## Bug reports

Open an issue with the page URL, what you did, what you expected, what
happened, and your browser and OS. A screenshot helps for layout bugs.
