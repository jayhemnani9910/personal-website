# Legacy Website (v1)

⚠️ **This folder contains the old static HTML website and is kept for reference only.**

## Status

- **Deprecated**: No longer maintained
- **Purpose**: Historical reference for content migration
- **Can Delete**: Yes, once all content has been migrated to the new site

## Contents

- `personal-website/` - The original HTML/CSS/JS portfolio site
  - `index.html` - Homepage
  - `projects.html` - Projects page
  - `about.html` - About page
  - `assets/` - CSS, JS, and data files

## Migration Status

All content has been migrated to:
- Projects → `content/projects/*.mdx`
- Resume data → `src/data/resume.ts`
- Profile info → `content/site.ts`

## Safe to Delete

Once you've verified all content is in the new site, delete this folder:

```bash
rm -rf v1-old-site/
```

