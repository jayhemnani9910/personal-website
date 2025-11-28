# GitHub Pages Output (Deprecated)

⚠️ **This folder is deprecated and should not be used.**

The current build output goes to `/out` folder instead.

## Why this folder exists

This was previously used for GitHub Pages deployment. The new deployment strategy:

1. Build outputs to `/out` (configured in `next.config.ts`)
2. GitHub Actions copies `/out` to the `gh-pages` branch
3. GitHub Pages serves from the `gh-pages` branch

## Can I delete this?

Yes, once you confirm your GitHub Pages deployment is working from the `gh-pages` branch, you can safely delete this folder.

To migrate:
1. Update your GitHub Pages settings to use the `gh-pages` branch
2. Set up GitHub Actions workflow (see `.github/workflows/deploy.yml`)
3. Delete this `docs/` folder
4. Remove `docs/` from `.gitignore` if present

