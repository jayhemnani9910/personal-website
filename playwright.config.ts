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
  testDir: "./tests",
  snapshotPathTemplate: "{testDir}/__snapshots__/{projectName}/{arg}{ext}",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0, // a flaky pixel diff is a bug in this harness, not something to paper over
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"], ["html", { open: "never" }]],

  expect: {
    toHaveScreenshot: {
      // Both numbers are measured, not guessed, and they were each wrong once.
      //
      // `threshold` is per-pixel colour sensitivity in YIQ space. Its default of
      // 0.2 is far too loose for this suite, whose entire subject is a palette
      // migration: the stale editorial rust (#b5471f) sits close enough to ember
      // (#FF5C2B) that recolouring every figure on the home page registered as 41
      // changed pixels. The same recolour at threshold 0 is ~52,000 pixels.
      //
      // `maxDiffPixels` is how many such pixels are tolerated. An earlier version
      // used maxDiffPixelRatio: 0.001, which was worse than useless: a ratio
      // scales with page height, so the 6489px dossier got ~8300 pixels of slack
      // while a regression stays a fixed size. Moving one legacy rule's padding by
      // 2px changed ~1000 pixels and the whole suite passed.
      //
      // At threshold 0 the measured run-to-run noise floor is 4 pixels, on light
      // theme only. 20 sits five times above that floor and roughly fifty times
      // below the smallest real regression tested.
      threshold: 0,
      maxDiffPixels: 20,
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
    { name: "dark", testDir: "./tests/visual", use: { colorScheme: "dark" } },
    { name: "light", testDir: "./tests/visual", use: { colorScheme: "light" } },
    // The budget measures bytes, which do not have a theme. Running it twice
    // would double the wall clock and assert the same numbers.
    { name: "perf", testDir: "./tests/perf", use: { colorScheme: "dark" } },
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
