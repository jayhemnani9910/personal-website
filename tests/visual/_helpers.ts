import { expect, type Page } from "@playwright/test";

// Shared setup for the visual suite. Not a spec: the filename does not match
// Playwright's testMatch, so the runner ignores it.

const VIEWS_STUB = { count: 42, counted: false };

/**
 * Put the page in a state where two runs produce identical pixels.
 *
 * The theme is set before first paint rather than by clicking the toggle: the
 * inline anti-flash script in layout.tsx reads localStorage, and a click would
 * screenshot the transition instead of the destination.
 */
export async function prepare(page: Page, theme: "dark" | "light") {
  await page.addInitScript((t) => {
    try {
      localStorage.setItem("theme", t);
      // The cold open is once-per-session and already off under reduced motion.
      // Belt and braces: a preloader caught mid-fade is the classic flaky shot.
      sessionStorage.setItem("tr-intro-seen", "1");
    } catch {
      // Storage disabled. Reduced motion still suppresses the preloader.
    }
  }, theme);

  // Two reasons, and the second is the important one. The counter renders
  // whatever number the API returns, so a live value makes every shot differ.
  // And an unstubbed run POSTs to /api/views on every mount of every project
  // page, which is how a real counter got inflated from 3 to 14 by an automated
  // loop once already. Nothing here is allowed to reach that route.
  await page.route("**/api/views**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(VIEWS_STUB),
    }),
  );

  // No test clicks "run sim", but a stray call would spend Gemini quota and
  // return different prose every run.
  await page.route("**/api/fde-sim**", (route) => route.abort());
}

/** Navigate and wait for everything that moves pixels to have settled. */
export async function settle(page: Page, path: string) {
  await page.goto(path, { waitUntil: "networkidle" });
  // Newsreader and JetBrains Mono are self-hosted by next/font, so this is fast,
  // but a screenshot taken mid-swap bakes in fallback metrics.
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator("#main-content")).toBeVisible();
}

/** The Playwright project name is the theme. */
export function themeOf(colorScheme: string | null | undefined): "dark" | "light" {
  if (colorScheme !== "dark" && colorScheme !== "light") {
    throw new Error(`visual tests need an explicit colorScheme, got ${colorScheme}`);
  }
  return colorScheme;
}
