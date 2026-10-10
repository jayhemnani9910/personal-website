import { expect, type Page } from "@playwright/test";

// Shared setup for the visual suite. Not a spec: the filename does not match
// Playwright's testMatch, so the runner ignores it.

const VIEWS_STUB = { count: 42, counted: false };

/** Put the page in a state where two runs produce identical pixels. */
export async function prepare(page: Page) {
  // The home page picks its project and fact by day and counts down to
  // midnight every second. A fixed clock holds both still.
  await page.clock.setFixedTime(new Date("2026-10-10T12:00:00"));
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
  // The home page's guestbook reads the shared wall. An empty wall keeps the
  // baseline stable and keeps tests from posting to the real one.
  await page.route("**/api/guestbook**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ notes: [] }) }),
  );
}

/** Navigate and wait for everything that moves pixels to have settled. */
export async function settle(page: Page, path: string) {
  await page.goto(path, { waitUntil: "networkidle" });
  // The fonts are self-hosted by next/font, so this is fast, but a screenshot
  // taken mid-swap bakes in fallback metrics.
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator("#main-content")).toBeVisible();
}
