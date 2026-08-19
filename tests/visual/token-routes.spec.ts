import { test, expect } from "@playwright/test";
import { prepare, settle, themeOf } from "./_helpers";

// Baselines for the routes that already run on `--tr-*` token classes.
//
// ADR 0006 scoped the original suite to the two legacy-CSS routes on the grounds
// that nothing else was about to be rewritten. That reasoning expired: retiring
// the legacy palette means deleting custom properties defined at `:root`, and
// every page on the site inherits from there. A change meant to be invisible
// outside /projects/[id] and /fde needs the pages outside them under test to be
// worth calling invisible.
//
// The home page carries the six featured figures, which are SVG drawn with
// custom properties inline rather than with classes, so they are the part most
// likely to move and the least likely to be noticed.
const ROUTES = [
  { path: "/", name: "home", why: "the six featured figures, drawn with inline custom properties" },
  { path: "/projects", name: "projects-index", why: "the catalogue: two bands, filter chips, cards" },
  { path: "/blog", name: "blog-index", why: "prose list styling" },
  { path: "/lab", name: "lab", why: "the tablist" },
  { path: "/resume", name: "resume", why: "the About page, whose CSS a bad ignore pattern once hid entirely" },
] as const;

for (const route of ROUTES) {
  test(`${route.name} renders unchanged`, async ({ page, colorScheme }) => {
    await prepare(page, themeOf(colorScheme));
    await settle(page, route.path);
    await expect(page).toHaveScreenshot(`${route.name}.png`, { fullPage: true });
  });
}
