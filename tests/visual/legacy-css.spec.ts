import { test, expect } from "@playwright/test";
import { prepare, settle, themeOf } from "./_helpers";

// This file's name is a holdover: it originally baselined the two routes
// still on the pre-redesign `.editorial`/`.fde-*` stylesheet (ADR 0002). Both
// /projects/[id] and /fde have since moved onto --tr-* tokens and Tailwind
// directly, so that reason is gone. The grouping still earns its keep,
// though: these are the pages most likely to regress silently, because
// /projects/[id]'s content shape varies per project (a plain dossier, a
// tools table, a findings list, a comparison slider, an architecture
// figure) in ways a single "does /projects render" smoke test would not
// catch, and /fde is the heaviest single page outside it.
//
// These are not general smoke tests. Each route below names why it is in the
// set, and adding one that does not carry distinct markup costs a baseline
// and buys nothing.
//
// Dark and light both run. The theme comes from the Playwright project, and
// snapshotPathTemplate files each project's baselines separately.

// ── Routes, and what each one is here to protect ──────────────────────────────
const ROUTES = [
  {
    path: "/projects/accurate-guesser",
    name: "dossier",
    why: "no showcase config: the fact-grid degrade, arrived/built/changed, and a decisions table whose cost column is empty throughout because none of this project's decisions record a trade-off",
  },
  {
    path: "/projects/webmcp-portfolio",
    name: "showcase-tools",
    why: "the only project with a tools table, so the only cover for the read/write kind distinction",
  },
  {
    path: "/projects/revolu-idea",
    name: "showcase-findings",
    why: "the only project with a findings list, so the only cover for the VERIFIED/CONTESTED/UNVERIFIED verdict states",
  },
  {
    path: "/projects/fifa-soccer-ds",
    name: "showcase-demo",
    why: "the comparison slider, which lazy-loads and is easy to break silently",
  },
  {
    path: "/projects/stock-data-platform",
    name: "showcase-arch",
    why: "the architecture image slot, rendered next to Data flow independent of whether that section itself renders",
  },
  {
    path: "/fde",
    name: "fde",
    why: "the heaviest single page outside /projects/[id]: console, phase strip, hand-drawn diagram",
  },
] as const;

for (const route of ROUTES) {
  test(`${route.name} renders unchanged`, async ({ page, colorScheme }) => {
    await prepare(page, themeOf(colorScheme));
    await settle(page, route.path);
    await expect(page).toHaveScreenshot(`${route.name}.png`, { fullPage: true });
  });
}

// Every showcase project's demo content renders directly on the page now:
// there is no tab bar to click into any more (ProjectShowcase and its
// `.sw-tab` markup were retired when /projects/[id] moved to one flowing
// template for all 27 projects), so the ROUTES screenshots above already
// cover tools/findings/compare/arch in their rendered state.
//
// What they cannot cover is whether the rarer branch of a project's data
// actually rendered rather than being silently dropped. The read/write and
// verdict states used to be CSS classes composed at runtime (`k-${kind}`,
// `v-${verdict}`), invisible to a static reachability scan, which is why ADR
// 0002 called them out as needing an explicit test. They are plain Tailwind
// utilities now, so that specific reachability risk is gone, but "did both
// tool kinds and all three verdicts actually make it into the DOM" is still
// worth asserting directly. `data-tool-kind` / `data-verdict` on
// ProjectDetail.tsx exist for exactly this: they are the styling-independent
// equivalent of the old CSS classes.
test("tools table renders both read and write kinds", async ({ page, colorScheme }) => {
  await prepare(page, themeOf(colorScheme));
  await settle(page, "/projects/webmcp-portfolio");

  await expect(page.locator('[data-tool-kind="read"]').first()).toBeVisible();
  await expect(page.locator('[data-tool-kind="write"]').first()).toBeVisible();
});

test("findings list renders all three verdict states", async ({ page, colorScheme }) => {
  await prepare(page, themeOf(colorScheme));
  await settle(page, "/projects/revolu-idea");

  await expect(page.locator('[data-verdict="VERIFIED"]').first()).toBeVisible();
  await expect(page.locator('[data-verdict="CONTESTED"]').first()).toBeVisible();
  await expect(page.locator('[data-verdict="UNVERIFIED"]').first()).toBeVisible();
});

// The sliders are the piece most likely to regress unnoticed: they render
// blank until their images load, which reads as an empty panel rather than a
// failure. This is a correctness check, not a second screenshot: the
// showcase-demo.png baseline above already captures the slider in its
// rendered state (it is no longer hidden behind a tab), and a pixel diff
// would not have caught "loaded" vs. "decoded" anyway.
test("comparison slider images decode", async ({ page, colorScheme }) => {
  await prepare(page, themeOf(colorScheme));
  await settle(page, "/projects/fifa-soccer-ds");

  const slider = page.locator('[data-testid="comparison-slider"]');
  await expect(slider.locator("img").first()).toBeVisible();
  await page.waitForFunction(() =>
    Array.from(
      document.querySelectorAll<HTMLImageElement>('[data-testid="comparison-slider"] img'),
    ).every((img) => img.complete && img.naturalWidth > 0),
  );
});
