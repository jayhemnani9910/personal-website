# Personal Website

[![Live](https://img.shields.io/badge/Live-jayhemnani.me-2ea44f?style=for-the-badge)](https://jayhemnani.me)

Portfolio website built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Projects** — 25+ projects with detailed case studies
- **Lab** — Experimental builds and prototypes
- **Blog** — Technical writing
- **Resume** — Role-specific PDFs (Data Engineer, ML, SWE, Analyst)

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- MDX for content
- Deployed on GitHub Pages

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Structure

```
src/
├── app/           # Pages (projects, blog, resume, lab)
├── components/    # Reusable UI components
├── content/       # MDX project files
├── data/          # Static data (projects, experience)
└── lib/           # Utilities
```

## Deployment

```bash
npm run build
npm run deploy
```

Deploys to GitHub Pages via `gh-pages` branch.

---

[jayhemnani.me](https://jayhemnani.me)
