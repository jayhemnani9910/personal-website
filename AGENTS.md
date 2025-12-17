# Repository Guidelines

## Project Overview
This repo contains a Next.js (App Router) personal website that is **statically exported** for GitHub Pages (`output: "export"` in `next.config.ts`). Keep changes compatible with static hosting (avoid API routes, Server Actions, and other server-only/runtime features).

## Project Structure & Module Organization
- `src/app/`: Route files (`page.tsx`, `layout.tsx`, dynamic routes like `projects/[id]`).
- `src/components/`: Reusable UI components.
- `src/hooks/`: Custom React hooks (tests live alongside source when present).
- `src/lib/`: Shared utilities (content loader, schemas, motion tokens).
- `content/`: Content sources (MDX/TS), e.g. `content/projects/*.mdx`, `content/blog/*.mdx`.
- `public/`: Static assets served at the site root.
- Build output: `.next/` and `out/` are generated locally; `docs/` contains a committed static build for Pages—don’t hand-edit it unless you’re preparing a deploy.

## Build, Test, and Development Commands
Prereq: **Node >= 20.9.0**.
- `npm ci`: Install dependencies from `package-lock.json`.
- `npm run dev`: Start local dev server.
- `npm run build`: Generate the static export into `out/`.
- `npm run lint`: Run ESLint (Next core-web-vitals + TypeScript rules).
- `npm test`: Run Vitest (watch mode).
- `npm test -- run`: Run tests once (CI-style).

Preview the export locally: `python3 -m http.server --directory out 3000`.

## Coding Style & Naming Conventions
- TypeScript + React functional components; keep Server Components by default and add `'use client'` only when needed.
- Prefer `@/*` imports (configured in `tsconfig.json`).
- Use Tailwind CSS utilities; use `cn()` from `src/lib/utils.ts` to compose `className`.
- Naming: components `PascalCase.tsx`, hooks `useThing.ts`, content slugs `kebab-case.mdx` (slug == filename).
- Content frontmatter is validated by Zod in `src/lib/definitions.ts`; keep required fields present and typed.

## Commit & Pull Request Guidelines
- Commits in this repo use short, descriptive sentences (no strict Conventional Commits).
- PRs should include: a brief summary + rationale, screenshots for UI changes, and a note confirming `npm run lint`, `npm test -- run`, and `npm run build` pass.
- For GitHub Pages under a subpath, build with `NEXT_PUBLIC_BASE_PATH="/<repo>" npm run build`.
