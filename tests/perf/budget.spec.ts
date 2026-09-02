import { test, expect, type Page } from "@playwright/test";

// Performance budget. Frontend Architecture for Design Systems, ch. 12: "The key
// to performance testing is to set a proper budget and stick to it... If any of
// the tests fail, the new feature will need to be adjusted, or some other
// feature may need to be removed."
//
// @vercel/speed-insights and @vercel/analytics were already wired in
// layout.tsx. Both report and neither fails anything, so there was no number
// written down that a change could violate. These are those numbers.
//
// Everything here is measured against the production build on localhost, from a
// cold browser context, at a fixed viewport. That makes the byte counts exact
// and machine-independent: the same build serves the same bytes on any machine,
// which is what lets them run in CI.

// Serial, against the config's fullyParallel. Two measurements racing on the
// same machine contend for CPU and inflate LCP: the first run of this file read
// 172ms where a lone measurement reads 84ms.
test.describe.configure({ mode: "serial" });

/** Home route. It is the heaviest page and the one every visitor loads first. */
const ROUTE = "/";

// Measured on 2026-08-19 at the values in parentheses. Headroom is deliberate:
// a budget that fails on rounding gets raised until it means nothing, and one
// with no headroom is the same thing with extra steps.
const BUDGET = {
  scriptBytes: 850 * 1024,     // measured 765.7 KB, then 718.2 KB on 2026-09-02
  stylesheetBytes: 95 * 1024,  // measured 84.3 KB
  // Was 5. The v4 home (ADR 0014) sets its type in Instrument Sans and Geist
  // Mono, so a sixth face is fetched on this route. Only one more rather than
  // two, because a browser downloads a face when a glyph renders in it and the
  // mono is variable. Still exact, for the reason below.
  fontFiles: 6,                // exact, see below
  // 160, 168, 168, 220, 224 across five runs under this test's own conditions,
  // which include a cold `next start` that JIT-compiles on the first request. An
  // earlier draft cited 84ms from a warm server, which is not what this measures.
  lcpMs: 500,
};

type Load = {
  byType: Record<string, number>;
  fontFiles: number;
  requests: number;
  lcpMs: number;
};

async function measure(page: Page, origin: string): Promise<Load> {
  const seen: { type: string; size: number }[] = [];

  page.on("response", async (res) => {
    if (!res.url().startsWith(origin)) return;
    let size = 0;
    try {
      size = (await res.body()).length;
    } catch {
      // Redirects and aborted requests have no body. They carry no weight either.
    }
    seen.push({ type: res.request().resourceType(), size });
  });

  await page.goto(ROUTE, { waitUntil: "networkidle" });

  // `buffered: true` matters: LCP usually fires before this observer is attached.
  const lcpMs = await page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        let v = 0;
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) v = e.startTime;
        }).observe({ type: "largest-contentful-paint", buffered: true });
        setTimeout(() => resolve(Math.round(v)), 600);
      }),
  );

  const byType: Record<string, number> = {};
  for (const r of seen) byType[r.type] = (byType[r.type] ?? 0) + r.size;

  return {
    byType,
    fontFiles: seen.filter((r) => r.type === "font").length,
    requests: seen.length,
    lcpMs,
  };
}

const kb = (n: number) => `${(n / 1024).toFixed(1)} KB`;

test("the home route stays inside its performance budget", async ({ page, baseURL }) => {
  const load = await measure(page, baseURL!);

  // Printed on pass as well as fail. A budget nobody sees the current value of
  // is a budget that gets raised on the first failure without anyone thinking.
  console.log(
    `\n  ${ROUTE}  ${load.requests} requests, LCP ${load.lcpMs}ms\n` +
      Object.entries(load.byType)
        .sort((a, b) => b[1] - a[1])
        .map(([t, n]) => `    ${t.padEnd(11)} ${kb(n)}`)
        .join("\n"),
  );

  expect(
    load.byType.script ?? 0,
    `JS on first load is ${kb(load.byType.script ?? 0)}, over the ${kb(BUDGET.scriptBytes)} budget`,
  ).toBeLessThanOrEqual(BUDGET.scriptBytes);

  // The site ran two stylesheets at once for a month (ADR 0002). This is the
  // number that notices a third.
  expect(
    load.byType.stylesheet ?? 0,
    `CSS is ${kb(load.byType.stylesheet ?? 0)}, over the ${kb(BUDGET.stylesheetBytes)} budget`,
  ).toBeLessThanOrEqual(BUDGET.stylesheetBytes);

  // Exact, not a ceiling, and it is the one number here with a specific bug
  // behind it. Newsreader and JetBrains Mono are variable fonts; listing a
  // `weight` array in next/font pins them to static instances and emits one file
  // per weight per style. That had happened, and it cost four extra files before
  // anyone noticed. An equality check fails on the way down too, which is what
  // you want: fewer files means a family stopped loading.
  expect(
    load.fontFiles,
    `${load.fontFiles} font files, expected exactly ${BUDGET.fontFiles}. ` +
      `More usually means a next/font call regained a \`weight\` array and pinned a ` +
      `variable font to static instances. Fewer means a family stopped loading.`,
  ).toBe(BUDGET.fontFiles);
});

// LCP against a localhost server on a shared CI runner measures the runner, not
// the site. It is asserted where the machine is known and logged everywhere, and
// real-user LCP comes from Speed Insights, which is what that tool is for.
test("the home route paints promptly", async ({ page, baseURL }) => {
  test.skip(!!process.env.CI, "LCP on a shared runner is noise; see the comment above");

  const load = await measure(page, baseURL!);
  expect(
    load.lcpMs,
    `LCP is ${load.lcpMs}ms against localhost, over the ${BUDGET.lcpMs}ms budget`,
  ).toBeLessThanOrEqual(BUDGET.lcpMs);
});
