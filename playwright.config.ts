import { defineConfig } from "@playwright/test";

// Visual regression harness. It exists for one job: ADR 0002 says the remaining
// legacy `.editorial` and `.fde` rules get ported to token classes once there is
// visual coverage of both routes in both themes, and this is that coverage.
//
// It runs against a production build rather than `next dev`, because the port
// changes CSS and dev-mode output is not what visitors get.

const PORT = 3100; // not 3000: a dev server on the default port must not be
// screenshotted by accident, and `reuseExistingServer` is off for the same reason.
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./tests/visual",
  snapshotPathTemplate: "{testDir}/__snapshots__/{projectName}/{arg}{ext}",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0, // a flaky pixel diff is a bug in this harness, not something to paper over
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"], ["html", { open: "never" }]],

  expect: {
    toHaveScreenshot: {
      // Zero, and that is measured rather than optimistic. Two consecutive runs
      // of the same build differ by 0 pixels across all 18 tests, so there is no
      // antialiasing noise here to leave slack for.
      //
      // The first version of this used maxDiffPixelRatio: 0.001, which was worse
      // than useless: a ratio scales with page height, so the 6489px-tall dossier
      // got 8300 pixels of slack while a real regression is a fixed size. Moving
      // one legacy rule's padding by 2px produced ~1000 differing pixels and the
      // whole suite passed. An absolute count cannot drift that way.
      maxDiffPixels: 0,
      animations: "disabled",
      caret: "hide",
      scale: "css",
    },
  },

  use: {
    baseURL: BASE_URL,
    browserName: "chromium",
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 1,
    // Turns off the preloader, the reticle cursor, every reveal and stagger, and
    // Lenis, because all of them read usePrefersReducedMotion(). See ADR 0003.
    // Nested under contextOptions because that is where this version puts it;
    // viewport and colorScheme are top-level test options, reducedMotion is not.
    contextOptions: { reducedMotion: "reduce" },
    trace: "retain-on-failure",
  },

  // Both themes are first-class (ADR 0001), and the legacy routes get their
  // palette by custom-property inheritance through a wrapper class (ADR 0002),
  // which is exactly the mechanism a port would disturb. One project each.
  projects: [
    { name: "dark", use: { colorScheme: "dark" } },
    { name: "light", use: { colorScheme: "light" } },
  ],

  webServer: {
    command: `npm run start -- --port ${PORT}`,
    url: BASE_URL,
    // Never reuse: `next start` serving a stale .next while a build remints the
    // hashed CSS chunk names hands out HTML pointing at 404ing stylesheets, and
    // the page renders unstyled. That would be baselined as truth.
    reuseExistingServer: false,
    timeout: 120_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});

// NOT wired into .github/workflows/ci.yml, deliberately. These baselines are
// pixel-exact against this machine's Chromium build and font rendering, so a
// GitHub runner would fail all 18 on differences that are not regressions.
// Running them in CI means running them in the official Playwright container and
// generating the baselines in that same container. Worth doing, not done yet;
// wiring it up half-way would produce a red build that everyone learns to ignore.
