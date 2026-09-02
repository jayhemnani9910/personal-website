repo: jayhemnani9910/personal-website
branch: main

## Last sync
date: 2026-09-01T19:15:22Z

### Updated in this project
- Full redesign across six screens: Home, Work Index, Project Detail, Writing, About, Channel
- Copied FIFA before/after frames and `src/data/youtube.json` for the Channel page
- Baseline recreation of the current home kept as `Current Home.dc.html`

## Screen map
| Screen | Repo files |
| --- | --- |
| Current Home.dc.html | src/app/page.tsx, src/app/layout.tsx, src/components/ClientLayout.tsx, src/components/EditorialHome.tsx, src/components/EditorialMasthead.tsx, src/components/EditorialColophon.tsx, src/components/motion/DecompositionScene.tsx, src/components/Buddy.tsx, src/components/featured/*.tsx, src/app/globals.css, src/lib/webmcp.ts |
| Portfolio Home.dc.html | content/site.ts, src/data/resume.ts, src/lib/webmcp.ts, src/lib/showcase.ts, content/projects/*.mdx (frontmatter), src/components/Buddy.tsx |
| Work Index.dc.html | content/projects/*.mdx (frontmatter), src/lib/content.ts |
| Project Detail.dc.html | content/projects/fifa-soccer-ds.mdx, src/lib/showcase.ts, public/projects/fifa/*.jpg |
| Writing.dc.html | content/blog/*.mdx (frontmatter), src/app/blog/page.tsx |
| About.dc.html | src/data/resume.ts, src/app/resume/page.tsx |
| Channel.dc.html | src/data/youtube.json, src/lib/youtube.ts, src/lib/youtube-copy.ts |
