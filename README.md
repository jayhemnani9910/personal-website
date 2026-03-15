<div align="center">

# jayhemnani.me

**Data engineer's portfolio — 26 projects, interactive case studies, and a terminal easter egg.**

[![Live Site](https://img.shields.io/badge/Live-jayhemnani.me-0a84ff?style=for-the-badge&logo=safari&logoColor=white)](https://jayhemnani.me)
[![Lint](https://img.shields.io/badge/Lint-0_issues-16a34a?style=for-the-badge&logo=eslint&logoColor=white)](#)
[![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)

</div>

---

## What's Inside

| Feature | Description |
|---------|-------------|
| **Projects** | 26 projects with custom interactive detail pages — live visualizations, architecture diagrams, animated pipelines |
| **Lab** | Experiments in progress — what I'm building, exploring, and watching |
| **Blog** | Technical writing in MDX |
| **Resume** | 4 role-targeted PDFs (Data Engineer, ML, SWE, Analyst) with inline preview |
| **Terminal** | Hidden terminal overlay — try `help`, `ls`, `cat skills.json`, or `sudo rm -rf /` |
| **WebMCP** | AI agents can query this portfolio via the W3C WebMCP API (Chrome 146+) |

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router, static export) |
| Language | TypeScript, React 19 |
| Styling | Tailwind CSS 4, CSS custom properties (light/dark) |
| Animation | Framer Motion (centralized tokens in `lib/motion.ts`) |
| Content | MDX + gray-matter, validated by Zod schemas |
| Diagrams | ReactFlow (architecture), Recharts (skills radar) |
| Hosting | GitHub Pages via GitHub Actions |

## Project Structure

```
src/
  app/             Routes — /, /projects, /blog, /lab, /resume
  components/      40+ UI components
  components/projects/   25 custom project detail pages
  context/         Theme + Terminal providers
  lib/             Content loader, Zod schemas, motion tokens, scroll utils
  data/            Resume, profile, navigation, timeline, coursework
content/
  projects/*.mdx   26 project files (frontmatter + MDX body)
  blog/*.mdx       Blog posts
  site.ts          Site-wide config
docs/
  *.d2 / *.svg     Architecture diagrams (system, data flow, modules)
```

## Quick Start

```bash
npm ci
npm run dev        # localhost:3000
npm run build      # Static export to out/
npm run lint       # ESLint (0 issues)
npm test -- run    # Vitest
```

## Architecture

Three D2 diagrams document the system:

- [`docs/architecture.d2`](docs/architecture.d2) — High-level components, contexts, and data flow
- [`docs/data-flow.d2`](docs/data-flow.d2) — Content pipeline: MDX files → Zod validation → static pages
- [`docs/modules.d2`](docs/modules.d2) — Module dependency graph across all layers

## How Content Works

1. Write project/blog content as `.mdx` files in `content/`
2. Frontmatter is validated against Zod schemas at build time
3. `generateStaticParams()` creates routes for every content file
4. Custom project pages register in `CUSTOM_PROJECT_PAGES` map for rich, interactive detail views
5. Static export produces `out/` — pure HTML + JS, no server required

---

<div align="center">

**[jayhemnani.me](https://jayhemnani.me)**

</div>
