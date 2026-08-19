import { test, expect } from "@playwright/test";
import { prepare, settle, themeOf } from "./_helpers";

// Baselines for the two routes that still render through the pre-redesign
// stylesheet: /projects/[id] and /fde (ADR 0002). Everything else moved to
// token classes in July.
//
// These are not general smoke tests. They cover the specific markup a port of
// those rules would have to reproduce, and each route below names why it is in
// the set. Adding a route here that does not use `.editorial` or `.fde` costs a
// baseline and buys nothing.
//
// Dark and light both run: the legacy routes get their palette by custom
// property inheritance through a wrapper class, which is the exact mechanism a
// port would disturb. The theme comes from the Playwright project, and
// snapshotPathTemplate files each project's baselines separately.

// ── Routes, and what each one is here to protect ──────────────────────────────
const ROUTES = [
  {
    path: "/projects/accurate-guesser",
    name: "dossier",
    why: "the plain ProjectDetail path, no showcase config, the `.editorial .dossier/.dd-` rules",
  },
  {
    path: "/projects/webmcp-portfolio",
    name: "showcase-tools",
    why: "the only showcase with a tools table, so the only cover for `k-read`/`k-write`",
  },
  {
    path: "/projects/revolu-idea",
    name: "showcase-findings",
    why: "the only showcase with findings, so the only cover for `v-verified`/`v-contested`/`v-unverified`",
  },
  {
    path: "/projects/fifa-soccer-ds",
    name: "showcase-demo",
    why: "the BeforeAfter comparison sliders, which lazy-load and are easy to break silently",
  },
  {
    path: "/projects/stock-data-platform",
    name: "showcase-arch",
    why: "the architecture image slot",
  },
  {
    path: "/fde",
    name: "fde",
    why: "the `.fde-*` rules: console, phase strip, hand-drawn diagram",
  },
] as const;

for (const route of ROUTES) {
  test(`${route.name} renders unchanged`, async ({ page, colorScheme }) => {
    await prepare(page, themeOf(colorScheme));
    await settle(page, route.path);
    await expect(page).toHaveScreenshot(`${route.name}.png`, { fullPage: true });
  });
}

// The tab bar is legacy `.sw-tab` markup and each panel is its own set of rules,
// so an overview-only baseline would leave most of the showcase stylesheet
// uncovered. The sweep starts at index 1 because the route tests above already
// baseline the overview tab.
//
// `requiredClasses` is the part that matters. Five class names in this markup
// are composed at runtime from `v-${verdict}` and `k-${kind}`, so they appear in
// no source file as literals and a static reachability scan calls them dead. One
// nearly deleted them already. Asserting they are in the DOM turns "I believe
// these baselines cover them" into something the suite fails over.
const TAB_SWEEPS = [
  {
    path: "/projects/webmcp-portfolio",
    prefix: "webmcp",
    requiredClasses: [".sw-tool-kind.k-read", ".sw-tool-kind.k-write"],
  },
  {
    path: "/projects/revolu-idea",
    prefix: "revolu",
    requiredClasses: [".sw-finding.v-verified", ".sw-finding.v-contested", ".sw-finding.v-unverified"],
  },
] as const;

for (const sweep of TAB_SWEEPS) {
  test(`${sweep.prefix} tabs render unchanged`, async ({ page, colorScheme }) => {
    await prepare(page, themeOf(colorScheme));
    await settle(page, sweep.path);

    const tabs = page.locator(".sw-tab");
    const count = await tabs.count();
    expect(count).toBeGreaterThan(1); // an overview-only page means the config broke

    for (let i = 1; i < count; i++) {
      const label = (await tabs.nth(i).innerText()).trim().toLowerCase().replace(/\W+/g, "-");
      await tabs.nth(i).click();
      await expect(page.locator(".sw-tab.active")).toHaveText(new RegExp(label, "i"));
      await expect(page).toHaveScreenshot(`${sweep.prefix}-tab-${label}.png`, { fullPage: true });
    }

    // The demo tab is last in every showcase config, so the loop above leaves it
    // open and these assert against what is on screen in the final baseline.
    for (const selector of sweep.requiredClasses) {
      await expect(page.locator(selector).first()).toBeVisible();
    }
  });
}

// The sliders are the piece most likely to regress unnoticed: they render blank
// until their images load, which reads as "the tab is empty" rather than as a
// failure.
test("comparison sliders render unchanged", async ({ page, colorScheme }) => {
  await prepare(page, themeOf(colorScheme));
  await settle(page, "/projects/fifa-soccer-ds");

  await page.locator(".sw-tab", { hasText: /demo/i }).click();

  await expect(page.locator(".sw-panel img").first()).toBeVisible();
  // Every image decoded, or the shot captures a half-loaded panel.
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll<HTMLImageElement>(".sw-panel img")).every(
      (img) => img.complete && img.naturalWidth > 0,
    ),
  );

  await expect(page).toHaveScreenshot("showcase-demo-sliders.png", { fullPage: true });
});
