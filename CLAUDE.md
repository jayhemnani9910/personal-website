# CLAUDE.md - AI Assistant Guide

> Personal portfolio website for Jay Hemnani, a Data Engineer. Built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4.

## Quick Reference

```bash
# Development
npm run dev          # Start dev server (localhost:3000)
npm run build        # Build static export to docs/
npm run lint         # Run ESLint
npm run test         # Run Vitest tests
```

## Project Overview

This is a **statically exported** portfolio site deployed to GitHub Pages. The site showcases projects, experience, and blog posts with a dark "void" theme and smooth animations.

**Live URL**: https://jeyhemnani.com
**Deployment**: GitHub Pages (static export to `docs/` directory)

## Architecture

```
personal-website/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Home page (main landing)
│   │   ├── layout.tsx          # Root layout with metadata
│   │   ├── globals.css         # CSS variables & utilities
│   │   ├── blog/               # Blog routes
│   │   │   ├── page.tsx        # Blog listing
│   │   │   └── [slug]/page.tsx # Individual blog posts
│   │   ├── projects/           # Project routes
│   │   │   ├── page.tsx        # Projects listing
│   │   │   └── [id]/page.tsx   # Individual project pages
│   │   └── personal/page.tsx   # Personal/about page
│   ├── components/             # React components
│   ├── lib/                    # Utilities & helpers
│   │   ├── content.ts          # MDX content loading
│   │   ├── definitions.ts      # Zod schemas for content
│   │   ├── utils.ts            # cn() classname helper
│   │   ├── motion-tokens.ts    # Animation constants
│   │   └── motion.ts           # Framer Motion utilities
│   ├── hooks/                  # Custom React hooks
│   ├── context/                # React contexts
│   └── data/                   # Static data files
│       ├── resume.ts           # Resume/CV data
│       ├── profile.ts          # Hero content, social links
│       └── types.ts            # TypeScript interfaces
├── content/                    # MDX content (editable)
│   ├── site.ts                 # Site-wide config (name, URL, nav)
│   ├── projects/*.mdx          # Project case studies
│   ├── blog/*.mdx              # Blog posts
│   ├── testimonials.ts         # Testimonials data
│   └── lab.ts                  # Lab/experiments section
├── public/                     # Static assets
├── docs/                       # Build output (GitHub Pages)
└── v1-old-site/               # Legacy site (archived)
```

## Technology Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router, static export) |
| UI | React 19 |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4, CSS Variables |
| Animation | Framer Motion, Lenis (smooth scroll) |
| Content | MDX + gray-matter, Zod validation |
| Testing | Vitest + Testing Library |
| Linting | ESLint 9 + eslint-config-next |

## Key Conventions

### Path Aliases
- Use `@/` for imports from `src/` directory
- Example: `import { cn } from "@/lib/utils"`

### Component Patterns
- **Server Components**: Default for pages, use for data fetching
- **Client Components**: Mark with `"use client"` when needed (interactivity, hooks)
- **Accessibility**: Always include `aria-label` on icon-only buttons
- **Reduced Motion**: Respect `prefers-reduced-motion` (check `ClientLayout.tsx`)

### Styling
- Use Tailwind utilities primarily
- CSS custom properties defined in `globals.css` (`:root`)
- Key color tokens:
  - `--bg-void`, `--bg-abyss`, `--bg-surface` (backgrounds)
  - `--text-primary`, `--text-secondary`, `--text-muted` (typography)
  - `--neon-cyan`, `--neon-purple`, `--neon-blue` (accents)
- Glass effects: `.glass-panel`, `.glass-card`, `.spotlight-card`
- Use `cn()` helper for conditional classnames: `cn("base-class", condition && "conditional-class")`

### Content Management

#### Adding a Project
Create `content/projects/<slug>.mdx`:
```mdx
---
title: "Project Name"
summary: "One-line summary"
role: "Your Role"
tags: ["tag1", "tag2"]
tech: ["Tech1", "Tech2"]
challenge: "The problem statement"
solution:
  - "Solution point 1"
  - "Solution point 2"
impact:
  - "Impact metric 1"
  - "Impact metric 2"
featured: true          # Optional: show on home
priority: 1             # Optional: sort order
links:                  # Optional
  github: "https://..."
  demo: "https://..."
---
# Overview
Project details in markdown...
```

#### Adding a Blog Post
Create `content/blog/<slug>.mdx`:
```mdx
---
title: "Post Title"
date: "2024-01-15"
summary: "Brief summary"
tags: ["tag1"]
category: "engineering"  # engineering | data | thoughts | tutorials
featured: false
draft: false
---
Post content...
```

#### Updating Site Config
Edit `content/site.ts` for:
- Site name, title, description, URL
- Navigation links
- Social links
- Hero content

### Animation Tokens
Import from `@/lib/motion-tokens.ts`:
```typescript
import { TRANSITIONS, VARIANTS } from "@/lib/motion-tokens"

// Use in Framer Motion components
<motion.div
  variants={VARIANTS.fadeInUp}
  transition={TRANSITIONS.smooth}
/>
```

## Development Workflow

### Local Development
```bash
npm install          # Install dependencies
npm run dev          # Start at localhost:3000
```

### Before Committing
```bash
npm run lint         # Check for ESLint errors
npm run test         # Run tests
npm run build        # Verify static export
```

### Deployment
1. Build generates static files in `docs/`
2. Push to main branch
3. GitHub Pages serves from `docs/` directory

### Static Export Notes
- No Server Actions (contact uses `mailto:` links)
- Images must use `unoptimized: true`
- Dynamic routes are pre-rendered at build time
- `trailingSlash: true` required for GitHub Pages

## File Locations for Common Tasks

| Task | File(s) |
|------|---------|
| Update personal info | `content/site.ts`, `src/data/profile.ts` |
| Update resume | `src/data/resume.ts` |
| Add project | `content/projects/<slug>.mdx` |
| Add blog post | `content/blog/<slug>.mdx` |
| Update testimonials | `content/testimonials.ts` |
| Modify navigation | `content/site.ts` (`navLinks`) |
| Change colors/theme | `src/app/globals.css` |
| Add component | `src/components/` |
| Add utility function | `src/lib/` |
| Add custom hook | `src/hooks/` |

## Testing

```bash
npm run test         # Run all tests
npm run test -- --watch  # Watch mode
```

Tests use:
- **Vitest** as test runner
- **Testing Library** for component tests
- **jsdom** environment

Example test pattern (see `src/hooks/useMousePosition.test.tsx`):
```typescript
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
```

## ESLint Configuration

ESLint 9 flat config in `eslint.config.mjs`:
- Extends `eslint-config-next/core-web-vitals` and `typescript`
- Ignores: `.next/`, `out/`, `build/`, `v1-old-site/`, `docs/`

## Important Constraints

1. **Static Export**: No server-side features. No `getServerSideProps`, no Server Actions, no API routes with runtime logic.

2. **GitHub Pages**: Build output goes to `docs/` directory. CNAME file must be preserved.

3. **Accessibility**: Maintain focus styles, skip links, ARIA labels, and reduced motion support.

4. **Content Validation**: All MDX frontmatter is validated with Zod schemas in `src/lib/definitions.ts`.

## Ignored Directories

- `v1-old-site/` - Legacy site archive (do not modify)
- `docs/` - Generated output (do not edit manually)
- `node_modules/` - Dependencies
- `.next/` - Next.js build cache
